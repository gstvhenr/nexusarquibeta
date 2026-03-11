import { useEffect, useMemo, useState } from 'react';
import type {
  Commission,
  Product,
  Project,
  Quotation,
  Supplier,
  SupplierProductPrice,
} from '../../types';
import { getLatestPriceFromHistory } from '../../utils/supplierHelpers';
import LinkProductModal from './LinkProductModal';
import { SupplierDetailsPanel } from './SupplierDetailsPanel';
import { SuppliersSidebar } from './SuppliersSidebar';
import type {
  SupplierActiveTab,
  SupplierProductSnapshot,
  SupplierQuotationsSummary,
} from './supplierViewTypes';

type SuppliersViewProps = {
  suppliers: Supplier[];
  commissions: Commission[];
  quotations: Quotation[];
  projects: Project[];
  products: Product[];
  prices: SupplierProductPrice[];
  onEditSupplier: (supplier: Supplier | null) => void;
  onLinkProduct: (productId: string, price: number) => void;
};

function SuppliersView({
  suppliers,
  commissions,
  quotations,
  projects: _projects,
  products,
  prices,
  onEditSupplier,
  onLinkProduct,
}: SuppliersViewProps): JSX.Element {
  const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(null);
  const [filter, setFilter] = useState('');
  const [activeTab, setActiveTab] = useState<SupplierActiveTab>('details');
  const [isLinkModalOpen, setLinkModalOpen] = useState(false);

  const activeSuppliers = useMemo(
    () =>
      suppliers
        .filter((supplier) => !supplier.archived)
        .sort((first, second) => first.name.localeCompare(second.name)),
    [suppliers],
  );

  const filteredSuppliers = useMemo(() => {
    if (!filter) return activeSuppliers;

    const normalizedFilter = filter.toLowerCase();

    return activeSuppliers.filter(
      (supplier) =>
        supplier.name.toLowerCase().includes(normalizedFilter) ||
        supplier.categories.some((category) => category.toLowerCase().includes(normalizedFilter)),
    );
  }, [activeSuppliers, filter]);

  useEffect(() => {
    if (!selectedSupplierId && activeSuppliers.length > 0) {
      setSelectedSupplierId(activeSuppliers[0].id);
    }

    if (
      selectedSupplierId &&
      !activeSuppliers.some((supplier) => supplier.id === selectedSupplierId) &&
      activeSuppliers.length > 0
    ) {
      setSelectedSupplierId(activeSuppliers[0].id);
    }
  }, [activeSuppliers, selectedSupplierId]);

  const selectedSupplier = useMemo(
    () => suppliers.find((supplier) => supplier.id === selectedSupplierId) || null,
    [suppliers, selectedSupplierId],
  );

  useEffect(() => {
    setActiveTab('products');
  }, [selectedSupplierId]);

  const supplierProducts = useMemo<SupplierProductSnapshot[]>(() => {
    if (!selectedSupplier) return [];

    const rows = prices
      .filter((price) => price.supplierId === selectedSupplier.id)
      .map((price) => {
        const product = products.find((item) => item.id === price.productId);
        const latestPrice = getLatestPriceFromHistory(price.priceHistory) || 0;
        const lastUpdated =
          price.priceHistory.length > 0
            ? new Date(price.priceHistory[price.priceHistory.length - 1].date)
            : null;

        return { product, latestPrice, lastUpdated };
      })
      .filter((row): row is { product: Product; latestPrice: number; lastUpdated: Date | null } =>
        Boolean(row.product),
      )
      .sort((first, second) => first.product.name.localeCompare(second.product.name));

    return rows;
  }, [selectedSupplier, prices, products]);

  const supplierCommissions = useMemo(() => {
    if (!selectedSupplier) return [];

    return commissions
      .filter((commission) => commission.supplierId === selectedSupplier.id)
      .sort(
        (first, second) => new Date(second.saleDate).getTime() - new Date(first.saleDate).getTime(),
      );
  }, [commissions, selectedSupplier]);

  const supplierQuotations = useMemo<SupplierQuotationsSummary>(() => {
    if (!selectedSupplier) return { pending: [], finalized: [], totalValue: 0 };

    const relevantQuotes = quotations
      .filter((quotation) =>
        quotation.items.some((item) =>
          prices.some(
            (price) =>
              price.productId === item.productId && price.supplierId === selectedSupplier.id,
          ),
        ),
      )
      .sort((first, second) => new Date(second.date).getTime() - new Date(first.date).getTime());

    const totalValue = relevantQuotes
      .filter((quotation) => quotation.status === 'Aceita')
      .reduce((sum, quotation) => {
        const quoteValue = quotation.items.reduce((innerSum, item) => {
          if (quotation.selections?.[item.productId] === selectedSupplier.id) {
            const priceInfo = prices.find(
              (price) =>
                price.productId === item.productId && price.supplierId === selectedSupplier.id,
            );
            const price = priceInfo ? getLatestPriceFromHistory(priceInfo.priceHistory) || 0 : 0;
            return innerSum + price * item.quantity;
          }
          return innerSum;
        }, 0);

        return sum + quoteValue;
      }, 0);

    return {
      pending: relevantQuotes.filter((quotation) => quotation.status === 'Em Aberto'),
      finalized: relevantQuotes.filter((quotation) => quotation.status === 'Aceita'),
      totalValue,
    };
  }, [quotations, prices, selectedSupplier]);

  const pendingCommissionValue = supplierCommissions
    .filter((commission) => commission.status === 'Pendente')
    .reduce((sum, commission) => sum + commission.commissionValue, 0);

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-140px)] gap-6 overflow-hidden">
      <SuppliersSidebar
        filter={filter}
        onFilterChange={setFilter}
        filteredSuppliers={filteredSuppliers}
        selectedSupplierId={selectedSupplierId}
        onSelectSupplier={setSelectedSupplierId}
      />

      <div className="flex-1 min-w-0 bg-surface rounded-2xl shadow-soft border border-border-color/60 flex flex-col overflow-hidden">
        <SupplierDetailsPanel
          selectedSupplier={selectedSupplier}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          supplierProducts={supplierProducts}
          supplierCommissions={supplierCommissions}
          pendingCommissionValue={pendingCommissionValue}
          totalNegotiatedValue={supplierQuotations.totalValue}
          onEditSupplier={onEditSupplier}
          onOpenLinkModal={() => setLinkModalOpen(true)}
        />
      </div>

      {selectedSupplier && (
        <LinkProductModal
          isOpen={isLinkModalOpen}
          onClose={() => setLinkModalOpen(false)}
          onSave={(productId, price) => {
            onLinkProduct(productId, price);
            setLinkModalOpen(false);
          }}
          products={products}
          supplierName={selectedSupplier.name}
        />
      )}
    </div>
  );
}

export default SuppliersView;
