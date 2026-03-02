import { CubeIcon, PlusIcon } from '../ui';
import type { Supplier } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import type { SupplierProductSnapshot } from './supplierViewTypes';

type SupplierProductsTabProps = {
  supplier: Supplier;
  supplierProducts: SupplierProductSnapshot[];
  onOpenLinkModal: () => void;
};

export function SupplierProductsTab({
  supplier,
  supplierProducts,
  onOpenLinkModal,
}: SupplierProductsTabProps): JSX.Element {
  return (
    <div className="space-y-4 animate-fade-in-up">
      <div className="flex justify-between items-center bg-surface p-4 rounded-xl border border-border-color shadow-sm">
        <div>
          <h4 className="font-bold text-text-primary">Catálogo de Produtos</h4>
          <p className="text-xs text-text-secondary">
            Produtos vinculados a este fornecedor e seus preços atuais.
          </p>
        </div>
        <button
          onClick={onOpenLinkModal}
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
                Comissão Est. ({supplier.commissionPercentage}%)
              </th>
              <th className="px-6 py-3 text-right">Última Atualização</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-color">
            {supplierProducts.map(({ product, latestPrice, lastUpdated }) => (
              <tr key={product.id} className="hover:bg-background/50 transition-colors group">
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
                  <span className="font-bold text-text-primary">{formatCurrency(latestPrice)}</span>
                  <span className="text-xs text-text-secondary ml-1">/ {product.unit}</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="font-bold text-success">
                    {formatCurrency(latestPrice * ((supplier.commissionPercentage || 0) / 100))}
                  </span>
                </td>
                <td className="px-6 py-4 text-right text-xs text-text-secondary">
                  {lastUpdated ? formatDate(lastUpdated.toISOString()) : '-'}
                </td>
              </tr>
            ))}
            {supplierProducts.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-text-secondary">
                  Nenhum produto vinculado. Adicione um produto para começar a monitorar preços.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
