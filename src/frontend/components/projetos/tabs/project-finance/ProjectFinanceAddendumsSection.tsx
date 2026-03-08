import { AlertIcon, TrashIcon } from '@/components/ui/icons';
import type { ContractAddendumStatus, ProjectFinancials } from '@/types';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { getStatusSelectionOptions } from '@/utils/addendumWorkflow';
import { getAuditTrailActionText } from './helpers';
import type { BudgetServiceOption } from './types';

interface NewAddendumState {
  description: string;
  value: number;
  date: string;
  isDiscount: boolean;
}

interface ProjectFinanceAddendumsSectionProps {
  financials: ProjectFinancials;
  commonInputClass: string;
  newAddendum: NewAddendumState;
  onNewAddendumChange: (updater: (current: NewAddendumState) => NewAddendumState) => void;
  onAddNewAddendum: () => void;
  budgetServices: BudgetServiceOption[];
  selectedBudgetServiceId: string;
  onBudgetServiceIdChange: (serviceId: string) => void;
  budgetServiceValue: number;
  onBudgetServiceValueChange: (value: number) => void;
  budgetServiceDate: string;
  onBudgetServiceDateChange: (date: string) => void;
  budgetServiceMode: 'increase' | 'discount';
  onBudgetServiceModeChange: (mode: 'increase' | 'discount') => void;
  selectedBudgetService?: BudgetServiceOption;
  onAddBudgetService: () => void;
  onUpdateAddendumStatus: (id: string, status: ContractAddendumStatus) => void;
  onRemoveAddendum: (id: string) => void;
}

