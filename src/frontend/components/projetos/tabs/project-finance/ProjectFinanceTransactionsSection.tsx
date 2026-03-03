import { CheckCircleIcon, ClockIcon, PlusIcon, TrashIcon } from '@/components/ui/icons';
import { IconButton } from '@/components/ui';
import type { Installment, Project, ProjectFinancials } from '@/types';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { getProjectLumpSumValue } from '@/utils/projectFinancials';
import { getInstallmentStatus } from './helpers';

interface ProjectFinanceTransactionsSectionProps {
  project: Project;
  financials: ProjectFinancials;
  onFinancialsChange: (
    field: keyof ProjectFinancials,
    value: ProjectFinancials[keyof ProjectFinancials],
  ) => void;
  onInstallmentChange: (
    id: string,
    field: keyof Installment,
    value: Installment[keyof Installment],
  ) => void;
  onGenerateInstallments: () => void;
  onConfirmPayment: (payment: { type: 'lump' } | { type: 'installment'; id: string }) => void;
  onAddInstallment: () => void;
  onRemoveInstallment: (id: string) => void;
}

export const ProjectFinanceTransactionsSection = ({
  project,
  financials,
  onFinancialsChange,
  onInstallmentChange,
  onGenerateInstallments,
  onConfirmPayment,
  onAddInstallment,
  onRemoveInstallment,
}: ProjectFinanceTransactionsSectionProps) => (
  <div className="bg-surface rounded-2xl shadow-soft border border-border-color overflow-hidden">
    <div className="p-5 border-b border-border-color bg-background/30 flex justify-between items-center">
      <h4 className="font-serif text-lg font-bold text-secondary">
        {financials.paymentType === 'vista' ? 'Pagamento Único' : 'Cronograma Financeiro'}
      </h4>
      {financials.paymentType === 'parcelado' && (
        <button
          type="button"
          onClick={onAddInstallment}
          className="text-xs font-semibold text-primary hover:bg-primary/10 px-3 py-1.5 rounded transition-colors flex items-center gap-1"
        >
          <PlusIcon className="w-3 h-3" /> Nova Parcela
        </button>
      )}
    </div>

    {financials.paymentType === 'vista' ? (
      <div className="p-6">
        <div className="flex items-center justify-between p-4 bg-background rounded-xl border border-border-color">
          <div className="space-y-1">
            <p className="font-bold text-text-primary text-lg">Pagamento à Vista</p>
            <div className="flex items-center gap-4 text-sm text-text-secondary">
              <span className="flex items-center gap-1">
                <ClockIcon className="w-4 h-4" /> Vencimento:{' '}
                <input
                  type="date"
                  value={financials.lumpSumDueDate?.split('T')[0] || ''}
                  onChange={(event) =>
                    onFinancialsChange('lumpSumDueDate', event.target.value || null)
                  }
                  className="bg-transparent border-none p-0 text-sm focus:ring-0 text-text-primary font-medium cursor-pointer"
                  aria-label="Data de Vencimento"
                />
              </span>
            </div>
          </div>
          <div className="text-right space-y-2">
            <p className="text-2xl font-bold font-sans text-secondary">
              {formatCurrency(getProjectLumpSumValue(project))}
            </p>
            {financials.lumpSumStatus === 'Pago' ? (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-success/10 text-success text-xs font-bold">
                <CheckCircleIcon className="w-4 h-4" /> Pago
              </span>
            ) : (
              <button
                type="button"
                onClick={() => onConfirmPayment({ type: 'lump' })}
                className="px-4 py-1.5 bg-primary text-primary-content rounded-lg text-sm font-semibold hover:bg-primary-focus transition-colors shadow-sm"
              >
                Confirmar Recebimento
              </button>
            )}
          </div>
        </div>
      </div>
    ) : (
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-background/50 text-xs text-text-secondary uppercase font-semibold">
            <tr>
              <th className="px-6 py-3 w-16 text-center">#</th>
              <th className="px-6 py-3">Descrição/Nota</th>
              <th className="px-6 py-3">Vencimento</th>
              <th className="px-6 py-3 text-right">Valor</th>
              <th className="px-6 py-3 text-center">Status</th>
              <th className="px-6 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-color/50">
            {(financials.installments || []).map((installment) => {
              const status = getInstallmentStatus(installment);
              return (
                <tr key={installment.id} className="hover:bg-background/30 transition-colors group">
                  <td className="px-6 py-4 text-center font-medium text-text-secondary">
                    {installment.number}
                  </td>
                  <td className="px-6 py-4">
                    <input
                      type="text"
                      value={installment.description || ''}
                      onChange={(event) =>
                        onInstallmentChange(installment.id, 'description', event.target.value)
                      }
                      className="bg-transparent border-none p-0 text-sm text-text-primary focus:ring-0 w-full placeholder-text-secondary/50"
                      placeholder="Parcela Regular"
                      aria-label="Descrição da Parcela"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <input
                      type="date"
                      value={installment.dueDate.split('T')[0]}
                      onChange={(event) =>
                        onInstallmentChange(installment.id, 'dueDate', event.target.value)
                      }
                      className="bg-transparent border-none p-0 text-sm text-text-primary focus:ring-0 font-medium w-32 cursor-pointer"
                      aria-label="Data de Vencimento"
                    />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <input
                      type="number"
                      value={installment.value}
                      onChange={(event) =>
                        onInstallmentChange(installment.id, 'value', parseFloat(event.target.value))
                      }
                      className="bg-transparent border-none p-0 text-sm text-right font-bold text-secondary focus:ring-0 w-24"
                      aria-label="Valor da Parcela"
                    />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-opacity-10 border border-opacity-20 ${status.color.replace('text-', 'bg-').replace('text-', 'border-')} ${status.color}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${status.dotColor}`}></span>{' '}
                      {status.text}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                    {!installment.paid ? (
                      <>
                        <button
                          type="button"
                          onClick={() =>
                            onConfirmPayment({ type: 'installment', id: installment.id })
                          }
                          className="text-primary hover:text-primary-focus font-semibold text-xs border border-primary/30 px-3 py-1 rounded hover:bg-primary/5 transition-colors"
                        >
                          Receber
                        </button>
                        <IconButton
                          variant="danger"
                          size="sm"
                          onClick={() => onRemoveInstallment(installment.id)}
                          aria-label="Remover parcela"
                          className="opacity-0 group-hover:opacity-100"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </IconButton>
                      </>
                    ) : (
                      <span className="text-xs text-text-secondary italic">
                        Pago em {formatDate(installment.paymentDate)}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {(financials.installments || []).length === 0 && (
          <div className="p-8 text-center text-text-secondary">
            <p>Nenhuma parcela gerada.</p>
            <button
              type="button"
              onClick={onGenerateInstallments}
              className="mt-2 text-primary font-semibold hover:underline"
            >
              Gerar Agora
            </button>
          </div>
        )}
      </div>
    )}
  </div>
);
