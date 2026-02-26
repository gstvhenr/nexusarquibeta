import React, { useState, useEffect } from 'react';
import { Modal } from '../ui';
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

  const inputClass =
    'w-full bg-background p-3 rounded-lg border border-border-color focus:border-primary focus:ring-1 focus:ring-primary outline-none transition text-sm font-medium';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Vincular Produto a ${supplierName}`}>
      <div className="space-y-6">
        <div className="bg-surface/50 p-4 rounded-lg border border-border-color/50">
          <p className="text-sm text-text-secondary">
            Ao vincular um produto, você define o preço base praticado por este fornecedor. Isso
            será usado automaticamente em novas cotações.
          </p>
        </div>

        <div>
          <label
            htmlFor="field-produto-do-catalogo"
            className="block text-xs font-bold text-text-secondary uppercase mb-2"
          >
            Produto do Catálogo
          </label>
          <select
            id="field-produto-do-catalogo"
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
            className={inputClass}
            aria-label="Produto do catálogo"
          >
            <option value="">Selecione um produto...</option>
            {products
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.unit})
                </option>
              ))}
          </select>
        </div>
        <div>
          <label
            htmlFor="field-preco-atual-r"
            className="block text-xs font-bold text-text-secondary uppercase mb-2"
          >
            Preço Atual (R$)
          </label>
          <input
            id="field-preco-atual-r"
            type="number"
            value={price || ''}
            onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
            className={inputClass}
            placeholder="0.00"
            aria-label="Preço atual"
          />
        </div>
      </div>
      <div className="flex justify-end space-x-3 mt-8 pt-4 border-t border-border-color">
        <button
          onClick={onClose}
          className="px-6 py-2.5 rounded-lg font-semibold text-text-primary bg-surface border border-border-color hover:bg-background transition-colors"
        >
          Cancelar
        </button>
        <button
          onClick={handleSave}
          className="px-6 py-2.5 rounded-lg font-semibold text-primary-content bg-primary hover:bg-primary-focus shadow-soft transition-all transform hover:-translate-y-0.5"
        >
          Salvar Vínculo
        </button>
      </div>
    </Modal>
  );
};

export default LinkProductModal;
