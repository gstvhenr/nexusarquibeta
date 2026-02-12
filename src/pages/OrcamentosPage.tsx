import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/layout';
import { Modal } from '../components/ui';
import { useData } from '../context/DataContext';
import { api } from '../services/infrastructure/api';
import type {
  BudgetSection,
  BudgetItem,
  Proposal,
  SavedSection,
  Client,
  BudgetUnit,
  BillingMethod,
  BudgetTemplateSection,
} from '../types';
import { formatCurrency } from '../utils/formatters';
import { NAV_LINKS } from '../constants';
import { DEFAULT_BUDGET_TEMPLATE_SECTIONS } from '../constants.budget';
import { ChevronDownIcon, TrashIcon } from '../components/ui';

const initializeSections = (customTemplate: BudgetTemplateSection[] | null): BudgetSection[] => {
  const templateData = customTemplate ? customTemplate : DEFAULT_BUDGET_TEMPLATE_SECTIONS;

  return templateData.map((section) => ({
    ...section,
    items: section.items.map((item) => ({
      ...item,
      included: false, // Always start unchecked
    })),
  }));
};

// --- SUB-COMPONENTS ---

interface BudgetSectionProps {
  section: BudgetSection;
  sectionCalculations: { cost: number; profit: number; total: number };
  onItemChange: (
    sectionId: number,
    itemId: number,
    field: keyof Omit<BudgetItem, 'unit'>,
    value: any,
  ) => void;
  onSectionChange: (
    sectionId: number,
    field: 'title' | 'billingMethod' | 'billingValue' | 'unit',
    value: string | number,
  ) => void;
  onAddItem: (sectionId: number) => void;
  onRemoveItem: (sectionId: number, itemId: number) => void;
  onRemoveSection: (sectionId: number) => void;
}

const billingMethodLabels: Record<BillingMethod, string> = {
  percentage_on_top: 'Percentual Sobre Custo',
  percentage_embedded: 'Percentual Embutido no Total',
  fixed_fee: 'Taxa Fixa',
  per_sqm: 'Por Metro Quadrado (m²)',
  per_hour: 'Por Hora Estimada (h)',
};

const getBillingValueLabel = (method: BillingMethod) => {
  switch (method) {
    case 'percentage_on_top':
    case 'percentage_embedded':
      return 'Valor (%)';
    case 'fixed_fee':
      return 'Valor (R$)';
    case 'per_sqm':
      return 'Valor (R$/m²)';
    case 'per_hour':
      return 'Valor (R$/h)';
    default:
      return 'Valor';
  }
};