export const ProjectFinanceAddendumsSection = ({
  financials,
  commonInputClass,
  newAddendum,
  onNewAddendumChange,
  onAddNewAddendum,
  budgetServices,
  selectedBudgetServiceId,
  onBudgetServiceIdChange,
  budgetServiceValue,
  onBudgetServiceValueChange,
  budgetServiceDate,
  onBudgetServiceDateChange,
  budgetServiceMode,
  onBudgetServiceModeChange,
  selectedBudgetService,
  onAddBudgetService,
  onUpdateAddendumStatus,
  onRemoveAddendum,
}: ProjectFinanceAddendumsSectionProps) => (
  <div className="bg-surface p-6 rounded-2xl shadow-soft border border-border-color">
    <h4 className="font-serif text-lg font-bold text-secondary mb-4 border-b border-border-color pb-2 flex items-center gap-2">
      Termos Aditivos
    </h4>

    <div className="space-y-3 mb-4">
      {(financials.addendums || []).map((addendum) => (
        <div
          key={addendum.id}
          className="p-3 bg-background rounded-lg border border-border-color text-sm"
        >
          <div className="flex justify-between items-start mb-1">
            <span className="font-semibold text-text-primary">{addendum.description}</span>
            <button
              type="button"
              onClick={() => onRemoveAddendum(addendum.id)}
              className="text-text-secondary hover:text-error"
              aria-label="Remover aditivo"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>
          <div className="text-xs text-text-secondary flex justify-between items-center gap-2 flex-wrap">
            <span>{formatDate(addendum.date)}</span>
            <span
              className={`font-bold ${addendum.value >= 0 ? 'text-success' : 'text-error'} bg-opacity-10 px-1.5 py-0.5 rounded ${addendum.value >= 0 ? 'bg-success/10' : 'bg-error/10'}`}
            >
              {addendum.value >= 0 ? '+' : ''}
              {formatCurrency(addendum.value)}
            </span>
          </div>

          <div className="mt-2 flex items-center gap-2">
            <select
              value={addendum.status || 'Pendente'}
              onChange={(event) =>
                onUpdateAddendumStatus(addendum.id, event.target.value as ContractAddendumStatus)
              }
              aria-label={`Status do aditivo ${addendum.description}`}
              className={`${commonInputClass} text-xs py-1 px-2`}
            >
              {getStatusSelectionOptions(addendum.status || 'Pendente').map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>
      ))}
      {(financials.addendums || []).length === 0 && (
        <p className="text-sm text-text-secondary text-center py-4">Nenhum aditivo registrado.</p>
      )}
    </div>

    <div className="space-y-2 pt-3 border-t border-border-color">
      <h5 className="text-sm font-semibold text-text-primary">Adicionar Aditivo Manual</h5>
      <div className="flex items-center gap-2 text-xs">
        <span className="text-text-secondary font-medium">Tipo:</span>
        <button
          type="button"
          onClick={() => onNewAddendumChange((current) => ({ ...current, isDiscount: false }))}
          className={`px-2.5 py-1 rounded-full border transition-colors ${!newAddendum.isDiscount ? 'bg-success/10 text-success border-success/40' : 'bg-background text-text-secondary border-border-color'}`}
        >
          Acréscimo
        </button>
        <button
          type="button"
          onClick={() => onNewAddendumChange((current) => ({ ...current, isDiscount: true }))}
          className={`px-2.5 py-1 rounded-full border transition-colors ${newAddendum.isDiscount ? 'bg-error/10 text-error border-error/40' : 'bg-background text-text-secondary border-border-color'}`}
        >
          Desconto
        </button>
      </div>
      <input
        type="text"
        placeholder="Descrição"
        value={newAddendum.description}
        onChange={(event) =>
          onNewAddendumChange((current) => ({ ...current, description: event.target.value }))
        }
        className={commonInputClass}
      />
      <div className="grid grid-cols-2 gap-2">
        <input
          type="number"
          placeholder="Valor"
          value={newAddendum.value || ''}
          onChange={(event) =>
            onNewAddendumChange((current) => ({
              ...current,
              value: parseFloat(event.target.value) || 0,
            }))
          }
          className={commonInputClass}
        />
        <input
          type="date"
          value={newAddendum.date}
          onChange={(event) =>
            onNewAddendumChange((current) => ({ ...current, date: event.target.value }))
          }
          aria-label="Data do aditivo"
          className={commonInputClass}
        />
      </div>
      <button
        type="button"
        onClick={onAddNewAddendum}
        className="w-full px-3 py-2 rounded-lg font-semibold text-sm bg-primary text-primary-content hover:bg-primary-focus"
      >
        Adicionar Aditivo
      </button>
    </div>

    <div className="space-y-2 pt-3 border-t border-border-color mt-4">
      <h5 className="text-sm font-semibold text-text-primary">Adicionar Serviço do Orçamento</h5>
      <div className="flex items-center gap-2 text-xs">
        <span className="text-text-secondary font-medium">Tipo:</span>
        <button
          type="button"
          onClick={() => onBudgetServiceModeChange('increase')}
          className={`px-2.5 py-1 rounded-full border transition-colors ${budgetServiceMode === 'increase' ? 'bg-success/10 text-success border-success/40' : 'bg-background text-text-secondary border-border-color'}`}
        >
          Acréscimo
        </button>
        <button
          type="button"
          onClick={() => onBudgetServiceModeChange('discount')}
          className={`px-2.5 py-1 rounded-full border transition-colors ${budgetServiceMode === 'discount' ? 'bg-error/10 text-error border-error/40' : 'bg-background text-text-secondary border-border-color'}`}
        >
          Desconto
        </button>
      </div>
      <select
        value={selectedBudgetServiceId}
        onChange={(event) => onBudgetServiceIdChange(event.target.value)}
        aria-label="Serviço do orçamento"
        className={commonInputClass}
      >
        <option value="">Selecionar serviço</option>
        {budgetServices.map((service) => (
          <option key={service.id} value={service.id}>
            {service.sectionTitle} - {service.description}
          </option>
        ))}
      </select>
      <div className="grid grid-cols-2 gap-2">
        <input
          type="number"
          placeholder="Valor"
          value={budgetServiceValue || ''}
          onChange={(event) => onBudgetServiceValueChange(parseFloat(event.target.value) || 0)}
          className={commonInputClass}
        />
        <input
          type="date"
          value={budgetServiceDate}
          onChange={(event) => onBudgetServiceDateChange(event.target.value)}
          aria-label="Data do serviço"
          className={commonInputClass}
        />
      </div>
      {selectedBudgetService && (
        <p className="text-xs text-text-secondary bg-background p-2 rounded-md">
          Unidade: {selectedBudgetService.unit} | Sugerido:{' '}
          {formatCurrency(selectedBudgetService.suggestedValue)}
        </p>
      )}
      <button
        type="button"
        onClick={onAddBudgetService}
        className="w-full px-3 py-2 rounded-lg font-semibold text-sm bg-secondary text-secondary-content hover:bg-secondary-focus"
      >
        Aplicar Serviço como Aditivo
      </button>
    </div>

    {(financials.addendumAuditTrail || []).length > 0 && (
      <div className="mt-4 pt-3 border-t border-border-color">
        <h5 className="text-sm font-semibold text-text-primary mb-2 flex items-center gap-1">
          <AlertIcon className="w-4 h-4 text-warning" /> Auditoria
        </h5>
        <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar pr-1">
          {financials.addendumAuditTrail!.slice(0, 10).map((entry) => (
            <div
              key={entry.id}
              className="text-xs bg-background rounded-md border border-border-color/50 p-2"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-text-primary">{entry.description}</span>
                <span className="text-[10px] text-text-secondary">
                  {new Date(entry.timestamp).toLocaleString('pt-BR')}
                </span>
              </div>
              <p className="text-[11px] text-text-secondary mt-1">
                {getAuditTrailActionText(entry)}
              </p>
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
);
