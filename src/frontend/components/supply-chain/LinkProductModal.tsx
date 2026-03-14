import React, { useState, useEffect } from 'react';
import { Button, FormField, Input, Modal, Select } from '../ui';
import type { Product } from '../../types';

/**
 * Modal for linking a product from the catalogue to a supplier with a price.
 * @param isOpen – Controls visibility
 * @param onSave – Callback with `(productId, price)` when user confirms
 */
const LinkProductModal: (props: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (productId: string, price: number) => void;
  products: Product[];
  supplierName: string;
}) => React.ReactNode = ({ isOpen, onClose, onSave, products, supplierName }) => {
  const [selectedProductId, setSelectedProductId] = useState('');
  const [price, setPrice] = useState<number>(0);

  useEffect(() => {
    if (isOpen) {
      setSelectedProductId('');
      setPrice(0);
    }
  }, [isOpen]);

  const handleSave = () => {
    if (!selectedProductId || price <= 0) {
      alert('Selecione um produto e informe um preço válido.');
      return;
    }
    onSave(selectedProductId, price);
  };

  if (!isOpen) return null;

  const productOptions = [
    { value: '', label: 'Selecione um produto...' },
    ...products
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((p) => ({ value: p.id, label: `${p.name} (${p.unit})` })),
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Vincular Produto a ${supplierName}`}>
      <div className="space-y-6">
        <div className="bg-surface/50 p-4 rounded-lg border border-border-color/50">
          <p className="text-sm text-text-secondary">
            Ao vincular um produto, você define o preço base praticado por este fornecedor. Isso
            será usado automaticamente em novas cotações.
          </p>
        </div>

        <Select
          label="Produto do Catálogo"
          value={selectedProductId}
          onChange={(e) => setSelectedProductId(e.target.value)}
          options={productOptions}
          aria-label="Produto do catálogo"
        />

        <FormField label="Preço Atual (R$)">
          <Input
            type="number"
            value={price || ''}
            onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
            placeholder="0.00"
            aria-label="Preço atual"
          />
        </FormField>
      </div>
      <div className="flex justify-end space-x-3 mt-8 pt-4 border-t border-border-color">
        <Button variant="secondary" onClick={onClose}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={handleSave}>
          Salvar Vínculo
        </Button>
      </div>
    </Modal>
  );
};

export default LinkProductModal;