const BudgetSectionComponent = React.memo<BudgetSectionProps>(
  ({
    section,
    sectionCalculations,
    onItemChange,
    onSectionChange,
    onAddItem,
    onRemoveItem,
    onRemoveSection,
  }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const handleItemFieldChange =
      (itemId: number, field: keyof Omit<BudgetItem, 'unit'>) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const value =
          e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
        onItemChange(section.id, itemId, field, value);
      };

    const useProfitPercentage =
      (section.unit === 'h' && section.billing.method === 'per_hour') ||
      (section.unit === 'm²' && section.billing.method === 'per_sqm');

    const isHourlyRateMode = section.unit === 'h' && section.billing.method === 'per_hour';

    return (
      <div className="bg-surface rounded-2xl shadow-soft transition-all duration-300 ease-in-out">
        <header className="p-5 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
          <div className="flex flex-wrap gap-4 justify-between items-start">
            <div className="flex items-center gap-3 flex-grow min-w-[200px]">
              <ChevronDownIcon
                className={`w-6 h-6 text-text-secondary transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
              />
              <input
                type="text"
                value={section.title}
                onChange={(e) => {
                  e.stopPropagation();
                  onSectionChange(section.id, 'title', e.target.value);
                }}
                onClick={(e) => e.stopPropagation()}
                className="font-serif text-2xl font-semibold text-secondary bg-transparent border-0 border-b-2 border-transparent focus:ring-0 focus:border-accent transition-all w-full p-1 -ml-1"
                placeholder="Nome da Seção"
                aria-label="Nome da seção"
              />
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className="text-sm text-success font-medium">Lucro</span>
                <p className="font-sans text-lg font-semibold text-success">
                  {formatCurrency(sectionCalculations.profit)}
                </p>
              </div>
              <div className="text-right">
                <span className="text-sm text-text-secondary">Total da Seção</span>
                <p className="font-sans text-2xl font-bold text-secondary">
                  {formatCurrency(sectionCalculations.total)}
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveSection(section.id);
                }}
                className="text-gray-400 hover:text-error p-2 rounded-full transition-colors self-center"
                aria-label="Remover seção"
              >
                <TrashIcon />
              </button>
            </div>
          </div>

          {isExpanded && (
            <div
              className="mt-4 pt-4 border-t border-border-color/50 flex flex-wrap items-end gap-3"
              onClick={(e) => e.stopPropagation()}
            >
              <p className="text-sm font-semibold text-text-secondary w-full">
                Configurações da Seção
              </p>
              <div className="w-24">
                <label className="text-xs text-text-secondary block mb-1">Unidade Padrão</label>
                <select
                  value={section.unit}
                  onChange={(e) => onSectionChange(section.id, 'unit', e.target.value)}
                  className="w-full bg-background px-2 h-9 rounded-md border border-border-color focus:border-accent focus:ring-accent/50 transition font-semibold text-sm"
                  aria-label="Unidade padrão"
                >
                  <option value="un">un</option>
                  <option value="m²">m²</option>
                  <option value="h">h</option>
                  <option value="vb">vb</option>
                </select>
              </div>
              <div className="w-60">
                <label className="text-xs text-text-secondary block mb-1">Método de Cobrança</label>
                <select
                  value={section.billing.method}
                  onChange={(e) => onSectionChange(section.id, 'billingMethod', e.target.value)}
                  className="w-full bg-background px-2 h-9 rounded-md border border-border-color focus:border-accent focus:ring-accent/50 transition font-semibold text-sm"
                  aria-label="Método de cobrança"
                >
                  {Object.entries(billingMethodLabels).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="w-28">
                <label className="text-xs text-text-secondary block mb-1">
                  {getBillingValueLabel(section.billing.method)}
                </label>
                <input
                  type="number"
                  value={section.billing.value || ''}
                  onChange={(e) => onSectionChange(section.id, 'billingValue', e.target.value)}
                  className="w-full bg-background text-right px-2 h-9 rounded-md border border-border-color focus:border-accent focus:ring-accent/50 transition font-semibold"
                  placeholder="0"
                  aria-label={getBillingValueLabel(section.billing.method)}
                />
              </div>
            </div>
          )}
        </header>

        <div
          className={`transition-all duration-500 ease-in-out overflow-hidden ${isExpanded ? 'max-h-[1000px]' : 'max-h-0'}`}
        >
          <div className="px-5 pb-5 pt-2">
            <div className="overflow-x-auto bg-background/50 dark:bg-background/20 rounded-lg">
              <table className="w-full text-sm text-left text-text-primary">
                <thead className="text-xs text-text-secondary uppercase">
                  <tr>
                    <th scope="col" className="p-4 w-12 text-center">
                      Inc.
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Descrição do Serviço
                    </th>
                    <th scope="col" className="px-6 py-3 w-40 text-center">
                      {isHourlyRateMode ? 'Qtd.' : `Qtd. (${section.unit})`}
                    </th>
                    <th scope="col" className="px-6 py-3 w-40 text-center">
                      {useProfitPercentage ? 'Lucro (%)' : 'Preço Unit.'}
                    </th>
                    <th scope="col" className="px-6 py-3 w-32 text-center">
                      QND. H
                    </th>
                    <th scope="col" className="px-6 py-3 w-40 text-center">
                      Total
                    </th>
                    <th scope="col" className="p-4 w-12 text-center" aria-label="Ações"></th>
                  </tr>
                </thead>
                <tbody>
                  {section.items.map((item, index) => {
                    const quantityForTotal =
                      section.unit === 'h' ? item.estimatedHours || 0 : item.quantity;
                    const itemTotal = useProfitPercentage
                      ? quantityForTotal * (section.billing.value * (1 + item.unitPrice / 100))
                      : quantityForTotal * item.unitPrice;
                    const rowClass = item.included
                      ? index % 2 === 0
                        ? 'bg-surface/50'
                        : 'bg-background/30'
                      : 'bg-background text-text-secondary opacity-75';

                    return (
                      <tr
                        key={item.id}
                        className={`${rowClass} border-b border-border-color last:border-b-0 hover:bg-accent/10 transition-colors`}
                      >
                        <td className="p-4 text-center">
                          <input
                            type="checkbox"
                            checked={item.included}
                            onChange={handleItemFieldChange(item.id, 'included')}
                            className="w-5 h-5 rounded focus:ring-2 cursor-pointer transition-colors accent-primary/70"
                            aria-label={`Incluir ${item.description}`}
                          />
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="text"
                            value={item.description}
                            onChange={handleItemFieldChange(item.id, 'description')}
                            className="w-full bg-transparent p-1 rounded border border-transparent hover:border-border-color/50 focus:border-accent focus:ring-0 transition font-medium"
                            disabled={!item.included}
                            aria-label="Descrição do item"
                          />
                        </td>
                        <td className="px-6 py-4 text-right">
                          <input
                            type="number"
                            min="0"
                            value={item.quantity}
                            onChange={handleItemFieldChange(item.id, 'quantity')}
                            className="w-20 bg-transparent text-right p-1 rounded border border-transparent hover:border-border-color/50 focus:border-accent focus:ring-0 transition"
                            disabled={!item.included}
                            aria-label={`Quantidade para ${item.description}`}
                          />
                        </td>
                        <td className="px-6 py-4 text-right">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.unitPrice.toFixed(2)}
                            onChange={handleItemFieldChange(item.id, 'unitPrice')}
                            className="w-24 bg-transparent text-right p-1 rounded border border-transparent hover:border-border-color/50 focus:border-accent focus:ring-0 transition"
                            disabled={!item.included}
                            aria-label={`Preço unitário para ${item.description}`}
                          />
                        </td>
                        <td className="px-6 py-4 text-right">
                          <input
                            type="number"
                            min="0"
                            value={item.estimatedHours || ''}
                            placeholder="0"
                            onChange={handleItemFieldChange(item.id, 'estimatedHours')}
                            className="w-20 bg-transparent text-right p-1 rounded border border-transparent hover:border-border-color/50 focus:border-accent focus:ring-0 transition"
                            disabled={!item.included}
                            aria-label={`Horas estimadas para ${item.description}`}
                          />
                        </td>
                        <td className="px-6 py-4 font-semibold text-right">
                          {formatCurrency(itemTotal)}
                        </td>
                        <td className="p-4 text-center">
                          <button
                            onClick={() => onRemoveItem(section.id, item.id)}
                            className="text-gray-400 hover:text-error p-1 rounded-full opacity-50 hover:opacity-100 transition-opacity"
                            aria-label={`Remover ${item.description}`}
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="p-3 border-t border-border-color">
                <button
                  onClick={() => onAddItem(section.id)}
                  className="w-full text-sm font-semibold text-primary hover:bg-primary/10 transition-colors py-2 rounded-md"
                >
                  + Adicionar Serviço
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  },
);

interface SaveProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (clientInfo: { name: string; id?: string }) => void;
  clients: Client[];
  isSaving: boolean;
}

const SaveProposalModal: React.FC<SaveProposalModalProps> = ({
  isOpen,
  onClose,
  onSave,
  clients,
  isSaving,
}) => {
  const [isUnlinked, setIsUnlinked] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [manualClientName, setManualClientName] = useState('');
  const [error, setError] = useState('');

  const eligibleClients = useMemo(
    () =>
      clients.filter(
        (c) => !c.archived && (c.status === 'Cliente Ativo' || c.status === 'Potencial Cliente'),
      ),
    [clients],
  );

  useEffect(() => {
    if (isOpen) {
      setError('');
      if (eligibleClients.length > 0) {
        setIsUnlinked(false);
        setSelectedClientId(eligibleClients[0].id);
      } else {
        setIsUnlinked(true);
      }
    }
  }, [isOpen, eligibleClients]);

  const handleSave = () => {
    if (isSaving) return;
    if (isUnlinked) {
      if (!manualClientName.trim()) {
        setError('O nome do cliente é obrigatório.');
        return;
      }
      onSave({ name: manualClientName.trim() });
    } else {
      const client = clients.find((c) => c.id === selectedClientId);
      if (!client) {
        setError('Cliente selecionado inválido.');
        return;
      }
      onSave({ name: client.name, id: client.id });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Salvar como Proposta">
      <div className="space-y-4">
        <p className="text-text-primary mb-4">
          Vincule a um cliente existente ou crie uma proposta avulsa.
        </p>
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="unlinkedProposal"
            checked={isUnlinked}
            onChange={(e) => setIsUnlinked(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 accent-primary/70 focus:ring-primary/70"
          />
          <label htmlFor="unlinkedProposal" className="text-sm font-medium text-text-primary">
            Salvar Proposta Sem Vínculo
          </label>
        </div>
        {isUnlinked ? (
          <div>
            <label
              htmlFor="manualClientName"
              className="block text-sm font-medium text-text-secondary mb-2"
            >
              Nome do Cliente
            </label>
            <input
              id="manualClientName"
              type="text"
              value={manualClientName}
              onChange={(e) => setManualClientName(e.target.value)}
              placeholder="Ex: Cotação para Obra XYZ"
              className="w-full bg-background p-3 rounded-md border border-border-color"
            />
          </div>
        ) : (
          <div>
            <label
              htmlFor="clientSelect"
              className="block text-sm font-medium text-text-secondary mb-2"
            >
              Selecione o Cliente
            </label>
            <select
              id="clientSelect"
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="w-full bg-background p-3 rounded-md border border-border-color"
              disabled={eligibleClients.length === 0}
              aria-label="Selecione o cliente"
            >
              {eligibleClients.length === 0 ? (
                <option disabled>Nenhum cliente elegível</option>
              ) : (
                eligibleClients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))
              )}
            </select>
          </div>
        )}

        {error && <p className="text-error text-sm mt-2">{error}</p>}
      </div>
      <div className="flex justify-end space-x-4 mt-8">
        <button
          onClick={onClose}
          className="px-6 py-2 rounded-lg font-semibold text-text-primary bg-border-color/50 hover:bg-border-color"
        >
          Cancelar
        </button>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-2 rounded-lg font-semibold text-primary-content bg-primary hover:bg-primary-focus disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSaving ? 'Salvando...' : 'Salvar Proposta'}
        </button>
      </div>
    </Modal>
  );
};

// --- MAIN PAGE COMPONENT ---
const OrcamentosPage: React.FC = () => {
  const { clients, setProposals, customBudgetTemplate, setCustomBudgetTemplate } = useData();

  const [sections, setSections] = useState<BudgetSection[]>(() =>
    initializeSections(customBudgetTemplate),
  );
  const [discount, setDiscount] = useState<number>(0);
  const [isClearConfirmOpen, setClearConfirmOpen] = useState(false);
  const [isSaveModalOpen, setSaveModalOpen] = useState(false);
  const [isSavingProposal, setIsSavingProposal] = useState(false);
  const saveProposalLockRef = useRef(false);

  const navigate = useNavigate();

  const calculations = useMemo(() => {
    let grandCost = 0;
    let grandProfit = 0;

    const sectionDetails = sections.map((section) => {
      let sectionCost = 0;
      let sectionProfit = 0;

      const useProfitPercentage =
        (section.unit === 'h' && section.billing.method === 'per_hour') ||
        (section.unit === 'm²' && section.billing.method === 'per_sqm');

      if (useProfitPercentage) {
        const baseUnitPrice = section.billing.value || 0;
        section.items.forEach((item) => {
          if (item.included) {
            const quantity = section.unit === 'h' ? item.estimatedHours || 0 : item.quantity;
            const itemCost = quantity * baseUnitPrice;
            const itemProfit = itemCost * (item.unitPrice / 100);
            sectionCost += itemCost;
            sectionProfit += itemProfit;
          }
        });
      } else {
        const itemsSubtotal = section.items.reduce((sum, item) => {
          if (!item.included) return sum;
          const quantity = section.unit === 'h' ? item.estimatedHours || 0 : item.quantity;
          return sum + quantity * item.unitPrice;
        }, 0);

        const { method, value } = section.billing;

        switch (method) {
          case 'percentage_on_top':
            sectionCost = itemsSubtotal;
            sectionProfit = sectionCost * (value / 100);
            break;
          case 'percentage_embedded':
            sectionProfit = itemsSubtotal * (value / 100);
            sectionCost = itemsSubtotal - sectionProfit;
            break;
          case 'fixed_fee':
            sectionCost = itemsSubtotal;
            sectionProfit = value;
            break;
          case 'per_sqm':
          case 'per_hour':
            // Fallback, as profit is defined per item in useProfitPercentage mode
            sectionCost = itemsSubtotal;
            sectionProfit = 0;
            break;
          default:
            sectionCost = itemsSubtotal;
        }
      }

      const sectionTotal = sectionCost + sectionProfit;
      grandCost += sectionCost;
      grandProfit += sectionProfit;

      return { id: section.id, cost: sectionCost, profit: sectionProfit, total: sectionTotal };
    });

    const grandTotalBeforeDiscount = grandCost + grandProfit;
    const discountAmount = grandTotalBeforeDiscount * (discount / 100);
    const grandTotalAfterDiscount = grandTotalBeforeDiscount - discountAmount;

    const finalRemuneration = grandProfit * (1 - discount / 100);

    return {
      sectionDetails,
      grandCost,
      grandProfit,
      grandTotalBeforeDiscount,
      discountAmount,
      grandTotal: grandTotalAfterDiscount,
      totalProfit: finalRemuneration,
    };
  }, [sections, discount]);

  const handleSaveDefaults = useCallback(() => {
    const templateToSave = sections.map((section) => {
      const { ...sectionData } = section;
      return {
        ...sectionData,
        items: section.items.map((item) => {
          const { included, ...itemData } = item;
          return itemData;
        }),
      };
    });
    setCustomBudgetTemplate(templateToSave);
    alert('Padrões de orçamento salvos com sucesso!');
  }, [sections, setCustomBudgetTemplate]);

  const handleSaveProposal = useCallback(
    (clientInfo: { name: string; id?: string }) => {
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
                // Use the EXACT same formula as the budget UI (line 222)
                // Formula: basePrice * (1 + profitPercentage/100)
                // Example: 69.15 * (1 + 30/100) = 69.15 * 1.30 = 89.90
                const finalUnitPrice = baseUnitPrice * (1 + item.unitPrice / 100);

                return {
                  id: item.id,
                  description: item.description,
                  unit: section.unit,
                  quantity: item.quantity,
                  unitPrice: finalUnitPrice, // Stores the FINAL price with profit margin
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

      const newProposalCode = api.reserveGlobalIdentifier();
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

      setProposals((prev) => {
        const alreadyExists = prev.some(
          (p) => p.id === newProposal.id || p.code === newProposal.code,
        );
        if (alreadyExists) return prev;
        return [...prev, newProposal];
      });
      setSaveModalOpen(false);
      navigate('/propostas');
    },
    [sections, calculations, discount, setProposals, navigate],
  );

  const handleClearBudget = () => {
    setSections(initializeSections(null)); // Reset to default hardcoded values
    setDiscount(0);
    setClearConfirmOpen(false);
  };

  const handleItemChange = useCallback(
    (sectionId: number, itemId: number, field: keyof BudgetItem, value: any) => {
      setSections((prev) =>
        prev.map((s) => {
          if (s.id === sectionId) {
            return {
              ...s,
              items: s.items.map((i) => {
                if (i.id === itemId) {
                  let processedValue = value;
                  if (field === 'quantity' || field === 'unitPrice' || field === 'estimatedHours') {
                    let numValue = parseFloat(value) || 0;
                    numValue = Math.max(0, numValue);
                    processedValue = numValue;
                  } else if (field === 'included') {
                    processedValue = Boolean(value);
                  }
                  return { ...i, [field]: processedValue };
                }
                return i;
              }),
            };
          }
          return s;
        }),
      );
    },
    [],
  );

  const handleSectionChange = useCallback(
    (sectionId: number, field: 'title' | 'billingMethod' | 'billingValue' | 'unit', value: any) => {
      setSections((prev) =>
        prev.map((s) => {
          if (s.id === sectionId) {
            if (field === 'title') {
              return { ...s, title: String(value) };
            }
            if (field === 'unit') {
              return { ...s, unit: value as BudgetUnit };
            }
            if (field === 'billingMethod') {
              return { ...s, billing: { ...s.billing, method: value as BillingMethod } };
            }
            if (field === 'billingValue') {
              return { ...s, billing: { ...s.billing, value: parseFloat(value) || 0 } };
            }
          }
          return s;
        }),
      );
    },
    [],
  );

  const handleAddSection = useCallback(() => {
    setSections((prev) => [
      ...prev,
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
    setSections((prev) => prev.filter((s) => s.id !== sectionId));
  }, []);
  const handleAddItem = useCallback((sectionId: number) => {
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              items: [
                ...s.items,
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
          : s,
      ),
    );
  }, []);
  const handleRemoveItem = useCallback((sectionId: number, itemId: number) => {
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId ? { ...s, items: s.items.filter((i) => i.id !== itemId) } : s,
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
                calculations.sectionDetails.find((s) => s.id === section.id) || {
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
                  onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
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
};

export default OrcamentosPage;
