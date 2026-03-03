import type { Installment } from '@/types';
import { PAYMENT_STATUS_DOT_COLORS } from '@/constants';
import { parseDateString } from '@/utils/formatters';
import type { AddendumAuditEntry, InstallmentStatusMeta } from './types';

export function getInstallmentStatus(inst: Installment): InstallmentStatusMeta {
  if (inst.paid) {
    return {
      text: 'Pago',
      color: 'text-success',
      dotColor: PAYMENT_STATUS_DOT_COLORS['Em dia'],
    };
  }

  const dueDate = parseDateString(inst.dueDate);
  if (dueDate && dueDate < new Date(new Date().setHours(0, 0, 0, 0))) {
    return {
      text: 'Atrasado',
      color: 'text-error',
      dotColor: PAYMENT_STATUS_DOT_COLORS['Em Atraso'],
    };
  }

  return {
    text: 'Pendente',
    color: 'text-warning',
    dotColor: PAYMENT_STATUS_DOT_COLORS['Pendente'],
  };
}

export function getAuditTrailActionText(entry: AddendumAuditEntry) {
  if (entry.action === 'created') return 'Criado';
  if (entry.action === 'deleted') return 'Removido';
  return `Status: ${entry.fromStatus} -> ${entry.toStatus}`;
}
