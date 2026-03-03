import React from 'react';
import { CheckCircleIcon, PlusIcon, TrashIcon } from '@/components/ui/icons';
import { IconButton } from '@/components/ui';
import { formatCurrency } from '@/utils/formatters';
import { OriginBadge } from './OriginBadge';
import { RecurrenceBadge } from './RecurrenceBadge';
import type { UnifiedEntry } from './types';

type CashBoxEntriesTableProps = {
  entries: UnifiedEntry[];
  sortAsc: boolean;
  todayStr: string;
  onToggleSort: () => void;
  onConfirmEntry: (entry: UnifiedEntry) => void;
  onDeleteEntry: (entry: UnifiedEntry) => void;
  formatDay: (date: string) => string;
};

export const CashBoxEntriesTable: (props: CashBoxEntriesTableProps) => React.ReactNode = ({
  entries,
  sortAsc,
  todayStr,
  onToggleSort,
  onConfirmEntry,
  onDeleteEntry,
  formatDay,
}) => {
  return (
    <div className="flex-1 overflow-y-auto -mx-6 mt-4 no-scrollbar">
      <table className="w-full text-sm text-left">
        <thead className="sticky top-0 bg-surface z-10">
          <tr className="border-b border-border-color">
            <th className="px-6 py-3 font-semibold text-text-secondary">Tipo</th>
            <th
              className="px-6 py-3 font-semibold text-text-secondary cursor-pointer select-none hover:text-text-primary transition-colors group"
              onClick={onToggleSort}
            >
              <span className="inline-flex items-center gap-1.5">
                Data
                <span className="text-[10px] text-text-secondary/60 group-hover:text-primary transition-colors">
                  {sortAsc ? '▲' : '▼'}
                </span>
              </span>
            </th>
            <th className="px-6 py-3 font-semibold text-text-secondary">Origem</th>
            <th className="px-6 py-3 font-semibold text-text-secondary">Descrição</th>
            <th className="px-6 py-3 font-semibold text-text-secondary text-center">Recorrência</th>
            <th className="px-6 py-3 font-semibold text-text-secondary text-right">Valor</th>
            <th className="px-6 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {entries.length > 0 ? (
            entries.map((entry) => {
              const isCredit = entry.type === 'credit';
              const isOverdue = !entry.confirmed && entry.date < todayStr;

              let badgeClass: string;
              let badgeLabel: string;
              if (entry.confirmed) {
                badgeClass = isCredit ? 'bg-success/10 text-success' : 'bg-error/10 text-error';
                badgeLabel = isCredit ? 'Crédito' : 'Débito';
              } else if (isOverdue) {
                badgeClass = 'bg-black text-white';
                badgeLabel = isCredit ? 'Crédito Previsto' : 'Débito Previsto';
              } else {
                badgeClass = isCredit ? 'bg-info/10 text-info' : 'bg-warning/10 text-warning';
                badgeLabel = isCredit ? 'Crédito Previsto' : 'Débito Previsto';
              }

              return (
                <tr
                  key={entry.id}
                  className={`group border-b border-border-color/50 last:border-b-0 hover:bg-background transition-colors ${isOverdue ? 'bg-error/5' : ''}`}
                >
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 text-xs font-bold rounded-full whitespace-nowrap ${badgeClass}`}
                    >
                      {badgeLabel}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-text-primary font-medium">
                    {formatDay(entry.date)}
                  </td>
                  <td className="px-6 py-4">
                    <OriginBadge origin={entry.origin} />
                  </td>
                  <td className="px-6 py-4 text-text-secondary">{entry.description}</td>
                  <td className="px-6 py-4 text-center">
                    {entry.recurrence ? (
                      <RecurrenceBadge
                        recurrence={entry.recurrence}
                        installmentNumber={entry.installmentNumber}
                        installmentTotal={entry.installmentTotal}
                      />
                    ) : (
                      <span className="text-text-secondary/30">—</span>
                    )}
                  </td>
                  <td
                    className={`px-6 py-4 font-bold text-right ${isCredit ? 'text-success' : 'text-error'}`}
                  >
                    {isCredit ? '+' : '-'}
                    {formatCurrency(entry.value)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      {!entry.confirmed && (
                        <IconButton
                          variant="default"
                          onClick={() => onConfirmEntry(entry)}
                          aria-label={isCredit ? 'Confirmar recebimento' : 'Confirmar pagamento'}
                          title={isCredit ? 'Confirmar recebimento' : 'Confirmar pagamento'}
                          className="text-success hover:text-success/80"
                        >
                          <CheckCircleIcon className="w-4 h-4" />
                        </IconButton>
                      )}
                      <IconButton
                        variant="danger"
                        onClick={() => onDeleteEntry(entry)}
                        aria-label={isCredit ? 'Excluir crédito' : 'Excluir despesa'}
                        className="opacity-0 group-hover:opacity-100"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </IconButton>
                    </div>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={7}>
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-3">
                    <PlusIcon className="w-7 h-7 text-primary" />
                  </div>
                  <p className="text-text-secondary text-sm font-medium">
                    Nenhum lançamento neste mês.
                  </p>
                  <p className="text-text-secondary/60 text-xs mt-1">
                    Use os botões acima para adicionar créditos ou despesas.
                  </p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
