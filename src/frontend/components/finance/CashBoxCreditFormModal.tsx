import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Button, FormField, Input } from '../ui';
import type { CashBoxOrigin, CashBoxCredit, CashBoxCreditCategory } from '../../types';
import {
  getCreditCategoriesForOrigin,
  getCreditItemsForCategory,
} from '../../services/cashBoxService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (credit: CashBoxCredit) => void;
}

const labelClass = 'block text-sm font-semibold text-text-secondary mb-1.5';
const inputClass =
  'w-full px-4 py-2.5 rounded-xl bg-background border border-border-color text-text-primary focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all';
const selectClass = inputClass;

/**
 * Modal form for adding a cash-box credit (income).
 * @param isOpen - controls modal visibility
 * @param onClose - callback when modal is dismissed
 * @param onSave - callback with the new CashBoxCredit entry
 */
const CashBoxCreditFormModal: (props: Props) => React.ReactNode = ({ isOpen, onClose, onSave }) => {
  const [origin, setOrigin] = useState<CashBoxOrigin | ''>('');
  const [category, setCategory] = useState<CashBoxCreditCategory | ''>('');
  const [item, setItem] = useState<string | ''>('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [value, setValue] = useState<number>(0);
  const [errors, setErrors] = useState<string[]>([]);

  // Derived lists
  const categories = useMemo(
    () => (origin ? getCreditCategoriesForOrigin(origin as CashBoxOrigin) : []),
    [origin],
  );
  const items = useMemo(
    () =>
      origin && category
        ? getCreditItemsForCategory(origin as CashBoxOrigin, category as CashBoxCreditCategory)
        : [],
    [origin, category],
  );

  // Reset form when opening
  useEffect(() => {
    if (isOpen) {
      setOrigin('');
      setCategory('');
      setItem('');
      setDescription('');
      setDate('');
      setValue(0);
      setErrors([]);
    }
  }, [isOpen]);

  // Clear category+item when origin changes
  useEffect(() => {
    setCategory('');
    setItem('');
  }, [origin]);

  // Clear item when category changes
  useEffect(() => {
    setItem('');
  }, [category]);

  const handleSave = useCallback(() => {
    const errs: string[] = [];
    if (!origin) errs.push('Selecione a origem.');
    if (!category) errs.push('Selecione a categoria.');
    if (!date) errs.push('Informe a data.');
    if (value <= 0) errs.push('Informe um valor positivo.');
    if (errs.length > 0) {
      setErrors(errs);
      return;
    }

    const credit: CashBoxCredit = {
      id: `cbc_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      origin: origin as CashBoxOrigin,
      category: category as CashBoxCreditCategory,
      item: item || null,
      description: description.trim(),
      date,
      value,
      confirmed: false,
      createdAt: new Date().toISOString(),
    };

    setErrors([]);
    onSave(credit);
  }, [origin, category, item, description, date, value, onSave]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in-up">
      <div className="bg-surface rounded-2xl shadow-lifted w-full max-w-lg max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border-color shrink-0">
          <h2 className="text-xl font-bold text-text-primary font-serif">Adicionar Crédito</h2>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary transition-colors text-2xl leading-none"
            aria-label="Fechar"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {errors.length > 0 && (
            <div className="bg-error/10 text-error text-sm rounded-xl p-3 space-y-1">
              {errors.map((e, i) => (
                <p key={i}>• {e}</p>
              ))}
            </div>
          )}

          {/* Origem */}
          <div>
            <label htmlFor="cbc-origin" className={labelClass}>
              Origem <span className="text-error">*</span>
            </label>
            <select
              id="cbc-origin"
              value={origin}
              onChange={(e) => setOrigin(e.target.value as CashBoxOrigin)}
              className={selectClass}
              aria-label="Origem"
            >
              <option value="" disabled>
                Selecione a origem
              </option>
              <option value="Profissional">Profissional</option>
              <option value="Pessoal">Pessoal</option>
            </select>
          </div>

          {/* Categoria */}
          {origin && (
            <div>
              <label htmlFor="cbc-category" className={labelClass}>
                Categoria <span className="text-error">*</span>
              </label>
              <select
                id="cbc-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as CashBoxCreditCategory)}
                className={selectClass}
                aria-label="Categoria"
              >
                <option value="" disabled>
                  Selecione a categoria
                </option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Item */}
          {category && items.length > 0 && (
            <div>
              <label htmlFor="cbc-item" className={labelClass}>
                Item
              </label>
              <select
                id="cbc-item"
                value={item}
                onChange={(e) => setItem(e.target.value)}
                className={selectClass}
                aria-label="Item"
              >
                <option value="">Selecione o item (opcional)</option>
                {items.map((it) => (
                  <option key={it} value={it}>
                    {it}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Descrição */}
          <FormField label="Descrição">
            <Input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Observação adicional (opcional)"
              aria-label="Descrição"
            />
          </FormField>

          {/* Data */}
          <FormField
            label={
              <>
                Data do Crédito <span className="text-error">*</span>
              </>
            }
          >
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              aria-label="Data do crédito"
            />
          </FormField>

          {/* Valor */}
          <FormField
            label={
              <>
                Valor (R$) <span className="text-error">*</span>
              </>
            }
          >
            <Input
              type="number"
              min="0.01"
              step="0.01"
              value={value || ''}
              onChange={(e) => setValue(parseFloat(e.target.value) || 0)}
              placeholder="0,00"
              aria-label="Valor"
            />
          </FormField>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-border-color shrink-0">
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSave} id="btn-save-credit">
            Salvar Crédito
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CashBoxCreditFormModal;
