import React, { useState, useEffect } from 'react';
import { Modal } from '../ui';
import type { Supplier } from '../../types';

/**
 * Modal for adding a supplier price entry to a product.
 * input -> isOpen, onClose, onSave callback, suppliers, productName
 * output -> void (calls onSave with supplierId, price, date)
 */
export const AddSupplierPriceModal: (props: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (supplierId: string, price: number, date: string) => void;
  suppliers: Supplier[];
  productName: string;
}) => React.ReactNode = ({ isOpen, onClose, onSave, suppliers, productName }) => {
  const [supplierId, setSupplierId] = useState('');
  const [price, setPrice] = useState(0);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  useEffect(() => {
    if (isOpen && suppliers.length > 0) setSupplierId(suppliers[0].id);
  }, [isOpen, suppliers]);
  const handleSave = () => {
    if (!supplierId || price <= 0) {
      alert('Selecione um fornecedor e insira um preço válido.');
      return;
    }
    onSave(supplierId, price, date);
  };
  if (!isOpen) return null;
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Adicionar Preço para "${productName}"`}>
      <div className="space-y-4">
        <div>
          <label
            htmlFor="field-fornecedor"
            className="block text-xs font-medium text-text-secondary mb-1"
          >
            Fornecedor
          </label>
          <select
            id="field-fornecedor"
            value={supplierId}
            onChange={(e) => setSupplierId(e.target.value)}
            className="w-full bg-background p-2 rounded-md border border-border-color text-sm"
            aria-label="Fornecedor"
          >
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="field-preco-r"
              className="block text-xs font-medium text-text-secondary mb-1"
            >
              Preço (R$)
            </label>
            <input
              id="field-preco-r"
              type="number"
              value={price || ''}
              onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
              className="w-full bg-background p-2 rounded-md border border-border-color text-sm"
              placeholder="0.00"
            />
          </div>
          <div>
            <label
              htmlFor="field-data"
              className="block text-xs font-medium text-text-secondary mb-1"
            >
              Data
            </label>
            <input
              id="field-data"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-background p-2 rounded-md border border-border-color text-sm"
              aria-label="Data do preço"
            />
          </div>
        </div>
      </div>
      <div className="flex justify-end space-x-4 mt-6 pt-4 border-t border-border-color">
        <button
          onClick={onClose}
          className="px-6 py-2 rounded-lg font-semibold text-text-primary bg-border-color/50 hover:bg-border-color"
        >
          Cancelar
        </button>
        <button
          onClick={handleSave}
          className="px-6 py-2 rounded-lg font-semibold text-primary-content bg-primary hover:bg-primary-focus"
        >
          Salvar Preço
        </button>
      </div>
    </Modal>
  );
};
