import type { ProjectFinancials } from '@/types';

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
  showSettings,
  onToggleSettings,
  commonInputClass,
  onFinancialsChange,
  onGenerateInstallments,
}: ProjectFinanceConfigSectionProps) => (
  <div className="bg-surface p-6 rounded-2xl shadow-soft border border-border-color">
    <h4 className="font-serif text-lg font-bold text-secondary mb-4 border-b border-border-color pb-2">
      Configuração Base
    </h4>

    <div className="space-y-4">
      <div>
        <span className="block text-xs font-bold text-text-secondary uppercase mb-1">
          Tipo de Pagamento
        </span>
        <div className="flex bg-background rounded-lg p-1 border border-border-color">
          <button
            type="button"
            onClick={() => onFinancialsChange('paymentType', 'vista')}
            className={`flex-1 py-1.5 text-sm font-semibold rounded-md transition-colors ${financials.paymentType === 'vista' ? 'bg-white dark:bg-zinc-700 shadow-sm text-primary' : 'text-text-secondary hover:text-text-primary'}`}
          >
            À Vista
          </button>
          <button
            type="button"
            onClick={() => onFinancialsChange('paymentType', 'parcelado')}
            className={`flex-1 py-1.5 text-sm font-semibold rounded-md transition-colors ${financials.paymentType === 'parcelado' ? 'bg-white dark:bg-zinc-700 shadow-sm text-primary' : 'text-text-secondary hover:text-text-primary'}`}
          >
            Parcelado
          </button>
        </div>
      </div>

      <div>
        <label
          htmlFor="field-valor-base-do-contrato"
          className="block text-xs font-bold text-text-secondary uppercase mb-1"
        >
          Valor Base do Contrato
        </label>
        <input
          id="field-valor-base-do-contrato"
          type="number"
          value={financials.baseContractValue ?? ''}
          onChange={(event) => {
            if (event.target.value === '') {
              onFinancialsChange('baseContractValue', undefined);
              return;
            }
            const parsedValue = Number(event.target.value);
            onFinancialsChange(
              'baseContractValue',
              Number.isFinite(parsedValue) ? parsedValue : undefined,
            );
          }}
          className={commonInputClass}
          placeholder={new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          }).format(baseContractValue)}
          aria-label="Valor base do contrato"
        />
      </div>

      {financials.paymentType === 'parcelado' && (
        <div className="pt-2 border-t border-border-color mt-2">
          <button
            type="button"
            onClick={onToggleSettings}
            className="text-sm text-primary font-semibold hover:underline flex items-center justify-between w-full"
          >
            <span>Recalcular Parcelas (Base)</span>
            <span className="text-xs">{showSettings ? '▲' : '▼'}</span>
          </button>

          {showSettings && (
            <div className="mt-3 space-y-3 bg-background/50 p-3 rounded-lg text-sm animate-fade-in-up">
              <div>
                <label htmlFor="field-n-parcelas" className="block text-xs font-medium mb-1">
                  Nº Parcelas
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
                <label htmlFor="field-dia-vencimento" className="block text-xs font-medium mb-1">
                  Dia Vencimento
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
                <label htmlFor="interest">Aplicar Juros (%)</label>
              </div>
              {financials.installmentsInterestEnabled && (
                <input
                  type="number"
                  value={financials.installmentsInterestRate || ''}
                  onChange={(event) =>
                    onFinancialsChange('installmentsInterestRate', parseFloat(event.target.value))
                  }
                  className={commonInputClass}
                  placeholder="Taxa %"
                  aria-label="Taxa de Juros (%)"
                />
              )}

              <button
                type="button"
                onClick={onGenerateInstallments}
                className="w-full px-3 py-2 rounded-lg font-semibold text-xs bg-secondary text-secondary-content hover:bg-secondary-focus mt-2"
              >
                Recalcular (Substitui Existentes)
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  </div>
);
