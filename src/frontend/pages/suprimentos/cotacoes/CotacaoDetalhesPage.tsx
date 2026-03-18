import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/layout';
import { Button, FormField, IconButton, Input, Modal, Select } from '@/components/ui';
import { useCoreData, useSupplyChainData, useFinanceData } from '@/context/DataContext';
import type { Quotation, Product, QuotationItem, Commission } from '@/types';
import { formatCurrency, getTodayDateOnly } from '@/utils/formatters';
import { getLatestPriceFromHistory } from '@/utils/supplierHelpers';
import { NAV_LINKS, SUPPLIER_CATEGORY_OPTIONS } from '@/constants';
import { PlusIcon, TrashIcon, CheckCircleIcon, XCircleIcon, PencilIcon } from '@/components/ui';

const getInitialQuotation = (id: string): Quotation => ({
  id,
  name: 'Nova Cotação',
  date: getTodayDateOnly(),
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
        <Input
          type="search"
          placeholder="Buscar produto"
          value={filter.search}
          onChange={(e) => setFilter((f) => ({ ...f, search: e.target.value }))}
        />
        <Select
          value={filter.category}
          onChange={(e) => setFilter((f) => ({ ...f, category: e.target.value }))}
          options={[
            { value: 'Todos', label: 'Todas Categorias' },
            ...SUPPLIER_CATEGORY_OPTIONS.map((c) => ({ value: c, label: c })),
          ]}
          aria-label="Filtrar por categoria"
        />
      </div>
      <div className="max-h-96 overflow-y-auto space-y-2 pr-2 -mr-2">
        {filteredProducts.map((p) => (
          <label
            key={p.id}
            className="flex items-center gap-3 p-3 bg-background rounded-lg cursor-pointer hover:bg-border-color/50"
          >
            <input
              id={`product-select-${p.id}`}
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
        <Button variant="secondary" onClick={onClose}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={handleAdd}>
          Adicionar Selecionados
        </Button>
      </div>
    </Modal>
  );
};

const QuotationItemRow: (props: {
  item: QuotationItem;
  product: Product;
  onItemChange: (productId: string, field: 'quantity', value: number) => void;
  onRemove: (productId: string) => void;
  selectedSupplierId?: string;
}) => React.ReactNode = ({ item, product, onItemChange, onRemove, selectedSupplierId }) => {
  const { suppliers, supplierProductPrices } = useSupplyChainData();

  const selectedPrice = useMemo(() => {
    if (!selectedSupplierId) return null;
    const priceEntry = supplierProductPrices.find(
      (p) => p.productId === product.id && p.supplierId === selectedSupplierId,
    );
    const supplier = suppliers.find((s) => s.id === selectedSupplierId);
    if (!priceEntry || !supplier) return null;
    const latestPrice = getLatestPriceFromHistory(priceEntry.priceHistory);
    if (latestPrice === null) return null;
    const total = latestPrice * item.quantity;
    const commission = total * ((supplier.commissionPercentage || 0) / 100);
    return { price: latestPrice, total, commission };
  }, [product.id, item.quantity, selectedSupplierId, supplierProductPrices, suppliers]);

  return (
    <div className="bg-surface rounded-lg shadow-soft p-4 flex items-center gap-4">
      <div className="flex-1 min-w-0">
        <p className="font-bold text-text-primary truncate">{product.name}</p>
        <p className="text-xs text-text-secondary">{product.category}</p>
      </div>
      <div className="flex items-center gap-4 shrink-0">
        <Input
          type="number"
          value={item.quantity}
          onChange={(e) => onItemChange(product.id, 'quantity', parseInt(e.target.value) || 1)}
          className="w-20 text-center"
          aria-label={`Quantidade para ${product.name}`}
        />
        <span className="w-8 text-text-secondary text-sm">{product.unit}</span>
        {selectedPrice ? (
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-xs text-text-secondary whitespace-nowrap">
              {formatCurrency(selectedPrice.price)}/{product.unit}
            </span>
            <span className="text-sm font-bold text-secondary whitespace-nowrap">
              {formatCurrency(selectedPrice.total)}
            </span>
            <span className="text-xs text-success font-semibold whitespace-nowrap">
              {formatCurrency(selectedPrice.commission)}
            </span>
          </div>
        ) : (
          <span className="text-xs text-text-secondary italic whitespace-nowrap">Sem preço</span>
        )}
        <IconButton
          variant="danger"
          onClick={() => onRemove(product.id)}
          aria-label="Remover produto da cotação"
        >
          <TrashIcon />
        </IconButton>
      </div>
    </div>
  );
};

const CotacaoDetalhesPage: () => React.ReactNode = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { projects, clients } = useCoreData();
  const { quotations, setQuotations, products, suppliers, supplierProductPrices } =
    useSupplyChainData();
  const { setCommissions } = useFinanceData();
  const [isProductModalOpen, setProductModalOpen] = useState(false);
  const [isEditingDetails, setIsEditingDetails] = useState(false);

  const isNewQuotation = Boolean(id?.startsWith('qt_new_'));

  const contextQuotation = useMemo(() => {
    if (!id) return null;
    return quotations.find((q) => q.id === id) ?? null;
  }, [id, quotations]);

  const [localQuotation, setLocalQuotation] = useState<Quotation | null>(null);
  const newQuotationInitializedRef = useRef(false);

  useEffect(() => {
    if (contextQuotation) {
      setLocalQuotation(contextQuotation);
    } else if (isNewQuotation && !newQuotationInitializedRef.current && id) {
      newQuotationInitializedRef.current = true;
      setLocalQuotation(getInitialQuotation(id));
    }
  }, [contextQuotation, isNewQuotation, id]);

  const quotation = localQuotation ?? contextQuotation;
  const setQuotation = setLocalQuotation;

  const existingProductIds = useMemo(
    () => new Set((quotation?.items || []).map((item) => item.productId)),
    [quotation],
  );

  interface EnrichedItem {
    item: QuotationItem;
    product: Product | undefined;
    supplier: (typeof suppliers)[number] | null;
    supplierId: string | undefined;
    price: number;
    total: number;
    commission: number;
  }

  interface SupplierGroup {
    supplierName: string;
    items: EnrichedItem[];
    groupTotal: number;
    groupCommission: number;
  }

  const supplierGroups = useMemo((): SupplierGroup[] => {
    if (!quotation) return [];
    const safeItems = quotation.items || [];
    const selections = quotation.selections || {};
    const groupMap = new Map<string, EnrichedItem[]>();

    safeItems.forEach((item) => {
      const product = products.find((p) => p.id === item.productId);
      const selectedSupplierId = selections[item.productId];
      const supplier = selectedSupplierId
        ? (suppliers.find((s) => s.id === selectedSupplierId) ?? null)
        : null;
      const priceInfo = selectedSupplierId
        ? supplierProductPrices.find(
            (p) => p.productId === item.productId && p.supplierId === selectedSupplierId,
          )
        : null;
      const price = priceInfo ? getLatestPriceFromHistory(priceInfo.priceHistory) || 0 : 0;
      const total = price * item.quantity;
      const commission = total * ((supplier?.commissionPercentage || 0) / 100);

      const groupKey = supplier?.name || '\uffff_Sem fornecedor selecionado';
      const group = groupMap.get(groupKey) || [];
      group.push({
        item,
        product,
        supplier,
        supplierId: selectedSupplierId,
        price,
        total,
        commission,
      });
      groupMap.set(groupKey, group);
    });

    return Array.from(groupMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, items]) => {
        items.sort((a, b) => (a.product?.name || '').localeCompare(b.product?.name || ''));
        return {
          supplierName: key.startsWith('\uffff_') ? 'Sem fornecedor selecionado' : key,
          items,
          groupTotal: items.reduce((sum, i) => sum + i.total, 0),
          groupCommission: items.reduce((sum, i) => sum + i.commission, 0),
        };
      });
  }, [quotation, products, supplierProductPrices, suppliers]);

  const totalCost = useMemo(
    () => supplierGroups.reduce((sum, g) => sum + g.groupTotal, 0),
    [supplierGroups],
  );
  const totalCommission = useMemo(
    () => supplierGroups.reduce((sum, g) => sum + g.groupCommission, 0),
    [supplierGroups],
  );

  const persistQuotation = (q: Quotation) => {
    setQuotations((prev) => {
      const exists = prev.some((existing) => existing.id === q.id);
      if (exists) return prev.map((existing) => (existing.id === q.id ? q : existing));
      return [...prev, q];
    });
  };

  const handleSave = () => {
    if (!quotation) return;
    persistQuotation(quotation);
    navigate('/cotacoes');
  };

  const generateCommissions = (acceptedQuotation: Quotation): Commission[] => {
    const supplierTotals = new Map<string, { saleValue: number; percentage: number }>();

    const safeItems = acceptedQuotation.items || [];
    const selections = acceptedQuotation.selections || {};

    safeItems.forEach((item) => {
      const selectedSupplierId = selections[item.productId];
      if (!selectedSupplierId) return;

      const product = products.find((p) => p.id === item.productId);
      const supplier = suppliers.find((s) => s.id === selectedSupplierId);
      if (!product || !supplier) return;

      const priceInfo = supplierProductPrices.find(
        (p) => p.productId === item.productId && p.supplierId === selectedSupplierId,
      );
      const price = priceInfo ? getLatestPriceFromHistory(priceInfo.priceHistory) || 0 : 0;

      const itemTotal = price * item.quantity;
      const existing = supplierTotals.get(selectedSupplierId);
      if (existing) {
        existing.saleValue += itemTotal;
      } else {
        supplierTotals.set(selectedSupplierId, {
          saleValue: itemTotal,
          percentage: supplier.commissionPercentage || 0,
        });
      }
    });

    const linkedProject = projects.find((p) => p.id === acceptedQuotation.projectId);
    const linkedClient = linkedProject
      ? clients.find((c) => c.id === linkedProject.clientId)
      : undefined;

    const newCommissions: Commission[] = [];
    supplierTotals.forEach((data, supplierId) => {
      const supplier = suppliers.find((s) => s.id === supplierId);
      if (!supplier) return;
      newCommissions.push({
        id: `comm_qt_${acceptedQuotation.id}_${supplierId}`,
        saleDate: getTodayDateOnly(),
        supplierId,
        supplierName: supplier.name,
        clientId: linkedClient?.id || '',
        clientName: linkedClient?.name || 'Cliente não vinculado',
        saleValue: data.saleValue,
        commissionPercentage: data.percentage,
        commissionValue: (data.saleValue * data.percentage) / 100,
        status: 'Pendente',
        quotationId: acceptedQuotation.id,
        notes: `Gerado automaticamente da cotação "${acceptedQuotation.name}"`,
      });
    });
    return newCommissions;
  };

  const handleAccept = () => {
    if (!quotation) return;
    const accepted = { ...quotation, status: 'Aceita' as const };
    persistQuotation(accepted);
    const newCommissions = generateCommissions(accepted);
    if (newCommissions.length > 0) {
      setCommissions((prev) => [...newCommissions, ...prev]);
    }
    navigate('/cotacoes');
  };

  const handleReject = () => {
    if (!quotation) return;
    const rejected = { ...quotation, status: 'Rejeitada' as const };
    persistQuotation(rejected);
    navigate('/cotacoes');
  };

  const isEditable = quotation?.status === 'Em Aberto';
  const canEdit = isEditable || isEditingDetails;

  const handleUpdate = (field: keyof Quotation, value: Quotation[keyof Quotation]) =>
    setQuotation((q) => (q ? { ...q, [field]: value } : null));

  const handleAddProducts = (newProducts: Product[]) => {
    const newItems: QuotationItem[] = newProducts.map((p) => ({ productId: p.id, quantity: 1 }));
    setQuotation((q) => (q ? { ...q, items: [...(q.items || []), ...newItems] } : null));
  };

  const handleItemChange = (productId: string, field: 'quantity', value: number) => {
    setQuotation((q) =>
      q
        ? {
            ...q,
            items: (q.items || []).map((i) =>
              i.productId === productId ? { ...i, [field]: value } : i,
            ),
          }
        : null,
    );
  };

  const handleRemoveItem = (productId: string) => {
    setQuotation((q) => {
      if (!q) return null;
      const newSelections = { ...(q.selections || {}) };
      delete newSelections[productId];
      return {
        ...q,
        items: (q.items || []).filter((i) => i.productId !== productId),
        selections: newSelections,
      };
    });
  };

  const cotacoesIcon = NAV_LINKS.find((link) => link.label === 'Suprimentos')?.children?.find(
    (c) => c.path === '/cotacoes',
  )?.icon;

  if (!quotation) {
    const isLoading = !isNewQuotation && quotations.length === 0;
    return (
      <div className="animate-fade-in-up">
        <PageHeader title="Detalhes da Cotação" subtitle="" icon={cotacoesIcon} />
        <div className="p-10 bg-surface rounded-xl shadow-soft text-center text-text-secondary mt-4">
          <h3 className="text-lg font-medium text-text-primary">
            {isLoading ? 'Carregando cotação…' : 'Cotação não encontrada'}
          </h3>
          <p className="mt-1 text-sm">
            {isLoading
              ? 'Aguarde enquanto os dados são carregados.'
              : 'A cotação solicitada não existe ou foi removida.'}
          </p>
          {!isLoading && (
            <Button variant="secondary" onClick={() => navigate('/cotacoes')} className="mt-4">
              Voltar para Cotações
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up pb-24">
      <PageHeader title="Detalhes da Cotação" subtitle="" icon={cotacoesIcon}>
        {quotation.status !== 'Em Aberto' && (
          <div className="flex items-center gap-3">
            <span
              className={`px-4 py-1.5 text-sm font-bold rounded-full ${
                quotation.status === 'Aceita'
                  ? 'bg-success/20 text-success'
                  : 'bg-error/20 text-error'
              }`}
            >
              {quotation.status === 'Aceita' ? '✓ Cotação Aceita' : '✗ Cotação Rejeitada'}
            </span>
            {!isEditingDetails && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditingDetails(true)}
                className="text-text-secondary"
              >
                <PencilIcon className="w-4 h-4" /> Editar
              </Button>
            )}
          </div>
        )}
      </PageHeader>

      <div className="bg-surface rounded-xl shadow-soft p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField label="Nome da Cotação">
            <Input
              type="text"
              value={quotation.name}
              onChange={(e) => handleUpdate('name', e.target.value)}
              readOnly={!canEdit}
              className={!canEdit ? 'opacity-70 cursor-not-allowed' : ''}
            />
          </FormField>
          <FormField label="Data da Cotação">
            <Input
              type="date"
              value={quotation.date}
              onChange={(e) => handleUpdate('date', e.target.value)}
              readOnly={!isEditable}
              className={!isEditable ? 'opacity-70 cursor-not-allowed' : ''}
            />
          </FormField>
          <Select
            label="Vincular ao Projeto"
            value={quotation.projectId || ''}
            onChange={(e) => handleUpdate('projectId', e.target.value || undefined)}
            options={[
              { value: '', label: 'Nenhum' },
              ...projects
                .filter((p) => !p.archived)
                .map((p) => ({
                  value: p.id,
                  label: p.name.startsWith(p.code) ? p.name : `${p.code} - ${p.name}`,
                })),
            ]}
            aria-label="Projeto"
            disabled={!isEditable}
            className={!isEditable ? 'opacity-70 cursor-not-allowed' : ''}
          />
        </div>
        <div className="flex justify-between items-center pt-4 border-t border-border-color">
          <h3 className="font-serif text-xl font-bold text-secondary">Itens</h3>
          {(isEditable || isEditingDetails) && (
            <Button variant="ghost" size="sm" onClick={() => setProductModalOpen(true)}>
              <PlusIcon className="w-4 h-4" /> Adicionar Produtos
            </Button>
          )}
        </div>
        {!canEdit ? (
          <div className="bg-surface rounded-lg shadow-soft border border-border-color overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-background text-text-secondary">
                <tr>
                  <th className="py-2 px-4 font-medium">Produto</th>
                  <th className="py-2 px-4 font-medium">Qtd</th>
                  <th className="py-2 px-4 font-medium text-right">Valor Unit.</th>
                  <th className="py-2 px-4 font-medium text-right">Total</th>
                  <th className="py-2 px-4 font-medium text-right">Comissão</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-color">
                {supplierGroups.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-4 px-4 text-center text-text-secondary italic">
                      Nenhum item adicionado.
                    </td>
                  </tr>
                ) : (
                  supplierGroups.map((group) => (
                    <React.Fragment key={group.supplierName}>
                      <tr className="bg-background/70">
                        <td
                          colSpan={5}
                          className="py-2 px-4 font-bold text-sm text-text-primary uppercase tracking-wide"
                        >
                          {group.supplierName}
                        </td>
                      </tr>
                      {group.items.map((entry) => (
                        <tr key={entry.item.productId} className="hover:bg-background/50">
                          <td className="py-2 px-4 pl-8">
                            <p className="font-medium text-text-primary">
                              {entry.product?.name || 'Produto não encontrado'}
                            </p>
                            <p className="text-xs text-text-secondary">{entry.product?.category}</p>
                          </td>
                          <td className="py-2 px-4 whitespace-nowrap">
                            {isEditingDetails ? (
                              <Input
                                type="number"
                                value={entry.item.quantity}
                                onChange={(e) =>
                                  handleItemChange(
                                    entry.item.productId,
                                    'quantity',
                                    parseInt(e.target.value) || 1,
                                  )
                                }
                                className="w-20 text-center"
                                aria-label={`Quantidade para ${entry.product?.name}`}
                              />
                            ) : (
                              <>
                                {entry.item.quantity} {entry.product?.unit}
                              </>
                            )}
                          </td>
                          <td className="py-2 px-4 text-right whitespace-nowrap">
                            {formatCurrency(entry.price)}
                          </td>
                          <td className="py-2 px-4 text-right font-semibold text-secondary whitespace-nowrap">
                            {formatCurrency(entry.total)}
                          </td>
                          <td className="py-2 px-4 text-right text-success whitespace-nowrap">
                            {formatCurrency(entry.commission)}
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))
                )}
              </tbody>
              {supplierGroups.length > 0 && (
                <tfoot className="border-t-2 border-border-color bg-background font-bold">
                  <tr>
                    <td
                      colSpan={3}
                      className="py-3 px-4 text-right text-text-secondary uppercase text-xs tracking-wide"
                    >
                      Totais
                    </td>
                    <td className="py-3 px-4 text-right text-secondary text-base">
                      {formatCurrency(totalCost)}
                    </td>
                    <td className="py-3 px-4 text-right text-success text-base">
                      {formatCurrency(totalCommission)}
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {supplierGroups.length > 0
                ? supplierGroups.map((group) => (
                    <div key={group.supplierName}>
                      <h4 className="text-sm font-bold text-text-secondary uppercase tracking-wide mb-2 pl-1">
                        {group.supplierName}
                      </h4>
                      <div className="space-y-2">
                        {group.items.map((entry) => {
                          if (!entry.product) return null;
                          const selections = quotation.selections || {};
                          return (
                            <QuotationItemRow
                              key={entry.item.productId}
                              item={entry.item}
                              product={entry.product}
                              onItemChange={handleItemChange}
                              onRemove={handleRemoveItem}
                              selectedSupplierId={selections[entry.item.productId]}
                            />
                          );
                        })}
                      </div>
                    </div>
                  ))
                : (quotation.items || []).map((item) => {
                    const product = products.find((p) => p.id === item.productId);
                    if (!product) return null;
                    const selections = quotation.selections || {};
                    return (
                      <QuotationItemRow
                        key={item.productId}
                        item={item}
                        product={product}
                        onItemChange={handleItemChange}
                        onRemove={handleRemoveItem}
                        selectedSupplierId={selections[item.productId]}
                      />
                    );
                  })}
              {(quotation.items || []).length === 0 && (
                <div className="text-center py-8 bg-background rounded-lg border border-dashed border-border-color">
                  <p className="text-sm text-text-secondary italic">
                    Nenhum item adicionado. Clique em &quot;Adicionar Produtos&quot; para começar a
                    cotar.
                  </p>
                </div>
              )}
            </div>
            {(quotation.items || []).length > 0 && (
              <div className="mt-4 flex justify-end gap-8 py-3 px-4 bg-background rounded-lg border border-border-color">
                <div className="text-right">
                  <span className="text-text-secondary text-xs uppercase tracking-wide">Total</span>
                  <p className="font-bold text-lg text-secondary tabular-nums">
                    {formatCurrency(totalCost)}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-text-secondary text-xs uppercase tracking-wide">
                    Comissão
                  </span>
                  <p className="font-bold text-lg text-success tabular-nums">
                    {formatCurrency(totalCommission)}
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <div className="fixed bottom-0 right-0 left-0 md:left-64 lg:left-80 bg-background/80 backdrop-blur-sm p-4 border-t border-border-color z-10">
        <div className="max-w-7xl mx-auto flex justify-end items-center px-6">
          <div className="flex items-center gap-3">
            {isEditable ? (
              <>
                <Button
                  variant="secondary"
                  onClick={() => navigate('/cotacoes')}
                  className="flex items-center gap-2 px-5 py-2.5 text-sm"
                >
                  Cancelar
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSave}
                  className="flex items-center gap-2 px-5 py-2.5 text-sm"
                >
                  Salvar Cotação
                </Button>
                <div className="w-px h-8 bg-border-color mx-1" />
                <Button
                  variant="danger"
                  onClick={handleReject}
                  className="flex items-center gap-2 px-5 py-2.5 text-sm"
                >
                  <XCircleIcon className="w-4 h-4" /> Rejeitar
                </Button>
                <Button
                  variant="primary"
                  onClick={handleAccept}
                  className="flex items-center gap-2 px-5 py-2.5 text-sm !bg-success hover:!bg-success/90"
                >
                  <CheckCircleIcon className="w-4 h-4" /> Aceitar
                </Button>
              </>
            ) : isEditingDetails ? (
              <>
                <Button
                  variant="secondary"
                  onClick={() => setIsEditingDetails(false)}
                  className="flex items-center gap-2 px-5 py-2.5 text-sm"
                >
                  Cancelar
                </Button>
                <Button
                  variant="primary"
                  onClick={() => {
                    if (quotation) persistQuotation(quotation);
                    setIsEditingDetails(false);
                  }}
                  className="flex items-center gap-2 px-5 py-2.5 text-sm"
                >
                  Salvar Alterações
                </Button>
              </>
            ) : (
              <Button
                variant="secondary"
                onClick={() => navigate('/cotacoes')}
                className="px-5 py-2.5 text-sm"
              >
                Voltar
              </Button>
            )}
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
