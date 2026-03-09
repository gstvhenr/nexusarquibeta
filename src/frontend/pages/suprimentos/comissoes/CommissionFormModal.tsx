import React, { useCallback, useEffect, useState } from 'react';
import { Button, FormField, Input, Modal, Textarea } from '@/components/ui';
import { useCoreData, useSupplyChainData } from '@/context/DataContext';
import type { Commission } from '@/types';
import { getTodayDateOnly } from '@/utils/formatters';

type CommissionFormModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (commission: Commission) => void;
  initialCommission: Commission | null;
};

const calculateCommissionValue = (saleValue: number, commissionPercentage: number): number =>
  (saleValue * commissionPercentage) / 100;

export const CommissionFormModal: (props: CommissionFormModalProps) => React.ReactNode = ({
  isOpen,
  onClose,
  onSave,
  initialCommission,
}) => {
  const { suppliers } = useSupplyChainData();
  const { clients } = useCoreData();

  const getInitial = useCallback(
    () =>
      initialCommission || {
        id: '',
        saleDate: getTodayDateOnly(),
        supplierId: '',
        supplierName: '',
        clientId: '',
        clientName: '',
        saleValue: 0,
        commissionPercentage: 0,
        commissionValue: 0,
        status: 'Pendente',
        notes: '',
        expectedPaymentDate: null,
      },
    [initialCommission],
  );

  const [commission, setCommission] = useState(getInitial());

  useEffect(() => {
    if (isOpen) {
      const nextCommission = getInitial();
      setCommission({
        ...nextCommission,
        commissionValue: calculateCommissionValue(
          nextCommission.saleValue,
          nextCommission.commissionPercentage,
        ),
      });
    }
  }, [isOpen, getInitial]);

  const handleChange = (field: keyof Commission, value: Commission[keyof Commission]) => {
    const updated = { ...commission, [field]: value };
    if (field === 'supplierId') {
      const supplier = suppliers.find((item) => item.id === value);
      updated.supplierName = supplier?.name || '';
      updated.commissionPercentage = supplier?.commissionPercentage || 0;
    }
    if (field === 'clientId') {
      updated.clientName = clients.find((item) => item.id === value)?.name || '';
    }

    updated.commissionValue = calculateCommissionValue(
      updated.saleValue,
      updated.commissionPercentage,
    );

    setCommission(updated);
  };

  const handleSave = () => {
    if (!commission.supplierId || !commission.clientId || commission.saleValue <= 0) {
      alert('Fornecedor, cliente e valor da venda são obrigatórios.');
      return;
    }
    onSave({ ...commission, id: commission.id || `comm_${Date.now()}` });
  };

  if (!isOpen) {
    return null;
  }

  const selectClass =
    'w-full bg-background p-2 rounded-md border border-border-color focus:border-accent';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialCommission ? 'Editar Comissão' : 'Adicionar Comissão'}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="field-fornecedor"
              className="block text-xs font-medium text-text-secondary mb-1"
            >
              Fornecedor
            </label>
            <select
              id="field-fornecedor"
              value={commission.supplierId}
              onChange={(event) => handleChange('supplierId', event.target.value)}
              className={selectClass}
              aria-label="Fornecedor"
            >
              <option value="">Selecione o Fornecedor</option>
              {suppliers
                .filter((supplier) => !supplier.archived)
                .map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </option>
                ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="field-cliente"
              className="block text-xs font-medium text-text-secondary mb-1"
            >
              Cliente
            </label>
            <select
              id="field-cliente"
              value={commission.clientId}
              onChange={(event) => handleChange('clientId', event.target.value)}
              className={selectClass}
              aria-label="Cliente"
            >
              <option value="">Selecione o Cliente</option>
              {clients
                .filter((client) => !client.archived)
                .map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Data da Venda">
            <Input
              type="date"
              value={commission.saleDate.split('T')[0]}
              onChange={(event) => handleChange('saleDate', event.target.value)}
              aria-label="Data da Venda"
            />
          </FormField>
          <FormField label="Data Prevista de Pagamento">
            <Input
              type="date"
              value={commission.expectedPaymentDate?.split('T')[0] || ''}
              onChange={(event) => handleChange('expectedPaymentDate', event.target.value || null)}
              aria-label="Data Prevista de Pagamento"
            />
          </FormField>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <FormField label="Valor da Venda">
            <Input
              type="number"
              placeholder="R$ 0,00"
              value={commission.saleValue || ''}
              onChange={(event) =>
                handleChange('saleValue', Number.parseFloat(event.target.value) || 0)
              }
              aria-label="Valor da Venda"
            />
          </FormField>
          <FormField label="% Comissão">
            <Input
              type="number"
              placeholder="%"
              value={commission.commissionPercentage || ''}
              onChange={(event) =>
                handleChange('commissionPercentage', Number.parseFloat(event.target.value) || 0)
              }
              aria-label="Percentual de Comissão"
            />
          </FormField>
          <FormField label="Valor Comissão">
            <Input
              type="number"
              placeholder="R$ 0,00"
              value={commission.commissionValue.toFixed(2)}
              readOnly
              className="bg-surface cursor-not-allowed"
              aria-label="Valor da Comissão"
            />
          </FormField>
        </div>
        <FormField label="Notas (Opcional)">
          <Textarea
            value={commission.notes || ''}
            onChange={(event) => handleChange('notes', event.target.value)}
            rows={2}
            aria-label="Notas"
          />
        </FormField>
      </div>
      <div className="flex justify-end space-x-4 mt-6 pt-4 border-t border-border-color">
        <Button variant="secondary" onClick={onClose}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={handleSave}>
          Salvar
        </Button>
      </div>
    </Modal>
  );
};
