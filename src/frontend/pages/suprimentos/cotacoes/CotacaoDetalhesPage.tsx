import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '../../../components/layout';
import { Modal } from '../../../components/ui';
import { useCoreData, useSupplyChainData } from '../../../context/DataContext';
import type { Quotation, Product, QuotationItem } from '../../../types';
import { formatCurrency } from '../../../utils/formatters';
import { getLatestPriceFromHistory } from '../../../utils/supplierHelpers';
import { NAV_LINKS, SUPPLIER_CATEGORY_OPTIONS } from '../../../constants';
import { PlusIcon, TrashIcon, GiftIcon } from '../../../components/ui';

const getInitialQuotation = (id: string): Quotation => ({
  id,
  name: 'Nova Cotação',
  date: new Date().toISOString().split('T')[0],
  status: 'Em Aberto',
  items: [],
  selections: {},
  archived: false,
});

const AddProductModal: (props: {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (products: Product[]) => void;
  existingIds: Set<string>;
}) => React.ReactNode = ({ isOpen, onClose, onAdd, existingIds }) => {
  const { products } = useSupplyChainData();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState({ search: '', category: 'Todos' });

  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        if (existingIds.has(p.id)) return false;
        const matchesCategory = filter.category === 'Todos' || p.category === filter.category;
        const matchesSearch =
          filter.search === '' || p.name.toLowerCase().includes(filter.search.toLowerCase());
        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [products, filter, existingIds]);

  const handleAdd = () => {
    onAdd(products.filter((p) => selectedIds.has(p.id)));
    onClose();
  };

  useEffect(() => {
    if (isOpen) setSelectedIds(new Set());
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Adicionar Produtos à Cotação" size="2xl">
      <div className="flex gap-4 mb-4">
        <input
          type="search"
          placeholder="Buscar produto..."
          value={filter.search}
          onChange={(e) => setFilter((f) => ({ ...f, search: e.target.value }))}
          className="w-full bg-background p-2 rounded-md border border-border-color"
          aria-label="Buscar produto"
        />
        <select
          value={filter.category}
          onChange={(e) => setFilter((f) => ({ ...f, category: e.target.value }))}
          className="bg-background p-2 rounded-md border border-border-color"
          aria-label="Filtrar por categoria"
        >
          <option value="Todos">Todas Categorias</option>
          {SUPPLIER_CATEGORY_OPTIONS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
      <div className="max-h-96 overflow-y-auto space-y-2 pr-2 -mr-2">
        {filteredProducts.map((p) => (
          <label
            key={p.id}
            className="flex items-center gap-3 p-3 bg-background rounded-lg cursor-pointer hover:bg-border-color/50"
          >
            <input
              type="checkbox"
              checked={selectedIds.has(p.id)}
              onChange={() =>
                setSelectedIds((prev) => {
                  const next = new Set(prev);
                  if (next.has(p.id)) next.delete(p.id);
                  else next.add(p.id);
                  return next;
                })
              }
              className="h-5 w-5 rounded accent-primary"
              aria-label={`Selecionar ${p.name}`}
            />
            <div>
              <p className="font-semibold">{p.name}</p>
              <p className="text-xs text-text-secondary">{p.category}</p>
            </div>
          </label>
        ))}
      </div>
      <div className="flex justify-end space-x-4 mt-6 pt-4 border-t border-border-color">
        <button
          type="button"
          onClick={onClose}
          className="px-6 py-2 rounded-lg font-semibold text-text-primary bg-border-color/50"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={handleAdd}
          className="px-6 py-2 rounded-lg font-semibold text-primary-content bg-primary"
        >
          Adicionar Selecionados
        </button>
      </div>
    </Modal>
  );
};

const QuotationItemRow: (props: {
  item: QuotationItem;
  product: Product;
  onItemChange: (productId: string, field: 'quantity', value: number) => void;
  onRemove: (productId: string) => void;
  onSelectSupplier: (productId: string, supplierId: string) => void;
  selectedSupplierId?: string;
}) => React.ReactNode = ({
  item,
  product,
  onItemChange,
  onRemove,
  onSelectSupplier,
  selectedSupplierId,
}) => {
  const { suppliers, supplierProductPrices } = useSupplyChainData();
  const [isExpanded, setIsExpanded] = useState(false);

  const availablePrices = useMemo(() => {
    return supplierProductPrices
      .filter((price) => price.productId === product.id)
      .map((price) => {
        const supplier = suppliers.find((s) => s.id === price.supplierId);
        const latestPrice = getLatestPriceFromHistory(price.priceHistory);
        if (!supplier || latestPrice === null) return null;
        const total = latestPrice * item.quantity;
        const commission = total * ((supplier.commissionPercentage || 0) / 100);
        return { supplier, price: latestPrice, total, commission };
      })
      .filter((p): p is NonNullable<typeof p> => !!p)
      .sort((a, b) => a.price - b.price);
  }, [product.id, item.quantity, supplierProductPrices, suppliers]);

  return (
    <div className="bg-surface rounded-lg shadow-soft">
      <div
        className="p-4 flex items-center gap-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            (() => setIsExpanded(!isExpanded))();
          }
        }}
        role="button"
        tabIndex={0}
      >
        <div className="flex-1">
          <p className="font-bold text-lg text-text-primary">{product.name}</p>
          <p className="text-xs text-text-secondary">{product.category}</p>
        </div>
        <div className="flex items-center gap-4">
          <input
            type="number"
            value={item.quantity}
            onChange={(e) => onItemChange(product.id, 'quantity', parseInt(e.target.value) || 1)}
            onClick={(e) => e.stopPropagation()}
            className="w-20 bg-background text-center p-2 rounded-md border border-border-color"
            aria-label={`Quantidade para ${product.name}`}
          />
          <span className="w-8 text-text-secondary">{product.unit}</span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemove(product.id);
            }}
            className="p-2 text-text-secondary/60 hover:text-error"
            aria-label="Remover produto da cotação"
          >
            <TrashIcon />
          </button>
        </div>
      </div>
      {isExpanded && (
        <div className="px-4 pb-4">
          <div className="space-y-2">
            {availablePrices.map(({ supplier, price, total, commission }) => (
              <div
                key={supplier.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectSupplier(product.id, supplier.id);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectSupplier(product.id, supplier.id);
                  }
                }}
                role="button"
                tabIndex={0}
                className={`p-3 rounded-lg border-2 grid grid-cols-4 items-center gap-4 transition-colors ${selectedSupplierId === supplier.id ? 'bg-primary/10 border-primary' : 'bg-background hover:bg-border-color/30 border-transparent'}`}
              >
                <div className="font-semibold">{supplier.name}</div>
                <div className="text-right">
                  {formatCurrency(price)} / {product.unit}
                </div>
                <div className="text-right font-bold text-lg text-secondary">
                  {formatCurrency(total)}
                </div>
                <div className="text-right text-xs text-success font-semibold flex items-center justify-end gap-1.5">
                  <GiftIcon className="w-4 h-4" /> {formatCurrency(commission)}
                </div>
              </div>
            ))}
            {availablePrices.length === 0 && (
              <p className="text-center text-xs text-text-secondary py-4">
                Nenhum preço cadastrado para este produto. Vá para "Catálogo de Produtos" para
                adicionar.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const CotacaoDetalhesPage: () => React.ReactNode = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { projects } = useCoreData();
  const { quotations, setQuotations, products, suppliers, supplierProductPrices } =
    useSupplyChainData();
  const [isProductModalOpen, setProductModalOpen] = useState(false);

  const [quotation, setQuotation] = useState<Quotation | null>(() => {
    if (!id) return null;
    if (id.startsWith('qt_new_')) return getInitialQuotation(id);
    return quotations.find((q) => q.id === id) || null;
  });

  const existingProductIds = useMemo(
    () => new Set(quotation?.items.map((item) => item.productId)),
    [quotation],
  );

  const { totalCost, totalCommission } = useMemo(() => {
    let cost = 0;
    let commission = 0;
    if (!quotation) return { totalCost: 0, totalCommission: 0 };

    quotation.items.forEach((item) => {
      const supplierId = quotation.selections?.[item.productId];
      if (supplierId) {
        const product = products.find((p) => p.id === item.productId);
        if (product) {
          const priceInfo = supplierProductPrices.find(
            (p) => p.productId === item.productId && p.supplierId === supplierId,
          );
          const supplier = suppliers.find((s) => s.id === supplierId);
          const price = priceInfo ? getLatestPriceFromHistory(priceInfo.priceHistory) : 0;
          if (price !== null && supplier) {
            const itemTotal = price * item.quantity;
            cost += itemTotal;
            commission += itemTotal * ((supplier.commissionPercentage || 0) / 100);
          }
        }
      }
    });
    return { totalCost: cost, totalCommission: commission };
  }, [quotation, products, supplierProductPrices, suppliers]);

  const handleSave = () => {
    if (!quotation) return;
    setQuotations((prev) => {
      const exists = prev.some((q) => q.id === quotation.id);
      if (exists) return prev.map((q) => (q.id === quotation.id ? quotation : q));
      return [...prev, quotation];
    });
    navigate('/cotacoes');
  };

  const handleUpdate = (field: keyof Quotation, value: Quotation[keyof Quotation]) =>
    setQuotation((q) => (q ? { ...q, [field]: value } : null));

  const handleAddProducts = (newProducts: Product[]) => {
    const newItems: QuotationItem[] = newProducts.map((p) => ({ productId: p.id, quantity: 1 }));
    setQuotation((q) => (q ? { ...q, items: [...q.items, ...newItems] } : null));
  };

  const handleItemChange = (productId: string, field: 'quantity', value: number) => {
    setQuotation((q) =>
      q
        ? {
            ...q,
            items: q.items.map((i) => (i.productId === productId ? { ...i, [field]: value } : i)),
          }
        : null,
    );
  };

  const handleRemoveItem = (productId: string) => {
    setQuotation((q) => {
      if (!q) return null;
      const newSelections = { ...q.selections };
      delete newSelections[productId];
      return {
        ...q,
        items: q.items.filter((i) => i.productId !== productId),
        selections: newSelections,
      };
    });
  };

  const onSelectSupplier = (productId: string, supplierId: string) => {
    setQuotation((q) =>
      q ? { ...q, selections: { ...q.selections, [productId]: supplierId } } : null,
    );
  };

  if (!quotation) return <div>Cotação não encontrada.</div>;

  const cotacoesIcon = NAV_LINKS.find((link) => link.label === 'Suprimentos')?.children?.find(
    (c) => c.path === '/cotacoes',
  )?.icon;

  return (
    <div className="animate-fade-in-up pb-24">
      <PageHeader title="Detalhes da Cotação" subtitle="" icon={cotacoesIcon} />

      <div className="bg-surface rounded-xl shadow-soft p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="field-nome-da-cotacao"
              className="block text-sm font-medium text-text-secondary mb-1"
            >
              Nome da Cotação
            </label>
            <input
              id="field-nome-da-cotacao"
              type="text"
              value={quotation.name}
              onChange={(e) => handleUpdate('name', e.target.value)}
              className="w-full bg-background p-2 rounded-md border border-border-color"
              aria-label="Nome da cotação"
            />
          </div>
          <div>
            <label
              htmlFor="field-vincular-ao-projeto"
              className="block text-sm font-medium text-text-secondary mb-1"
            >
              Vincular ao Projeto
            </label>
            <select
              id="field-vincular-ao-projeto"
              value={quotation.projectId || ''}
              onChange={(e) => handleUpdate('projectId', e.target.value || undefined)}
              className="w-full bg-background p-2 rounded-md border border-border-color"
              aria-label="Projeto"
            >
              <option value="">Nenhum</option>
              {projects
                .filter((p) => !p.archived)
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name.startsWith(p.code) ? p.name : `${p.code} - ${p.name}`}
                  </option>
                ))}
            </select>
          </div>
        </div>
        <div className="flex justify-between items-center pt-4 border-t border-border-color">
          <h3 className="font-serif text-xl font-bold text-secondary">Itens</h3>
          <button
            type="button"
            onClick={() => setProductModalOpen(true)}
            className="text-sm font-semibold text-primary hover:underline"
          >
            <PlusIcon className="inline w-4 h-4 mr-1" /> Adicionar Produtos
          </button>
        </div>
        <div className="space-y-3">
          {quotation.items.map((item) => {
            const product = products.find((p) => p.id === item.productId);
            if (!product) return null;
            return (
              <QuotationItemRow
                key={item.productId}
                item={item}
                product={product}
                onItemChange={handleItemChange}
                onRemove={handleRemoveItem}
                onSelectSupplier={onSelectSupplier}
                selectedSupplierId={quotation.selections?.[item.productId]}
              />
            );
          })}
        </div>
      </div>

      <div className="fixed bottom-0 right-0 left-0 md:left-64 lg:left-80 bg-background/80 backdrop-blur-sm p-4 border-t border-border-color z-10">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-6">
          <div className="flex gap-6 text-sm">
            <div>
              <span className="text-text-secondary">Custo Total (Cliente):</span>
              <p className="font-bold text-2xl text-secondary">{formatCurrency(totalCost)}</p>
            </div>
            <div>
              <span className="text-text-secondary">Comissão Potencial:</span>
              <p className="font-bold text-2xl text-success">{formatCurrency(totalCommission)}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              type="button"
              onClick={() => navigate('/cotacoes')}
              className="px-6 py-3 rounded-lg font-semibold text-text-primary bg-surface border border-border-color hover:bg-background"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-6 py-3 rounded-lg font-semibold text-primary-content bg-primary hover:bg-primary-focus"
            >
              Salvar Cotação
            </button>
          </div>
        </div>
      </div>

      <AddProductModal
        isOpen={isProductModalOpen}
        onClose={() => setProductModalOpen(false)}
        onAdd={handleAddProducts}
        existingIds={existingProductIds}
      />
    </div>
  );
};

export default CotacaoDetalhesPage;
