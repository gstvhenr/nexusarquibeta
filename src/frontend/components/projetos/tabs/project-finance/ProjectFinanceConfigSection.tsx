import type { ProjectFinancials } from '@/types';
import { formatCurrency } from '@/utils/formatters';
import { CurrencyInput } from './CurrencyInput';

interface ProjectFinanceConfigSectionProps {
  financials: ProjectFinancials;
  baseContractValue: number;
  showSettings: boolean;
  onToggleSettings: () => void;
  commonInputClass: string;
  onFinancialsChange: (
    field: keyof ProjectFinancials,
    value: ProjectFinancials[keyof ProjectFinancials],
  ) => void;
  onGenerateInstallments: () => void;
}

export const ProjectFinanceConfigSection = ({
  financials,
  baseContractValue,
  commonInputClass,
  onFinancialsChange,
  onGenerateInstallments,
}: ProjectFinanceConfigSectionProps) => (
  <div className="bg-surface rounded-2xl shadow-soft border border-border-color overflow-hidden">
    <div className="p-6 space-y-5">
      {/* Row 1: Payment Type + Due Date/Day + Base Value */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 items-end">
        <div>
          <span
            id="payment-type-label"
            className="block text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2"
          >
            Forma de Pagamento
          </span>
          <div
            role="group"
            aria-labelledby="payment-type-label"
            className="flex bg-background rounded-lg p-1 border border-border-color h-[38px]"
          >
            <button
              type="button"
              onClick={() => onFinancialsChange('paymentType', 'vista')}
              className={`flex-1 text-sm font-semibold rounded-md transition-all duration-200 ${financials.paymentType === 'vista' ? 'bg-surface shadow-sm text-primary' : 'text-text-secondary hover:text-text-primary'}`}
            >
              À Vista
            </button>
            <button
              type="button"
              onClick={() => onFinancialsChange('paymentType', 'parcelado')}
              className={`flex-1 text-sm font-semibold rounded-md transition-all duration-200 ${financials.paymentType === 'parcelado' ? 'bg-surface shadow-sm text-primary' : 'text-text-secondary hover:text-text-primary'}`}
            >
              Parcelado
            </button>
          </div>
        </div>

        {financials.paymentType === 'vista' ? (
          <div>
            <label
              htmlFor="field-lump-sum-due-date-config"
              className="block text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2"
            >
              Data de Vencimento
            </label>
            <input
              id="field-lump-sum-due-date-config"
              type="date"
              value={financials.lumpSumDueDate?.split('T')[0] || ''}
              onChange={(event) => onFinancialsChange('lumpSumDueDate', event.target.value || null)}
              className={commonInputClass}
              aria-label="Data de Vencimento à Vista"
            />
          </div>
        ) : (
          <div>
            <label
              htmlFor="field-dia-vencimento"
              className="block text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2"
            >
              Dia de Vencimento
            </label>
            <input
              id="field-dia-vencimento"
              type="number"
              min="1"
              max="31"
              value={financials.installmentsPaymentDay || ''}
              onChange={(event) =>
                onFinancialsChange('installmentsPaymentDay', parseInt(event.target.value))
              }
              className={commonInputClass}
              aria-label="Dia do Vencimento"
            />
          </div>
        )}

        <div>
          <label
            htmlFor="field-valor-base-do-contrato"
            className="block text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2"
          >
            Valor Base do Contrato
          </label>
          <CurrencyInput
            id="field-valor-base-do-contrato"
            value={financials.baseContractValue}
            onChange={(parsedValue) => onFinancialsChange('baseContractValue', parsedValue)}
            className={`${commonInputClass} text-right`}
            placeholder={formatCurrency(baseContractValue)}
            aria-label="Valor base do contrato"
          />
        </div>
      </div>

      {/* Row 2: Installment settings (always visible when parcelado) */}
      {financials.paymentType === 'parcelado' && (
        <div className="bg-background/50 rounded-xl border border-border-color/50 p-4 space-y-4 animate-fade-in-up">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1 h-4 rounded-full bg-primary" />
            <h5 className="text-xs font-bold text-text-primary uppercase tracking-wide">
              Configuração de Parcelas
            </h5>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label
                htmlFor="field-n-parcelas"
                className="block text-xs font-medium text-text-secondary mb-1"
              >
                Nº de Parcelas
              </label>
              <input
                id="field-n-parcelas"
                type="number"
                value={financials.numberOfInstallments || ''}
                onChange={(event) =>
                  onFinancialsChange('numberOfInstallments', parseInt(event.target.value))
                }
                className={commonInputClass}
                aria-label="Número de Parcelas"
              />
            </div>
            <div className="flex items-end">
              <div className="flex items-center gap-2 h-[38px]">
                <input
                  id="start-current-month"
                  type="checkbox"
                  checked={financials.startInstallmentsInCurrentMonth || false}
                  onChange={(event) =>
                    onFinancialsChange('startInstallmentsInCurrentMonth', event.target.checked)
                  }
                  className="rounded accent-primary"
                />
                <label htmlFor="start-current-month" className="text-sm text-text-primary">
                  Lançar vencimento no mês vigente
                </label>
              </div>
            </div>
            <div className="flex items-end">
              <div className="flex items-center gap-2 h-[38px]">
                <input
                  id="interest"
                  type="checkbox"
                  checked={financials.installmentsInterestEnabled ?? true}
                  onChange={(event) =>
                    onFinancialsChange('installmentsInterestEnabled', event.target.checked)
                  }
                  className="rounded accent-primary"
                />
                <label htmlFor="interest" className="text-sm text-text-primary">
                  Juros
                </label>
                {(financials.installmentsInterestEnabled ?? true) && (
                  <input
                    id="field-interest-rate"
                    type="number"
                    value={financials.installmentsInterestRate || ''}
                    onChange={(event) =>
                      onFinancialsChange('installmentsInterestRate', parseFloat(event.target.value))
                    }
                    className={`${commonInputClass} w-20`}
                    placeholder="%"
                    aria-label="Taxa de Juros (%)"
                  />
                )}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onGenerateInstallments}
            className="w-full sm:w-auto px-5 py-2 rounded-lg font-semibold text-sm bg-secondary text-secondary-content hover:bg-secondary-focus transition-colors"
          >
            Gerar / Recalcular Parcelas
          </button>
        </div>
      )}
    </div>
  </div>
);
