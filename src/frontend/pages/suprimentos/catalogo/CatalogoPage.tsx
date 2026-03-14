import React, { useMemo, useState } from 'react';
import { PageHeader } from '@/components/layout';
import { Button, IconButton, Input, Select } from '@/components/ui';
import { useSupplyChainData } from '@/context/DataContext';
import type { Product, SupplierProductPrice, PriceEntry } from '@/types';
import { NAV_LINKS } from '@/constants';
import { PlusIcon, EditIcon } from '@/components/ui';
import { ProductFormModal, AddSupplierPriceModal, ProductPriceModal } from '@/components/catalogo';
import { formatCurrency } from '@/utils/formatters';

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
  const [isDetailsModalOpen, setDetailsModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [filter, setFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Todos Produtos');

  const sortedProducts = useMemo(
    () => [...products].sort((a, b) => a.name.localeCompare(b.name)),
    [products],
  );

  const allCategories = useMemo(() => {
    const cats = new Set<string>();
    products.forEach((p) => {
      if (p.category && p.category.trim() !== '') {
        cats.add(p.category);
      }
    });
    return Array.from(cats).sort((a, b) => a.localeCompare(b));
  }, [products]);

  const categoryOptions = [
    { value: 'Todos Produtos', label: 'Todos Produtos' },
    ...allCategories.map((c) => ({ value: c, label: c })),
  ];

  const filteredProducts = useMemo(() => {
    return sortedProducts.filter((p) => {
      const matchText =
        !filter ||
        p.name.toLowerCase().includes(filter.toLowerCase()) ||
        p.category.toLowerCase().includes(filter.toLowerCase());
      const matchCategory = categoryFilter === 'Todos Produtos' || p.category === categoryFilter;
      return matchText && matchCategory;
    });
  }, [sortedProducts, filter, categoryFilter]);

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
        <Button
          variant="primary"
          onClick={() => openProductModal(null)}
          className="flex items-center gap-2"
        >
          <PlusIcon className="w-5 h-5" /> Adicionar Produto
        </Button>
      </PageHeader>

      <div className="bg-surface rounded-xl shadow-soft overflow-hidden border border-border-color flex-1 flex flex-col mt-6">
        <div className="p-4 border-b border-border-color bg-background/30 flex flex-col sm:flex-row gap-4">
          <Input
            type="search"
            placeholder="Buscar produto..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full sm:w-64"
          />
          <Select
            options={categoryOptions}
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full sm:w-64"
          />
        </div>
        <div className="overflow-x-auto flex-1">
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
                      setDetailsModalOpen(true);
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

      <ProductFormModal
        isOpen={isProductModalOpen}
        onClose={() => setProductModalOpen(false)}
        onSave={handleSaveProduct}
        initialProduct={productToEdit}
        suppliers={suppliers}
        existingRelations={productRelations}
      />

      <ProductPriceModal
        isOpen={isDetailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        selectedProduct={selectedProduct || null}
        prices={prices}
        suppliers={suppliers}
        onAddPriceClick={() => setPriceModalOpen(true)}
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
