import React, { useMemo } from 'react';
import { TrashIcon } from '../../ui/icons';
import { Project, Quotation } from '../../../types';
import { formatDate } from '../../../utils/formatters';

interface QuotationsTabProps {
  project: Project;
  allQuotations: Quotation[];
  onLink: () => void;
  onUnlink: (quotationId: string) => void;
}

export const ProjectQuotationsTab: React.FC<QuotationsTabProps> = ({
  project,
  allQuotations,
  onLink,
  onUnlink,
}) => {
  const linkedQuotations = useMemo(() => {
    return (project.linkedQuotationIds || [])
      .map((id) => allQuotations.find((q) => q.id === id))
      .filter((q): q is Quotation => !!q);
  }, [project.linkedQuotationIds, allQuotations]);

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
            className="bg-background/50 p-4 rounded-lg flex justify-between items-center group"
          >
            <div>
              <h4 className="font-semibold text-text-primary">{q.name}</h4>
              <p className="text-xs text-text-secondary mt-1">Data: {formatDate(q.date)}</p>
            </div>
            <div className="flex items-center gap-4">
              <span
                className={`px-2 py-1 text-xs font-bold rounded-full ${q.status === 'Finalizada' ? 'bg-success/20 text-success' : 'bg-info/20 text-info'}`}
              >
                {q.status}
              </span>
              <button
                type="button"
                onClick={() => onUnlink(q.id)}
                className="p-1 text-text-secondary/50 hover:text-error transition-colors opacity-0 group-hover:opacity-100"
                aria-label="Desvincular cotação"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
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
