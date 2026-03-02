import { formatCurrency, formatDate } from '../../utils/formatters';
import type { SupplierCommissionHistory } from './supplierViewTypes';

type SupplierCommissionsTabProps = {
  supplierCommissions: SupplierCommissionHistory;
};

export function SupplierCommissionsTab({
  supplierCommissions,
}: SupplierCommissionsTabProps): JSX.Element {
  return (
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
                {supplierCommissions.map((commission) => (
                  <tr key={commission.id} className="hover:bg-background/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-text-primary">
                      {commission.clientName}
                    </td>
                    <td className="px-6 py-4 text-text-secondary">
                      {formatDate(commission.saleDate)}
                    </td>
                    <td className="px-6 py-4 text-right text-text-secondary">
                      {formatCurrency(commission.saleValue)}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-success">
                      {formatCurrency(commission.commissionValue)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`px-2 py-1 text-xs font-bold rounded-full ${commission.status === 'Recebido' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}
                      >
                        {commission.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {supplierCommissions.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-text-secondary">
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
  );
}
