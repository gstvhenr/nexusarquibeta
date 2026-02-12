import React from 'react';
import type { Client, PaymentStatus } from '../../types';
import {
  CLIENT_STATUS_COLORS,
  PAYMENT_STATUS_COLORS,
  PAYMENT_STATUS_DOT_COLORS,
} from '../../constants';
import { SirenIcon, ClockIcon, AlertIcon } from '../ui/icons';
import { getInitials, formatDateDayMonth } from '../../utils/formatters';

interface ClientTableRowProps {
  client: Client;
  paymentStatus: PaymentStatus;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onToggleUrgent: (id: string) => void;
  onView: (client: Client) => void;
  nextDeadline?: Date | null;
}

export const ClientTableRow: React.FC<ClientTableRowProps> = React.memo(
  ({ client, paymentStatus, isSelected, onSelect, onToggleUrgent, onView, nextDeadline }) => {
    const primaryContact = client.contacts?.find((c) => c.isPrimary) || client.contacts?.[0];

    // Determine Urgency based on manual flag OR overdue deadline
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const isDeadlineUrgent = nextDeadline
      ? new Date(nextDeadline).setHours(0, 0, 0, 0) <= today.getTime()
      : false;
    const isUrgent = client.isUrgent || isDeadlineUrgent;

    // Urgent Style
    const urgentClass = isUrgent
      ? 'bg-error/5 hover:bg-error/10 border-l-4 border-l-error border-b border-border-color'
      : 'border-b border-border-color hover:bg-background/80';

    return (
      <tr
        className={`group transition-colors ${urgentClass} ${client.archived ? 'opacity-60' : ''}`}
      >
        <td className="p-4 text-center w-10">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onSelect(client.id)}
            className="w-4 h-4 rounded accent-primary cursor-pointer"
            aria-label={`Selecionar cliente ${client.name}`}
            title={`Selecionar cliente ${client.name}`}
          />
        </td>
        <td className="p-4 text-center">
          <div className="flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={() => onToggleUrgent(client.id)}
              className="text-gray-300 hover:text-error transition-colors"
              aria-label="Marcar Urgência"
              title="Urgente"
            >
              <SirenIcon className={`w-5 h-5 ${isUrgent ? 'text-error' : ''}`} />
            </button>
          </div>
        </td>
        <th scope="row" className="px-6 py-4 font-semibold text-text-primary whitespace-nowrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-secondary/80 text-secondary-content flex items-center justify-center font-bold text-sm flex-shrink-0">
              {getInitials(client.name)}
            </div>
            <div>
              <button
                type="button"
                onClick={() => onView(client)}
                className="text-left hover:underline focus:underline focus:outline-none font-bold"
              >
                {client.name}
              </button>
              <div className="text-xs text-text-secondary font-normal">{client.cpfCnpj || ''}</div>
              {isUrgent && (
                <span className="text-[10px] font-bold text-error bg-white px-1.5 py-0.5 rounded border border-error/30 mt-1 inline-block">
                  {isDeadlineUrgent ? 'PRAZO VENCIDO/HOJE' : 'PRIORIDADE'}
                </span>
              )}
            </div>
          </div>
        </th>
        <td className="px-6 py-4">
          <span
            className={`px-2 py-1 text-xs font-bold rounded-full whitespace-nowrap ${CLIENT_STATUS_COLORS[client.status]}`}
          >
            {client.status}
          </span>
        </td>
        <td className="px-6 py-4">
          <span
            className={`inline-flex items-center gap-2 px-3 py-1 text-xs font-bold rounded-full whitespace-nowrap ${PAYMENT_STATUS_COLORS[paymentStatus]}`}
          >
            <span
              className={`h-2 w-2 rounded-full ${PAYMENT_STATUS_DOT_COLORS[paymentStatus]}`}
            ></span>
            {paymentStatus}
          </span>
        </td>
        <td className="px-6 py-4">
          <div className="font-medium text-text-primary">{primaryContact?.phone || 'N/A'}</div>
          <div className="text-gray-600">{client.email}</div>
        </td>
        <td className="px-6 py-4">
          <div className="font-medium">{client.address.city}</div>
          <div className="text-text-secondary">{client.address.state}</div>
        </td>
        <td className="px-6 py-4 text-right">
          {nextDeadline ? (
            <div
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap ${isDeadlineUrgent ? 'bg-error text-white' : 'bg-surface border border-border-color text-text-primary'}`}
            >
              {isDeadlineUrgent ? (
                <AlertIcon className="w-4 h-4" />
              ) : (
                <ClockIcon className="w-4 h-4" />
              )}
              {formatDateDayMonth(nextDeadline.toISOString())}
            </div>
          ) : (
            <span className="text-text-secondary text-xs italic">-</span>
          )}
        </td>
      </tr>
    );
  },
);
