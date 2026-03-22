import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import { formatCurrency } from '../../utils/formatters';

// ═══════════════════════════════════════════════════════════════
// DASHBOARD SECTION — Wrapper for each category
// ═══════════════════════════════════════════════════════════════

export const DashboardSection: (props: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) => React.ReactNode = ({ title, icon, children }) => (
  <section className="mb-8 animate-fade-in-up">
    <div className="flex items-center gap-3 mb-5">
      <div className="flex items-center justify-center w-9 h-9 rounded-ui bg-primary/10 text-primary">
        {icon}
      </div>
      <h2 className="text-section-title text-text-primary">{title}</h2>
    </div>
    {children}
  </section>
);

// ═══════════════════════════════════════════════════════════════
// METRIC CARD — KPI card with value, label, and optional trend
// ═══════════════════════════════════════════════════════════════

export type MetricTrend = 'up' | 'down' | 'neutral';

const TREND_COLORS: Record<MetricTrend, string> = {
  up: 'text-emerald-600',
  down: 'text-red-600',
  neutral: 'text-text-secondary',
};

const TREND_ICONS: Record<MetricTrend, string> = {
  up: '↑',
  down: '↓',
  neutral: '→',
};

export const MetricCard: (props: {
  label: string;
  value: string | number;
  subtext?: string;
  trend?: MetricTrend;
  trendLabel?: string;
  className?: string;
  accentColor?: string;
}) => React.ReactNode = ({
  label,
  value,
  subtext,
  trend,
  trendLabel,
  className = '',
  accentColor,
}) => (
  <div
    className={`bg-surface rounded-card shadow-soft p-5 flex flex-col gap-2 transition-transform duration-150 hover:shadow-lift hover:-translate-y-0.5 ${className}`}
  >
    <p className="text-caption text-text-secondary font-semibold uppercase tracking-wider">
      {label}
    </p>
    <p
      className="text-stat font-extrabold"
      style={accentColor ? { color: accentColor } : undefined}
    >
      {value}
    </p>
    <div className="flex items-center gap-2 mt-auto">
      {trend && (
        <span className={`text-xs font-bold ${TREND_COLORS[trend]}`}>
          {TREND_ICONS[trend]} {trendLabel}
        </span>
      )}
      {subtext && <span className="text-xs text-text-muted">{subtext}</span>}
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════
// REPORT CARD — Generic card container with title
// ═══════════════════════════════════════════════════════════════

export const ReportCard: (props: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) => React.ReactNode = ({ title, children, className = '' }) => (
  <div className={`bg-surface rounded-card shadow-soft p-6 ${className}`}>
    <h3 className="text-section-title text-text-secondary mb-4 pb-3 border-b border-border-color">
      {title}
    </h3>
    {children}
  </div>
);

// ═══════════════════════════════════════════════════════════════
// PROGRESS BAR — For rates/percentages
// ═══════════════════════════════════════════════════════════════

export const ProgressBar: (props: {
  label: string;
  value: number;
  max?: number;
  color?: string;
  showPercentage?: boolean;
}) => React.ReactNode = ({
  label,
  value,
  max = 100,
  color = 'bg-primary',
  showPercentage = true,
}) => {
  const percentage = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span className="text-xs font-semibold text-text-secondary">{label}</span>
        {showPercentage && (
          <span className="text-xs font-bold text-text-primary">{percentage.toFixed(1)}%</span>
        )}
      </div>
      <div className="w-full h-2.5 bg-background rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${color}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// STAT ROW — Compact stat for inline lists
// ═══════════════════════════════════════════════════════════════

export const StatRow: (props: {
  items: { label: string; value: string | number; color?: string }[];
}) => React.ReactNode = ({ items }) => (
  <div className="flex flex-wrap gap-4">
    {items.map((item) => (
      <div key={item.label} className="flex items-center gap-2">
        {item.color && (
          <span
            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: item.color }}
          />
        )}
        <span className="text-xs text-text-secondary">{item.label}:</span>
        <span className="text-sm font-bold text-text-primary">{item.value}</span>
      </div>
    ))}
  </div>
);

