import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { DeleteConfirmationModal } from '../components/ui';
import type { Proposal, ProposalStatus } from '../types';
import { useData } from '../context/DataContext';
import { NAV_LINKS } from '../constants';
import { PageHeader } from '../components/layout';
import { ProposalListItem } from '../components/propostas';
import { ArchiveIcon, UnarchiveIcon } from '../components/ui';

const PropostasPage: React.FC = () => {
  const { proposals, setProposals, projects } = useData();
  const [isDeleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [proposalToInteract, setProposalToInteract] = useState<Proposal | null>(null);
  const [showArchived, setShowArchived] = useState(false);

  const projectsByProposalId = useMemo(() => {
    const map = new Map<string, boolean>();
    projects.forEach((p) => {
      if (p.proposalId) {
        map.set(p.proposalId, true);
      }
    });
    return map;
  }, [projects]);

  // Map project IDs to their codes for linked project badge
  const projectCodeMap = useMemo(() => {
    const map = new Map<string, string>();
    projects.forEach((p) => {
      map.set(p.id, p.code || p.id);
    });
    return map;
  }, [projects]);

  const sortedProposals = useMemo(() => {
    return [...proposals].sort((a, b) => {
      const codeA = parseInt((a.code || a.id).replace(/[^0-9]/g, ''));
      const codeB = parseInt((b.code || b.id).replace(/[^0-9]/g, ''));
      return codeB - codeA;
    });
  }, [proposals]);

  const proposalsToDisplay = useMemo(
    () => sortedProposals.filter((p) => (p.archived || false) === showArchived),
    [sortedProposals, showArchived],
  );

  const handleDeleteRequest = useCallback((proposal: Proposal) => {
    setProposalToInteract(proposal);
    setDeleteConfirmOpen(true);
  }, []);

  const handleDeleteConfirm = () => {
    if (proposalToInteract) {
      setProposals((prev) => prev.filter((p) => p.id !== proposalToInteract.id));
    }
    setDeleteConfirmOpen(false);
    setProposalToInteract(null);
  };

  const handleArchive = useCallback(
    (proposal: Proposal) => {
      setProposals((prev) =>
        prev.map((p) => (p.id === proposal.id ? { ...p, archived: true } : p)),
      );
    },
    [setProposals],
  );

  const handleUnarchive = useCallback(
    (proposal: Proposal) => {
      setProposals((prev) =>
        prev.map((p) => (p.id === proposal.id ? { ...p, archived: false } : p)),
      );
    },
    [setProposals],
  );

  const propostasIcon = NAV_LINKS.find((link) => link.path === '/propostas')?.icon;

  return (
    <div className="animate-fade-in-up">
      <PageHeader title="Propostas" icon={propostasIcon}>
        <div className="text-sm font-medium text-text-secondary bg-surface px-3 py-2 rounded-lg border border-border-color shadow-sm mr-2">
          {showArchived ? 'Total Arquivadas:' : 'Total Ativas:'}{' '}
          <span className="text-text-primary font-bold">{proposalsToDisplay.length}</span>
        </div>
        <button
          type="button"
          onClick={() => setShowArchived(!showArchived)}
          className="px-4 py-2 rounded-lg font-semibold text-text-primary bg-surface border border-border-color hover:bg-background transition-colors text-sm flex items-center gap-2"
        >
          {showArchived ? (
            <UnarchiveIcon className="w-4 h-4" />
          ) : (
            <ArchiveIcon className="w-4 h-4" />
          )}
          {showArchived ? 'Ver Ativas' : 'Ver Arquivadas'}
        </button>
      </PageHeader>

      <div className="space-y-6">
        {proposalsToDisplay.map((p) => (
          <ProposalListItem
            key={p.id}
            proposal={p}
            onDelete={handleDeleteRequest}
            onArchive={handleArchive}
            onUnarchive={handleUnarchive}
            isArchived={p.archived}
            hasProject={!!projectsByProposalId.get(p.id)}
            linkedProjectCode={p.projectId ? projectCodeMap.get(p.projectId) : undefined}
          />
        ))}
      </div>

      {proposalsToDisplay.length === 0 && (
        <div className="p-10 bg-surface rounded-xl shadow-soft text-center mt-6">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-text-primary">
            {showArchived ? 'Nenhuma proposta arquivada' : 'Nenhuma proposta encontrada'}
          </h3>
          <p className="mt-1 text-sm text-text-secondary">
            {showArchived
              ? 'Você ainda não arquivou nenhuma proposta.'
              : 'Vá para a página de Orçamentos para criar uma nova proposta.'}
          </p>
        </div>
      )}

      <DeleteConfirmationModal
        isOpen={isDeleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDeleteConfirm}
        itemName={proposalToInteract?.name || ''}
        itemType="Proposta"
      />
    </div>
  );
};

export default PropostasPage;
