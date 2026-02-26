import React, { useState } from 'react';
import type { BudgetSection, BudgetItem, BillingMethod } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { ChevronDownIcon, TrashIcon } from '../ui';

type BudgetSectionProps = {
  section: BudgetSection;
  sectionCalculations: { cost: number; profit: number; total: number };
  onItemChange: (
    sectionId: number,
    itemId: number,
    field: keyof Omit<BudgetItem, 'unit'>,
    value: BudgetItem[keyof BudgetItem],
  ) => void;
  onSectionChange: (
    sectionId: number,
    field: 'title' | 'billingMethod' | 'billingValue' | 'unit',
    value: string | number,
  ) => void;
  onAddItem: (sectionId: number) => void;
  onRemoveItem: (sectionId: number, itemId: number) => void;
  onRemoveSection: (sectionId: number) => void;
};

const billingMethodLabels: Record<BillingMethod, string> = {
  percentage_on_top: 'Percentual Sobre Custo',
  percentage_embedded: 'Percentual Embutido no Total',
  fixed_fee: 'Taxa Fixa',
  per_sqm: 'Por Metro Quadrado (m²)',
  per_hour: 'Por Hora Estimada (h)',
};

const getBillingValueLabel = (method: BillingMethod) => {
  switch (method) {
    case 'percentage_on_top':
    case 'percentage_embedded':
      return 'Valor (%)';
    case 'fixed_fee':
      return 'Valor (R$)';
    case 'per_sqm':
      return 'Valor (R$/m²)';
    case 'per_hour':
      return 'Valor (R$/h)';
    default:
      return 'Valor';
  }
};

