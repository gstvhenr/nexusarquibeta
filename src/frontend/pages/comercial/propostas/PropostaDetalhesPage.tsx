import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useAutoReset } from '../../../hooks/useAutoReset';
import { useParams, useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { PageHeader } from '../../../components/layout';
import { useCoreData, useSystemData } from '../../../context/DataContext';
import type { ProposalBlock, ProjectAddress } from '../../../types';

import { proposalService } from '../../../services/proposalService';
import { NAV_LINKS } from '../../../constants';
import { addItemToTree } from '../../../utils/tree';
import {
  ProposalDocumentEditor,
  ConversionModal,
  ValidationModal,
} from '../../../components/propostas';
import { v4 as uuidv4 } from 'uuid';
import { validateClientForProject } from '../../../services/clientService';

// --- PAGE COMPONENT ---

const PropostaDetalhesPage: () => React.ReactNode = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { proposals, setProposals, projects, setProjects, clients, setClients } = useCoreData();
  const { setDocumentStorage: setDocs, setAgendaEvents, contractDeadlines } = useSystemData();

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
  const [toast, setToast] = useAutoReset<{ message: string; type: 'success' | 'error' } | null>(
    null,
    3500,
  );

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
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, (imgHeight * pdfWidth) / imgWidth);
      pdf.save(`proposta_${proposal?.code}.pdf`);
    } catch (error) {
      console.error('PDF Error', error);
      setToast({ message: 'Erro ao gerar PDF.', type: 'error' });
    } finally {
      setIsExportingPdf(false);
    }
  }, [proposal, setToast]);

  // Enhanced Conversion Handler
  const handleConversionClick = () => {
    if (!proposal) return;
    const client = clients.find((c) => c.id === proposal.clientId);

    if (!client) {
      setToast({ message: 'Cliente não encontrado.', type: 'error' });
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
        setToast({ message: 'Cliente não encontrado.', type: 'error' });
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
      setToast({ message: 'Projeto criado com sucesso!', type: 'success' });
      navigate(`/projetos/${result.newProject.id}`);
    },
    [
      proposal,
      setProjects,
      setProposals,
      clients,
      setClients,
      setDocs,
      setAgendaEvents,
      navigate,
      contractDeadlines,
      setToast,
    ],
  );

  if (!proposal) return <div>Proposta não encontrada</div>;
  const client = clients.find((c) => c.id === proposal.clientId);

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

      {/* Toast notification */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-fade-in-up">
          <div
            className={`flex items-center gap-3 px-5 py-3 rounded-xl bg-surface border shadow-lg backdrop-blur-sm ${
              toast.type === 'success' ? 'border-emerald-500/30' : 'border-error/30'
            }`}
          >
            <span className={toast.type === 'success' ? 'text-emerald-500' : 'text-error'}>
              {toast.type === 'success' ? (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
                  />
                </svg>
              )}
            </span>
            <span className="text-sm font-medium text-text-primary">{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropostaDetalhesPage;
