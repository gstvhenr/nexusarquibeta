import React from 'react';
import {
  ArchiveIcon,
  Badge,
  Button,
  EditIcon,
  IconButton,
  TrashIcon,
  UnarchiveIcon,
} from '@/components/ui';
import { formatCurrency, formatDate } from '@/utils/formatters';
import type { Commission } from '@/types';

type CommissionsTableProps = {
  commissions: Commission[];
  onConfirmPayment: (commission: Commission) => void;
  onEdit: (commission: Commission) => void;
  onDelete: (commission: Commission) => void;
  onToggleArchive: (id: string, archiveStatus: boolean) => void;
};

export const CommissionsTable: (props: CommissionsTableProps) => React.ReactNode = ({
  commissions,
  onConfirmPayment,
  onEdit,
  onDelete,
  onToggleArchive,
}) => {
  return (
    <div className="bg-surface rounded-xl shadow-soft overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="bg-background/50 text-xs text-text-secondary uppercase tracking-wider">
          <tr>
            <th scope="col" className="px-6 py-3">
              Fornecedor
            </th>
            <th scope="col" className="px-6 py-3">
              Cliente
            </th>
            <th scope="col" className="px-6 py-3">
              Data Venda
            </th>
            <th scope="col" className="px-6 py-3">
              Data Prevista
            </th>
            <th scope="col" className="px-6 py-3 text-right">
              Valor Comissão
            </th>
            <th scope="col" className="px-6 py-3">
              Notas
            </th>
            <th scope="col" className="px-6 py-3 text-center">
              Status
            </th>
            <th scope="col" className="px-6 py-3 text-right">
              Ações
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border-color">
          {commissions.map((commission) => (
            <tr key={commission.id} className="hover:bg-background/80">
              <td className="px-6 py-4 font-semibold text-text-primary">
                {commission.supplierName}
              </td>
              <td className="px-6 py-4 text-text-secondary">{commission.clientName}</td>
              <td className="px-6 py-4 text-text-primary">{formatDate(commission.saleDate)}</td>
              <td className="px-6 py-4 text-text-primary">
                {formatDate(commission.expectedPaymentDate)}
              </td>
              <td className="px-6 py-4 font-bold text-secondary text-right">
                {formatCurrency(commission.commissionValue)}
              </td>
              <td
                className="px-6 py-4 text-text-secondary max-w-xs truncate"
                title={commission.notes || ''}
              >
                {commission.notes || '-'}
              </td>
              <td className="px-6 py-4 text-center">
                <Badge variant={commission.status === 'Recebido' ? 'success' : 'warning'}>
                  {commission.status}
                </Badge>
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-2">
                  {commission.status === 'Pendente' ? (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onConfirmPayment(commission)}
                      >
                        Confirmar
                      </Button>
                      <IconButton
                        variant="primary"
                        size="sm"
                        onClick={() => onEdit(commission)}
                        aria-label="Editar comissão"
                      >
                        <EditIcon className="w-4 h-4" />
                      </IconButton>
                      <IconButton
                        variant="danger"
                        size="sm"
                        onClick={() => onDelete(commission)}
                        aria-label="Excluir comissão"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </IconButton>
                    </>
                  ) : (
                    <IconButton
                      variant="secondary"
                      size="sm"
                      onClick={() => onToggleArchive(commission.id, !commission.archived)}
                      aria-label={
                        commission.archived ? 'Desarquivar comissão' : 'Arquivar comissão'
                      }
                      title={commission.archived ? 'Desarquivar' : 'Arquivar'}
                    >
                      {commission.archived ? (
                        <UnarchiveIcon className="w-4 h-4" />
                      ) : (
                        <ArchiveIcon className="w-4 h-4" />
                      )}
                    </IconButton>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {commissions.length === 0 && (
        <p className="text-center text-text-secondary py-10">Nenhuma comissão encontrada.</p>
      )}
    </div>
  );
};