export const BudgetSectionComponent = React.memo<BudgetSectionProps>(
  ({
    section,
    sectionCalculations,
    onItemChange,
    onSectionChange,
    onAddItem,
    onRemoveItem,
    onRemoveSection,
  }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const handleItemFieldChange =
      (itemId: number, field: keyof Omit<BudgetItem, 'unit'>) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const value =
          e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
        onItemChange(section.id, itemId, field, value);
      };

    const useProfitPercentage =
      (section.unit === 'h' && section.billing.method === 'per_hour') ||
      (section.unit === 'm²' && section.billing.method === 'per_sqm');

    const isHourlyRateMode = section.unit === 'h' && section.billing.method === 'per_hour';

    return (
      <div className="bg-surface rounded-2xl shadow-soft transition-all duration-300 ease-in-out">
        <header
          className="p-5 cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setIsExpanded(!isExpanded);
            }
          }}
          role="button"
          tabIndex={0}
        >
          <div className="flex flex-wrap gap-4 justify-between items-start">
            <div className="flex items-center gap-3 flex-grow min-w-[200px]">
              <ChevronDownIcon
                className={`w-6 h-6 text-text-secondary transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
              />
              <input
                type="text"
                value={section.title}
                onChange={(e) => {
                  e.stopPropagation();
                  onSectionChange(section.id, 'title', e.target.value);
                }}
                onClick={(e) => e.stopPropagation()}
                className="font-serif text-2xl font-semibold text-secondary bg-transparent border-0 border-b-2 border-transparent focus:ring-0 focus:border-accent transition-all w-full p-1 -ml-1"
                placeholder="Nome da Seção"
                aria-label="Nome da seção"
              />
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className="text-sm text-success font-medium">Lucro</span>
                <p className="font-sans text-lg font-semibold text-success">
                  {formatCurrency(sectionCalculations.profit)}
                </p>
              </div>
              <div className="text-right">
                <span className="text-sm text-text-secondary">Total da Seção</span>
                <p className="font-sans text-2xl font-bold text-secondary">
                  {formatCurrency(sectionCalculations.total)}
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveSection(section.id);
                }}
                className="text-gray-400 hover:text-error p-2 rounded-full transition-colors self-center"
                aria-label="Remover seção"
              >
                <TrashIcon />
              </button>
            </div>
          </div>

          {isExpanded && (
            /* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
            <div
              className="mt-4 pt-4 border-t border-border-color/50 flex flex-wrap items-end gap-3"
              onClick={(e) => e.stopPropagation()}
            >
              {/* eslint-enable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
              <p className="text-sm font-semibold text-text-secondary w-full">
                Configurações da Seção
              </p>
              <div className="w-24">
                <span className="text-xs text-text-secondary block mb-1">Unidade Padrão</span>
                <select
                  value={section.unit}
                  onChange={(e) => onSectionChange(section.id, 'unit', e.target.value)}
                  className="w-full bg-background px-2 h-9 rounded-md border border-border-color focus:border-accent focus:ring-accent/50 transition font-semibold text-sm"
                  aria-label="Unidade padrão"
                >
                  <option value="un">un</option>
                  <option value="m²">m²</option>
                  <option value="h">h</option>
                  <option value="vb">vb</option>
                </select>
              </div>
              <div className="w-60">
                <span className="text-xs text-text-secondary block mb-1">Método de Cobrança</span>
                <select
                  value={section.billing.method}
                  onChange={(e) => onSectionChange(section.id, 'billingMethod', e.target.value)}
                  className="w-full bg-background px-2 h-9 rounded-md border border-border-color focus:border-accent focus:ring-accent/50 transition font-semibold text-sm"
                  aria-label="Método de cobrança"
                >
                  {Object.entries(billingMethodLabels).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="w-28">
                <label className="text-xs text-text-secondary block mb-1">
                  {getBillingValueLabel(section.billing.method)}
                </label>
                <input
                  type="number"
                  value={section.billing.value || ''}
                  onChange={(e) => onSectionChange(section.id, 'billingValue', e.target.value)}
                  className="w-full bg-background text-right px-2 h-9 rounded-md border border-border-color focus:border-accent focus:ring-accent/50 transition font-semibold"
                  placeholder="0"
                  aria-label={getBillingValueLabel(section.billing.method)}
                />
              </div>
            </div>
          )}
        </header>

        <div
          className={`transition-all duration-500 ease-in-out overflow-hidden ${isExpanded ? 'max-h-[1000px]' : 'max-h-0'}`}
        >
          <div className="px-5 pb-5 pt-2">
            <div className="overflow-x-auto bg-background/50 dark:bg-background/20 rounded-lg">
              <table className="w-full text-sm text-left text-text-primary">
                <thead className="text-xs text-text-secondary uppercase">
                  <tr>
                    <th scope="col" className="p-4 w-12 text-center">
                      Inc.
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Descrição do Serviço
                    </th>
                    <th scope="col" className="px-6 py-3 w-40 text-center">
                      {isHourlyRateMode ? 'Qtd.' : `Qtd. (${section.unit})`}
                    </th>
                    <th scope="col" className="px-6 py-3 w-40 text-center">
                      {useProfitPercentage ? 'Lucro (%)' : 'Preço Unit.'}
                    </th>
                    <th scope="col" className="px-6 py-3 w-32 text-center">
                      QND. H
                    </th>
                    <th scope="col" className="px-6 py-3 w-40 text-center">
                      Total
                    </th>
                    <th scope="col" className="p-4 w-12 text-center" aria-label="Ações"></th>
                  </tr>
                </thead>
                <tbody>
                  {section.items.map((item, index) => {
                    const quantityForTotal =
                      section.unit === 'h' ? item.estimatedHours || 0 : item.quantity;
                    const itemTotal = useProfitPercentage
                      ? quantityForTotal * (section.billing.value * (1 + item.unitPrice / 100))
                      : quantityForTotal * item.unitPrice;
                    const rowClass = item.included
                      ? index % 2 === 0
                        ? 'bg-surface/50'
                        : 'bg-background/30'
                      : 'bg-background text-text-secondary opacity-75';

                    return (
                      <tr
                        key={item.id}
                        className={`${rowClass} border-b border-border-color last:border-b-0 hover:bg-accent/10 transition-colors`}
                      >
                        <td className="p-4 text-center">
                          <input
                            type="checkbox"
                            checked={item.included}
                            onChange={handleItemFieldChange(item.id, 'included')}
                            className="w-5 h-5 rounded focus:ring-2 cursor-pointer transition-colors accent-primary/70"
                            aria-label={`Incluir ${item.description}`}
                          />
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="text"
                            value={item.description}
                            onChange={handleItemFieldChange(item.id, 'description')}
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
                            onChange={handleItemFieldChange(item.id, 'quantity')}
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
                            onChange={handleItemFieldChange(item.id, 'unitPrice')}
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
                            onChange={handleItemFieldChange(item.id, 'estimatedHours')}
                            className="w-20 bg-transparent text-right p-1 rounded border border-transparent hover:border-border-color/50 focus:border-accent focus:ring-0 transition"
                            disabled={!item.included}
                            aria-label={`Horas estimadas para ${item.description}`}
                          />
                        </td>
                        <td className="px-6 py-4 font-semibold text-right">
                          {formatCurrency(itemTotal)}
                        </td>
                        <td className="p-4 text-center">
                          <button
                            onClick={() => onRemoveItem(section.id, item.id)}
                            className="text-gray-400 hover:text-error p-1 rounded-full opacity-50 hover:opacity-100 transition-opacity"
                            aria-label={`Remover ${item.description}`}
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="p-3 border-t border-border-color">
                <button
                  onClick={() => onAddItem(section.id)}
                  className="w-full text-sm font-semibold text-primary hover:bg-primary/10 transition-colors py-2 rounded-md"
                >
                  + Adicionar Serviço
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  },
);
