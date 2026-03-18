import React, { useState } from 'react';
import type { BudgetSection, BudgetItem, BillingMethod } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { Button, ChevronDownIcon, IconButton, Input, Select, TrashIcon } from '../ui';
import { BudgetItemRow } from './BudgetItemRow';

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
        <header className="p-5">
          <div className="flex flex-wrap gap-4 justify-between items-start">
            <div className="flex items-center gap-3 flex-grow min-w-[200px]">
              <div
                className="cursor-pointer shrink-0"
                onClick={() => setIsExpanded(!isExpanded)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setIsExpanded(!isExpanded);
                  }
                }}
                role="button"
                tabIndex={0}
                aria-label={isExpanded ? 'Recolher seção' : 'Expandir seção'}
              >
                <ChevronDownIcon
                  className={`w-6 h-6 text-text-secondary transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                />
              </div>
              <input
                id={`budget-section-title-${section.id}`}
                type="text"
                value={section.title}
                onChange={(e) => {
                  e.stopPropagation();
                  onSectionChange(section.id, 'title', e.target.value);
                }}
                className="font-serif text-2xl font-semibold text-secondary bg-transparent border-0 border-b-2 border-transparent focus:ring-0 focus:border-accent transition-all w-full p-1 -ml-1"
                placeholder="Nome da Seção"
                aria-label="Nome da seção"
              />
            </div>

            <div className="flex items-center gap-4">
              <div
                className="flex items-center gap-4 cursor-pointer"
                onClick={() => setIsExpanded(!isExpanded)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setIsExpanded(!isExpanded);
                  }
                }}
                role="button"
                tabIndex={0}
                aria-label={isExpanded ? 'Recolher seção' : 'Expandir seção'}
              >
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
              </div>
              <IconButton
                variant="danger"
                size="sm"
                onClick={() => onRemoveSection(section.id)}
                aria-label="Remover seção"
              >
                <TrashIcon className="w-5 h-5" />
              </IconButton>
            </div>
          </div>
          {isExpanded && (
            <div className="mt-4 pt-4 border-t border-border-color/50 flex flex-wrap items-end gap-3">
              <p className="text-sm font-semibold text-text-secondary w-full">
                Configurações da Seção
              </p>
              <div className="w-24">
                <Select
                  label="Unidade Padrão"
                  value={section.unit}
                  onChange={(e) => onSectionChange(section.id, 'unit', e.target.value)}
                  options={[
                    { value: 'un', label: 'un' },
                    { value: 'm²', label: 'm²' },
                    { value: 'h', label: 'h' },
                    { value: 'vb', label: 'vb' },
                  ]}
                  size="sm"
                  aria-label="Unidade padrão"
                />
              </div>
              <div className="w-60">
                <Select
                  label="Método de Cobrança"
                  value={section.billing.method}
                  onChange={(e) => onSectionChange(section.id, 'billingMethod', e.target.value)}
                  options={Object.entries(billingMethodLabels).map(([key, label]) => ({
                    value: key,
                    label,
                  }))}
                  size="sm"
                  aria-label="Método de cobrança"
                />
              </div>
              <div className="w-28">
                <span className="text-xs font-medium text-text-secondary">
                  {getBillingValueLabel(section.billing.method)}
                </span>
                <Input
                  type="number"
                  value={section.billing.value || ''}
                  onChange={(e) => onSectionChange(section.id, 'billingValue', e.target.value)}
                  className="text-right font-semibold"
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
                  {section.items.map((item, index) => (
                    <BudgetItemRow
                      key={item.id}
                      item={item}
                      index={index}
                      sectionId={section.id}
                      sectionUnit={section.unit}
                      useProfitPercentage={useProfitPercentage}
                      billingValue={section.billing.value}
                      onFieldChange={handleItemFieldChange}
                      onRemoveItem={onRemoveItem}
                    />
                  ))}
                </tbody>
              </table>
              <div className="p-3 border-t border-border-color">
                <Button
                  variant="ghost"
                  onClick={() => onAddItem(section.id)}
                  className="w-full text-primary"
                >
                  + Adicionar Serviço
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  },
);
