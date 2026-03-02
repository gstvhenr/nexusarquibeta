import React from 'react';
import type { CashBoxOrigin, CashBoxCategory, CashBoxRecurrence } from '../../types';
import { cashBoxRecurrences } from '../../types';

const inputClass =
  'w-full bg-background p-2.5 rounded-lg border border-border-color focus:border-accent focus:ring-1 focus:ring-accent text-text-primary text-sm transition-colors outline-none';
const selectClass = `${inputClass} appearance-none cursor-pointer`;
const labelClass = 'block text-sm font-medium text-text-secondary mb-1.5';

interface CashBoxExpenseFieldsProps {
  origin: CashBoxOrigin | '';
  category: CashBoxCategory | '';
  item: string | null;
  recurrence: CashBoxRecurrence | '';
  dueDate: string;
  paymentDate: string;
  value: number;
  installments: number;
  errors: string[];
  categories: string[];
  items: string[];
  ORIGINS: CashBoxOrigin[];
  onOriginChange: (v: CashBoxOrigin) => void;
  onCategoryChange: (v: CashBoxCategory) => void;
  onItemChange: (v: string | null) => void;
  onRecurrenceChange: (v: CashBoxRecurrence) => void;
  onDueDateChange: (v: string) => void;
  onPaymentDateChange: (v: string) => void;
  onValueChange: (v: number) => void;
  onInstallmentsChange: (v: number) => void;
}

function CashBoxExpenseFields({
  origin,
  category,
  item,
  recurrence,
  dueDate,
  paymentDate,
  value,
  installments,
  errors,
  categories,
  items,
  ORIGINS,
  onOriginChange,
  onCategoryChange,
  onItemChange,
  onRecurrenceChange,
  onDueDateChange,
  onPaymentDateChange,
  onValueChange,
  onInstallmentsChange,
}: CashBoxExpenseFieldsProps) {
  return (
    <div className="space-y-5">
      {errors.length > 0 && (
        <div className="bg-error/10 border border-error/30 rounded-lg p-3">
          {errors.map((err, i) => (
            <p key={i} className="text-error text-sm">
              • {err}
            </p>
          ))}
        </div>
      )}

      <div>
        <label htmlFor="cb-origin" className={labelClass}>
          Origem <span className="text-error">*</span>
        </label>
        <select
          id="cb-origin"
          value={origin}
          onChange={(e) => onOriginChange(e.target.value as CashBoxOrigin)}
          className={selectClass}
          aria-label="Origem"
        >
          <option value="" disabled>
            Selecione a origem
          </option>
          {ORIGINS.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="cb-category" className={labelClass}>
          Categoria <span className="text-error">*</span>
        </label>
        <select
          id="cb-category"
          value={category}
          onChange={(e) => onCategoryChange(e.target.value as CashBoxCategory)}
          className={selectClass}
          disabled={!origin}
          aria-label="Categoria"
        >
          <option value="" disabled>
            {origin ? 'Selecione a categoria' : 'Selecione a origem primeiro'}
          </option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="cb-item" className={labelClass}>
          Item
        </label>
        {items.length > 0 ? (
          <select
            id="cb-item"
            value={item ?? ''}
            onChange={(e) => onItemChange(e.target.value || null)}
            className={selectClass}
            disabled={!category}
            aria-label="Item"
          >
            <option value="">
              {category ? 'Selecione o item' : 'Selecione a categoria primeiro'}
            </option>
            {items.map((it) => (
              <option key={it} value={it}>
                {it}
              </option>
            ))}
          </select>
        ) : (
          <>
            <select
              id="cb-item"
              disabled
              className={`${selectClass} opacity-50 cursor-not-allowed`}
              aria-label="Item"
            >
              <option>Sem itens para esta categoria</option>
            </select>
            <p className="text-xs text-text-secondary/60 mt-1">
              Esta categoria não possui itens cadastrados.
            </p>
          </>
        )}
      </div>

      <div>
        <label htmlFor="cb-value" className={labelClass}>
          Valor (R$) <span className="text-error">*</span>
        </label>
        <input
          id="cb-value"
          type="number"
          min="0"
          step="0.01"
          value={value || ''}
          onChange={(e) => onValueChange(parseFloat(e.target.value) || 0)}
          className={inputClass}
          placeholder="0,00"
          aria-label="Valor"
        />
      </div>

      <div>
        <label htmlFor="cb-recurrence" className={labelClass}>
          Recorrência <span className="text-error">*</span>
        </label>
        <select
          id="cb-recurrence"
          value={recurrence}
          onChange={(e) => onRecurrenceChange(e.target.value as CashBoxRecurrence)}
          className={selectClass}
          aria-label="Recorrência"
        >
          <option value="" disabled>
            Selecione a recorrência
          </option>
          {cashBoxRecurrences.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className={recurrence !== 'Parcelada' ? 'col-span-2' : ''}>
          <label htmlFor="cb-due-date" className={labelClass}>
            Data de Vencimento <span className="text-error">*</span>
          </label>
          <input
            id="cb-due-date"
            type="date"
            value={dueDate}
            onChange={(e) => onDueDateChange(e.target.value)}
            className={inputClass}
            aria-label="Data de vencimento"
          />
          {recurrence === 'Indeterminada' && (
            <p className="text-xs text-text-secondary/60 mt-1">
              Será lançado mensalmente no mesmo dia, sem data final.
            </p>
          )}
          {recurrence === 'Parcelada' && (
            <p className="text-xs text-text-secondary/60 mt-1">
              As parcelas serão lançadas para os meses seguintes, no mesmo dia.
            </p>
          )}
        </div>
        {recurrence === 'Parcelada' && (
          <div>
            <label htmlFor="cb-installments" className={labelClass}>
              Nº de Parcelas <span className="text-error">*</span>
            </label>
            <input
              id="cb-installments"
              type="number"
              min="2"
              max="120"
              value={installments}
              onChange={(e) => onInstallmentsChange(parseInt(e.target.value, 10) || 2)}
              className={inputClass}
              aria-label="Número de parcelas"
            />
          </div>
        )}
      </div>

      <div>
        <label htmlFor="cb-payment-date" className={labelClass}>
          Data de Pagamento
        </label>
        <input
          id="cb-payment-date"
          type="date"
          value={paymentDate}
          onChange={(e) => onPaymentDateChange(e.target.value)}
          className={inputClass}
          aria-label="Data de pagamento"
        />
        <p className="text-xs text-text-secondary/60 mt-1">
          Deixe em branco se ainda não foi pago. A data de pagamento define o período da
          movimentação financeira.
        </p>
      </div>
    </div>
  );
}

export default CashBoxExpenseFields;
