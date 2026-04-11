import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip } from 'recharts';
import type { Project, ProjectFinancials } from '@/types';
import { formatCurrency } from '@/utils/formatters';
import { CardShell, SectionTitle, HealthBar, DonutTooltip } from '@/components/finance';

const EXPENSES_COLOR = 'hsl(var(--color-error))'; // Vermelho para custos/aditivos desc
const ADDENDUM_INC_COLOR = 'hsl(var(--color-info))'; // Azul para aditivos extras
const BASE_VALUE_COLOR = 'hsl(var(--color-primary))'; // Roxo padrão
const DEFAULT_COLOR = 'hsl(var(--color-text-secondary))';

interface ProjectFinanceOverviewSubTabProps {
  project: Project;
  financials: ProjectFinancials;
  baseContractValue: number;
  totalValue: number;
  totalPaid: number;
  totalToPay: number;
  totalAddendums: number;
}

export const ProjectFinanceOverviewSubTab: React.FC<ProjectFinanceOverviewSubTabProps> = ({
  financials,
  baseContractValue,
  totalValue,
  totalPaid,
  totalToPay,
  totalAddendums,
}) => {
  // Prepara dados do Donut (Receita vs Aditivos vs Impostos Estimados, etc)
  const donutData = useMemo(() => {
    const data: Array<{ category: string; value: number; color: string }> = [];

    if (baseContractValue > 0) {
      data.push({
        category: 'Valor Base',
        value: baseContractValue,
        color: BASE_VALUE_COLOR,
      });
    }

    if (totalAddendums > 0) {
      data.push({
        category: 'Aditivos (Acréscimos)',
        value: totalAddendums,
        color: ADDENDUM_INC_COLOR,
      });
    } else if (totalAddendums < 0) {
      // Se for negativo é desconto na receita, plotamos separadamente como "Descontos Concedidos"
      data.push({
        category: 'Descontos Concedidos',
        value: Math.abs(totalAddendums),
        color: EXPENSES_COLOR,
      });
    }

    // Se houverem custos de serviços adicionais/freelancers fixos, poderiamos plotar (Custo Direto).
    // Por enquanto, seguimos o escopo direto do contrato.

    // Se contrato for zero
    if (data.length === 0) {
      data.push({ category: 'Sem Valores', value: 1, color: DEFAULT_COLOR });
    }

    return data;
  }, [baseContractValue, totalAddendums]);

  const totalDonutValue = donutData.reduce(
    (acc, r) => acc + (r.category !== 'Sem Valores' ? r.value : 0),
    0,
  );

  // Define as parcelas para o HealthBar se for parcelado
  const isParcelado = financials.paymentType === 'parcelado';
  const installments = financials.installments || [];

  const paidCount = installments.filter((i) => i.paid).length;
  const overdueCount = installments.filter(
    (i) => !i.paid && i.dueDate < new Date().toISOString().split('T')[0],
  ).length;
  const openCount = installments.filter(
    (i) => !i.paid && i.dueDate >= new Date().toISOString().split('T')[0],
  ).length;

  const totalInstallmentsCount = installments.length;

  return (
    <div className="space-y-6 animate-fade-in-up mt-4">
      <div className="grid grid-cols-1 lg:grid-cols-[5fr_7fr] gap-4">
        {/* Bloco 1: Saúde Financeira de Quitação */}
        <CardShell className="p-5 flex flex-col h-full items-start w-full">
          <SectionTitle>Status de Quitação</SectionTitle>
          <div className="w-full mt-4 space-y-4">
            {isParcelado ? (
              <>
                <HealthBar
                  label={`Parcelas Pagas (${paidCount}/${totalInstallmentsCount})`}
                  value={totalPaid}
                  total={totalValue}
                  variant="success"
                />
                <HealthBar
                  label={`A Vencer (${openCount}/${totalInstallmentsCount})`}
                  value={installments
                    .filter((i) => !i.paid && i.dueDate >= new Date().toISOString().split('T')[0])
                    .reduce((a, b) => a + b.value, 0)}
                  total={totalValue}
                  variant="warning"
                />
                {overdueCount > 0 && (
                  <HealthBar
                    label={`Em Atraso (${overdueCount}/${totalInstallmentsCount})`}
                    value={installments
                      .filter((i) => !i.paid && i.dueDate < new Date().toISOString().split('T')[0])
                      .reduce((a, b) => a + b.value, 0)}
                    total={totalValue}
                    variant="error"
                  />
                )}
              </>
            ) : (
              <>
                <HealthBar
                  label="Valor Quitado à Vista"
                  value={totalPaid}
                  total={totalValue}
                  variant="success"
                />
                <HealthBar
                  label="Pendente à Vista"
                  value={totalToPay}
                  total={totalValue}
                  variant="warning"
                />
              </>
            )}
          </div>
        </CardShell>

        {/* Bloco 2: Distribuição do Contrato (Donut) */}
        <CardShell className="p-5 flex flex-col h-full w-full">
          <SectionTitle>Composição de Receita</SectionTitle>
          <div className="flex flex-col sm:flex-row items-center gap-6 mt-4 w-full h-full">
            <div className="relative">
              <PieChart width={160} height={160}>
                <Pie
                  data={donutData}
                  dataKey="value"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                  stroke="none"
                  cornerRadius={4}
                >
                  {donutData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<DonutTooltip />} wrapperStyle={{ zIndex: 10 }} />
              </PieChart>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-center">
                <div>
                  <p className="text-[10px] text-text-secondary font-medium">Total</p>
                  <p className="text-sm font-bold tabular-nums text-secondary">
                    {formatCurrency(totalValue)}
                  </p>
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="flex flex-col gap-2 flex-1">
              {donutData.map((cat, i) => {
                if (cat.category === 'Sem Valores') return null;
                const pct =
                  totalDonutValue > 0 ? ((cat.value / totalDonutValue) * 100).toFixed(1) : '0';
                return (
                  <div key={i} className="flex items-center gap-2 text-xs py-1">
                    <div
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="text-text-secondary flex-1">{cat.category}</span>
                    <span className="font-semibold text-text-primary tabular-nums">
                      {formatCurrency(cat.value)}
                    </span>
                    <span className="text-[10px] text-text-secondary tabular-nums min-w-[32px] text-right">
                      {pct}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </CardShell>
      </div>
    </div>
  );
};
