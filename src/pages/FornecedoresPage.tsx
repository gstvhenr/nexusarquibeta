import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { PageHeader } from '../components/layout';
import { Modal } from '../components/ui';
import { useData } from '../context/DataContext';
import type {
  Supplier,
  Product,
  PriceEntry,
  Quotation,
  Project,
  Commission,
  SupplierProductPrice,
  SupplierContact,
  ProductUnit,
} from '../types';
import { NAV_LINKS, SUPPLIER_CATEGORY_OPTIONS } from '../constants';
import {
  PlusIcon,
  TrashIcon,
  ArchiveIcon,
  UnarchiveIcon,
  EditIcon,
  BuildingIcon,
  CubeIcon,
  TagIcon,
  CashIcon,
  GiftIcon,
  ChartBarIcon,
  LinkIcon,
  PhoneIcon,
  MailIcon,
  MapPinIcon,
  GlobeIcon,
  UserCircleIcon,
  ClockIcon,
} from '../components/ui';
import { formatCurrency, formatDate } from '../utils/formatters';

// --- HELPER FUNCTIONS ---
const getLatestPriceFromHistory = (priceHistory: PriceEntry[]): number | null => {
  if (!priceHistory || priceHistory.length === 0) return null;
  return [...priceHistory].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  )[0].price;
};

const getInitials = (name: string) => {
  if (!name) return '?';
  const names = name.trim().split(' ');
  if (names.length === 1) return names[0].substring(0, 2).toUpperCase();
  return (names[0][0] + (names[names.length - 1][0] || '')).toUpperCase();
};

const getInitialSupplier = (): Supplier => ({
  id: '',
  name: '',
  logo: '',
  categories: [],
  cnpj: '',
  address: '',
  site: '',
  mainContact: { name: '', role: '', email: '', phone: '', hasWhatsApp: false },
  paymentTerms: '',
  shippingPolicy: '',
  commissionPercentage: 0,
  notes: '',
  archived: false,
});

// --- MODALS ---

const LinkProductModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: (productId: string, price: number) => void;
  products: Product[];
  supplierName: string;
}> = ({ isOpen, onClose, onSave, products, supplierName }) => {
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
          <label className="block text-xs font-bold text-text-secondary uppercase mb-2">
            Produto do Catálogo
          </label>
          <select
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
          <label className="block text-xs font-bold text-text-secondary uppercase mb-2">
            Preço Atual (R$)
          </label>
          <input
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

const SupplierFormModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: (supplier: Supplier) => void;
  onArchive: (supplier: Supplier) => void;
  onDelete: (id: string) => void;
  initialSupplier: Supplier | null;
}> = ({ isOpen, onClose, onSave, onArchive, onDelete, initialSupplier }) => {
  const [supplier, setSupplier] = useState<Supplier>(initialSupplier || getInitialSupplier());
  const [logoPreview, setLogoPreview] = useState<string | null>(initialSupplier?.logo || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const data = initialSupplier || getInitialSupplier();
    setSupplier(data);
    setLogoPreview(data.logo || null);
  }, [initialSupplier, isOpen]);

  const handleChange = (field: keyof Supplier, value: any) =>
    setSupplier((s) => ({ ...s, [field]: value }));
  const handleContactChange = (field: keyof SupplierContact, value: any) =>
    setSupplier((s) => ({ ...s, mainContact: { ...s.mainContact, [field]: value } }));
  const handleCategoryChange = (category: string, checked: boolean) => {
    const newCategories = checked
      ? [...supplier.categories, category]
      : supplier.categories.filter((c) => c !== category);
    handleChange('categories', newCategories);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setLogoPreview(result);
        handleChange('logo', result);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleSave = () => {
    if (!supplier.name.trim()) {
      alert('O nome do fornecedor é obrigatório.');
      return;
    }
    onSave({ ...supplier, id: supplier.id || `sup_${Date.now()}` });
  };

  const handleDelete = () => {
    if (
      initialSupplier &&
      window.confirm(
        `Tem certeza que deseja excluir "${initialSupplier.name}"? Esta ação não pode ser desfeita.`,
      )
    ) {
      onDelete(initialSupplier.id);
    }
  };

  if (!isOpen) return null;
  const inputClass =
    'w-full bg-background p-2.5 rounded-md border border-border-color focus:border-primary outline-none transition text-sm';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialSupplier ? 'Editar Fornecedor' : 'Adicionar Fornecedor'}
      size="2xl"
    >
      <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2 -mr-2 custom-scrollbar">
        {/* Logo & Name Section */}
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <div className="flex flex-col items-center gap-3">
            <div
              className="w-28 h-28 bg-surface rounded-2xl flex items-center justify-center overflow-hidden border-2 border-dashed border-border-color text-text-secondary cursor-pointer hover:border-primary hover:bg-primary/5 transition-all relative group"
              onClick={() => fileInputRef.current?.click()}
            >
              {logoPreview ? (
                <>
                  <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <EditIcon className="w-6 h-6 text-white" />
                  </div>
                </>
              ) : (
                <div className="text-center p-2">
                  <BuildingIcon className="w-8 h-8 mx-auto mb-1 opacity-50" />
                  <span className="text-[10px] font-semibold">Upload Logo</span>
                </div>
              )}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handlePhotoChange}
              accept="image/*"
              className="hidden"
              aria-label="Selecionar logo do fornecedor"
            />
          </div>

          <div className="flex-1 w-full space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-text-secondary uppercase mb-1">
                  Nome da Empresa <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  value={supplier.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className={inputClass}
                  placeholder="Ex: Marmoraria Pedra Fina"
                  aria-label="Nome do fornecedor"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-text-secondary uppercase mb-1">
                  CNPJ
                </label>
                <input
                  type="text"
                  value={supplier.cnpj || ''}
                  onChange={(e) => handleChange('cnpj', e.target.value)}
                  className={inputClass}
                  placeholder="00.000.000/0001-00"
                  aria-label="CNPJ"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-text-secondary uppercase mb-1">
                  Site
                </label>
                <input
                  type="url"
                  value={supplier.site || ''}
                  onChange={(e) => handleChange('site', e.target.value)}
                  className={inputClass}
                  placeholder="https://"
                  aria-label="Site"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs / Sections */}
        <div className="space-y-6">
          <div className="bg-background/30 p-5 rounded-xl border border-border-color/50">
            <h4 className="font-serif font-bold text-secondary mb-4 flex items-center gap-2">
              <UserCircleIcon className="w-5 h-5" /> Contato Principal
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-text-secondary uppercase mb-1">
                  Nome do Contato
                </label>
                <input
                  type="text"
                  value={supplier.mainContact.name}
                  onChange={(e) => handleContactChange('name', e.target.value)}
                  className={inputClass}
                  aria-label="Nome do contato"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-text-secondary uppercase mb-1">
                  Cargo
                </label>
                <input
                  type="text"
                  value={supplier.mainContact.role || ''}
                  onChange={(e) => handleContactChange('role', e.target.value)}
                  className={inputClass}
                  aria-label="Cargo"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-text-secondary uppercase mb-1">
                  Telefone / WhatsApp
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="tel"
                    value={supplier.mainContact.phone}
                    onChange={(e) => handleContactChange('phone', e.target.value)}
                    className={inputClass}
                    aria-label="Telefone do contato"
                  />
                  <label className="flex items-center gap-1.5 text-xs font-medium cursor-pointer select-none bg-background border border-border-color px-2 py-2.5 rounded-md hover:border-primary transition-colors">
                    <input
                      type="checkbox"
                      checked={supplier.mainContact.hasWhatsApp}
                      onChange={(e) => handleContactChange('hasWhatsApp', e.target.checked)}
                      className="rounded accent-primary"
                    />
                    Whats
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-text-secondary uppercase mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={supplier.mainContact.email || ''}
                  onChange={(e) => handleContactChange('email', e.target.value)}
                  className={inputClass}
                  aria-label="Email"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-xs font-bold text-text-secondary uppercase mb-1">
                Endereço Completo
              </label>
              <input
                type="text"
                value={supplier.address || ''}
                onChange={(e) => handleChange('address', e.target.value)}
                className={inputClass}
                placeholder="Rua, Número, Bairro, Cidade - UF"
                aria-label="Endereço completo"
              />
            </div>
          </div>

          <div className="bg-background/30 p-5 rounded-xl border border-border-color/50">
            <h4 className="font-serif font-bold text-secondary mb-4 flex items-center gap-2">
              <GiftIcon className="w-5 h-5" /> Detalhes Comerciais
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-text-secondary uppercase mb-1">
                  Comissão (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={supplier.commissionPercentage || ''}
                    onChange={(e) =>
                      handleChange('commissionPercentage', parseFloat(e.target.value) || 0)
                    }
                    className={`${inputClass} pl-3 pr-8`}
                    placeholder="0"
                    aria-label="Comissão (%)"
                  />
                  <span className="absolute right-3 top-2.5 text-text-secondary font-bold">%</span>
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-text-secondary uppercase mb-1">
                  Categorias
                </label>
                <div className="h-24 overflow-y-auto bg-background border border-border-color rounded-md p-2 grid grid-cols-2 gap-2 custom-scrollbar">
                  {SUPPLIER_CATEGORY_OPTIONS.map((cat) => (
                    <label
                      key={cat}
                      className="flex items-center gap-2 text-xs cursor-pointer hover:bg-surface p-1 rounded"
                    >
                      <input
                        type="checkbox"
                        checked={supplier.categories.includes(cat)}
                        onChange={(e) => handleCategoryChange(cat, e.target.checked)}
                        className="rounded accent-primary"
                      />
                      {cat}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase mb-1">
              Notas Internas
            </label>
            <textarea
              value={supplier.notes || ''}
              onChange={(e) => handleChange('notes', e.target.value)}
              rows={3}
              className={inputClass}
              placeholder="Informações sobre atendimento, prazos, qualidade..."
              aria-label="Notas internas"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mt-6 pt-4 border-t border-border-color">
        <div>
          {initialSupplier && (
            <div className="flex gap-2">
              <button
                onClick={() => onArchive(supplier)}
                className="px-4 py-2 rounded-lg font-semibold text-sm text-secondary hover:bg-secondary/10 transition-colors flex items-center gap-2"
              >
                {supplier.archived ? (
                  <UnarchiveIcon className="w-4 h-4" />
                ) : (
                  <ArchiveIcon className="w-4 h-4" />
                )}{' '}
                {supplier.archived ? 'Reativar' : 'Arquivar'}
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 rounded-lg font-semibold text-sm text-error hover:bg-error/10 transition-colors flex items-center gap-2"
              >
                <TrashIcon className="w-4 h-4" /> Excluir
              </button>
            </div>
          )}
        </div>
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg font-semibold text-text-primary bg-border-color/50 hover:bg-border-color transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 rounded-lg font-semibold text-primary-content bg-primary hover:bg-primary-focus transition-colors shadow-soft"
          >
            Salvar Fornecedor
          </button>
        </div>
      </div>
    </Modal>
  );
};

// --- VIEW COMPONENTS ---

const KPICard: React.FC<{
  label: string;
  value: string | number;
  subtext?: string;
  icon: React.ReactNode;
  color: string;
}> = ({ label, value, subtext, icon, color }) => (
  <div className="bg-surface rounded-xl shadow-sm border border-border-color p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
    <div className={`p-3 rounded-full ${color} bg-opacity-10 text-opacity-100`}>{icon}</div>
    <div>
      <p className="text-xs font-bold text-text-secondary uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-bold font-sans text-text-primary">{value}</p>
      {subtext && <p className="text-xs text-text-secondary mt-0.5">{subtext}</p>}
    </div>
  </div>
);

const SuppliersView: React.FC<{
  suppliers: Supplier[];
  commissions: Commission[];
  quotations: Quotation[];
  projects: Project[];
  products: Product[];
  prices: SupplierProductPrice[];
  onEditSupplier: (supplier: Supplier | null) => void;
  onLinkProduct: (productId: string, price: number) => void;
}> = ({
  suppliers,
  commissions,
  quotations,
  projects,
  products,
  prices,
  onEditSupplier,
  onLinkProduct,
}) => {
  const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(null);
  const [filter, setFilter] = useState('');
  const [activeTab, setActiveTab] = useState<'details' | 'products' | 'commissions' | 'quotations'>(
    'details',
  );
  const [isLinkModalOpen, setLinkModalOpen] = useState(false);

  const activeSuppliers = useMemo(
    () => suppliers.filter((s) => !s.archived).sort((a, b) => a.name.localeCompare(b.name)),
    [suppliers],
  );

  const filteredSuppliers = useMemo(() => {
    if (!filter) return activeSuppliers;
    return activeSuppliers.filter(
      (s) =>
        s.name.toLowerCase().includes(filter.toLowerCase()) ||
        s.categories.some((c) => c.toLowerCase().includes(filter.toLowerCase())),
    );
  }, [activeSuppliers, filter]);

  // Auto-select first supplier if none selected
  useEffect(() => {
    if (!selectedSupplierId && activeSuppliers.length > 0) {
      setSelectedSupplierId(activeSuppliers[0].id);
    }
    // If selected supplier is filtered out or archived, fallback
    if (
      selectedSupplierId &&
      !activeSuppliers.some((s) => s.id === selectedSupplierId) &&
      activeSuppliers.length > 0
    ) {
      setSelectedSupplierId(activeSuppliers[0].id);
    }
  }, [activeSuppliers, selectedSupplierId]);

  const selectedSupplier = useMemo(
    () => suppliers.find((s) => s.id === selectedSupplierId),
    [suppliers, selectedSupplierId],
  );

  // Reset tab when supplier changes
  useEffect(() => {
    setActiveTab('products');
  }, [selectedSupplierId]);

  // --- KPI DATA CALCULATIONS ---
  const supplierProducts = useMemo(() => {
    if (!selectedSupplier) return [];
    return prices
      .filter((price) => price.supplierId === selectedSupplier.id)
      .map((price) => {
        const product = products.find((p) => p.id === price.productId);
        const latestPrice = getLatestPriceFromHistory(price.priceHistory) || 0;
        const lastUpdated =
          price.priceHistory.length > 0
            ? new Date(price.priceHistory[price.priceHistory.length - 1].date)
            : null;
        return { product, latestPrice, lastUpdated };
      })
      .filter((item) => !!item.product)
      .sort((a, b) => (a.product?.name || '').localeCompare(b.product?.name || ''));
  }, [selectedSupplier, prices, products]);

  const supplierCommissions = useMemo(() => {
    if (!selectedSupplier) return [];
    return commissions
      .filter((c) => c.supplierId === selectedSupplier.id)
      .sort((a, b) => new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime());
  }, [commissions, selectedSupplier]);

  const supplierQuotations = useMemo(() => {
    if (!selectedSupplier) return { pending: [], finalized: [], totalValue: 0 };

    const relevantQuotes = quotations
      .filter((q) =>
        q.items.some((item) =>
          prices.some(
            (p) => p.productId === item.productId && p.supplierId === selectedSupplier.id,
          ),
        ),
      )
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Calculate total value (very rough estimation based on finalized)
    const totalValue = relevantQuotes
      .filter((q) => q.status === 'Finalizada')
      .reduce((sum, q) => {
        // Sum items belonging to this supplier
        const quoteValue = q.items.reduce((iSum, item) => {
          if (q.selections?.[item.productId] === selectedSupplier.id) {
            const priceInfo = prices.find(
              (p) => p.productId === item.productId && p.supplierId === selectedSupplier.id,
            );
            const price = priceInfo ? getLatestPriceFromHistory(priceInfo.priceHistory) || 0 : 0;
            return iSum + price * item.quantity;
          }
          return iSum;
        }, 0);
        return sum + quoteValue;
      }, 0);

    return {
      pending: relevantQuotes.filter((q) => q.status === 'Em Aberto'),
      finalized: relevantQuotes.filter((q) => q.status === 'Finalizada'),
      totalValue,
    };
  }, [quotations, prices, selectedSupplier]);

  const pendingCommissionValue = supplierCommissions
    .filter((c) => c.status === 'Pendente')
    .reduce((sum, c) => sum + c.commissionValue, 0);

  const tabButtonClass = (tabName: typeof activeTab) =>
    `px-6 py-3 font-semibold text-sm transition-all border-b-2 whitespace-nowrap ${activeTab === tabName ? 'border-primary text-primary' : 'border-transparent text-text-secondary hover:text-text-primary hover:border-border-color'}`;

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-140px)] gap-6 overflow-hidden">
      {/* Left Panel: List */}
      <div className="w-full lg:w-80 bg-surface rounded-2xl shadow-soft flex flex-col overflow-hidden border border-border-color/60 shrink-0">
        <div className="p-4 border-b border-border-color shrink-0 bg-background/30">
          <div className="relative">
            <input
              type="search"
              placeholder="Buscar fornecedor..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full bg-background pl-9 pr-4 py-2.5 rounded-xl border border-border-color focus:border-accent text-sm transition-all focus:ring-2 focus:ring-accent/10"
              aria-label="Buscar fornecedor"
            />
            <svg
              className="w-4 h-4 text-text-secondary absolute left-3 top-1/2 -translate-y-1/2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              ></path>
            </svg>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
          {filteredSuppliers.map((s) => (
            <div
              key={s.id}
              onClick={() => setSelectedSupplierId(s.id)}
              className={`p-3 rounded-xl flex items-center gap-3 cursor-pointer transition-all duration-200 border-l-4 ${selectedSupplierId === s.id ? 'bg-primary/5 border-primary shadow-sm' : 'border-transparent hover:bg-background/80 hover:border-border-color'}`}
            >
              <div
                className={`w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden border ${selectedSupplierId === s.id ? 'border-primary/30' : 'border-border-color'} bg-surface`}
              >
                {s.logo ? (
                  <img src={s.logo} alt={s.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="font-bold text-secondary text-sm">{getInitials(s.name)}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className={`font-bold text-sm truncate ${selectedSupplierId === s.id ? 'text-primary' : 'text-text-primary'}`}
                >
                  {s.name}
                </p>
                <div className="flex items-center gap-1 mt-0.5">
                  <p className="text-xs text-text-secondary truncate">
                    {s.categories[0] || 'Geral'}
                  </p>
                  {s.categories.length > 1 && (
                    <span className="text-[10px] text-text-secondary bg-background px-1 rounded-sm">
                      +{s.categories.length - 1}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
          {filteredSuppliers.length === 0 && (
            <p className="text-center text-sm text-text-secondary py-10">
              Nenhum fornecedor encontrado.
            </p>
          )}
        </div>
      </div>

      {/* Right Panel: Details */}
      <div className="flex-1 min-w-0 bg-surface rounded-2xl shadow-soft border border-border-color/60 flex flex-col overflow-hidden">
        {selectedSupplier ? (
          <>
            {/* Profile Header */}
            <header className="p-6 pb-0 shrink-0">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div className="flex items-center gap-5">
                  <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center overflow-hidden border-2 border-border-color shadow-sm p-1">
                    {selectedSupplier.logo ? (
                      <img
                        src={selectedSupplier.logo}
                        alt={selectedSupplier.name}
                        className="w-full h-full object-cover rounded-xl"
                      />
                    ) : (
                      <BuildingIcon className="w-8 h-8 text-secondary/30" />
                    )}
                  </div>
                  <div>
                    <h2 className="font-serif text-3xl font-bold text-secondary">
                      {selectedSupplier.name}
                    </h2>
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-text-secondary">
                      <span className="flex items-center gap-1 bg-primary/5 text-primary px-2 py-0.5 rounded-md font-medium">
                        <TagIcon className="w-3.5 h-3.5" />{' '}
                        {selectedSupplier.categories[0] || 'Fornecedor'}
                      </span>
                      {selectedSupplier.commissionPercentage ? (
                        <span className="flex items-center gap-1 bg-success/10 text-success px-2 py-0.5 rounded-md font-bold">
                          <GiftIcon className="w-3.5 h-3.5" />{' '}
                          {selectedSupplier.commissionPercentage}% Comissão
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => onEditSupplier(selectedSupplier)}
                  className="px-4 py-2 rounded-lg font-semibold text-sm text-primary bg-primary/10 hover:bg-primary/20 transition-colors flex items-center gap-2"
                >
                  <EditIcon className="w-4 h-4" /> Editar Perfil
                </button>
              </div>

              {/* Snapshot KPIs */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <KPICard
                  label="Produtos no Catálogo"
                  value={supplierProducts.length}
                  icon={<CubeIcon className="w-5 h-5" />}
                  color="text-info bg-info"
                />
                <KPICard
                  label="Comissões Pendentes"
                  value={formatCurrency(pendingCommissionValue)}
                  icon={<ClockIcon className="w-5 h-5" />}
                  color="text-warning bg-warning"
                />
                <KPICard
                  label="Total Negociado"
                  value={formatCurrency(supplierQuotations.totalValue)}
                  subtext="Vendas confirmadas"
                  icon={<ChartBarIcon className="w-5 h-5" />}
                  color="text-success bg-success"
                />
              </div>

              {/* Navigation */}
              <nav className="flex border-b border-border-color overflow-x-auto no-scrollbar">
                <button
                  onClick={() => setActiveTab('details')}
                  className={tabButtonClass('details')}
                >
                  Detalhes de Contato
                </button>
                <button
                  onClick={() => setActiveTab('products')}
                  className={tabButtonClass('products')}
                >
                  Catálogo & Preços
                </button>
                <button
                  onClick={() => setActiveTab('commissions')}
                  className={tabButtonClass('commissions')}
                >
                  Histórico Financeiro
                </button>
              </nav>
            </header>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6 bg-background/30">
              {activeTab === 'details' && (
                <div className="space-y-6 max-w-4xl animate-fade-in-up">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-surface p-5 rounded-xl shadow-sm border border-border-color">
                      <h4 className="font-bold text-secondary mb-4 flex items-center gap-2 border-b border-border-color pb-2">
                        <UserCircleIcon className="w-5 h-5" /> Contato Principal
                      </h4>
                      <div className="space-y-4">
                        <div>
                          <p className="text-xs font-bold text-text-secondary uppercase">Nome</p>
                          <p className="text-text-primary font-medium text-lg">
                            {selectedSupplier.mainContact.name}{' '}
                            <span className="text-sm font-normal text-text-secondary">
                              ({selectedSupplier.mainContact.role || 'Responsável'})
                            </span>
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="bg-primary/10 p-2 rounded-lg text-primary">
                            <PhoneIcon className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-text-secondary uppercase">
                              Telefone
                            </p>
                            <p className="text-text-primary font-mono">
                              {selectedSupplier.mainContact.phone}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="bg-primary/10 p-2 rounded-lg text-primary">
                            <MailIcon className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-text-secondary uppercase">Email</p>
                            <a
                              href={`mailto:${selectedSupplier.mainContact.email}`}
                              className="text-primary hover:underline"
                            >
                              {selectedSupplier.mainContact.email || 'N/A'}
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-surface p-5 rounded-xl shadow-sm border border-border-color">
                      <h4 className="font-bold text-secondary mb-4 flex items-center gap-2 border-b border-border-color pb-2">
                        <BuildingIcon className="w-5 h-5" /> Empresa
                      </h4>
                      <div className="space-y-4">
                        <div>
                          <p className="text-xs font-bold text-text-secondary uppercase">CNPJ</p>
                          <p className="text-text-primary font-mono">
                            {selectedSupplier.cnpj || 'Não informado'}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="bg-secondary/10 p-2 rounded-lg text-secondary">
                            <MapPinIcon className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-text-secondary uppercase">
                              Endereço
                            </p>
                            <p className="text-text-primary text-sm">
                              {selectedSupplier.address || 'Não informado'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="bg-secondary/10 p-2 rounded-lg text-secondary">
                            <GlobeIcon className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-text-secondary uppercase">Site</p>
                            <a
                              href={selectedSupplier.site}
                              target="_blank"
                              rel="noreferrer"
                              className="text-primary hover:underline text-sm truncate block max-w-[200px]"
                            >
                              {selectedSupplier.site || 'N/A'}
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {selectedSupplier.notes && (
                    <div className="bg-yellow-50 dark:bg-yellow-900/10 p-5 rounded-xl border border-yellow-200 dark:border-yellow-800/30">
                      <h4 className="font-bold text-yellow-800 dark:text-yellow-500 mb-2">
                        Anotações Internas
                      </h4>
                      <p className="text-text-primary whitespace-pre-wrap text-sm leading-relaxed">
                        {selectedSupplier.notes}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'products' && (
                <div className="space-y-4 animate-fade-in-up">
                  <div className="flex justify-between items-center bg-surface p-4 rounded-xl border border-border-color shadow-sm">
                    <div>
                      <h4 className="font-bold text-text-primary">Catálogo de Produtos</h4>
                      <p className="text-xs text-text-secondary">
                        Produtos vinculados a este fornecedor e seus preços atuais.
                      </p>
                    </div>
                    <button
                      onClick={() => setLinkModalOpen(true)}
                      className="px-4 py-2 rounded-lg text-sm font-semibold bg-primary text-primary-content hover:bg-primary-focus shadow-soft flex items-center gap-2 transition-transform hover:-translate-y-0.5"
                    >
                      <PlusIcon className="w-4 h-4" /> Vincular Produto
                    </button>
                  </div>

                  <div className="bg-surface rounded-xl border border-border-color overflow-hidden shadow-sm">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-background text-xs font-bold text-text-secondary uppercase">
                        <tr>
                          <th className="px-6 py-3">Produto</th>
                          <th className="px-6 py-3">Categoria</th>
                          <th className="px-6 py-3 text-right">Preço Unit.</th>
                          <th className="px-6 py-3 text-right">
                            Comissão Est. ({selectedSupplier.commissionPercentage}%)
                          </th>
                          <th className="px-6 py-3 text-right">Última Atualização</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border-color">
                        {supplierProducts.map(
                          ({ product, latestPrice, lastUpdated }) =>
                            product && (
                              <tr
                                key={product.id}
                                className="hover:bg-background/50 transition-colors group"
                              >
                                <td className="px-6 py-4 font-semibold text-text-primary flex items-center gap-3">
                                  <div className="w-8 h-8 rounded bg-background flex items-center justify-center text-text-secondary border border-border-color">
                                    <CubeIcon className="w-4 h-4" />
                                  </div>
                                  {product.name}
                                </td>
                                <td className="px-6 py-4">
                                  <span className="px-2 py-1 bg-background rounded-md text-xs font-medium border border-border-color text-text-secondary">
                                    {product.category}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                  <span className="font-bold text-text-primary">
                                    {formatCurrency(latestPrice)}
                                  </span>
                                  <span className="text-xs text-text-secondary ml-1">
                                    / {product.unit}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                  <span className="font-bold text-success">
                                    {formatCurrency(
                                      latestPrice *
                                        ((selectedSupplier.commissionPercentage || 0) / 100),
                                    )}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-right text-xs text-text-secondary">
                                  {lastUpdated ? formatDate(lastUpdated.toISOString()) : '-'}
                                </td>
                              </tr>
                            ),
                        )}
                        {supplierProducts.length === 0 && (
                          <tr>
                            <td colSpan={5} className="px-6 py-12 text-center text-text-secondary">
                              Nenhum produto vinculado. Adicione um produto para começar a monitorar
                              preços.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'commissions' && (
                <div className="space-y-6 animate-fade-in-up">
                  <div className="grid grid-cols-1 gap-6">
                    <div className="bg-surface rounded-xl border border-border-color overflow-hidden shadow-sm">
                      <div className="p-4 border-b border-border-color bg-background/50">
                        <h4 className="font-bold text-text-primary">Histórico de Comissões</h4>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                          <thead className="bg-background text-xs font-bold text-text-secondary uppercase">
                            <tr>
                              <th className="px-6 py-3">Cliente / Projeto</th>
                              <th className="px-6 py-3">Data Venda</th>
                              <th className="px-6 py-3 text-right">Valor Venda</th>
                              <th className="px-6 py-3 text-right">Comissão</th>
                              <th className="px-6 py-3 text-center">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border-color">
                            {supplierCommissions.map((c) => (
                              <tr key={c.id} className="hover:bg-background/50 transition-colors">
                                <td className="px-6 py-4 font-medium text-text-primary">
                                  {c.clientName}
                                </td>
                                <td className="px-6 py-4 text-text-secondary">
                                  {formatDate(c.saleDate)}
                                </td>
                                <td className="px-6 py-4 text-right text-text-secondary">
                                  {formatCurrency(c.saleValue)}
                                </td>
                                <td className="px-6 py-4 text-right font-bold text-success">
                                  {formatCurrency(c.commissionValue)}
                                </td>
                                <td className="px-6 py-4 text-center">
                                  <span
                                    className={`px-2 py-1 text-xs font-bold rounded-full ${c.status === 'Recebido' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}
                                  >
                                    {c.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                            {supplierCommissions.length === 0 && (
                              <tr>
                                <td
                                  colSpan={5}
                                  className="px-6 py-12 text-center text-text-secondary"
                                >
                                  Nenhuma comissão registrada.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center text-text-secondary p-8">
            <div className="bg-surface p-6 rounded-full shadow-soft mb-6">
              <BuildingIcon className="w-16 h-16 text-border-color" />
            </div>
            <h3 className="text-2xl font-serif font-bold text-text-primary mb-2">
              Selecione um Fornecedor
            </h3>
            <p className="max-w-md">
              Navegue pela lista à esquerda para ver detalhes, gerenciar produtos ou acompanhar
              comissões.
            </p>
            <button
              onClick={() => onEditSupplier(null)}
              className="mt-6 text-primary font-semibold hover:underline"
            >
              Ou cadastre um novo fornecedor
            </button>
          </div>
        )}
      </div>

      {/* Modal for Linking Products */}
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
};

// --- MAIN PAGE ---
const FornecedoresPage: React.FC = () => {
  // Data hooks
  const {
    suppliers,
    setSuppliers,
    commissions,
    quotations,
    projects,
    products,
    supplierProductPrices: prices,
    setSupplierProductPrices,
  } = useData();

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
    <div className="animate-fade-in-up h-full flex flex-col p-6 overflow-hidden">
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
