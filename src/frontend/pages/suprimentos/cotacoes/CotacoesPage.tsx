import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/layout';
import { Button, DeleteConfirmationModal, IconButton } from '@/components/ui';
import { useCoreData, useSupplyChainData } from '@/context/DataContext';
import type { Quotation, Project } from '@/types';
import { NAV_LINKS } from '@/constants';
import { PlusIcon, ArchiveIcon, UnarchiveIcon, TrashIcon } from '@/components/ui';

import { v4 as uuidv4 } from 'uuid';

const QuotationListItem: (props: {
  quotation: Quotation;
  project?: Project;
  onArchive: (id: string, archive: boolean) => void;
  onDelete: (id: string) => void;
}) => React.ReactNode = React.memo(({ quotation, project, onArchive, onDelete }) => {
  const navigate = useNavigate();
  const statusClassMap: Record<string, string> = {
    'Em Aberto': 'bg-info/20 text-info',
    Aceita: 'bg-success/20 text-success',
    Rejeitada: 'bg-error/20 text-error',
  };
  const statusClass = statusClassMap[quotation.status] || 'bg-info/20 text-info';

  return (
    <div
      onClick={() => navigate(`/cotacoes/${quotation.id}`)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          navigate(`/cotacoes/${quotation.id}`);
        }
      }}
      role="button"
      tabIndex={0}
      className={`bg-surface rounded-xl shadow-soft transition-all duration-300 ease-in-out group p-5 flex justify-between items-center cursor-pointer ${quotation.archived ? 'opacity-70' : 'hover:shadow-lg hover:-translate-y-px'}`}
    >
      <div className="flex-1 min-w-0 pr-4">
        <p className="font-serif text-2xl font-semibold text-secondary truncate group-hover:underline">
          {quotation.name}
        </p>
        <p className="text-sm text-text-secondary">
          {project
            ? `Projeto: ${project.name.startsWith(project.code) ? project.name : `${project.code} - ${project.name}`}`
            : 'Sem projeto vinculado'}
        </p>
        <p className="text-sm text-text-secondary mt-1">
          {(quotation.items || []).length} {(quotation.items || []).length === 1 ? 'item' : 'itens'}{' '}
          na cotação
        </p>
      </div>
      <div className="flex items-center gap-4 ml-4">
        <span
          className={`px-3 py-1 text-xs font-bold rounded-full min-w-[90px] text-center ${statusClass}`}
        >
          {quotation.status}
        </span>
        <div className="flex items-center gap-1">
          {quotation.archived ? (
            <IconButton
              variant="secondary"
              onClick={(e) => {
                e.stopPropagation();
                onArchive(quotation.id, false);
              }}
              aria-label="Desarquivar"
              title="Desarquivar"
            >
              <UnarchiveIcon className="w-5 h-5" />
            </IconButton>
          ) : (
            <IconButton
              variant="secondary"
              onClick={(e) => {
                e.stopPropagation();
                onArchive(quotation.id, true);
              }}
              aria-label="Arquivar"
              title="Arquivar"
            >
              <ArchiveIcon className="w-5 h-5" />
            </IconButton>
          )}
          <IconButton
            variant="danger"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(quotation.id);
            }}
            aria-label="Excluir"
            title="Excluir"
          >
            <TrashIcon className="w-5 h-5" />
          </IconButton>
        </div>
      </div>
    </div>
  );
});

const CotacoesPage: () => React.ReactNode = () => {
  const { projects } = useCoreData();
  const { quotations, setQuotations } = useSupplyChainData();
  const navigate = useNavigate();
  const [showArchived, setShowArchived] = useState(false);
  const [quotationToDelete, setQuotationToDelete] = useState<string | null>(null);

  const quotationsToDisplay = useMemo(() => {
    return quotations
      .filter((q) => (q.archived || false) === showArchived)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [quotations, showArchived]);

  const handleCreate = () => {
    const newId = `qt_new_${uuidv4()}`;
    navigate(`/cotacoes/${newId}`);
  };

  const handleArchive = useCallback(
    (id: string, archive: boolean) => {
      setQuotations((prev) => prev.map((q) => (q.id === id ? { ...q, archived: archive } : q)));
    },
    [setQuotations],
  );

  const handleDeleteRequest = useCallback((id: string) => {
    setQuotationToDelete(id);
  }, []);

  const handleDeleteConfirm = () => {
    if (quotationToDelete) {
      setQuotations((prev) => prev.filter((q) => q.id !== quotationToDelete));
    }
    setQuotationToDelete(null);
  };

  const cotacoesIcon = NAV_LINKS.find((link) => link.label === 'Suprimentos')?.children?.find(
    (c) => c.path === '/cotacoes',
  )?.icon;

  return (
    <div className="animate-fade-in-up">
      <PageHeader title="Cotações" icon={cotacoesIcon}>
        <Button
          variant="secondary"
          onClick={() => setShowArchived(!showArchived)}
          className="flex items-center gap-2"
        >
          {showArchived ? (
            <UnarchiveIcon className="w-4 h-4" />
          ) : (
            <ArchiveIcon className="w-4 h-4" />
          )}
          {showArchived ? 'Ver Ativas' : 'Ver Arquivadas'}
        </Button>
        <Button variant="primary" onClick={handleCreate} className="flex items-center gap-2">
          <PlusIcon className="w-5 h-5" /> Nova Cotação
        </Button>
      </PageHeader>

      <div className="space-y-4">
        {quotationsToDisplay.map((q) => (
          <QuotationListItem
            key={q.id}
            quotation={q}
            project={projects.find((p) => p.id === q.projectId)}
            onArchive={handleArchive}
            onDelete={handleDeleteRequest}
          />
        ))}
      </div>

      {quotationsToDisplay.length === 0 && (
        <div className="p-10 bg-surface rounded-xl shadow-soft text-center text-text-secondary mt-8">
          <h3 className="text-lg font-medium text-text-primary">
            {showArchived ? 'Nenhuma cotação arquivada' : 'Nenhuma cotação criada'}
          </h3>
          <p className="mt-1 text-sm">
            {showArchived
              ? 'Você ainda não arquivou nenhuma cotação.'
              : 'Clique em "Nova Cotação" para começar.'}
          </p>
        </div>
      )}

      <DeleteConfirmationModal
        isOpen={!!quotationToDelete}
        onClose={() => setQuotationToDelete(null)}
        onConfirm={handleDeleteConfirm}
        itemName={quotations.find((q) => q.id === quotationToDelete)?.name || ''}
        itemType="Cotação"
      />
    </div>
  );
};

export default CotacoesPage;
