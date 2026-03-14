import React, { useState, useEffect } from 'react';
import { Button, FormField, Input, Modal, Select } from '../ui';
import type { Supplier } from '../../types';
import { getTodayDateOnly } from '../../utils/formatters';

interface AddSupplierPriceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (supplierId: string, price: number, date: string) => void;
  suppliers: Supplier[];
  productName: string;
}

const AddSupplierPriceModal: (props: AddSupplierPriceModalProps) => React.ReactNode = ({
  isOpen,
  onClose,
  onSave,
  suppliers,
  productName,
}) => {
  const [supplierId, setSupplierId] = useState('');
  const [price, setPrice] = useState<number>(0);
  const [date, setDate] = useState(getTodayDateOnly());

  useEffect(() => {
    if (isOpen) {
      setSupplierId('');
      setPrice(0);
      setDate(getTodayDateOnly());
    }
  }, [isOpen]);

  const handleSave = () => {
    if (!supplierId || price <= 0) return;
    onSave(supplierId, price, date);
  };

  if (!isOpen) return null;

  const supplierOptions = [
    { value: '', label: 'Selecione...' },
    ...suppliers.filter((s) => !s.archived).map((s) => ({ value: s.id, label: s.name })),
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Novo Preço para ${productName}`}>
      <div className="space-y-4">
        <Select
          label="Fornecedor"
          value={supplierId}
          onChange={(e) => setSupplierId(e.target.value)}
          options={supplierOptions}
          aria-label="Fornecedor"
        />
        <FormField label="Preço (R$)">
          <Input
            type="number"
            value={price || ''}
            onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
            placeholder="0.00"
          />
        </FormField>
        <FormField label="Data de Referência">
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </FormField>
      </div>
      <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-border-color">
        <Button variant="secondary" onClick={onClose}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={handleSave}>
          Salvar Preço
        </Button>
      </div>
    </Modal>
  );
};

export { AddSupplierPriceModal };
