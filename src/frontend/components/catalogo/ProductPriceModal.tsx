import React from 'react';
import { Button, Modal, PlusIcon, TagIcon } from '../ui';
import type { Product, Supplier, SupplierProductPrice } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';

interface ProductPriceModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProduct: Product | null;
  prices: SupplierProductPrice[];
  suppliers: Supplier[];
  onAddPriceClick: () => void;
}

export function ProductPriceModal({
  isOpen,
  onClose,
  selectedProduct,
  prices,
  suppliers,
  onAddPriceClick,
}: ProductPriceModalProps) {
  if (!isOpen || !selectedProduct) return null;

  const productPrices = prices.filter((p) => p.productId === selectedProduct.id);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Detalhes do Produto" size="lg">
      <div className="space-y-6">
        <div>
          <h2 className="font-serif text-2xl font-bold text-secondary">{selectedProduct.name}</h2>
          <div className="flex items-center gap-3 mt-2 text-sm text-text-secondary">
            <span className="flex items-center gap-1 bg-background px-2 py-1 rounded border border-border-color">
              <TagIcon className="w-3 h-3" /> {selectedProduct.category}
            </span>
            <span className="flex items-center gap-1 bg-background px-2 py-1 rounded border border-border-color">
              Unidade: {selectedProduct.unit}
            </span>
          </div>
        </div>

        {selectedProduct.description && (
          <div>
            <h4 className="font-semibold text-text-secondary mb-2 text-sm uppercase tracking-wide">
              Descrição
            </h4>
            <p className="text-text-primary bg-background/30 p-4 rounded-lg border border-border-color/50 text-sm leading-relaxed">
              {selectedProduct.description}
            </p>
          </div>
        )}

        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-serif text-xl font-bold text-secondary">Tabela de Preços</h3>
            <Button variant="secondary" size="sm" onClick={onAddPriceClick}>
              <PlusIcon className="w-3 h-3" /> Novo Preço
            </Button>
          </div>
          <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
            {productPrices.length > 0 ? (
              productPrices.map((p) => {
                const latestEntry = p.priceHistory.sort(
                  (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
                )[0];
                const supplier = suppliers.find((s) => s.id === p.supplierId);
                const price = latestEntry ? latestEntry.price : 0;

                return (
                  <div
                    key={p.id}
                    className="bg-background/50 p-4 rounded-lg flex justify-between items-center border border-border-color hover:border-primary/30 transition-colors group"
                  >
                    <div>
                      <p className="font-bold text-text-primary text-base">
                        {supplier?.name || 'Fornecedor Desconhecido'}
                      </p>
                      {latestEntry && (
                        <p className="text-xs text-text-secondary mt-1 flex items-center gap-1">
                          Atualizado em: {formatDate(latestEntry.date)}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      {price > 0 ? (
                        <>
                          <p className="font-bold text-xl text-secondary">
                            {formatCurrency(price)}
                          </p>
                          <p className="text-xs text-text-secondary">por {selectedProduct.unit}</p>
                        </>
                      ) : (
                        <span className="text-xs bg-warning/10 text-warning px-2 py-1 rounded">
                          Preço não definido
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-10 bg-background/30 rounded-lg border border-dashed border-border-color">
                <p className="text-text-secondary text-sm">
                  Nenhum fornecedor vinculado a este produto.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-border-color">
          <Button variant="ghost" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </div>
    </Modal>
  );
}
