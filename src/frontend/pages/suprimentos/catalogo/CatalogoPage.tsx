import React, { useMemo, useState } from 'react';
import { PageHeader } from '@/components/layout';
import { Button, IconButton, Input } from '@/components/ui';
import { useSupplyChainData } from '@/context/DataContext';
import type { Product, SupplierProductPrice, PriceEntry } from '@/types';
import { NAV_LINKS } from '@/constants';
import {
  PlusIcon,
  CubeIcon,
  TagIcon,
  ListViewIcon,
  CollectionIcon,
  EditIcon,
} from '@/components/ui';
import { ProductFormModal, AddSupplierPriceModal } from '@/components/catalogo';
import { formatCurrency, formatDate } from '@/utils/formatters';

const CatalogoPage: () => React.ReactNode = () => {
  const {
    products,
    setProducts,
    suppliers,
    supplierProductPrices: prices,
    setSupplierProductPrices: setPrices,
  } = useSupplyChainData();
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [isProductModalOpen, setProductModalOpen] = useState(false);
  const [isPriceModalOpen, setPriceModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [filter, setFilter] = useState('');
  const [viewMode, setViewMode] = useState<'card' | 'grid'>('grid'); // Default to grid for desktop productivity

  const sortedProducts = useMemo(
    () => [...products].sort((a, b) => a.name.localeCompare(b.name)),
    [products],
  );
  const filteredProducts = useMemo(() => {
    if (!filter) return sortedProducts;
    return sortedProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(filter.toLowerCase()) ||
        p.category.toLowerCase().includes(filter.toLowerCase()),
    );
  }, [sortedProducts, filter]);

  const effectiveSelectedProductId = useMemo(() => {
    if (selectedProductId && filteredProducts.some((product) => product.id === selectedProductId)) {
      return selectedProductId;
    }
    return filteredProducts[0]?.id ?? null;
  }, [filteredProducts, selectedProductId]);

  const selectedProduct = useMemo(
    () => products.find((product) => product.id === effectiveSelectedProductId),
    [products, effectiveSelectedProductId],
  );

  const productRelations = useMemo(() => {
    if (!productToEdit) return [];
    return prices.filter((pr) => pr.productId === productToEdit.id).map((pr) => pr.supplierId);
  }, [productToEdit, prices]);

  const handleSaveProduct = (product: Product, linkedSupplierIds: string[]) => {
    // 1. Save Product
    setProducts((prev) => {
      const exists = prev.some((p) => p.id === product.id);
      if (exists) {
        return prev.map((p) => (p.id === product.id ? product : p));
      }
      return [product, ...prev];
    });

    // 2. Sync Supplier Relations
    setPrices((prevPrices) => {
      let newPrices = [...prevPrices];

      // A. Create new relations for selected IDs if they don't exist
      linkedSupplierIds.forEach((supplierId) => {
        const exists = newPrices.some(
          (pr) => pr.productId === product.id && pr.supplierId === supplierId,
        );
        if (!exists) {
          newPrices = [
            ...newPrices,
            {
              id: `price_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              productId: product.id,
              supplierId: supplierId,
              priceHistory: [], // Start with no price history, user adds later
            },
          ];
        }
      });

      // B. Remove relations for IDs NOT in selectedIds (only for this product)
      newPrices = newPrices.filter((pr) => {
        if (pr.productId === product.id) {
          return linkedSupplierIds.includes(pr.supplierId);
        }
        return true;
      });

      return newPrices;
    });

    setProductModalOpen(false);
  };

  const handleAddPrice = (supplierId: string, price: number, date: string) => {
    if (!selectedProduct) return;
    setPrices((prev) => {
      const priceInfoIndex = prev.findIndex(
        (p) => p.productId === selectedProduct.id && p.supplierId === supplierId,
      );
      const newPriceEntry: PriceEntry = { date, price };
      if (priceInfoIndex > -1) {
        const updatedPrices = [...prev];
        const newPriceHistory = [...updatedPrices[priceInfoIndex].priceHistory, newPriceEntry];
        updatedPrices[priceInfoIndex] = {
          ...updatedPrices[priceInfoIndex],
          priceHistory: newPriceHistory,
        };
        return updatedPrices;
      } else {
        const newPriceInfo: SupplierProductPrice = {
          id: `price_${Date.now()}`,
          productId: selectedProduct.id,
          supplierId: supplierId,
          priceHistory: [newPriceEntry],
        };
        return [...prev, newPriceInfo];
      }
    });
    setPriceModalOpen(false);
  };

  const openProductModal = (product: Product | null) => {
    setProductToEdit(product);
    setProductModalOpen(true);
  };

  const suprimentosLink = NAV_LINKS.find((link) => link.label === 'Suprimentos');
  const pageIcon = suprimentosLink?.children?.find((child) => child.path === '/catalogo')?.icon;

  return (
    <div className="animate-fade-in-up h-full flex flex-col">
      <PageHeader title="Catálogo de Produtos" icon={pageIcon}>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-primary text-primary-content' : 'bg-surface text-text-secondary hover:text-primary'}`}
            aria-label="Visualização em Lista"
          >
            <ListViewIcon className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('card')}
            className={`p-2 rounded-lg transition-colors ${viewMode === 'card' ? 'bg-primary text-primary-content' : 'bg-surface text-text-secondary hover:text-primary'}`}
            aria-label="Visualização em Detalhes"
          >
            <CollectionIcon className="w-5 h-5" />
          </button>
        </div>
        <Button
          variant="primary"
          onClick={() => openProductModal(null)}
          className="flex items-center gap-2"
        >
          <PlusIcon className="w-5 h-5" /> Adicionar Produto
        </Button>
      </PageHeader>

      {viewMode === 'grid' ? (
        <div className="bg-surface rounded-xl shadow-soft overflow-hidden border border-border-color flex-1">
          <div className="p-4 border-b border-border-color bg-background/30">
            <Input
              type="search"
              placeholder="Buscar produto..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full sm:w-64"
            />
          </div>
          <div className="overflow-x-auto h-full">
            <table className="w-full text-sm text-left">
              <thead className="bg-background/50 text-xs text-text-secondary uppercase font-semibold border-b border-border-color sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-3">Produto</th>
                  <th className="px-6 py-3">Categoria</th>
                  <th className="px-6 py-3">Unid.</th>
                  <th className="px-6 py-3 text-right">Preço Médio</th>
                  <th className="px-6 py-3 text-center">Fornecedores</th>
                  <th className="px-6 py-3 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-color">
                {filteredProducts.map((product) => {
                  const productPrices = prices.filter((pr) => pr.productId === product.id);
                  const relevantPrices = productPrices
                    .map((pr) =>
                      pr.priceHistory.length > 0
                        ? pr.priceHistory[pr.priceHistory.length - 1].price
                        : 0,
                    )
                    .filter((p) => p > 0);
                  const avgPrice =
                    relevantPrices.length > 0
                      ? relevantPrices.reduce((a, b) => a + b, 0) / relevantPrices.length
                      : 0;
                  const linkedSupplierCount = productPrices.length;

                  return (
                    <tr
                      key={product.id}
                      onClick={() => {
                        setSelectedProductId(product.id);
                        setViewMode('card');
                      }}
                      className="hover:bg-background/50 cursor-pointer transition-colors group"
                    >
                      <td className="px-6 py-4 font-semibold text-text-primary">{product.name}</td>
                      <td className="px-6 py-4 text-text-secondary">
                        <span className="bg-background border border-border-color px-2 py-1 rounded text-xs">
                          {product.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-text-secondary">{product.unit}</td>
                      <td className="px-6 py-4 text-right font-medium text-secondary">
                        {avgPrice > 0 ? formatCurrency(avgPrice) : '-'}
                      </td>
                      <td className="px-6 py-4 text-center text-xs text-text-secondary">
                        {linkedSupplierCount > 0 ? `${linkedSupplierCount} vinculados` : 'Nenhum'}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <IconButton
                          variant="primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            openProductModal(product);
                          }}
                          aria-label="Editar"
                          title="Editar"
                        >
                          <EditIcon className="w-4 h-4" />
                        </IconButton>
                      </td>
                    </tr>
                  );
                })}
                {filteredProducts.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-text-secondary">
                      Nenhum produto encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 overflow-hidden mt-6">
          <div className="md:col-span-1 bg-surface rounded-xl shadow-soft flex flex-col h-full overflow-hidden">
            <div className="p-4 border-b border-border-color shrink-0">
              <Input
                type="search"
                placeholder="Buscar produto..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              />
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {filteredProducts.map((p) => (
                <div
                  key={p.id}
                  onClick={() => setSelectedProductId(p.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      (() => setSelectedProductId(p.id))();
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  className={`p-3 rounded-lg cursor-pointer flex items-center gap-3 transition-all ${effectiveSelectedProductId === p.id ? 'bg-primary/10 border-l-4 border-primary' : 'hover:bg-background/80 border-l-4 border-transparent'}`}
                >
                  <div className="w-10 h-10 rounded bg-background flex items-center justify-center text-text-secondary border border-border-color">
                    <CubeIcon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-text-primary text-sm truncate">{p.name}</p>
                    <p className="text-xs text-text-secondary truncate">{p.category}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="md:col-span-2 bg-surface rounded-xl shadow-soft flex flex-col h-full overflow-hidden">
            {selectedProduct ? (
              <>
                <header className="p-6 border-b border-border-color flex justify-between items-start shrink-0">
                  <div>
                    <h2 className="font-serif text-3xl font-bold text-secondary">
                      {selectedProduct.name}
                    </h2>
                    <div className="flex items-center gap-3 mt-2 text-sm text-text-secondary">
                      <span className="flex items-center gap-1 bg-background px-2 py-1 rounded border border-border-color">
                        <TagIcon className="w-3 h-3" /> {selectedProduct.category}
                      </span>
                      <span className="flex items-center gap-1 bg-background px-2 py-1 rounded border border-border-color">
                        Unidade: {selectedProduct.unit}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => openProductModal(selectedProduct)}
                    className="px-4 py-2 rounded-lg font-semibold text-primary bg-primary/10 hover:bg-primary/20 flex items-center gap-2"
                  >
                    Editar
                  </button>
                </header>
                <div className="flex-1 p-6 overflow-y-auto">
                  {selectedProduct.description && (
                    <div className="mb-8">
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
                      <h3 className="font-serif text-xl font-bold text-secondary">
                        Tabela de Preços
                      </h3>
                      <button
                        onClick={() => setPriceModalOpen(true)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-secondary text-secondary-content hover:bg-secondary-focus transition-colors flex items-center gap-1"
                      >
                        <PlusIcon className="w-3 h-3" /> Novo Preço
                      </button>
                    </div>
                    <div className="space-y-3">
                      {prices.filter((p) => p.productId === selectedProduct.id).length > 0 ? (
                        prices
                          .filter((p) => p.productId === selectedProduct.id)
                          .map((p) => {
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
                                      <p className="text-xs text-text-secondary">
                                        por {selectedProduct.unit}
                                      </p>
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
                          <button
                            onClick={() => openProductModal(selectedProduct)}
                            className="text-primary text-xs mt-2 hover:underline"
                          >
                            Vincular Fornecedores
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center text-text-secondary">
                <CubeIcon className="w-16 h-16 text-border-color mb-4" />
                <p>Selecione um produto para ver os detalhes.</p>
              </div>
            )}
          </div>
        </div>
      )}

      <ProductFormModal
        isOpen={isProductModalOpen}
        onClose={() => setProductModalOpen(false)}
        onSave={handleSaveProduct}
        initialProduct={productToEdit}
        suppliers={suppliers}
        existingRelations={productRelations}
      />

      <AddSupplierPriceModal
        isOpen={isPriceModalOpen}
        onClose={() => setPriceModalOpen(false)}
        onSave={handleAddPrice}
        suppliers={suppliers.filter((s) => !s.archived)}
        productName={selectedProduct?.name || ''}
      />
    </div>
  );
};

export default CatalogoPage;
