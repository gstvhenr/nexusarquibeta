import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Modal } from '../ui';
import type { CashBoxOrigin, CashBoxCategory, CashBoxRecurrence } from '../../types';
import {
  getCategoriesForOrigin,
  getItemsForCategory,
  validateExpenseInput,
  type CreateExpenseInput,
} from '../../services/cashBoxService';
import CashBoxExpenseFields from './CashBoxExpenseFields';

interface CashBoxExpenseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (input: CreateExpenseInput) => void;
}

const ORIGINS: CashBoxOrigin[] = ['Profissional', 'Pessoal'];

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
      <CashBoxExpenseFields
        origin={origin}
        category={category}
        item={item}
        recurrence={recurrence}
        dueDate={dueDate}
        paymentDate={paymentDate}
        value={value}
        installments={installments}
        errors={errors}
        categories={categories}
        items={items}
        ORIGINS={ORIGINS}
        onOriginChange={setOrigin}
        onCategoryChange={setCategory}
        onItemChange={setItem}
        onRecurrenceChange={setRecurrence}
        onDueDateChange={setDueDate}
        onPaymentDateChange={setPaymentDate}
        onValueChange={setValue}
        onInstallmentsChange={setInstallments}
      />

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
