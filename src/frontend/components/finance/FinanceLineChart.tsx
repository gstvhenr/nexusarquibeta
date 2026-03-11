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
import { XIcon } from '../ui';
import { CardShell } from './CardShell';
import { SectionTitle } from './SectionTitle';

type FinanceLineChartProps = {
  title?: string;
  dataSeries: SeriesPoint[];
  period: PeriodSelection;
  filters: FinanceLineChartFilters;
  onPeriodChange: (period: PeriodSelection) => void;
  onFilterChange: (filters: Filters) => void;
  isLoading?: boolean;
  emptyMessage?: string;
  lineColorClassName?: string;
  lineLabel?: string;
  comparisonSeries?: {
    data: SeriesPoint[];
    label: string;
    colorClassName: string;
  };
  seriesModeControl?: {
    value: string;
    options: Array<{ value: string; label: string }>;
    onChange: (value: string) => void;
    ariaLabel?: string;
  };
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
  emptyMessage,
  lineColorClassName = 'hsl(var(--color-success))',
  lineLabel = 'Total',
  comparisonSeries,
  seriesModeControl,
}) => {
  const showYearField = period.mode === 'YEAR';
  const fieldGroupClass = 'flex min-w-0 flex-col gap-1';
  const fieldLabelClass = 'block text-xs leading-4 text-text-secondary';
  const inputClass =
    'h-11 w-full rounded-xl border border-border-color bg-background px-3 text-sm text-text-primary shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/30';
  const actionButtonClass =
    'inline-flex h-11 w-11 items-center justify-center rounded-xl border border-border-color/90 bg-background text-text-secondary shadow-sm transition-all duration-200 hover:border-primary/20 hover:bg-surface hover:text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30 active:translate-y-px';
  const modeButtonClass =
    'relative z-10 flex h-full min-w-0 items-center justify-center rounded-xl px-3 text-[11px] font-semibold transition-colors duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] focus:outline-none focus:ring-2 focus:ring-primary/30 sm:text-xs';
  const lineColor = resolveCssVarColor(lineColorClassName);
  const comparisonLineColor = comparisonSeries
    ? resolveCssVarColor(comparisonSeries.colorClassName)
    : null;
  const axisColor = resolveCssVarColor('hsl(var(--color-text-secondary))');
  const gridColor = resolveCssVarColor('hsl(var(--color-border-color) / 0.25)');
  const hasTitle = Boolean(title?.trim());
  const filtersGridClassName = showYearField
    ? 'grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-[minmax(0,1.8fr)_minmax(0,1.1fr)_minmax(0,0.75fr)_minmax(0,0.95fr)_minmax(0,1fr)_minmax(0,1.3fr)_3.5rem]'
    : 'grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-[minmax(0,1.8fr)_minmax(0,1.1fr)_minmax(0,0.95fr)_minmax(0,1fr)_minmax(0,1.3fr)_3.5rem]';
  const chartData = React.useMemo(() => {
    const primaryByLabel = new Map(dataSeries.map((point) => [point.label, point.value]));
    const comparisonByLabel = new Map(
      comparisonSeries?.data.map((point) => [point.label, point.value]) ?? [],
    );
    const labels = Array.from(
      new Set([...primaryByLabel.keys(), ...(comparisonSeries ? comparisonByLabel.keys() : [])]),
    ).sort((left, right) => left.localeCompare(right));

    return labels.map((label) => ({
      label,
      primaryValue: primaryByLabel.get(label) ?? 0,
      secondaryValue: comparisonSeries ? (comparisonByLabel.get(label) ?? 0) : undefined,
    }));
  }, [comparisonSeries, dataSeries]);
  const hasNonZeroValue = chartData.some(
    (point) => (point.primaryValue ?? 0) > 0 || (point.secondaryValue ?? 0) > 0,
  );
  const showEmptyState = !hasNonZeroValue && Boolean(emptyMessage?.trim());
  const legendItems = [
    { label: lineLabel, color: lineColor },
    ...(comparisonSeries
      ? [
          {
            label: comparisonSeries.label,
            color: comparisonLineColor ?? lineColor,
          },
        ]
      : []),
  ];
  const loadingIndicator = isLoading ? (
    <span className="animate-pulse text-xs text-text-secondary">Atualizando...</span>
  ) : null;
  const movementOptionCount = seriesModeControl?.options.length ?? 0;
  const activeMovementIndex =
    seriesModeControl?.options.findIndex((option) => option.value === seriesModeControl.value) ??
    -1;
  const movementIndicatorStyle =
    seriesModeControl && movementOptionCount > 0 && activeMovementIndex >= 0
      ? {
          width: `calc((100% - 0.5rem - ${(movementOptionCount - 1) * 0.25}rem) / ${movementOptionCount})`,
          transform: `translateX(calc(${activeMovementIndex * 100}% + ${activeMovementIndex * 0.25}rem))`,
        }
      : undefined;

  const handlePeriodModeChange = (mode: PeriodSelection['mode']) => {
    if (mode === 'YEAR') {
      onPeriodChange({ mode: 'YEAR', year: period.year ?? new Date().getFullYear() });
      return;
    }
    onPeriodChange({ mode });
  };

  return (
    <CardShell className="flex h-full min-h-0 flex-col gap-4 p-5">
      {hasTitle ? (
        <SectionTitle trailing={loadingIndicator}>{title}</SectionTitle>
      ) : loadingIndicator ? (
        <div className="flex items-center justify-end">{loadingIndicator}</div>
      ) : null}

      <div className={filtersGridClassName}>
        {seriesModeControl ? (
          <div className={fieldGroupClass}>
            <span id="field-movimentacao-label" className={fieldLabelClass}>
              Movimentação
            </span>
            <div
              className="relative grid h-11 w-full min-w-0 grid-cols-3 items-center gap-1 rounded-2xl border border-border-color bg-background/70 p-1 shadow-sm"
              role="group"
              aria-labelledby="field-movimentacao-label"
              aria-label={seriesModeControl.ariaLabel ?? 'Filtro por movimentação'}
            >
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-y-1 left-1 rounded-xl bg-primary shadow-soft transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform"
                style={movementIndicatorStyle}
              />
              {seriesModeControl.options.map((option) => {
                const isActive = option.value === seriesModeControl.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => seriesModeControl.onChange(option.value)}
                    aria-pressed={isActive}
                    className={`${modeButtonClass} ${
                      isActive
                        ? 'text-primary-content'
                        : 'text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}
        <div className={fieldGroupClass}>
          <label htmlFor="field-periodo" className={fieldLabelClass}>
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
          <div className={fieldGroupClass}>
            <label htmlFor="field-ano" className={fieldLabelClass}>
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

        <div className={fieldGroupClass}>
          <label htmlFor="field-origem" className={fieldLabelClass}>
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

        <div className={fieldGroupClass}>
          <label htmlFor="field-categoria" className={fieldLabelClass}>
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

        <div className={fieldGroupClass}>
          <label htmlFor="field-item" className={fieldLabelClass}>
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

        <div className={fieldGroupClass}>
          <span className={fieldLabelClass}>Ações</span>
          <div className="flex h-11 items-center xl:justify-center">
            <button
              type="button"
              onClick={() => onFilterChange({})}
              className={actionButtonClass}
              aria-label="Limpar filtros"
              title="Limpar filtros"
            >
              <XIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="min-h-[220px] flex-1 sm:min-h-[240px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 12, right: 12, left: 0, bottom: 6 }}>
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
              formatter={(value, name) => [formatCurrency(Number(value)), name]}
              labelFormatter={(label) => formatMonthLabel(String(label))}
            />
            <Line
              type="monotone"
              dataKey="primaryValue"
              stroke={lineColor}
              strokeWidth={2.5}
              dot={{ r: 2, strokeWidth: 0, fill: lineColor }}
              activeDot={{ r: 5 }}
              name={lineLabel}
            />
            {comparisonSeries ? (
              <Line
                type="monotone"
                dataKey="secondaryValue"
                stroke={comparisonLineColor ?? lineColor}
                strokeWidth={2.5}
                dot={{ r: 2, strokeWidth: 0, fill: comparisonLineColor ?? lineColor }}
                activeDot={{ r: 5 }}
                name={comparisonSeries.label}
              />
            ) : null}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {legendItems.length > 0 ? (
        <div className="flex items-center justify-center gap-4 pt-1">
          {legendItems.map((item) => (
            <span
              key={item.label}
              className="inline-flex items-center gap-1.5 text-[11px] font-medium text-text-secondary"
            >
              <span
                className="inline-block h-2 w-2 rounded-full opacity-80"
                style={{ backgroundColor: item.color }}
              />
              {item.label}
            </span>
          ))}
        </div>
      ) : null}

      {showEmptyState && (
        <div className="rounded-xl border border-dashed border-border-color bg-background/40 px-4 py-3">
          <p className="text-sm text-text-secondary text-center">{emptyMessage}</p>
        </div>
      )}
    </CardShell>
  );
};
