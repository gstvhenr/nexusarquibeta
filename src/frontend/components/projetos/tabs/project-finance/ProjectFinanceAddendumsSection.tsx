import React, { useState } from 'react';
import { AlertIcon, PlusIcon, TrashIcon } from '@/components/ui/icons';
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

type AddendumFormMode = 'manual' | 'budget-service';

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
}: ProjectFinanceAddendumsSectionProps) => {
  const [formMode, setFormMode] = useState<AddendumFormMode>('manual');
  const [showAudit, setShowAudit] = useState(false);

  const addendums = financials.addendums || [];
  const auditTrail = financials.addendumAuditTrail || [];

  return (
    <div className="space-y-5">
      {/* ── Card 1: Add new addendum (form first for easy access) ── */}
      <div className="bg-surface rounded-2xl shadow-soft border border-border-color overflow-hidden">
        <div className="px-6 py-4 border-b border-border-color bg-background/30">
          <h4 className="text-sm font-bold text-text-primary">Novo Aditivo</h4>
          {/* Mode toggle */}
          <div className="flex gap-1 mt-2 bg-background/60 rounded-lg p-0.5 w-fit">
            <button
              type="button"
              onClick={() => setFormMode('manual')}
              className={`px-3 py-1 text-[11px] font-semibold rounded-md transition-all duration-200
                ${
                  formMode === 'manual'
                    ? 'bg-surface text-primary shadow-sm'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
            >
              Manual
            </button>
            <button
              type="button"
              onClick={() => setFormMode('budget-service')}
              className={`px-3 py-1 text-[11px] font-semibold rounded-md transition-all duration-200
                ${
                  formMode === 'budget-service'
                    ? 'bg-surface text-primary shadow-sm'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
            >
              Serviço do Orçamento
            </button>
          </div>
        </div>

        <div className="p-5">
          {formMode === 'manual' ? (
            /* ── Manual Addendum Form ── */
            <div className="space-y-3">
              {/* Type toggle */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-text-secondary">Tipo:</span>
                <button
                  type="button"
                  onClick={() =>
                    onNewAddendumChange((current) => ({ ...current, isDiscount: false }))
                  }
                  className={`px-3 py-1 text-xs rounded-full border transition-colors ${!newAddendum.isDiscount ? 'bg-success/10 text-success border-success/40 font-semibold' : 'bg-background text-text-secondary border-border-color'}`}
                >
                  Acréscimo
                </button>
                <button
                  type="button"
                  onClick={() =>
                    onNewAddendumChange((current) => ({ ...current, isDiscount: true }))
                  }
                  className={`px-3 py-1 text-xs rounded-full border transition-colors ${newAddendum.isDiscount ? 'bg-error/10 text-error border-error/40 font-semibold' : 'bg-background text-text-secondary border-border-color'}`}
                >
                  Desconto
                </button>
              </div>

              {/* Horizontal form */}
              <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto_auto] gap-3 items-end">
                <div>
                  <label
                    htmlFor="field-addendum-desc"
                    className="block text-xs font-medium text-text-secondary mb-1"
                  >
                    Descrição
                  </label>
                  <input
                    id="field-addendum-desc"
                    type="text"
                    value={newAddendum.description}
                    onChange={(event) =>
                      onNewAddendumChange((current) => ({
                        ...current,
                        description: event.target.value,
                      }))
                    }
                    className={commonInputClass}
                  />
                </div>
                <div>
                  <label
                    htmlFor="field-addendum-value"
                    className="block text-xs font-medium text-text-secondary mb-1"
                  >
                    Valor (R$)
                  </label>
                  <input
                    id="field-addendum-value"
                    type="number"
                    placeholder="R$ 0,00"
                    value={newAddendum.value || ''}
                    onChange={(event) =>
                      onNewAddendumChange((current) => ({
                        ...current,
                        value: parseFloat(event.target.value) || 0,
                      }))
                    }
                    className={`${commonInputClass} w-28`}
                  />
                </div>
                <div>
                  <label
                    htmlFor="field-addendum-date"
                    className="block text-xs font-medium text-text-secondary mb-1"
                  >
                    Data
                  </label>
                  <input
                    id="field-addendum-date"
                    type="date"
                    value={newAddendum.date}
                    onChange={(event) =>
                      onNewAddendumChange((current) => ({
                        ...current,
                        date: event.target.value,
                      }))
                    }
                    aria-label="Data do aditivo"
                    className={commonInputClass}
                  />
                </div>
                <button
                  type="button"
                  onClick={onAddNewAddendum}
                  className="px-5 py-2 rounded-lg font-semibold text-sm bg-primary text-primary-content hover:bg-primary-focus transition-colors whitespace-nowrap"
                >
                  Adicionar
                </button>
              </div>
            </div>
          ) : (
            /* ── Budget Service Form ── */
            <div className="space-y-3">
              {/* Type toggle */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-text-secondary">Tipo:</span>
                <button
                  type="button"
                  onClick={() => onBudgetServiceModeChange('increase')}
                  className={`px-3 py-1 text-xs rounded-full border transition-colors ${budgetServiceMode === 'increase' ? 'bg-success/10 text-success border-success/40 font-semibold' : 'bg-background text-text-secondary border-border-color'}`}
                >
                  Acréscimo
                </button>
                <button
                  type="button"
                  onClick={() => onBudgetServiceModeChange('discount')}
                  className={`px-3 py-1 text-xs rounded-full border transition-colors ${budgetServiceMode === 'discount' ? 'bg-error/10 text-error border-error/40 font-semibold' : 'bg-background text-text-secondary border-border-color'}`}
                >
                  Desconto
                </button>
              </div>

              {/* Horizontal form */}
              <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto_auto] gap-3 items-end">
                <div>
                  <label
                    htmlFor="field-budget-service"
                    className="block text-xs font-medium text-text-secondary mb-1"
                  >
                    Serviço
                  </label>
                  <select
                    id="field-budget-service"
                    value={selectedBudgetServiceId}
                    onChange={(event) => onBudgetServiceIdChange(event.target.value)}
                    aria-label="Serviço do orçamento"
                    className={commonInputClass}
                  >
                    <option value="">Selecionar serviço...</option>
                    {budgetServices.map((service) => (
                      <option key={service.id} value={service.id}>
                        {service.sectionTitle} — {service.description}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="field-budget-value"
                    className="block text-xs font-medium text-text-secondary mb-1"
                  >
                    Valor (R$)
                  </label>
                  <input
                    id="field-budget-value"
                    type="number"
                    placeholder="R$ 0,00"
                    value={budgetServiceValue || ''}
                    onChange={(event) =>
                      onBudgetServiceValueChange(parseFloat(event.target.value) || 0)
                    }
                    className={`${commonInputClass} w-28`}
                  />
                </div>
                <div>
                  <label
                    htmlFor="field-budget-date"
                    className="block text-xs font-medium text-text-secondary mb-1"
                  >
                    Data
                  </label>
                  <input
                    id="field-budget-date"
                    type="date"
                    value={budgetServiceDate}
                    onChange={(event) => onBudgetServiceDateChange(event.target.value)}
                    aria-label="Data do serviço"
                    className={commonInputClass}
                  />
                </div>
                <button
                  type="button"
                  onClick={onAddBudgetService}
                  className="px-5 py-2 rounded-lg font-semibold text-sm bg-secondary text-secondary-content hover:bg-secondary-focus transition-colors whitespace-nowrap"
                >
                  Aplicar
                </button>
              </div>

              {selectedBudgetService && (
                <p className="text-xs text-text-secondary bg-background/60 p-2 rounded-md">
                  Unidade: {selectedBudgetService.unit} · Sugerido:{' '}
                  {formatCurrency(selectedBudgetService.suggestedValue)}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Card 2: Addendums List (below the form) ── */}
      <div className="bg-surface rounded-2xl shadow-soft border border-border-color overflow-hidden">
        <div className="px-6 py-4 border-b border-border-color bg-background/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-info/10 flex items-center justify-center">
              <PlusIcon className="w-4 h-4 text-info" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-text-primary">Aditivos Contratuais</h4>
              <p className="text-[11px] text-text-secondary">
                {addendums.length} aditivo(s) registrado(s)
              </p>
            </div>
          </div>

          {auditTrail.length > 0 && (
            <button
              type="button"
              onClick={() => setShowAudit((prev) => !prev)}
              className="flex items-center gap-1 text-[11px] font-semibold text-text-secondary hover:text-warning transition-colors"
            >
              <AlertIcon className="w-3.5 h-3.5" />
              {showAudit ? 'Ocultar' : 'Auditoria'}
            </button>
          )}
        </div>

        <div className="p-5">
          {addendums.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-border-color rounded-xl">
              <p className="text-sm text-text-secondary">Nenhum aditivo registrado.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {addendums.map((addendum) => (
                <div
                  key={addendum.id}
                  className="flex items-center gap-4 p-3 bg-background rounded-lg border border-border-color/50 group hover:border-border-color transition-colors"
                >
                  {/* Value badge */}
                  <div
                    className={`shrink-0 px-3 py-1.5 rounded-lg text-sm font-bold tabular-nums ${addendum.value >= 0 ? 'bg-success/10 text-success' : 'bg-error/10 text-error'}`}
                  >
                    {addendum.value >= 0 ? '+' : ''}
                    {formatCurrency(addendum.value)}
                  </div>

                  {/* Description + date */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-text-primary truncate">
                      {addendum.description}
                    </p>
                    <p className="text-[11px] text-text-secondary">{formatDate(addendum.date)}</p>
                  </div>

                  {/* Status select */}
                  <select
                    id={`addendum-status-${addendum.id}`}
                    value={addendum.status || 'Pendente'}
                    onChange={(event) =>
                      onUpdateAddendumStatus(
                        addendum.id,
                        event.target.value as ContractAddendumStatus,
                      )
                    }
                    aria-label={`Status do aditivo ${addendum.description}`}
                    className="text-xs py-1.5 px-2 bg-background border border-border-color rounded-md focus:border-accent text-text-primary transition"
                  >
                    {getStatusSelectionOptions(addendum.status || 'Pendente').map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>

                  {/* Remove */}
                  <button
                    type="button"
                    onClick={() => onRemoveAddendum(addendum.id)}
                    className="text-text-secondary hover:text-error opacity-0 group-hover:opacity-100 transition-all shrink-0"
                    aria-label={`Remover aditivo ${addendum.description}`}
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Audit trail (collapsible) */}
          {showAudit && auditTrail.length > 0 && (
            <div className="mt-4 pt-3 border-t border-border-color animate-fade-in-up">
              <div className="space-y-1.5 max-h-32 overflow-y-auto custom-scrollbar pr-1">
                {auditTrail.slice(0, 10).map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between text-[11px] py-1.5 px-2 rounded-md bg-background/60"
                  >
                    <span className="text-text-primary font-medium truncate mr-2">
                      {entry.description}
                    </span>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-text-secondary">{getAuditTrailActionText(entry)}</span>
                      <span className="text-text-secondary/60">
                        {new Date(entry.timestamp).toLocaleString('pt-BR')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
