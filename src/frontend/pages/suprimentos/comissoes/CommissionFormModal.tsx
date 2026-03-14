import React, { useCallback, useEffect, useState } from 'react';
import { Button, FormField, Input, Modal, Select, Textarea } from '@/components/ui';
import { useCoreData, useSupplyChainData } from '@/context/DataContext';
import type { Commission } from '@/types';
import { getLatestPriceFromHistory } from '@/utils/supplierHelpers';
import { getTodayDateOnly, formatCurrency } from '@/utils/formatters';

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
  const { suppliers, quotations, products, supplierProductPrices } = useSupplyChainData();
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

  const supplierOptions = [
    { value: '', label: 'Selecione o Fornecedor' },
    ...suppliers
      .filter((supplier) => !supplier.archived)
      .map((supplier) => ({ value: supplier.id, label: supplier.name })),
  ];

  const clientOptions = [
    { value: '', label: 'Selecione o Cliente' },
    ...clients
      .filter((client) => !client.archived)
      .map((client) => ({ value: client.id, label: client.name })),
  ];

  const sourceQuotation = commission.quotationId
    ? quotations.find((q) => q.id === commission.quotationId)
    : null;

  const quotationItems = sourceQuotation
    ? (sourceQuotation.items || []).filter(
        (item) => (sourceQuotation.selections || {})[item.productId] === commission.supplierId,
      )
    : [];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialCommission ? 'Editar Comissão' : 'Adicionar Comissão'}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Fornecedor"
            value={commission.supplierId}
            onChange={(event) => handleChange('supplierId', event.target.value)}
            options={supplierOptions}
            aria-label="Fornecedor"
          />
          <Select
            label="Cliente"
            value={commission.clientId}
            onChange={(event) => handleChange('clientId', event.target.value)}
            options={clientOptions}
            aria-label="Cliente"
          />
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

        {sourceQuotation && quotationItems.length > 0 && (
          <div className="mt-6 pt-4 border-t border-border-color">
            <h4 className="font-semibold text-secondary mb-3">Itens da Cotação</h4>
            <div className="bg-surface rounded-lg shadow-soft border border-border-color overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-background text-text-secondary">
                  <tr>
                    <th className="py-2 px-4 font-medium">Produto</th>
                    <th className="py-2 px-4 font-medium">Qtd</th>
                    <th className="py-2 px-4 font-medium text-right">Valor Unit.</th>
                    <th className="py-2 px-4 font-medium text-right">Comissão</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-color">
                  {quotationItems.map((item) => {
                    const product = products.find((p) => p.id === item.productId);
                    const priceInfo = supplierProductPrices.find(
                      (p) =>
                        p.productId === item.productId && p.supplierId === commission.supplierId,
                    );
                    const latestPrice = priceInfo
                      ? getLatestPriceFromHistory(priceInfo.priceHistory) || 0
                      : 0;
                    const itemTotal = latestPrice * item.quantity;
                    const itemCommission = calculateCommissionValue(
                      itemTotal,
                      commission.commissionPercentage,
                    );

                    return (
                      <tr key={item.productId} className="hover:bg-background/50">
                        <td className="py-2 px-4">
                          <p className="font-medium text-text-primary">
                            {product?.name || 'Produto não encontrado'}
                          </p>
                          <p className="text-xs text-text-secondary">{product?.category}</p>
                        </td>
                        <td className="py-2 px-4">
                          {item.quantity} {product?.unit}
                        </td>
                        <td className="py-2 px-4 text-right">{formatCurrency(latestPrice)}</td>
                        <td className="py-2 px-4 text-right text-success font-semibold">
                          {formatCurrency(itemCommission)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-text-secondary italic mt-2 text-right">
              Origem: Cotação "{sourceQuotation.name}"
            </p>
          </div>
        )}
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
