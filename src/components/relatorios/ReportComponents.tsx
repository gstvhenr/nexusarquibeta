import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '../../utils/formatters';

export const ReportCard: (props: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) => React.ReactNode = ({ title, children, className = '' }) => (
  <div className={`bg-surface rounded-xl shadow-soft p-6 ${className}`}>
    <h3 className="font-serif text-xl font-bold text-secondary mb-4 pb-4 border-b border-border-color">
      {title}
    </h3>
    {children}
  </div>
);

export const StatCard: (props: {
  label: string;
  value: string | number;
  subtext?: string;
}) => React.ReactNode = ({ label, value, subtext }) => (
  <div>
    <p className="text-3xl font-bold font-sans text-primary">{value}</p>
    <p className="font-semibold text-text-secondary text-sm">{label}</p>
    {subtext && <p className="text-xs text-text-secondary mt-1 opacity-70">{subtext}</p>}
  </div>
);

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

  const CustomTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean;
    payload?: { value: number }[];
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      const value = payload[0].value;
      const formattedValue = format === 'currency' ? formatCurrency(value) : value;
      return (
        <div className="bg-surface p-2 border border-border-color rounded-md shadow-lg">
          <p className="font-semibold">{label}</p>
          <p className="text-primary">{`Valor: ${formattedValue}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--color-border-color) / 0.5)" />
          <XAxis
            dataKey="label"
            stroke="hsl(var(--color-text-secondary))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="hsl(var(--color-text-secondary))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={formatYAxisTick}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: 'hsl(var(--color-primary) / 0.1)' }}
          />
          <Bar dataKey="value" fill="hsl(var(--color-primary))" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
