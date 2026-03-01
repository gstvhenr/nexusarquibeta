import React, { useEffect, useState } from 'react';
import { paymentMethods, type PaymentMethod } from '../../types';
import { AlertIcon, PlusIcon } from '../ui';
import { Modal } from '../ui';

export const InfoCard: (props: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) => React.ReactNode = ({ label, children, className }) => (
  <div className={`bg-surface p-4 rounded-xl shadow-soft ${className}`}>
    <p className="text-sm font-semibold text-text-secondary">{label}</p>
    <div className="mt-1 font-bold text-text-primary text-lg">{children}</div>
  </div>
);

export const RevisionCounter: (props: {
  count: number;
  limit: number;
  onIncrement: () => void;
}) => React.ReactNode = ({ count, limit, onIncrement }) => {
  const isOverLimit = count > limit;
  return (
    <div
      className={`bg-surface p-4 rounded-xl shadow-soft border ${isOverLimit ? 'border-error/50' : 'border-border-color'}`}
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-semibold text-text-secondary">Revisões Utilizadas</p>
          <div className="flex items-baseline gap-1 mt-1">
            <span
              className={`text-2xl font-bold ${isOverLimit ? 'text-error' : 'text-text-primary'}`}
            >
              {count}
            </span>
            <span className="text-text-secondary font-medium">/ {limit}</span>
          </div>
        </div>
        <button
          onClick={onIncrement}
          className="p-2 bg-background hover:bg-border-color rounded-full transition-colors text-text-primary"
          aria-label="Adicionar revisão"
        >
          <PlusIcon className="w-4 h-4" />
        </button>
      </div>
      {isOverLimit && (
        <p className="text-xs text-error mt-2 font-semibold flex items-center gap-1">
          <AlertIcon className="w-3 h-3" /> Limite excedido. Sugere-se criar um Aditivo Financeiro.
        </p>
      )}
    </div>
  );
};

export const ConfirmPaymentModal: (props: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (date: string, method: PaymentMethod) => void;
}) => React.ReactNode = ({ isOpen, onClose, onConfirm }) => {
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(paymentMethods[0]);

  useEffect(() => {
    if (!isOpen) return;
    setPaymentDate(new Date().toISOString().split('T')[0]);
    setPaymentMethod(paymentMethods[0]);
  }, [isOpen]);

  if (!isOpen) return null;

  const commonInputClass =
    'w-full bg-background p-2 rounded-md border border-border-color focus:border-accent text-text-primary transition';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Confirmar Recebimento">
      <div className="space-y-4">
        <p className="text-text-primary">Confirme os detalhes do pagamento recebido.</p>
        <div>
          <label
            htmlFor="field-data-de-recebimento"
            className="block text-sm font-medium text-text-secondary mb-1"
          >
            Data de Recebimento
          </label>
          <input
            id="field-data-de-recebimento"
            type="date"
            value={paymentDate}
            onChange={(e) => setPaymentDate(e.target.value)}
            className={commonInputClass}
            aria-label="Data de recebimento"
          />
        </div>
        <div>
          <label
            htmlFor="field-forma-de-pagamento"
            className="block text-sm font-medium text-text-secondary mb-1"
          >
            Forma de Pagamento
          </label>
          <select
            id="field-forma-de-pagamento"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
            className={commonInputClass}
            aria-label="Forma de pagamento"
          >
            {paymentMethods.map((method) => (
              <option key={method} value={method}>
                {method}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex justify-end space-x-4 mt-6 pt-4 border-t border-border-color">
        <button
          type="button"
          onClick={onClose}
          className="px-6 py-2 rounded-lg font-semibold text-text-primary bg-border-color/50"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={() => onConfirm(paymentDate, paymentMethod)}
          className="px-6 py-2 rounded-lg font-semibold text-primary-content bg-primary"
        >
          Confirmar
        </button>
      </div>
    </Modal>
  );
};
