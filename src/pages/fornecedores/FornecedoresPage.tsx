import React, { useState, useCallback } from 'react';
import { PageHeader } from '../../components/layout';
import { useCoreData, useFinanceData, useSupplyChainData } from '../../context/DataContext';
import type { Supplier, PriceEntry, SupplierProductPrice } from '../../types';
import { NAV_LINKS } from '../../constants';
import { PlusIcon } from '../../components/ui';
import { SuppliersView, SupplierFormModal } from '../../components/supply-chain';

const FornecedoresPage: () => React.ReactNode = () => {
  // Data hooks
  const { projects } = useCoreData();
  const { commissions } = useFinanceData();
  const {
    suppliers,
    setSuppliers,
    quotations,
    products,
    supplierProductPrices: prices,
    setSupplierProductPrices,
  } = useSupplyChainData();

  // Modals state
  const [isSupplierModalOpen, setSupplierModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

  const handleSaveSupplier = useCallback(
    (supplier: Supplier) => {
      setSuppliers((prev) => {
        const exists = prev.some((s) => s.id === supplier.id);
        if (exists) {
          return prev.map((s) => (s.id === supplier.id ? supplier : s));
        }
        return [...prev, supplier];
      });
      setSupplierModalOpen(false);
    },
    [setSuppliers],
  );

  const handleArchiveSupplier = useCallback(
    (supplier: Supplier) => {
      if (
        window.confirm(
          `Tem certeza que deseja ${supplier.archived ? 'desarquivar' : 'arquivar'} "${supplier.name}"?`,
        )
      ) {
        setSuppliers((prev) =>
          prev.map((s) => (s.id === supplier.id ? { ...s, archived: !s.archived } : s)),
        );
        setSupplierModalOpen(false);
      }
    },
    [setSuppliers],
  );

  const handleDeleteSupplier = useCallback(
    (id: string) => {
      setSuppliers((prev) => prev.filter((s) => s.id !== id));
      setSupplierModalOpen(false);
    },
    [setSuppliers],
  );

  const handleLinkProduct = useCallback(
    (productId: string, price: number) => {
      if (!selectedSupplier) return;
      const today = new Date().toISOString().split('T')[0];

      setSupplierProductPrices((prev) => {
        const existingEntryIndex = prev.findIndex(
          (p) => p.productId === productId && p.supplierId === selectedSupplier.id,
        );
        const newPriceEntry: PriceEntry = { date: today, price };

        if (existingEntryIndex > -1) {
          // Update existing
          const updatedPrices = [...prev];
          const updatedHistory = [...updatedPrices[existingEntryIndex].priceHistory, newPriceEntry];
          updatedPrices[existingEntryIndex] = {
            ...updatedPrices[existingEntryIndex],
            priceHistory: updatedHistory,
          };
          return updatedPrices;
        } else {
          // Create new
          const newEntry: SupplierProductPrice = {
            id: `price_${Date.now()}`,
            productId,
            supplierId: selectedSupplier.id,
            priceHistory: [newPriceEntry],
          };
          return [...prev, newEntry];
        }
      });
    },
    [selectedSupplier, setSupplierProductPrices],
  );

  const openSupplierModal = useCallback((s: Supplier | null) => {
    setSelectedSupplier(s);
    setSupplierModalOpen(true);
  }, []);

  const suprimentosLink = NAV_LINKS.find((link) => link.label === 'Suprimentos');
  const fornecedoresIcon = suprimentosLink?.children?.find(
    (child) => child.path === '/fornecedores',
  )?.icon;

  return (
    <div className="animate-fade-in-up h-full flex flex-col overflow-hidden">
      <PageHeader title="Fornecedores" icon={fornecedoresIcon}>
        <button
          onClick={() => openSupplierModal(null)}
          className="px-5 py-2 rounded-lg font-semibold text-primary-content bg-primary hover:bg-primary-focus shadow-soft flex items-center justify-center transition-colors text-sm gap-2"
        >
          <PlusIcon className="w-5 h-5" /> Adicionar Fornecedor
        </button>
      </PageHeader>

      <div className="flex-1 min-h-0">
        <SuppliersView
          suppliers={suppliers}
          commissions={commissions}
          quotations={quotations}
          projects={projects}
          products={products}
          prices={prices}
          onEditSupplier={openSupplierModal}
          onLinkProduct={handleLinkProduct}
        />
      </div>

      <SupplierFormModal
        isOpen={isSupplierModalOpen}
        onClose={() => setSupplierModalOpen(false)}
        initialSupplier={selectedSupplier}
        onSave={handleSaveSupplier}
        onArchive={handleArchiveSupplier}
        onDelete={handleDeleteSupplier}
      />
    </div>
  );
};

export default FornecedoresPage;
