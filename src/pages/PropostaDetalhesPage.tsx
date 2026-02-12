import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { PageHeader } from '../components/layout';
import { Modal } from '../components/ui';
import { useData } from '../context/DataContext';
import type {
  Proposal,
  Project,
  Client,
  DocumentStorage,
  DocumentFolder,
  AgendaEvent,
  ProposalStatus,
  ProposalBlock,
  ProjectAddress,
  SavedSection,
} from '../types';
import { proposalStatuses } from '../types';
import { formatCurrency, formatCEP } from '../utils/formatters';
import { proposalService } from '../services/proposalService';
import { PROPOSAL_STATUS_CLASSES, NAV_LINKS, PROJECT_DOCUMENT_FOLDER_TEMPLATE } from '../constants';
import { addItemToTree } from '../utils/tree';
import {
  PlusIcon,
  TrashIcon,
  ArrowUpCircleIcon,
  ArrowDownCircleIcon,
  AlertIcon,
} from '../components/ui';
import { v4 as uuidv4 } from 'uuid';
import { validateClientForProject } from '../services/clientService';

// --- SUB-COMPONENTS FOR EDITOR ---

interface BudgetTableBlockProps {
  proposal: Proposal;
  showItemPrices: boolean;
  showSectionTotals: boolean;
  showDiscount: boolean;
  showGrandTotal: boolean;
  totalsAlignment: 'right' | 'left';
}

const computeSectionTotal = (section: SavedSection): number => {
  return section.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
};

