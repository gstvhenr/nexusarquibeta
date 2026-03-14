import { useState, useMemo, useCallback, useEffect } from 'react';
import { useAutoReset } from '@/hooks/useAutoReset';
import { useDisclosure } from '@/hooks/useDisclosure';
import { useParams, useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { PageHeader } from '@/components/layout';
import { useCoreData, useSystemData } from '@/context/DataContext';
import type { ProposalBlock, ProjectAddress } from '@/types';
import { Modal, Button, Select, LinkIcon, CheckCircleIcon, AlertIcon } from '@/components/ui';

import { proposalService } from '@/services/proposalService';
import { NAV_LINKS } from '@/constants';
import { addItemToTree } from '@/utils/tree';
import { ProposalDocumentEditor, ConversionModal, ValidationModal } from '@/components/propostas';
import { v4 as uuidv4 } from 'uuid';
import { validateClientForProject } from '@/services/clientService';

// --- PAGE COMPONENT ---

function PropostaDetalhesPage(): JSX.Element | null {
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
  const [isEditMode, setIsEditMode] = useState(false);
  const conversionDisclosure = useDisclosure();
  const closeConversionModal = conversionDisclosure.close;
  const linkClientDisclosure = useDisclosure();
  const [selectedClientId, setSelectedClientId] = useState('');

  // Validation State
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const validationDisclosure = useDisclosure();
  const [toast, setToast] = useAutoReset<{ message: string; type: 'success' | 'error' } | null>(
    null,
    3500,
  );

  const eligibleClients = useMemo(
    () =>
      clients.filter(
        (c) => !c.archived && (c.status === 'Cliente Ativo' || c.status === 'Potencial Cliente'),
      ),
    [clients],
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

    // If no client linked, open the link-client modal first
    if (!proposal.clientId) {
      if (eligibleClients.length > 0) {
        setSelectedClientId(eligibleClients[0].id);
      }
      linkClientDisclosure.open();
      return;
    }

    const client = clients.find((c) => c.id === proposal.clientId);

    if (!client) {
      setToast({ message: 'Cliente não encontrado.', type: 'error' });
      return;
    }

    const validation = validateClientForProject(client);

    if (!validation.valid) {
      setValidationErrors(validation.missingFields);
      validationDisclosure.open();
    } else {
      conversionDisclosure.open();
    }
  };

  const handleLinkClientAndConvert = () => {
    if (!proposal || !selectedClientId) return;

    const linkedClient = clients.find((c) => c.id === selectedClientId);
    if (!linkedClient) {
      setToast({ message: 'Cliente selecionado inválido.', type: 'error' });
      return;
    }

    // Link client to proposal
    setProposals((prev) =>
      prev.map((p) =>
        p.id === proposal.id ? { ...p, clientId: selectedClientId, name: linkedClient.name } : p,
      ),
    );
    linkClientDisclosure.close();

    // Now validate and proceed with conversion
    const validation = validateClientForProject(linkedClient);
    if (!validation.valid) {
      setValidationErrors(validation.missingFields);
      validationDisclosure.open();
    } else {
      conversionDisclosure.open();
    }
  };

  const convertProposal = useCallback(
    (useDifferentAddress: boolean, address?: ProjectAddress) => {
      if (!proposal) return;
      if (!proposal.clientId) return;
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

      closeConversionModal();
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
      closeConversionModal,
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
      <PageHeader title={`${proposal.name} - ${proposal.code}`} icon={propostasIcon}>
        <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
          Voltar
        </Button>
        {isEditMode ? (
          <Button type="button" variant="primary" onClick={saveBlocks}>
            Salvar Edição
          </Button>
        ) : (
          <Button
            type="button"
            variant="secondary"
            onClick={() => setIsEditMode(true)}
            className="bg-primary/10 text-primary border-primary/10 hover:bg-primary/20"
          >
            Editar Documento
          </Button>
        )}
        <Button
          type="button"
          variant="secondary"
          onClick={handleExportPdf}
          disabled={isExportingPdf}
          className="bg-warning/10 text-warning border-warning/20 hover:bg-warning/20"
        >
          {isExportingPdf ? 'Gerando...' : 'PDF'}
        </Button>
        {!projectExists && (
          <Button type="button" variant="primary" onClick={handleConversionClick}>
            Converter para Projeto
          </Button>
        )}
      </PageHeader>

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
                className="w-4 h-4 rounded border-border-color accent-primary/70 focus:ring-primary/70"
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
                className="w-4 h-4 rounded border-border-color accent-primary/70 focus:ring-primary/70"
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
                className="w-4 h-4 rounded border-border-color accent-primary/70 focus:ring-primary/70"
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
              className="w-4 h-4 rounded border-border-color accent-primary/70 focus:ring-primary/70"
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
              className="w-4 h-4 rounded border-border-color accent-primary/70 focus:ring-primary/70"
            />
            <span className="text-sm text-text-primary group-hover:text-primary transition-colors">
              Data
            </span>
          </label>
          <div className="flex items-center gap-2">
            <label htmlFor="totals-alignment" className="text-sm text-text-primary">
              Alinhamento dos totais
            </label>
            <Select
              id="totals-alignment"
              value={totalsAlignment}
              onChange={(e) => handleTotalsAlignmentChange(e.target.value as 'right' | 'left')}
              options={[
                { value: 'right', label: 'Direita' },
                { value: 'left', label: 'Esquerda' },
              ]}
              className="text-sm"
              wrapperClassName="min-w-[9rem]"
            />
          </div>
        </div>

        {linkedProject && (
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate(`/projetos/${linkedProject.id}`)}
            className="flex items-center gap-2 text-sm bg-accent/10 text-accent border-accent/20 hover:bg-accent/20"
          >
            <LinkIcon className="w-4 h-4" />
            Vinculado ao {linkedProject.code}
          </Button>
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
            isOpen={conversionDisclosure.isOpen}
            onClose={conversionDisclosure.close}
            onConfirm={convertProposal}
            clientAddress={client.address}
          />
          <ValidationModal
            isOpen={validationDisclosure.isOpen}
            onClose={validationDisclosure.close}
            errors={validationErrors}
            onRedirect={() => navigate(`/clientes/${client.id}`)}
          />
        </>
      )}

      {/* Link Client Modal — shown when converting a proposal without a linked client */}
      <Modal
        isOpen={linkClientDisclosure.isOpen}
        onClose={linkClientDisclosure.close}
        title="Vincular Cliente"
      >
        <div className="space-y-4">
          <p className="text-text-primary">
            Para converter esta proposta em projeto, é necessário vincular um cliente.
          </p>
          {eligibleClients.length > 0 ? (
            <div>
              <Select
                id="linkClientSelect"
                label="Selecione o Cliente"
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
                options={eligibleClients.map((c) => ({
                  value: c.id,
                  label: c.name,
                }))}
              />
            </div>
          ) : (
            <p className="text-warning text-sm">
              Nenhum cliente elegível encontrado. Cadastre um cliente primeiro.
            </p>
          )}
        </div>
        <div className="flex justify-end space-x-4 mt-8">
          <Button variant="secondary" onClick={linkClientDisclosure.close}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleLinkClientAndConvert}
            disabled={eligibleClients.length === 0 || !selectedClientId}
          >
            Vincular e Converter
          </Button>
        </div>
      </Modal>

      {/* Toast notification */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-fade-in-up">
          <div
            className={`flex items-center gap-3 px-5 py-3 rounded-xl bg-surface border shadow-lg backdrop-blur-sm ${
              toast.type === 'success' ? 'border-success/30' : 'border-error/30'
            }`}
          >
            <span className={toast.type === 'success' ? 'text-success' : 'text-error'}>
              {toast.type === 'success' ? (
                <CheckCircleIcon className="w-5 h-5" />
              ) : (
                <AlertIcon className="w-5 h-5" />
              )}
            </span>
            <span className="text-sm font-medium text-text-primary">{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default PropostaDetalhesPage;
