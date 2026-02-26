import React from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type {
  CashBoxOrigin,
  Filters,
  FinanceLineChartFilters,
  PeriodSelection,
  SeriesPoint,
} from '../../types';
import { formatCurrency, formatYAxisTick } from '../../utils/formatters';
import { CardShell } from './CardShell';
import { SectionTitle } from './SectionTitle';

type FinanceLineChartProps = {
  title: string;
  dataSeries: SeriesPoint[];
  period: PeriodSelection;
  filters: FinanceLineChartFilters;
  onPeriodChange: (period: PeriodSelection) => void;
  onFilterChange: (filters: Filters) => void;
  isLoading?: boolean;
  emptyMessage?: string;
  lineColorClassName?: string;
};

const PERIOD_OPTIONS: Array<{ value: PeriodSelection['mode']; label: string }> = [
  { value: 'LAST_12_MONTHS', label: 'Últimos 12 meses' },
  { value: 'QUARTER', label: 'Trimestral' },
  { value: 'SEMESTER', label: 'Semestral' },
  { value: 'YEAR', label: 'Ano completo' },
];

const formatMonthLabel = (label: string): string => {
  const [year, month] = label.split('-');
  const date = new Date(Number(year), Number(month) - 1, 1);
  return date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
};

const normalizeOrigin = (value: string): CashBoxOrigin | undefined => {
  if (value === 'Profissional' || value === 'Pessoal') return value;
  return undefined;
};

const resolveCssVarColor = (value: string): string => {
  if (typeof window === 'undefined') return value;

  return value.replace(/var\((--[^)\s]+)\)/g, (_, cssVarName: string) => {
    const resolvedValue = window
      .getComputedStyle(document.documentElement)
      .getPropertyValue(cssVarName);
    return resolvedValue.trim() || `var(${cssVarName})`;
  });
};

export const FinanceLineChart: (props: FinanceLineChartProps) => React.ReactNode = ({
  title,
  dataSeries,
  period,
  filters,
  onPeriodChange,
  onFilterChange,
  isLoading = false,
  emptyMessage = 'Nenhum dado encontrado para o período e filtros selecionados.',
  lineColorClassName = 'hsl(var(--color-success))',
}) => {
  const hasNonZeroValue = dataSeries.some((point) => point.value > 0);
  const showYearField = period.mode === 'YEAR';
  const inputClass =
    'w-full bg-background px-3 py-2 rounded-lg border border-border-color text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30';
  const actionButtonClass =
    'w-full bg-background px-3 py-2 rounded-lg border border-border-color text-sm font-semibold text-text-secondary hover:text-text-primary hover:bg-surface focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors';
  const lineColor = resolveCssVarColor(lineColorClassName);
  const axisColor = resolveCssVarColor('hsl(var(--color-text-secondary))');
  const gridColor = resolveCssVarColor('hsl(var(--color-border-color) / 0.25)');

  const handlePeriodModeChange = (mode: PeriodSelection['mode']) => {
    if (mode === 'YEAR') {
      onPeriodChange({ mode: 'YEAR', year: period.year ?? new Date().getFullYear() });
      return;
    }
    onPeriodChange({ mode });
  };

  return (
    <CardShell className="p-5 min-h-[540px] flex flex-col gap-2">
      <SectionTitle
        trailing={
          isLoading ? (
            <span className="text-xs text-text-secondary animate-pulse">Atualizando...</span>
          ) : null
        }
      >
        {title}
      </SectionTitle>

      <div
        className={`grid grid-cols-1 gap-2 ${showYearField ? 'lg:grid-cols-7' : 'lg:grid-cols-6'}`}
      >
        <div>
          <label htmlFor="field-periodo" className="block text-xs text-text-secondary mb-0.5">
            Período
          </label>
          <select
            id="field-periodo"
            className={inputClass}
            value={period.mode}
            onChange={(event) =>
              handlePeriodModeChange(event.target.value as PeriodSelection['mode'])
            }
            aria-label="Período do gráfico"
          >
            {PERIOD_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {showYearField && (
          <div>
            <label htmlFor="field-ano" className="block text-xs text-text-secondary mb-0.5">
              Ano
            </label>
            <input
              id="field-ano"
              type="number"
              min={2000}
              max={2100}
              className={inputClass}
              value={period.year ?? new Date().getFullYear()}
              onChange={(event) =>
                onPeriodChange({
                  mode: 'YEAR',
                  year: Number(event.target.value) || new Date().getFullYear(),
                })
              }
              aria-label="Ano"
            />
          </div>
        )}

        <div>
          <label htmlFor="field-origem" className="block text-xs text-text-secondary mb-0.5">
            Origem
          </label>
          <select
            id="field-origem"
            className={inputClass}
            value={filters.values.origin || ''}
            onChange={(event) =>
              onFilterChange({
                ...filters.values,
                origin: normalizeOrigin(event.target.value),
              })
            }
            aria-label="Filtro por origem"
          >
            <option value="">Todos</option>
            {filters.options.origins.map((origin) => (
              <option key={origin} value={origin}>
                {origin}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="field-categoria" className="block text-xs text-text-secondary mb-0.5">
            Categoria
          </label>
          <select
            id="field-categoria"
            className={inputClass}
            value={filters.values.category || ''}
            onChange={(event) =>
              onFilterChange({
                ...filters.values,
                category: event.target.value || undefined,
                item: undefined,
              })
            }
            aria-label="Filtro por categoria"
          >
            <option value="">Todos</option>
            {filters.options.categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="field-item" className="block text-xs text-text-secondary mb-0.5">
            Item
          </label>
          <select
            id="field-item"
            className={inputClass}
            value={filters.values.item || ''}
            onChange={(event) =>
              onFilterChange({
                ...filters.values,
                item: event.target.value || undefined,
              })
            }
            aria-label="Filtro por item"
          >
            <option value="">Todos</option>
            {filters.options.items.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div>
          <span className="block text-xs text-text-secondary mb-0.5">Ações</span>
          <button type="button" onClick={() => onFilterChange({})} className={actionButtonClass}>
            Limpar filtros
          </button>
        </div>
      </div>

      <div className="w-full h-[350px] md:h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={dataSeries} margin={{ top: 12, right: 12, left: 0, bottom: 6 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              fontSize={11}
              stroke={axisColor}
              tickFormatter={formatMonthLabel}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              fontSize={11}
              stroke={axisColor}
              width={64}
              domain={[0, (dataMax: number) => (dataMax > 0 ? Math.ceil(dataMax * 1.1) : 1)]}
              tickFormatter={formatYAxisTick}
            />
            <Tooltip
              formatter={(value) => formatCurrency(Number(value))}
              labelFormatter={(label) => formatMonthLabel(String(label))}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke={lineColor}
              strokeWidth={2.5}
              dot={{ r: 2, strokeWidth: 0, fill: lineColor }}
              activeDot={{ r: 5 }}
              name="Total"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {!hasNonZeroValue && (
        <div className="rounded-xl border border-dashed border-border-color bg-background/40 px-4 py-3">
          <p className="text-sm text-text-secondary text-center">{emptyMessage}</p>
        </div>
      )}
    </CardShell>
  );
};
