import React from 'react';
import type { BudgetItem } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { IconButton, TrashIcon } from '../ui';

interface BudgetItemRowProps {
  item: BudgetItem;
  index: number;
  sectionId: number;
  sectionUnit: string;
  useProfitPercentage: boolean;
  billingValue: number;
  onFieldChange: (
    itemId: number,
    field: keyof Omit<BudgetItem, 'unit'>,
  ) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onRemoveItem: (sectionId: number, itemId: number) => void;
}

export const BudgetItemRow: (props: BudgetItemRowProps) => React.ReactNode = ({
  item,
  index,
  sectionId,
  sectionUnit,
  useProfitPercentage,
  billingValue,
  onFieldChange,
  onRemoveItem,
}) => {
  const quantityForTotal = sectionUnit === 'h' ? item.estimatedHours || 0 : item.quantity;
  const itemTotal = useProfitPercentage
    ? quantityForTotal * (billingValue * (1 + item.unitPrice / 100))
    : quantityForTotal * item.unitPrice;
  const rowClass = item.included
    ? index % 2 === 0
      ? 'bg-surface/50'
      : 'bg-background/30'
    : 'bg-background text-text-secondary opacity-75';

  return (
    <tr
      className={`${rowClass} border-b border-border-color last:border-b-0 hover:bg-accent/10 transition-colors`}
    >
      <td className="p-4 text-center">
        <input
          type="checkbox"
          checked={item.included}
          onChange={onFieldChange(item.id, 'included')}
          className="w-5 h-5 rounded focus:ring-2 cursor-pointer transition-colors accent-primary/70"
          aria-label={`Incluir ${item.description}`}
        />
      </td>
      <td className="px-6 py-4">
        <input
          type="text"
          value={item.description}
          onChange={onFieldChange(item.id, 'description')}
          className="w-full bg-transparent p-1 rounded border border-transparent hover:border-border-color/50 focus:border-accent focus:ring-0 transition font-medium"
          disabled={!item.included}
          aria-label="Descrição do item"
        />
      </td>
      <td className="px-6 py-4 text-right">
        <input
          type="number"
          min="0"
          value={item.quantity}
          onChange={onFieldChange(item.id, 'quantity')}
          className="w-20 bg-transparent text-right p-1 rounded border border-transparent hover:border-border-color/50 focus:border-accent focus:ring-0 transition"
          disabled={!item.included}
          aria-label={`Quantidade para ${item.description}`}
        />
      </td>
      <td className="px-6 py-4 text-right">
        <input
          type="number"
          min="0"
          step="0.01"
          value={item.unitPrice.toFixed(2)}
          onChange={onFieldChange(item.id, 'unitPrice')}
          className="w-24 bg-transparent text-right p-1 rounded border border-transparent hover:border-border-color/50 focus:border-accent focus:ring-0 transition"
          disabled={!item.included}
          aria-label={`Preço unitário para ${item.description}`}
        />
      </td>
      <td className="px-6 py-4 text-right">
        <input
          type="number"
          min="0"
          value={item.estimatedHours || ''}
          placeholder="0"
          onChange={onFieldChange(item.id, 'estimatedHours')}
          className="w-20 bg-transparent text-right p-1 rounded border border-transparent hover:border-border-color/50 focus:border-accent focus:ring-0 transition"
          disabled={!item.included}
          aria-label={`Horas estimadas para ${item.description}`}
        />
      </td>
      <td className="px-6 py-4 font-semibold text-right">{formatCurrency(itemTotal)}</td>
      <td className="p-4 text-center">
        <IconButton
          variant="danger"
          size="sm"
          onClick={() => onRemoveItem(sectionId, item.id)}
          aria-label={`Remover ${item.description}`}
        >
          <TrashIcon className="w-4 h-4" />
        </IconButton>
      </td>
    </tr>
  );
};
