import type { ProjectFinancials } from '@/types';
import { formatCurrency } from '@/utils/formatters';
import { CashIcon } from '@/components/ui/icons';
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
    {/* Header */}
    <div className="px-6 py-4 border-b border-border-color bg-background/30 flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center">
        <CashIcon className="w-4 h-4 text-secondary" />
      </div>
    </div>

    <div className="p-6 space-y-5">
      {/* Row 1: Payment Type + Base Value side by side */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-end">
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
            <div>
              <label
                htmlFor="field-dia-vencimento"
                className="block text-xs font-medium text-text-secondary mb-1"
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
            <div>
              <span className="block text-xs font-medium text-text-secondary mb-1">Juros</span>
              <div className="flex items-center gap-2">
                <input
                  id="interest"
                  type="checkbox"
                  checked={financials.installmentsInterestEnabled}
                  onChange={(event) =>
                    onFinancialsChange('installmentsInterestEnabled', event.target.checked)
                  }
                  className="rounded accent-primary"
                />
                <label htmlFor="interest" className="text-sm text-text-primary">
                  Aplicar
                </label>
                {financials.installmentsInterestEnabled && (
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
