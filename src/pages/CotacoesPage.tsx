import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/layout';
import { DeleteConfirmationModal } from '../components/ui';
import { useData } from '../context/DataContext';
import type { Quotation, Project } from '../types';
import { NAV_LINKS } from '../constants';
import { PlusIcon, ArchiveIcon, UnarchiveIcon, TrashIcon } from '../components/ui';
import { formatCurrency, formatDate } from '../utils/formatters';
import { v4 as uuidv4 } from 'uuid';

const QuotationListItem: React.FC<{
  quotation: Quotation;
  project?: Project;
  onArchive: (id: string, archive: boolean) => void;
  onDelete: (id: string) => void;
}> = React.memo(({ quotation, project, onArchive, onDelete }) => {
  const navigate = useNavigate();
  const statusClass =
    quotation.status === 'Finalizada' ? 'bg-success/20 text-success' : 'bg-info/20 text-info';

  return (
    <div
      onClick={() => navigate(`/cotacoes/${quotation.id}`)}
      className={`bg-surface rounded-xl shadow-soft transition-all duration-300 ease-in-out group p-5 flex justify-between items-center cursor-pointer ${quotation.archived ? 'opacity-70' : 'hover:shadow-lg hover:-translate-y-px'}`}
    >
      <div className="flex-1 truncate">
        <p className="font-serif text-2xl font-semibold text-secondary truncate group-hover:underline">
          {quotation.name}
        </p>
        <p className="text-sm text-text-secondary">
          {project ? `${project.code} - ${project.name}` : 'Sem projeto vinculado'}
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
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onArchive(quotation.id, false);
              }}
              className="p-2 text-text-secondary/70 hover:text-secondary rounded-full hover:bg-secondary/10"
              title="Desarquivar"
            >
              <UnarchiveIcon className="w-5 h-5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onArchive(quotation.id, true);
              }}
              className="p-2 text-text-secondary/70 hover:text-secondary rounded-full hover:bg-secondary/10"
              title="Arquivar"
            >
              <ArchiveIcon className="w-5 h-5" />
            </button>
          )}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(quotation.id);
            }}
            className="p-2 text-text-secondary/70 hover:text-error rounded-full hover:bg-error/10"
            title="Excluir"
          >
            <TrashIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
});

const CotacoesPage: React.FC = () => {
  const { quotations, setQuotations, projects } = useData();
  const navigate = useNavigate();
  const [showArchived, setShowArchived] = useState(false);
  const [quotationToDelete, setQuotationToDelete] = useState<string | null>(null);

  const quotationsToDisplay = useMemo(() => {
    return quotations
      .filter((q) => (q.archived || false) === showArchived)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [quotations, showArchived]);

  const handleCreate = () => {
    const newId = `qt_${uuidv4()}`;
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
        <button
          type="button"
          onClick={handleCreate}
          className="px-5 py-2 rounded-lg font-semibold text-primary-content bg-primary hover:bg-primary-focus shadow-soft flex items-center gap-2 transition-colors text-sm"
        >
          <PlusIcon className="w-5 h-5" /> Nova Cotação
        </button>
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
