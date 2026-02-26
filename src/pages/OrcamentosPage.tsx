import { useCallback, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BudgetSectionComponent } from '../components/orcamentos';
import { PageHeader } from '../components/layout';
import { Modal } from '../components/ui';
import { NAV_LINKS } from '../constants';
import { useCoreData, useSystemData } from '../context/DataContext';
import { api } from '../services/infrastructure/api';
import type {
  BillingMethod,
  BudgetItem,
  BudgetSection,
  BudgetUnit,
  Proposal,
  SavedSection,
} from '../types';
import { formatCurrency } from '../utils/formatters';
import { calculateBudgetTotals, initializeSections, SaveProposalModal } from './orcamentos';

function OrcamentosPage(): JSX.Element {
  const { clients, setProposals } = useCoreData();
  const { customBudgetTemplate, setCustomBudgetTemplate } = useSystemData();

  const [sections, setSections] = useState<BudgetSection[]>(() =>
    initializeSections(customBudgetTemplate),
  );
  const [discount, setDiscount] = useState<number>(0);
  const [isClearConfirmOpen, setClearConfirmOpen] = useState(false);
  const [isSaveModalOpen, setSaveModalOpen] = useState(false);
  const [isSavingProposal, setIsSavingProposal] = useState(false);

  const saveProposalLockRef = useRef(false);
  const navigate = useNavigate();

  const calculations = useMemo(
    () => calculateBudgetTotals(sections, discount),
    [sections, discount],
  );

  const handleSaveDefaults = useCallback(() => {
    const templateToSave = sections.map((section) => ({
      ...section,
      items: section.items.map(({ included: _included, ...itemData }) => itemData),
    }));

    setCustomBudgetTemplate(templateToSave);
    alert('Padrões de orçamento salvos com sucesso!');
  }, [sections, setCustomBudgetTemplate]);

  const handleSaveProposal = useCallback(
    async (clientInfo: { name: string; id?: string }) => {
      if (saveProposalLockRef.current) return;

      saveProposalLockRef.current = true;
      setIsSavingProposal(true);

      const selectedSections: SavedSection[] = sections
        .map((section) => {
          const baseUnitPrice = section.billing.value || 0;

          return {
            id: section.id,
            title: section.title,
            items: section.items
              .filter((item) => item.included)
              .map((item) => {
                const finalUnitPrice = baseUnitPrice * (1 + item.unitPrice / 100);

                return {
                  id: item.id,
                  description: item.description,
                  unit: section.unit,
                  quantity: item.quantity,
                  unitPrice: finalUnitPrice,
                  estimatedHours: item.estimatedHours,
                };
              }),
          };
        })
        .filter((section) => section.items.length > 0);

      if (selectedSections.length === 0) {
        alert('Selecione ao menos um item para salvar a proposta.');
        saveProposalLockRef.current = false;
        setIsSavingProposal(false);
        return;
      }

      const newProposalCode = await api.reserveGlobalIdentifier();
      const newProposal: Proposal = {
        id: `prop_${newProposalCode}`,
        code: `#${newProposalCode}`,
        name: clientInfo.name,
        clientId: clientInfo.id,
        status: 'Pendente',
        date: new Date().toLocaleDateString('pt-BR'),
        sections: selectedSections,
        subtotal: calculations.grandTotalBeforeDiscount,
        discount,
        total: calculations.grandTotal,
        remuneration: calculations.totalProfit,
        archived: false,
        showItemPrices: true,
        showSectionTotals: true,
        showDiscount: discount > 0,
        showGrandTotal: true,
        totalsAlignment: 'right',
        showProposalDate: true,
      };

      setProposals((previous) => {
        const alreadyExists = previous.some(
          (proposal) => proposal.id === newProposal.id || proposal.code === newProposal.code,
        );
        if (alreadyExists) return previous;
        return [...previous, newProposal];
      });

      setSaveModalOpen(false);
      navigate('/propostas');
    },
    [sections, calculations, discount, setProposals, navigate],
  );

  const handleClearBudget = () => {
    setSections(initializeSections(null));
    setDiscount(0);
    setClearConfirmOpen(false);
  };

  const handleItemChange = useCallback(
    (
      sectionId: number,
      itemId: number,
      field: keyof BudgetItem,
      value: BudgetItem[keyof BudgetItem],
    ) => {
      setSections((previous) =>
        previous.map((section) => {
          if (section.id !== sectionId) return section;

          return {
            ...section,
            items: section.items.map((item) => {
              if (item.id !== itemId) return item;

              let processedValue = value;
              if (field === 'quantity' || field === 'unitPrice' || field === 'estimatedHours') {
                let numericValue = parseFloat(String(value)) || 0;
                numericValue = Math.max(0, numericValue);
                processedValue = numericValue;
              } else if (field === 'included') {
                processedValue = Boolean(value);
              }

              return { ...item, [field]: processedValue };
            }),
          };
        }),
      );
    },
    [],
  );

  const handleSectionChange = useCallback(
    (
      sectionId: number,
      field: 'title' | 'billingMethod' | 'billingValue' | 'unit',
      value: string | number,
    ) => {
      setSections((previous) =>
        previous.map((section) => {
          if (section.id !== sectionId) return section;

          if (field === 'title') {
            return { ...section, title: String(value) };
          }
          if (field === 'unit') {
            return { ...section, unit: value as BudgetUnit };
          }
          if (field === 'billingMethod') {
            return { ...section, billing: { ...section.billing, method: value as BillingMethod } };
          }
          if (field === 'billingValue') {
            return {
              ...section,
              billing: { ...section.billing, value: parseFloat(String(value)) || 0 },
            };
          }

          return section;
        }),
      );
    },
    [],
  );

  const handleAddSection = useCallback(() => {
    setSections((previous) => [
      ...previous,
      {
        id: Date.now(),
        title: 'Nova Seção',
        unit: 'un',
        billing: { method: 'percentage_on_top', value: 20 },
        items: [],
      },
    ]);
  }, []);

  const handleRemoveSection = useCallback((sectionId: number) => {
    setSections((previous) => previous.filter((section) => section.id !== sectionId));
  }, []);

  const handleAddItem = useCallback((sectionId: number) => {
    setSections((previous) =>
      previous.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              items: [
                ...section.items,
                {
                  id: Date.now(),
                  description: 'Novo Serviço/Item',
                  quantity: 1,
                  unitPrice: 0,
                  included: true,
                  estimatedHours: 0,
                },
              ],
            }
          : section,
      ),
    );
  }, []);

  const handleRemoveItem = useCallback((sectionId: number, itemId: number) => {
    setSections((previous) =>
      previous.map((section) =>
        section.id === sectionId
          ? { ...section, items: section.items.filter((item) => item.id !== itemId) }
          : section,
      ),
    );
  }, []);

  const orcamentosIcon = NAV_LINKS.find((link) => link.path === '/orcamentos')?.icon;

  return (
    <>
      <div className="pb-32 animate-fade-in-up">
        <PageHeader title="Orçamentos" icon={orcamentosIcon}>
          <button
            onClick={handleSaveDefaults}
            className="px-4 py-2 rounded-lg font-semibold text-sm text-primary-content bg-secondary hover:bg-secondary-focus transition-colors shadow-soft"
          >
            Salvar
          </button>
        </PageHeader>

        <div className="space-y-8">
          {sections.map((section) => (
            <BudgetSectionComponent
              key={section.id}
              section={section}
              sectionCalculations={
                calculations.sectionDetails.find((detail) => detail.id === section.id) || {
                  cost: 0,
                  profit: 0,
                  total: 0,
                }
              }
              onItemChange={handleItemChange}
              onSectionChange={handleSectionChange}
              onAddItem={handleAddItem}
              onRemoveItem={handleRemoveItem}
              onRemoveSection={handleRemoveSection}
            />
          ))}

          <div className="mt-8">
            <button
              onClick={handleAddSection}
              className="w-full p-4 text-center rounded-lg border-2 border-dashed border-border-color text-text-secondary hover:bg-background hover:border-accent transition-colors font-semibold"
            >
              + Adicionar Nova Seção
            </button>
          </div>

          <div className="flex justify-end pt-8">
            <div className="w-full max-w-sm space-y-4">
              <div className="flex justify-between items-center text-lg">
                <span className="text-text-secondary">Subtotal Geral</span>
                <span className="font-sans font-semibold text-text-primary">
                  {formatCurrency(calculations.grandTotalBeforeDiscount)}
                </span>
              </div>
              <div className="flex justify-between items-center text-lg">
                <label htmlFor="discount" className="text-text-secondary">
                  Desconto (%)
                </label>
                <input
                  id="discount"
                  type="number"
                  value={discount === 0 ? '' : discount}
                  onChange={(event) => setDiscount(parseFloat(event.target.value) || 0)}
                  placeholder="0"
                  className="w-24 bg-surface text-right p-2 rounded-md border border-border-color focus:border-accent transition font-semibold"
                />
              </div>
              <div className="flex justify-between items-center text-lg border-t border-border-color pt-4">
                <span className="text-text-secondary">Valor do Desconto</span>
                <span className="font-sans font-semibold text-accent">
                  - {formatCurrency(calculations.discountAmount)}
                </span>
              </div>
              <div className="flex justify-between items-center text-2xl font-serif font-bold bg-secondary/10 p-4 rounded-lg">
                <span className="text-secondary">Total Geral</span>
                <span className="text-secondary">{formatCurrency(calculations.grandTotal)}</span>
              </div>
              <div className="text-right text-sm text-success font-medium mt-2">
                Remuneração Estimada: {formatCurrency(calculations.totalProfit)}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 right-0 left-0 md:left-64 lg:left-80 bg-surface border-t border-border-color p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-20">
        <div className="flex justify-end items-center gap-4 px-4 md:px-8">
          <button
            onClick={() => setClearConfirmOpen(true)}
            className="px-6 py-2.5 rounded-lg font-semibold text-text-secondary hover:text-error hover:bg-error/10 transition-colors border border-transparent hover:border-error/20"
          >
            Limpar Orçamento
          </button>
          <button
            onClick={() => {
              saveProposalLockRef.current = false;
              setIsSavingProposal(false);
              setSaveModalOpen(true);
            }}
            className="px-8 py-2.5 rounded-lg font-bold text-primary-content bg-primary hover:bg-primary-focus shadow-lg shadow-primary/30 transform hover:-translate-y-0.5 transition-all"
          >
            Salvar Proposta
          </button>
        </div>
      </div>

      <Modal
        isOpen={isClearConfirmOpen}
        onClose={() => setClearConfirmOpen(false)}
        title="Confirmar Limpeza"
      >
        <p className="text-text-primary mb-6">
          Tem certeza que deseja limpar a página e remover todas as seleções? Esta ação não pode ser
          desfeita.
        </p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={() => setClearConfirmOpen(false)}
            className="px-6 py-2 rounded-lg font-semibold text-text-primary bg-border-color/50 hover:bg-border-color"
          >
            Cancelar
          </button>
          <button
            onClick={handleClearBudget}
            className="px-6 py-2 rounded-lg font-semibold text-white bg-error hover:opacity-90"
          >
            Limpar
          </button>
        </div>
      </Modal>

      <SaveProposalModal
        isOpen={isSaveModalOpen}
        onClose={() => {
          setSaveModalOpen(false);
          saveProposalLockRef.current = false;
          setIsSavingProposal(false);
        }}
        onSave={handleSaveProposal}
        clients={clients}
        isSaving={isSavingProposal}
      />
    </>
  );
}

export default OrcamentosPage;