// ═══════════════════════════════════════════════════════════════
// DONUT CHART — Distribution visualization
// ═══════════════════════════════════════════════════════════════

const DONUT_COLORS = [
  'hsl(var(--color-primary))',
  'hsl(var(--color-secondary))',
  'hsl(var(--color-accent))',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#06b6d4',
];

export const DonutChart: (props: {
  data: { label: string; value: number }[];
  height?: number;
}) => React.ReactNode = ({ data, height = 220 }) => {
  const filteredData = data.filter((d) => d.value > 0);

  if (filteredData.length === 0) {
    return <p className="text-center text-sm text-text-secondary py-8">Sem dados para exibir.</p>;
  }

  const total = filteredData.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="flex flex-col items-center gap-3">
      <div style={{ width: '100%', height }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={filteredData}
              cx="50%"
              cy="50%"
              innerRadius="55%"
              outerRadius="85%"
              paddingAngle={3}
              dataKey="value"
              nameKey="label"
              stroke="none"
            >
              {filteredData.map((_, index) => (
                <Cell key={index} fill={DONUT_COLORS[index % DONUT_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const entry = payload[0];
                  const pct =
                    total > 0 ? (((entry.value as number) / total) * 100).toFixed(1) : '0';
                  return (
                    <div className="bg-surface p-2 border border-border-color rounded-ui shadow-overlay text-xs">
                      <p className="font-semibold">{entry.name}</p>
                      <p className="text-primary">
                        {entry.value} ({pct}%)
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1">
        {filteredData.map((d, i) => (
          <div key={d.label} className="flex items-center gap-1.5 text-xs">
            <span
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: DONUT_COLORS[i % DONUT_COLORS.length] }}
            />
            <span className="text-text-secondary">{d.label}</span>
            <span className="font-bold text-text-primary">{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// HORIZONTAL BAR CHART — Rankings
// ═══════════════════════════════════════════════════════════════

export const HorizontalBarList: (props: {
  data: { label: string; value: number }[];
  format?: 'number' | 'currency';
  maxItems?: number;
}) => React.ReactNode = ({ data, format = 'number', maxItems = 6 }) => {
  const sliced = data.slice(0, maxItems);
  if (sliced.length === 0) {
    return <p className="text-center text-sm text-text-secondary py-6">Sem dados para exibir.</p>;
  }

  const maxValue = Math.max(...sliced.map((d) => d.value), 1);

  return (
    <div className="space-y-3">
      {sliced.map((item) => {
        const fraction = (item.value / maxValue) * 100;
        const displayValue = format === 'currency' ? formatCurrency(item.value) : item.value;
        return (
          <div key={item.label} className="space-y-1">
            <div className="flex justify-between items-center text-xs">
              <span className="text-text-secondary truncate max-w-[60%]">{item.label}</span>
              <span className="font-bold text-text-primary">{displayValue}</span>
            </div>
            <div className="w-full h-2 bg-background rounded-full overflow-hidden">
              <div
                className="h-full bg-primary/70 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${fraction}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// INTERACTIVE BAR CHART — Monthly/time series
// ═══════════════════════════════════════════════════════════════

export const InteractiveBarChart: (props: {
  data: { label: string; value: number }[];
  format: 'currency' | 'number';
}) => React.ReactNode = ({ data, format }) => {
  if (data.length === 0) {
    return (
      <p className="text-center text-sm text-text-secondary py-10">
        Dados insuficientes para exibir o gráfico.
      </p>
    );
  }

  const formatYAxisTick = (tick: number): string => {
    if (format === 'currency') {
      if (tick >= 1000) return `R$${tick / 1000}k`;
      return `R$${tick}`;
    }
    return String(tick);
  };

  return (
    <div className="w-full h-[280px]">
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--color-border-color) / 0.5)" />
          <XAxis
            dataKey="label"
            stroke="hsl(var(--color-text-secondary))"
            fontSize={11}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="hsl(var(--color-text-secondary))"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tickFormatter={formatYAxisTick}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                const val = payload[0].value as number;
                const formatted = format === 'currency' ? formatCurrency(val) : val;
                return (
                  <div className="bg-surface p-2 border border-border-color rounded-ui shadow-overlay text-xs">
                    <p className="font-semibold">{label}</p>
                    <p className="text-primary">{`Valor: ${formatted}`}</p>
                  </div>
                );
              }
              return null;
            }}
            cursor={{ fill: 'hsl(var(--color-primary) / 0.1)' }}
          />
          <Bar dataKey="value" fill="hsl(var(--color-primary))" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// SOCIAL MEDIA REPORT — Line chart and network selector
// ═══════════════════════════════════════════════════════════════

export const SocialMediaReport = ({
  networks,
}: {
  networks: {
    id: string;
    name: string;
    snapshots: { date: string; followers: number }[];
  }[];
}) => {
  const [selectedNetworkId, setSelectedNetworkId] = useState<string>(
    networks.length > 0 ? networks[0].id : '',
  );

  if (networks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-text-secondary bg-surface rounded-ui border border-border-color">
        <p className="text-sm">Nenhum dado de rede social disponível.</p>
      </div>
    );
  }

  const selectedNetwork = networks.find((n) => n.id === selectedNetworkId) || networks[0];

  return (
    <div className="flex flex-col gap-5 p-5 bg-surface rounded-ui border border-border-color shadow-soft">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-base font-semibold text-text-primary">Evolução de Seguidores</h4>
          <p className="text-sm text-text-secondary mt-1">
            Acompanhe o crescimento da sua audiência
          </p>
        </div>
        <select
          value={selectedNetworkId}
          onChange={(e) => setSelectedNetworkId(e.target.value)}
          className="text-sm bg-background border border-border-color rounded-ui px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
        >
          {networks.map((network) => (
            <option key={network.id} value={network.id}>
              {network.name}
            </option>
          ))}
        </select>
      </div>

      <div className="w-full h-[320px] mt-2">
        {selectedNetwork.snapshots.length > 0 ? (
          <ResponsiveContainer>
            <LineChart
              data={selectedNetwork.snapshots}
              margin={{ top: 10, right: 20, left: 10, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--color-border-color) / 0.5)"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                stroke="hsl(var(--color-text-secondary))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                dy={10}
              />
              <YAxis
                stroke="hsl(var(--color-text-secondary))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                dx={-10}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-surface p-3 border border-border-color rounded-ui shadow-overlay text-sm">
                        <p className="font-medium text-text-secondary mb-1">{label}</p>
                        <p className="font-semibold text-primary">
                          {new Intl.NumberFormat('pt-BR').format(payload[0].value as number)}{' '}
                          seguidores
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
                cursor={{ stroke: 'hsl(var(--color-primary) / 0.1)', strokeWidth: 2 }}
              />
              <Line
                type="monotone"
                dataKey="followers"
                stroke="hsl(var(--color-primary))"
                strokeWidth={3}
                dot={{
                  fill: 'hsl(var(--color-surface))',
                  stroke: 'hsl(var(--color-primary))',
                  strokeWidth: 2,
                  r: 4,
                }}
                activeDot={{
                  fill: 'hsl(var(--color-primary))',
                  stroke: 'hsl(var(--color-surface))',
                  strokeWidth: 2,
                  r: 6,
                }}
                animationDuration={1500}
                animationEasing="ease-out"
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-sm text-text-secondary border border-dashed border-border-color rounded-ui bg-background">
            Sem histórico para esta rede no período.
          </div>
        )}
      </div>
    </div>
  );
};
