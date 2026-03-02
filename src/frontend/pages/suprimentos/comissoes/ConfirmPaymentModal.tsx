import React, { useEffect, useState } from 'react';
import { Modal } from '../../../components/ui';
import { formatCurrency } from '../../../utils/formatters';
import type { Commission } from '../../../types';

type ConfirmPaymentModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (date: string) => void;
  commission: Commission | null;
};

export const ConfirmPaymentModal: (props: ConfirmPaymentModalProps) => React.ReactNode = ({
  isOpen,
  onClose,
  onConfirm,
  commission,
}) => {
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (isOpen) {
      setPaymentDate(new Date().toISOString().split('T')[0]);
    }
  }, [isOpen]);

  if (!isOpen || !commission) {
    return null;
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Confirmar Recebimento">
      <div className="space-y-4">
        <p>
          Confirmar o recebimento de{' '}
          <strong className="text-secondary">{formatCurrency(commission.commissionValue)}</strong>{' '}
          do fornecedor <strong className="text-secondary">{commission.supplierName}</strong>?
        </p>
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
            onChange={(event) => setPaymentDate(event.target.value)}
            className="w-full bg-background p-2 rounded-md border border-border-color focus:border-accent"
            aria-label="Data de Recebimento"
          />
        </div>
      </div>
      <div className="flex justify-end space-x-4 mt-6 pt-4 border-t border-border-color">
        <button
          type="button"
          onClick={onClose}
          className="px-6 py-2 rounded-lg font-semibold text-text-primary bg-border-color/50 hover:bg-border-color"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={() => onConfirm(paymentDate)}
          className="px-6 py-2 rounded-lg font-semibold text-primary-content bg-primary hover:bg-primary-focus"
        >
          Confirmar
        </button>
      </div>
    </Modal>
  );
};
