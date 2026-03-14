import { Badge, Button, CubeIcon, PlusIcon } from '../ui';
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
        </div>
        <Button variant="primary" size="sm" onClick={onOpenLinkModal}>
          <PlusIcon className="w-4 h-4" /> Vincular Produto
        </Button>
      </div>

      <div className="bg-surface rounded-xl border border-border-color overflow-hidden shadow-sm">
        <table className="w-full text-sm text-left">
          <thead className="bg-background text-xs font-bold text-text-secondary uppercase">
            <tr>
              <th className="px-6 py-3 whitespace-nowrap">Produto</th>
              <th className="px-6 py-3 whitespace-nowrap">Categoria</th>
              <th className="px-6 py-3 text-right whitespace-nowrap">Preço Unit.</th>
              <th className="px-6 py-3 text-right whitespace-nowrap">Comissão</th>
              <th className="px-6 py-3 text-right whitespace-nowrap">Atualização</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-color">
            {supplierProducts.map(({ product, latestPrice, lastUpdated }) => (
              <tr key={product.id} className="hover:bg-background/50 transition-colors group">
                <td className="px-6 py-4 font-semibold text-text-primary flex items-center gap-3 whitespace-nowrap">
                  <div className="w-8 h-8 rounded bg-background flex items-center justify-center text-text-secondary border border-border-color">
                    <CubeIcon className="w-4 h-4" />
                  </div>
                  {product.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge variant="default">{product.category}</Badge>
                </td>
                <td className="px-6 py-4 text-right whitespace-nowrap">
                  <span className="font-bold text-text-primary">{formatCurrency(latestPrice)}</span>
                  <span className="text-xs text-text-secondary ml-1">/ {product.unit}</span>
                </td>
                <td className="px-6 py-4 text-right whitespace-nowrap">
                  <span className="font-bold text-success">
                    {formatCurrency(latestPrice * ((supplier.commissionPercentage || 0) / 100))}
                  </span>
                </td>
                <td className="px-6 py-4 text-right text-xs text-text-secondary whitespace-nowrap">
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
