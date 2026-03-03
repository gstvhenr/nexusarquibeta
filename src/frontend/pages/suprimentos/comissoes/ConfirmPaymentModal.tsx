import React, { useEffect, useState } from 'react';
import { Button, FormField, Input, Modal } from '@/components/ui';
import { formatCurrency } from '@/utils/formatters';
import type { Commission } from '@/types';

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
        <FormField label="Data de Recebimento">
          <Input
            type="date"
            value={paymentDate}
            onChange={(event) => setPaymentDate(event.target.value)}
            aria-label="Data de Recebimento"
          />
        </FormField>
      </div>
      <div className="flex justify-end space-x-4 mt-6 pt-4 border-t border-border-color">
        <Button variant="secondary" onClick={onClose}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={() => onConfirm(paymentDate)}>
          Confirmar
        </Button>
      </div>
    </Modal>
  );
};
