import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Modal } from '../ui';
import type { Product, Supplier, ProductUnit } from '../../types';
import {
  PRODUCT_UNIT_OPTIONS,
  SUPPLIER_CATEGORY_OPTIONS as PRODUCT_CATEGORY_OPTIONS,
} from '../../constants';
import { BuildingIcon, AlertIcon, ChevronDownIcon, SearchIcon } from '../ui';

/**
 * Modal for creating/editing a product with supplier linking.
 * input -> isOpen, onClose, onSave callback, initialProduct, suppliers, existingRelations
 * output -> void (calls onSave with product and linked supplier IDs)
 */
export const ProductFormModal: (props: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Product, linkedSupplierIds: string[]) => void;
  initialProduct: Product | null;
  suppliers: Supplier[];
  existingRelations: string[];
}) => React.ReactNode = ({
  isOpen,
  onClose,
  onSave,
  initialProduct,
  suppliers,
  existingRelations,
}) => {
  const getInitial = useCallback(
    () =>
      initialProduct || {
        id: '',
        name: '',
        unit: 'un',
        category: '',
        description: '',
        archived: false,
      },
    [initialProduct],
  );
  const [product, setProduct] = useState<Product>(getInitial());
  const [selectedSupplierIds, setSelectedSupplierIds] = useState<string[]>([]);

  const [isSuppliersOpen, setIsSuppliersOpen] = useState(false);
  const [supplierSearch, setSupplierSearch] = useState('');

  useEffect(() => {
    if (isOpen) {
      setProduct(getInitial());
      setSelectedSupplierIds(initialProduct ? existingRelations : []);
      setIsSuppliersOpen(false);
      setSupplierSearch('');
    }
  }, [isOpen, getInitial, initialProduct, existingRelations]);

  const handleChange = (field: keyof Product, value: string | boolean) =>
    setProduct((p) => ({ ...p, [field]: value }));

  const handleSupplierToggle = (supplierId: string) => {
    setSelectedSupplierIds((prev) =>
      prev.includes(supplierId) ? prev.filter((id) => id !== supplierId) : [...prev, supplierId],
    );
  };

  const handleSave = () => {
    if (!product.name.trim() || !product.category) {
      alert('Nome e Categoria são obrigatórios.');
      return;
    }
    onSave({ ...product, id: product.id || `prod_${Date.now()}` }, selectedSupplierIds);
  };

  const filteredSuppliers = useMemo(() => {
    return suppliers
      .filter((s) => !s.archived)
      .filter((s) => s.name.toLowerCase().includes(supplierSearch.toLowerCase()))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [suppliers, supplierSearch]);

  if (!isOpen) return null;

  const hasSuppliers = suppliers.length > 0;
  const inputClass =
    'w-full bg-background p-2 rounded-md border border-border-color focus:border-accent text-text-primary transition text-sm';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialProduct ? 'Editar Produto' : 'Adicionar Produto'}
    >
      {!hasSuppliers ? (
        <div className="text-center py-8">
          <div className="bg-warning/10 text-warning p-4 rounded-xl mb-4 flex items-start gap-3">
            <AlertIcon className="w-6 h-6 flex-shrink-0" />
            <div className="text-left">
              <h4 className="font-bold text-sm">Nenhum fornecedor cadastrado</h4>
              <p className="text-xs mt-1">
                Para cadastrar produtos, é necessário ter fornecedores no sistema para criar o
                vínculo.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-primary text-sm font-semibold hover:underline">
            Voltar e cadastrar fornecedores
          </button>
        </div>
      ) : (
        <>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
            <div>
              <label
                htmlFor="field-nome-do-produto"
                className="block text-xs font-medium text-text-secondary mb-1"
              >
                Nome do Produto
              </label>
              <input
                id="field-nome-do-produto"
                type="text"
                value={product.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className={inputClass}
                aria-label="Nome do Produto"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="field-unidade"
                  className="block text-xs font-medium text-text-secondary mb-1"
                >
                  Unidade
                </label>
                <select
                  id="field-unidade"
                  value={product.unit}
                  onChange={(e) => handleChange('unit', e.target.value as ProductUnit)}
                  className={inputClass}
                  aria-label="Unidade"
                >
                  {PRODUCT_UNIT_OPTIONS.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="field-categoria"
                  className="block text-xs font-medium text-text-secondary mb-1"
                >
                  Categoria
                </label>
                <select
                  id="field-categoria"
                  value={product.category}
                  onChange={(e) => handleChange('category', e.target.value)}
                  className={inputClass}
                  aria-label="Categoria"
                >
                  <option value="">Selecione uma categoria...</option>
                  {PRODUCT_CATEGORY_OPTIONS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label
                htmlFor="field-descricao"
                className="block text-xs font-medium text-text-secondary mb-1"
              >
                Descrição
              </label>
              <textarea
                id="field-descricao"
                value={product.description || ''}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={2}
                className={inputClass}
                aria-label="Descrição do Produto"
              />
            </div>

            {/* Collapsible Supplier Selection */}
            <div className="border border-border-color rounded-xl overflow-hidden bg-background/30 transition-all duration-300">
              <button
                type="button"
                onClick={() => setIsSuppliersOpen(!isSuppliersOpen)}
                className="w-full flex items-center justify-between p-4 bg-surface hover:bg-background/80 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <BuildingIcon className="w-4 h-4 text-secondary" />
                  <span className="text-xs font-bold text-text-secondary uppercase">
                    Vincular Fornecedores
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  {selectedSupplierIds.length > 0 && (
                    <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full border border-primary/20">
                      {selectedSupplierIds.length} selecionado(s)
                    </span>
                  )}
                  <ChevronDownIcon
                    className={`w-5 h-5 text-text-secondary transition-transform duration-300 ${isSuppliersOpen ? 'rotate-180' : ''}`}
                  />
                </div>
              </button>

              {isSuppliersOpen && (
                <div className="p-4 border-t border-border-color animate-fade-in-up">
                  <div className="relative mb-3">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                    <input
                      type="text"
                      placeholder="Buscar fornecedor..."
                      value={supplierSearch}
                      onChange={(e) => setSupplierSearch(e.target.value)}
                      className="w-full bg-surface pl-9 pr-3 py-2 rounded-lg border border-border-color text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-1 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                    {filteredSuppliers.length > 0 ? (
                      filteredSuppliers.map((supplier) => (
                        <label
                          key={supplier.id}
                          className="flex items-center gap-3 p-2 hover:bg-surface rounded-lg cursor-pointer transition-colors group"
                        >
                          <input
                            type="checkbox"
                            checked={selectedSupplierIds.includes(supplier.id)}
                            onChange={() => handleSupplierToggle(supplier.id)}
                            className="rounded accent-primary w-4 h-4 cursor-pointer"
                          />
                          <span className="text-sm text-text-primary group-hover:text-primary transition-colors">
                            {supplier.name}
                          </span>
                        </label>
                      ))
                    ) : (
                      <p className="text-xs text-text-secondary text-center py-4 italic">
                        Nenhum fornecedor encontrado.
                      </p>
                    )}
                  </div>
                  <p className="text-[10px] text-text-secondary mt-3 text-center">
                    * Defina os preços para os selecionados na próxima tela ou na tabela de
                    produtos.
                  </p>
                </div>
              )}
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
              Salvar
            </button>
          </div>
        </>
      )}
    </Modal>
  );
};
