import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Modal } from '../ui';
import type { CashBoxOrigin, CashBoxCategory, CashBoxRecurrence } from '../../types';
import { cashBoxRecurrences } from '../../types';
import {
  getCategoriesForOrigin,
  getItemsForCategory,
  validateExpenseInput,
  type CreateExpenseInput,
} from '../../services/cashBoxService';

interface CashBoxExpenseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (input: CreateExpenseInput) => void;
}

const ORIGINS: CashBoxOrigin[] = ['Profissional', 'Pessoal'];

const inputClass =
  'w-full bg-background p-2.5 rounded-lg border border-border-color focus:border-accent focus:ring-1 focus:ring-accent text-text-primary text-sm transition-colors outline-none';

const selectClass = `${inputClass} appearance-none cursor-pointer`;

const labelClass = 'block text-sm font-medium text-text-secondary mb-1.5';

const CashBoxExpenseFormModal: (props: CashBoxExpenseFormModalProps) => React.ReactNode = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [origin, setOrigin] = useState<CashBoxOrigin | ''>('');
  const [category, setCategory] = useState<CashBoxCategory | ''>('');
  const [item, setItem] = useState<string | null>(null);
  const [recurrence, setRecurrence] = useState<CashBoxRecurrence | ''>('');
  const [dueDate, setDueDate] = useState('');
  const [paymentDate, setPaymentDate] = useState('');
  const [value, setValue] = useState<number>(0);
  const [installments, setInstallments] = useState<number>(2);
  const [errors, setErrors] = useState<string[]>([]);

  // Reset form when opening
  useEffect(() => {
    if (isOpen) {
      setOrigin('');
      setCategory('');
      setItem(null);
      setRecurrence('');
      setDueDate('');
      setPaymentDate('');
      setValue(0);
      setInstallments(2);
      setErrors([]);
    }
  }, [isOpen]);

  useEffect(() => {
    setCategory('');
    setItem(null);
  }, [origin]);

  // Reset item when category changes
  useEffect(() => {
    setItem(null);
  }, [category]);

  const categories = useMemo(() => (origin ? getCategoriesForOrigin(origin) : []), [origin]);

  const items = useMemo(
    () =>
      origin && category
        ? getItemsForCategory(origin as CashBoxOrigin, category as CashBoxCategory)
        : [],
    [origin, category],
  );

  const handleSave = useCallback(() => {
    const input: CreateExpenseInput = {
      origin: origin as CashBoxOrigin,
      category: category as CashBoxCategory,
      item: item,
      recurrence: recurrence as CashBoxRecurrence,
      dueDate,
      paymentDate: paymentDate || null,
      value,
      installments: recurrence === 'Parcelada' ? installments : undefined,
    };

    const validation = validateExpenseInput(input);
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    setErrors([]);
    onSave(input);
  }, [origin, category, item, recurrence, dueDate, paymentDate, value, installments, onSave]);

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Adicionar Despesa" size="lg">
      <div className="space-y-5">
        {/* Error display */}
        {errors.length > 0 && (
          <div className="bg-error/10 border border-error/30 rounded-lg p-3">
            {errors.map((err, i) => (
              <p key={i} className="text-error text-sm">
                • {err}
              </p>
            ))}
          </div>
        )}

        {/* Origem */}
        <div>
          <label htmlFor="cb-origin" className={labelClass}>
            Origem <span className="text-error">*</span>
          </label>
          <select
            id="cb-origin"
            value={origin}
            onChange={(e) => setOrigin(e.target.value as CashBoxOrigin)}
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

        {/* Categoria */}
        <div>
          <label htmlFor="cb-category" className={labelClass}>
            Categoria <span className="text-error">*</span>
          </label>
          <select
            id="cb-category"
            value={category}
            onChange={(e) => setCategory(e.target.value as CashBoxCategory)}
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

        {/* Item */}
        <div>
          <label htmlFor="cb-item" className={labelClass}>
            Item
          </label>
          {items.length > 0 ? (
            <select
              id="cb-item"
              value={item ?? ''}
              onChange={(e) => setItem(e.target.value || null)}
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

        {/* Valor */}
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
            onChange={(e) => setValue(parseFloat(e.target.value) || 0)}
            className={inputClass}
            placeholder="0,00"
            aria-label="Valor"
          />
        </div>

        {/* Recorrência */}
        <div>
          <label htmlFor="cb-recurrence" className={labelClass}>
            Recorrência <span className="text-error">*</span>
          </label>
          <select
            id="cb-recurrence"
            value={recurrence}
            onChange={(e) => setRecurrence(e.target.value as CashBoxRecurrence)}
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

        {/* Data de Vencimento */}
        <div className="grid grid-cols-2 gap-4">
          <div className={recurrence !== 'Parcelada' ? 'col-span-2' : ''}>
            <label htmlFor="cb-due-date" className={labelClass}>
              Data de Vencimento <span className="text-error">*</span>
            </label>
            <input
              id="cb-due-date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
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
                onChange={(e) => setInstallments(parseInt(e.target.value, 10) || 2)}
                className={inputClass}
                aria-label="Número de parcelas"
              />
            </div>
          )}
        </div>

        {/* Data de Pagamento */}
        <div>
          <label htmlFor="cb-payment-date" className={labelClass}>
            Data de Pagamento
          </label>
          <input
            id="cb-payment-date"
            type="date"
            value={paymentDate}
            onChange={(e) => setPaymentDate(e.target.value)}
            className={inputClass}
            aria-label="Data de pagamento"
          />
          <p className="text-xs text-text-secondary/60 mt-1">
            Deixe em branco se ainda não foi pago. A data de pagamento define o período da
            movimentação financeira.
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-4 mt-8 pt-4 border-t border-border-color">
        <button
          type="button"
          onClick={onClose}
          className="px-6 py-2.5 rounded-lg font-semibold text-sm text-text-primary bg-border-color/50 hover:bg-border-color transition-colors"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="px-6 py-2.5 rounded-lg font-semibold text-sm text-primary-content bg-primary hover:bg-primary-focus transition-colors"
        >
          Salvar
        </button>
      </div>
    </Modal>
  );
};

export default CashBoxExpenseFormModal;
