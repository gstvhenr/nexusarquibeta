import { formatCurrency } from '@/utils/formatters';
import type { ClientFormFinanceTabProps } from './types';

export const ClientFormFinanceTab = ({ financialSummaries }: ClientFormFinanceTabProps) => (
  <div className="space-y-4">
    {financialSummaries.length > 0 ? (
      financialSummaries.map((summary) => (
        <div key={summary.projectId} className="bg-background/50 p-4 rounded-lg">
          <h4 className="font-semibold text-lg text-text-primary border-b border-border-color pb-2 mb-3">
            {summary.projectName}
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-sm text-text-secondary">Pendente</p>
              <p className="font-bold text-lg text-warning">{formatCurrency(summary.pending)}</p>
            </div>
            <div>
              <p className="text-sm text-text-secondary">Atrasado</p>
              <p className="font-bold text-lg text-error">{formatCurrency(summary.overdue)}</p>
            </div>
            <div>
              <p className="text-sm text-text-secondary">Total Pago</p>
              <p className="font-bold text-lg text-success">{formatCurrency(summary.paid)}</p>
            </div>
            <div>
              <p className="text-sm text-text-secondary">Valor Total</p>
              <p className="font-bold text-lg text-secondary">
                {formatCurrency(summary.totalValue)}
              </p>
            </div>
          </div>
        </div>
      ))
    ) : (
      <p className="text-center text-text-secondary py-8">
        Nenhum projeto ativo para exibir dados financeiros.
      </p>
    )}
  </div>
);