const BudgetTableBlock: React.FC<BudgetTableBlockProps> = ({
  proposal,
  showItemPrices,
  showSectionTotals,
  showDiscount,
  showGrandTotal,
  totalsAlignment,
}) => {
  return (
    <div className="my-6">
      {/* Render all sections */}
      {proposal.sections.map((section) => {
        const sectionTotal = computeSectionTotal(section);
        return (
          <div key={section.id} className="mb-8">
            <h4 className="font-serif text-lg font-bold text-gray-800 mb-2 border-b-2 border-primary/20 pb-1 inline-block">
              {section.title}
            </h4>

            {/* Service List (ALWAYS VISIBLE) */}
            <div className="overflow-x-auto mt-2">
              <table className="w-full text-sm">
                <thead className="text-left text-gray-500 border-b border-gray-200">
                  <tr>
                    <th className="py-2 pr-4 font-semibold uppercase text-xs tracking-wider">
                      Descrição
                    </th>
                    {showItemPrices && (
                      <th className="py-2 pl-4 text-right font-semibold uppercase text-xs tracking-wider w-32">
                        Valor
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {section.items.map((item) => (
                    <tr key={item.id} className="border-b border-gray-100 last:border-0">
                      <td className="py-3 pr-4 text-gray-700">
                        {item.description}
                        {item.quantity > 1 && (
                          <span className="text-gray-400 text-xs ml-2">
                            ({item.quantity} {item.unit})
                          </span>
                        )}
                      </td>
                      {showItemPrices && (
                        <td className="py-3 pl-4 text-right font-medium text-gray-900">
                          {formatCurrency(item.quantity * item.unitPrice)}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Section Total (conditional) */}
            {showSectionTotals && (
              <div className="flex justify-end mt-3 pr-2">
                <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded">
                  <span className="text-sm text-gray-600 font-medium">Subtotal da Seção:</span>
                  <span className="text-base text-gray-900 font-semibold">
                    {formatCurrency(sectionTotal)}
                  </span>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Grand Total Section (conditional) */}
      {showGrandTotal && (
        <div
          className={`flex items-end pt-4 mt-4 border-t-2 border-gray-300 ${totalsAlignment === 'left' ? 'justify-start' : 'justify-end'}`}
        >
          <div className="w-full max-w-xs space-y-2 text-md">
            {showDiscount && proposal.discount > 0 && (
              <>
                <div className="flex justify-between">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-medium text-gray-900">
                    {formatCurrency(proposal.subtotal)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Desconto ({proposal.discount}%)</span>
                  <span className="font-medium text-red-500">
                    - {formatCurrency(proposal.subtotal - proposal.total)}
                  </span>
                </div>
                <div className="border-t border-gray-200 my-1"></div>
              </>
            )}
            <div className="flex justify-between font-bold text-xl items-center">
              <span className="text-primary">Total</span>
              <span className="text-gray-900">{formatCurrency(proposal.total)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const TextBlockEditor: React.FC<{
  content: string;
  onChange: (val: string) => void;
  onDelete: () => void;
  isEditing: boolean;
}> = ({ content, onChange, onDelete, isEditing }) => {
  return (
    <div className="relative group mb-4">
      {isEditing ? (
        <textarea
          value={content}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-background p-4 rounded-lg border border-border-color focus:border-accent text-base leading-relaxed min-h-[100px]"
          placeholder="Escreva seu texto aqui..."
        />
      ) : (
        <div className="prose max-w-none text-text-primary whitespace-pre-wrap p-2">{content}</div>
      )}
      {isEditing && (
        <button
          onClick={onDelete}
          className="absolute -right-3 -top-3 bg-surface border border-border-color text-error p-1 rounded-full shadow-sm hover:bg-error/10"
          aria-label="Excluir bloco"
        >
          <TrashIcon className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

// Main Document Editor Component
const ProposalDocumentEditor: React.FC<{
  blocks: ProposalBlock[];
  proposal: Proposal;
  onUpdateBlocks: (blocks: ProposalBlock[]) => void;
  readOnly: boolean;
}> = ({ blocks, proposal, onUpdateBlocks, readOnly }) => {
  const addTextBlock = (index: number) => {
    const newBlock: ProposalBlock = { id: uuidv4(), type: 'text', content: '', order: index };
    const newBlocks = [...blocks];
    newBlocks.splice(index, 0, newBlock);
    onUpdateBlocks(newBlocks);
  };

  const handleContentChange = (id: string, newContent: string) => {
    onUpdateBlocks(blocks.map((b) => (b.id === id ? { ...b, content: newContent } : b)));
  };

  const handleDeleteBlock = (id: string) => {
    onUpdateBlocks(blocks.filter((b) => b.id !== id));
  };

  const moveBlock = (index: number, direction: -1 | 1) => {
    if (index + direction < 0 || index + direction >= blocks.length) return;
    const newBlocks = [...blocks];
    const temp = newBlocks[index];
    newBlocks[index] = newBlocks[index + direction];
    newBlocks[index + direction] = temp;
    onUpdateBlocks(newBlocks);
  };

  return (
    <div className="h-full p-12 relative">
      {/* Header / Letterhead */}
      <div className="border-b-2 border-primary pb-6 mb-8 flex justify-between items-start">
        <div>
          <h1 className="font-serif text-3xl font-bold text-secondary">
            Rafael Munaro Arquitetura
          </h1>
          <p className="text-sm text-text-secondary mt-1">CAU: A231798-2 | (19) 99690-8104</p>
          <p className="text-sm text-text-secondary">
            Rua Padre Fabiano, 1072 - Centro, Capivari-SP
          </p>
        </div>
        <div className="text-right">
          <h2 className="text-xl font-bold text-text-primary">Proposta Comercial</h2>
          <p className="text-sm text-text-secondary">{proposal.code}</p>
          {proposal.showProposalDate !== false && (
            <p className="text-sm text-text-secondary">{proposal.date}</p>
          )}
        </div>
      </div>

      <div className="mb-8">
        <h3 className="font-serif text-2xl font-bold text-center text-primary mb-2">
          {proposal.name}
        </h3>
        <p className="text-center text-text-secondary">Projeto de Arquitetura & Interiores</p>
      </div>

      {/* Blocks */}
      <div className="space-y-6">
        {blocks.map((block, index) => (
          <div key={block.id} className="relative group/block">
            {!readOnly && (
              <div className="absolute -left-10 top-2 flex flex-col gap-1 opacity-0 group-hover/block:opacity-100 transition-opacity">
                <button
                  onClick={() => moveBlock(index, -1)}
                  className="p-1 text-text-secondary hover:text-primary"
                  aria-label="Mover bloco para cima"
                >
                  <ArrowUpCircleIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => moveBlock(index, 1)}
                  className="p-1 text-text-secondary hover:text-primary"
                  aria-label="Mover bloco para baixo"
                >
                  <ArrowDownCircleIcon className="w-5 h-5" />
                </button>
              </div>
            )}

            {block.type === 'text' && (
              <TextBlockEditor
                content={block.content || ''}
                onChange={(val) => handleContentChange(block.id, val)}
                onDelete={() => handleDeleteBlock(block.id)}
                isEditing={!readOnly}
              />
            )}

            {block.type === 'budget_table' && (
              <div
                className={`transition-colors ${!readOnly ? 'border-2 border-dashed border-transparent hover:border-primary/20 rounded p-2' : ''}`}
              >
                <BudgetTableBlock
                  proposal={proposal}
                  showItemPrices={proposal.showItemPrices !== false}
                  showSectionTotals={proposal.showSectionTotals !== false}
                  showDiscount={proposal.discount > 0 && proposal.showDiscount !== false}
                  showGrandTotal={proposal.showGrandTotal !== false}
                  totalsAlignment={proposal.totalsAlignment === 'left' ? 'left' : 'right'}
                />
                {!readOnly && (
                  <p className="text-center text-xs text-text-secondary mb-2">
                    Tabela de Orçamento (Gerada Automaticamente)
                  </p>
                )}
              </div>
            )}

            {!readOnly && (
              <div
                className="h-4 group/add flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity my-2 cursor-pointer"
                onClick={() => addTextBlock(index + 1)}
              >
                <div className="h-px bg-primary/30 w-full relative">
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-surface border border-primary text-primary px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-1">
                    <PlusIcon className="w-3 h-3" /> Texto
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Initial Add Button if empty */}
      {!readOnly && blocks.length === 0 && (
        <button
          onClick={() => addTextBlock(0)}
          className="w-full py-8 border-2 border-dashed border-border-color rounded-lg text-text-secondary hover:border-primary hover:text-primary transition-colors flex flex-col items-center justify-center"
        >
          <PlusIcon className="w-8 h-8 mb-2" />
          <span>Começar a escrever a proposta</span>
        </button>
      )}
    </div>
  );
};

const ConversionModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (useDifferentAddress: boolean, address?: ProjectAddress) => void;
  clientAddress: ProjectAddress;
}> = ({ isOpen, onClose, onConfirm, clientAddress }) => {
  const [isStep2, setIsStep2] = useState(false);
  const [newAddress, setNewAddress] = useState<ProjectAddress>({
    street: '',
    number: '',
    neighborhood: '',
    city: '',
    state: 'SP', // Default locked to SP
    zip: '',
    complement: '',
  });

  useEffect(() => {
    if (isOpen) {
      setIsStep2(false);
      setNewAddress({
        street: '',
        number: '',
        neighborhood: '',
        city: '',
        state: 'SP',
        zip: '',
        complement: '',
      });
    }
  }, [isOpen]);

  const handleAddressChange = (field: keyof ProjectAddress, value: string) => {
    setNewAddress((prev) => ({ ...prev, [field]: value }));
  };

  const handleConfirmStep1 = () => {
    onConfirm(false);
  };

  const handleConfirmStep2 = () => {
    onConfirm(true, newAddress);
  };

  if (!isOpen) return null;
  const inputClass =
    'w-full bg-background p-2 rounded-md border border-border-color focus:border-accent text-sm';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Converter para Projeto">
      <div className="space-y-6">
        {!isStep2 ? (
          // STEP 1: Selection
          <div className="animate-fade-in-up">
            <p className="font-semibold text-text-primary mb-2">Endereço da Obra/Serviço</p>
            <p className="text-sm text-text-secondary mb-4">
              O local do serviço é o mesmo do endereço cadastrado do cliente?
            </p>
            <div className="p-3 bg-surface border border-border-color rounded-lg mb-6 text-sm text-text-secondary">
              {clientAddress.street}, {clientAddress.number} - {clientAddress.neighborhood},{' '}
              {clientAddress.city}/{clientAddress.state}
            </div>

            <div className="grid grid-cols-1 gap-3">
              <button
                onClick={handleConfirmStep1}
                className="flex items-center p-3 border border-border-color rounded-lg hover:border-primary hover:bg-primary/5 transition-all text-left group"
              >
                <div className="flex-1">
                  <span className="block font-semibold text-text-primary group-hover:text-primary">
                    Sim, é o mesmo endereço
                  </span>
                  <span className="text-xs text-text-secondary">
                    O projeto será vinculado ao endereço do cliente acima.
                  </span>
                </div>
                <div className="w-4 h-4 rounded-full border border-border-color group-hover:border-primary"></div>
              </button>

              <button
                onClick={() => setIsStep2(true)}
                className="flex items-center p-3 border border-border-color rounded-lg hover:border-primary hover:bg-primary/5 transition-all text-left group"
              >
                <div className="flex-1">
                  <span className="block font-semibold text-text-primary group-hover:text-primary">
                    Não, é outro local
                  </span>
                  <span className="text-xs text-text-secondary">
                    Cadastrar um endereço específico para a obra.
                  </span>
                </div>
                <div className="w-4 h-4 rounded-full border border-border-color group-hover:border-primary"></div>
              </button>
            </div>
          </div>
        ) : (
          // STEP 2: Form
          <div className="bg-background/50 p-4 rounded-lg border border-border-color animate-fade-in-up">
            <h4 className="font-semibold text-sm text-text-primary mb-3">Novo Endereço da Obra</h4>
            <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
              <div className="md:col-span-2">
                <input
                  type="text"
                  placeholder="CEP"
                  value={newAddress.zip}
                  onChange={(e) => handleAddressChange('zip', formatCEP(e.target.value))}
                  className={inputClass}
                />
              </div>
              <div className="md:col-span-4">
                <input
                  type="text"
                  placeholder="Rua"
                  value={newAddress.street}
                  onChange={(e) => handleAddressChange('street', e.target.value)}
                  className={inputClass}
                />
              </div>
              <div className="md:col-span-2">
                <input
                  type="text"
                  placeholder="Número"
                  value={newAddress.number}
                  onChange={(e) => handleAddressChange('number', e.target.value)}
                  className={inputClass}
                />
              </div>
              <div className="md:col-span-4">
                <input
                  type="text"
                  placeholder="Bairro"
                  value={newAddress.neighborhood}
                  onChange={(e) => handleAddressChange('neighborhood', e.target.value)}
                  className={inputClass}
                />
              </div>
              <div className="md:col-span-4">
                <input
                  type="text"
                  placeholder="Cidade"
                  value={newAddress.city}
                  onChange={(e) => handleAddressChange('city', e.target.value)}
                  className={inputClass}
                />
              </div>
              <div className="md:col-span-2">
                <input
                  type="text"
                  placeholder="UF"
                  value={newAddress.state}
                  disabled
                  className={`${inputClass} opacity-60 cursor-not-allowed`}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-4 mt-6 pt-4 border-t border-border-color">
        {isStep2 ? (
          <>
            <button
              onClick={() => setIsStep2(false)}
              className="px-6 py-2 rounded-lg font-semibold text-text-primary bg-border-color/50 hover:bg-border-color"
            >
              Voltar
            </button>
            <button
              onClick={handleConfirmStep2}
              className="px-6 py-2 rounded-lg font-semibold text-primary-content bg-primary hover:bg-primary-focus"
            >
              Confirmar Conversão
            </button>
          </>
        ) : (
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg font-semibold text-text-primary bg-border-color/50 hover:bg-border-color"
          >
            Cancelar
          </button>
        )}
      </div>
    </Modal>
  );
};

// --- Validation Modal ---
const ValidationModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  errors: string[];
  onRedirect: () => void;
}> = ({ isOpen, onClose, errors, onRedirect }) => {
  if (!isOpen) return null;
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Cadastro Incompleto">
      <div className="space-y-4">
        <div className="bg-warning/10 border-l-4 border-warning p-4 rounded-r-lg flex items-start gap-3">
          <AlertIcon className="w-6 h-6 text-warning flex-shrink-0" />
          <div>
            <h4 className="font-bold text-text-primary text-sm">Atenção!</h4>
            <p className="text-sm text-text-secondary mt-1">
              Para converter esta proposta em projeto, o cliente precisa ter o cadastro completo.
            </p>
          </div>
        </div>

        <div className="bg-background border border-border-color rounded-lg p-4">
          <p className="font-semibold text-sm mb-2 text-text-primary">Campos faltantes:</p>
          <ul className="list-disc list-inside text-sm text-error space-y-1">
            {errors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      </div>
      <div className="flex justify-end space-x-4 mt-6 pt-4 border-t border-border-color">
        <button
          onClick={onClose}
          className="px-6 py-2 rounded-lg font-semibold text-text-primary bg-border-color/50 hover:bg-border-color"
        >
          Cancelar
        </button>
        <button
          onClick={onRedirect}
          className="px-6 py-2 rounded-lg font-semibold text-primary-content bg-primary hover:bg-primary-focus"
        >
          Corrigir Cadastro
        </button>
      </div>
    </Modal>
  );
};

// --- PAGE COMPONENT ---

const PropostaDetalhesPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    proposals,
    setProposals,
    projects,
    setProjects,
    clients,
    setClients,
    documentStorage: docs,
    setDocumentStorage: setDocs,
    setAgendaEvents,
    contractDeadlines,
  } = useData();

  const proposal = useMemo(() => proposals.find((p) => p.id === id), [id, proposals]);

  // Initialize blocks if not present
  const [blocks, setBlocks] = useState<ProposalBlock[]>([]);

  useEffect(() => {
    if (proposal) {
      if (proposal.contentBlocks && proposal.contentBlocks.length > 0) {
        setBlocks(proposal.contentBlocks);
      } else {
        // Default structure if no blocks exist
        setBlocks([
          {
            id: uuidv4(),
            type: 'text',
            order: 0,
            content: `Prezado(a) ${proposal.name},\n\nÉ com satisfação que apresentamos esta proposta de serviços de arquitetura e design.`,
          },
          { id: uuidv4(), type: 'budget_table', order: 1 },
          {
            id: uuidv4(),
            type: 'text',
            order: 2,
            content:
              'Estamos à disposição para quaisquer esclarecimentos.\n\nAtenciosamente,\nRafael Munaro',
          },
        ]);
      }
    }
  }, [proposal]);

  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isConversionModalOpen, setConversionModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // Validation State
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isValidationModalOpen, setValidationModalOpen] = useState(false);

  const projectExists = useMemo(() => {
    if (!proposal) return false;
    return projects.some((p) => p.proposalId === proposal.id);
  }, [projects, proposal]);

  const saveBlocks = () => {
    if (proposal) {
      setProposals((prev) =>
        prev.map((p) => (p.id === proposal.id ? { ...p, contentBlocks: blocks } : p)),
      );
      setIsEditMode(false);
    }
  };

  const handleExportPdf = useCallback(async () => {
    setIsExportingPdf(true);
    // Temporarily ensure we are in view mode for clean capture
    setIsEditMode(false);

    // Wait for render
    await new Promise((resolve) => setTimeout(resolve, 500));

    const element = document.getElementById('proposal-document');
    if (!element) return;

    try {
      const canvas = await html2canvas(element, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 30;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, (imgHeight * pdfWidth) / imgWidth);
      pdf.save(`proposta_${proposal?.code}.pdf`);
    } catch (error) {
      console.error('PDF Error', error);
      alert('Erro ao gerar PDF.');
    } finally {
      setIsExportingPdf(false);
    }
  }, [proposal]);

  // Enhanced Conversion Handler
  const handleConversionClick = () => {
    if (!proposal) return;
    const client = clients.find((c) => c.id === proposal.clientId);

    if (!client) {
      alert('Cliente não encontrado.');
      return;
    }

    const validation = validateClientForProject(client);

    if (!validation.valid) {
      setValidationErrors(validation.missingFields);
      setValidationModalOpen(true);
    } else {
      setConversionModalOpen(true);
    }
  };

  const convertProposal = useCallback(
    (useDifferentAddress: boolean, address?: ProjectAddress) => {
      if (!proposal) return;
      const client = clients.find((c) => c.id === proposal.clientId);
      if (!client) {
        alert('Cliente não encontrado.');
        return;
      }

      const result = proposalService.convertProposalToProject(
        proposal,
        client,
        contractDeadlines,
        address,
      );

      setProjects((prev) => [result.newProject, ...prev]);
      setProposals((prev) => prev.map((p) => (p.id === proposal.id ? result.updatedProposal : p)));
      if (result.updatedClient) {
        setClients((prev) =>
          prev.map((c) => (c.id === result.updatedClient!.id ? result.updatedClient! : c)),
        );
      }
      setDocs((prevDocs) => ({
        ...prevDocs,
        projects: addItemToTree(prevDocs.projects, 'projects-root', result.newProjectFolder),
      }));
      setAgendaEvents(result.updatedAgendaEvents);

      setConversionModalOpen(false);
      alert('Projeto criado com sucesso!');
      navigate(`/projetos/${result.newProject.id}`);
    },
    [
      proposal,
      projects,
      setProjects,
      setProposals,
      clients,
      setClients,
      setDocs,
      setAgendaEvents,
      navigate,
      contractDeadlines,
    ],
  );

  if (!proposal) return <div>Proposta não encontrada</div>;
  const client = clients.find((c) => c.id === proposal.clientId);
  const statusClass = PROPOSAL_STATUS_CLASSES[proposal.status];
  const propostasIcon = NAV_LINKS.find((link) => link.path === '/propostas')?.icon;

  // Linked project info
  const linkedProject = proposal.projectId
    ? projects.find((p) => p.id === proposal.projectId)
    : null;

  // Toggle handlers for PDF display settings
  const toggleShowItemPrices = () => {
    const newVal = !(proposal.showItemPrices !== false);
    setProposals((prev) =>
      prev.map((p) => (p.id === proposal.id ? { ...p, showItemPrices: newVal } : p)),
    );
  };
  const toggleShowSectionTotals = () => {
    const newVal = !(proposal.showSectionTotals !== false);
    setProposals((prev) =>
      prev.map((p) => (p.id === proposal.id ? { ...p, showSectionTotals: newVal } : p)),
    );
  };
  const toggleShowDiscount = () => {
    if (proposal.discount <= 0) return;
    const newVal = !(proposal.showDiscount !== false);
    setProposals((prev) =>
      prev.map((p) => (p.id === proposal.id ? { ...p, showDiscount: newVal } : p)),
    );
  };
  const toggleShowGrandTotal = () => {
    const newVal = !(proposal.showGrandTotal !== false);
    setProposals((prev) =>
      prev.map((p) => (p.id === proposal.id ? { ...p, showGrandTotal: newVal } : p)),
    );
  };
  const toggleShowProposalDate = () => {
    const newVal = !(proposal.showProposalDate !== false);
    setProposals((prev) =>
      prev.map((p) => (p.id === proposal.id ? { ...p, showProposalDate: newVal } : p)),
    );
  };
  const handleTotalsAlignmentChange = (alignment: 'right' | 'left') => {
    setProposals((prev) =>
      prev.map((p) => (p.id === proposal.id ? { ...p, totalsAlignment: alignment } : p)),
    );
  };

  // Computed display flags with defaults
  const showItemPrices = proposal.showItemPrices !== false;
  const showSectionTotals = proposal.showSectionTotals !== false;
  const hasDiscount = proposal.discount > 0;
  const showDiscount = hasDiscount && proposal.showDiscount !== false;
  const showGrandTotal = proposal.showGrandTotal !== false;
  const showProposalDate = proposal.showProposalDate !== false;
  const totalsAlignment: 'right' | 'left' = proposal.totalsAlignment === 'left' ? 'left' : 'right';

  return (
    <div className="animate-fade-in-up pb-24">
      <div className="flex justify-between items-start mb-6">
        <PageHeader title={`${proposal.name} - ${proposal.code}`} icon={propostasIcon} />
        <div className="flex items-center gap-3 mt-10">
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 rounded-lg font-semibold text-text-primary bg-surface border border-border-color"
          >
            Voltar
          </button>
          {isEditMode ? (
            <button
              onClick={saveBlocks}
              className="px-4 py-2 rounded-lg font-semibold text-primary-content bg-primary hover:bg-primary-focus"
            >
              Salvar Edição
            </button>
          ) : (
            <button
              onClick={() => setIsEditMode(true)}
              className="px-4 py-2 rounded-lg font-semibold text-primary bg-primary/10 hover:bg-primary/20"
            >
              Editar Documento
            </button>
          )}
          <button
            onClick={handleExportPdf}
            disabled={isExportingPdf}
            className="px-4 py-2 rounded-lg font-semibold text-orange-700 bg-orange-100 hover:bg-orange-200"
          >
            {isExportingPdf ? 'Gerando...' : 'PDF'}
          </button>
          {!projectExists && proposal.clientId && (
            <button
              onClick={handleConversionClick}
              className="px-4 py-2 rounded-lg font-semibold text-primary-content bg-secondary hover:bg-secondary-focus"
            >
              Converter para Projeto
            </button>
          )}
        </div>
      </div>

      {/* PDF Display Settings & Linked Project Badge */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 bg-surface rounded-xl p-4 border border-border-color/50">
        <div className="flex items-center gap-6">
          <span className="text-sm font-semibold text-text-secondary uppercase tracking-wider">
            Exibição no PDF
          </span>
          {/* Independent Checkboxes for PDF Customization */}
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer select-none group">
              <input
                type="checkbox"
                checked={showItemPrices}
                onChange={toggleShowItemPrices}
                className="w-4 h-4 rounded border-gray-300 accent-primary/70 focus:ring-primary/70"
              />
              <span className="text-sm text-text-primary group-hover:text-primary transition-colors">
                Valores individuais
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer select-none group">
              <input
                type="checkbox"
                checked={showSectionTotals}
                onChange={toggleShowSectionTotals}
                className="w-4 h-4 rounded border-gray-300 accent-primary/70 focus:ring-primary/70"
              />
              <span className="text-sm text-text-primary group-hover:text-primary transition-colors">
                Subtotais de seção
              </span>
            </label>
            <label
              className={`flex items-center gap-2 select-none group ${hasDiscount ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}
            >
              <input
                type="checkbox"
                checked={showDiscount}
                onChange={toggleShowDiscount}
                disabled={!hasDiscount}
                className="w-4 h-4 rounded border-gray-300 accent-primary/70 focus:ring-primary/70"
              />
              <span className="text-sm text-text-primary group-hover:text-primary transition-colors">
                Desconto
              </span>
            </label>
          </div>
          <label className="flex items-center gap-2 cursor-pointer select-none group">
            <input
              type="checkbox"
              checked={showGrandTotal}
              onChange={toggleShowGrandTotal}
              className="w-4 h-4 rounded border-gray-300 accent-primary/70 focus:ring-primary/70"
            />
            <span className="text-sm text-text-primary group-hover:text-primary transition-colors">
              Total geral
            </span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer select-none group">
            <input
              type="checkbox"
              checked={showProposalDate}
              onChange={toggleShowProposalDate}
              className="w-4 h-4 rounded border-gray-300 accent-primary/70 focus:ring-primary/70"
            />
            <span className="text-sm text-text-primary group-hover:text-primary transition-colors">
              Data
            </span>
          </label>
          <div className="flex items-center gap-2">
            <label htmlFor="totals-alignment" className="text-sm text-text-primary">
              Alinhamento dos totais
            </label>
            <select
              id="totals-alignment"
              value={totalsAlignment}
              onChange={(e) => handleTotalsAlignmentChange(e.target.value as 'right' | 'left')}
              className="bg-background p-2 rounded-md border border-border-color text-sm text-text-primary"
            >
              <option value="right">Direita</option>
              <option value="left">Esquerda</option>
            </select>
          </div>
        </div>

        {linkedProject && (
          <button
            onClick={() => navigate(`/projetos/${linkedProject.id}`)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold bg-accent/10 text-accent hover:bg-accent/20 transition-colors border border-accent/20"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.86-2.06a4.5 4.5 0 00-1.242-7.244l-4.5-4.5a4.5 4.5 0 00-6.364 6.364L4.34 8.636"
              />
            </svg>
            Vinculado ao {linkedProject.code}
          </button>
        )}
      </div>

      <div className="flex justify-center bg-background/50 p-8 rounded-2xl border border-border-color/50 overflow-auto">
        <div
          id="proposal-document"
          className="w-[210mm] bg-white text-black shadow-md min-h-[297mm]"
        >
          <ProposalDocumentEditor
            blocks={blocks}
            proposal={proposal}
            onUpdateBlocks={setBlocks}
            readOnly={!isEditMode}
          />
        </div>
      </div>

      {client && (
        <>
          <ConversionModal
            isOpen={isConversionModalOpen}
            onClose={() => setConversionModalOpen(false)}
            onConfirm={convertProposal}
            clientAddress={client.address}
          />
          <ValidationModal
            isOpen={isValidationModalOpen}
            onClose={() => setValidationModalOpen(false)}
            errors={validationErrors}
            onRedirect={() => navigate(`/clientes/${client.id}`)}
          />
        </>
      )}
    </div>
  );
};

export default PropostaDetalhesPage;
