import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrashIcon } from '../../ui/icons';
import { IconButton } from '../../ui';
import { Project, Quotation } from '@/types';
import { formatDate } from '@/utils/formatters';

interface QuotationsTabProps {
  project: Project;
  allQuotations: Quotation[];
  onLink: () => void;
  onUnlink: (quotationId: string) => void;
}

export const ProjectQuotationsTab: (props: QuotationsTabProps) => React.ReactNode = ({
  project,
  allQuotations,
  onLink,
  onUnlink,
}) => {
  const navigate = useNavigate();
  const linkedQuotations = useMemo(() => {
    const linkedById = (project.linkedQuotationIds || [])
      .map((id) => allQuotations.find((q) => q.id === id))
      .filter((q): q is Quotation => !!q);
    const linkedByProjectId = allQuotations.filter(
      (q) => q.projectId === project.id && !(project.linkedQuotationIds || []).includes(q.id),
    );
    return [...linkedById, ...linkedByProjectId];
  }, [project.id, project.linkedQuotationIds, allQuotations]);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={onLink}
          className="text-sm font-semibold text-primary hover:underline"
        >
          + Vincular Cotação
        </button>
      </div>
      {linkedQuotations.length > 0 ? (
        linkedQuotations.map((q) => (
          <div
            key={q.id}
            onClick={() => navigate(`/cotacoes/${q.id}`)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                navigate(`/cotacoes/${q.id}`);
              }
            }}
            role="button"
            tabIndex={0}
            className="bg-background/50 p-4 rounded-lg flex justify-between items-center group cursor-pointer hover:bg-primary/5 transition-colors"
          >
            <div>
              <h4 className="font-semibold text-text-primary group-hover:text-primary transition-colors">
                {q.name}
              </h4>
              <p className="text-xs text-text-secondary mt-1">Data: {formatDate(q.date)}</p>
            </div>
            <div className="flex items-center gap-4">
              <span
                className={`px-2 py-1 text-xs font-bold rounded-full ${q.status === 'Aceita' ? 'bg-success/20 text-success' : q.status === 'Rejeitada' ? 'bg-error/20 text-error' : 'bg-info/20 text-info'}`}
              >
                {q.status}
              </span>
              <IconButton
                variant="danger"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onUnlink(q.id);
                }}
                aria-label="Desvincular cotação"
                className="opacity-0 group-hover:opacity-100"
              >
                <TrashIcon className="w-4 h-4" />
              </IconButton>
            </div>
          </div>
        ))
      ) : (
        <p className="text-center text-sm text-text-secondary py-10">
          Nenhuma cotação vinculada a este projeto.
        </p>
      )}
    </div>
  );
};
