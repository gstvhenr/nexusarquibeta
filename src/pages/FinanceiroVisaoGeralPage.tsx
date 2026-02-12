import React, { useMemo, useState, useCallback } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { PageHeader } from '../components/layout';
import { useData } from '../context/DataContext';
import { formatCurrency, formatDateDayMonth, formatYAxisTick } from '../utils/formatters';
import { getFinancialPageData } from '../services/financeService';
import { NAV_LINKS, EXPENSE_CATEGORY_COLORS } from '../constants';
import { ArrowUpCircleIcon, ArrowDownCircleIcon, KeyIcon, ChevronDownIcon } from '../components/ui';
import {
  CardShell,
  SectionTitle,
  KPICard,
  MarginBar,
  HealthBar,
  CustomTooltip,
  DonutTooltip,
} from '../components/finance';

const DEFAULT_CATEGORY_COLOR = 'hsl(0, 0%, 55%)';

// ═══════════════════════════════════════════════════════════════
// PAGE COMPONENT
// ═══════════════════════════════════════════════════════════════
const FinanceiroVisaoGeralPage: React.FC = () => {
  const { projects, commissions, manualExpenses, manualIncomes, marketingActivities, freelancers } =
    useData();
  const [chartRefDate, setChartRefDate] = useState(new Date());

  // (#7) Single temporal reference: chartRefDate for chart, same base for viewDate
  const financialData = useMemo(
    () =>
      getFinancialPageData(
        projects,
        commissions,
        manualExpenses,
        manualIncomes,
        marketingActivities,
        freelancers,
        new Date(),
        chartRefDate,
      ),
    [
      projects,
      commissions,
      manualExpenses,
      manualIncomes,
      marketingActivities,
      freelancers,
      chartRefDate,
    ],
  );

  const {
    kpis,
    cashFlowForecast,
    recentTransactions,
    expensesByCategory,
    receivablesHealth,
    debitsHealth,
    profitMargin,
  } = financialData.overview;

  const financeiroIcon = NAV_LINKS.find((link) => link.label === 'Financeiro')?.icon;

  const navigateChart = useCallback((direction: 'prev' | 'next') => {
    setChartRefDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1));
      return newDate;
    });
  }, []);

  const resetChart = useCallback(() => setChartRefDate(new Date()), []);

  const totalReceivables =
    receivablesHealth.totalOpen + receivablesHealth.totalOverdue + receivablesHealth.totalPaid;
  const totalDebits =
    debitsHealth.totalPending + debitsHealth.totalOverdue + debitsHealth.totalPaid;

  // (#5) Merge colors into data in the PRESENTATION layer
  const expensesWithColors = useMemo(
    () =>
      expensesByCategory.map((c) => ({
        ...c,
        color: EXPENSE_CATEGORY_COLORS[c.category] || DEFAULT_CATEGORY_COLOR,
      })),
    [expensesByCategory],
  );
  const totalExpenseValue = expensesWithColors.reduce((s, c) => s + c.value, 0);

  return (
    <div className="animate-fade-in-up h-full flex flex-col">
      <div className="flex-1 overflow-y-auto px-6 py-5 min-h-0">
        <div className="space-y-5">
          <PageHeader title="Visão Geral" icon={financeiroIcon} />

          {/* ── ROW 1: KPI Cards + Margin Bar ────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard
              title="Receita (Mês)"
              value={formatCurrency(kpis.receitaMensal)}
              icon={<ArrowUpCircleIcon />}
              change={kpis.receitaChange}
              variant="success"
            />
            <KPICard
              title="Despesas (Mês)"
              value={formatCurrency(kpis.despesaMensal)}
              icon={<ArrowDownCircleIcon />}
              change={kpis.despesaChange}
              variant="warning"
            />
            <KPICard
              title="Saldo (Mês)"
              value={formatCurrency(kpis.saldoMensal)}
              icon={<KeyIcon />}
              change={kpis.saldoChange}
              variant="default"
            />
            <MarginBar
              receita={kpis.receitaMensal}
              despesa={kpis.despesaMensal}
              margin={profitMargin}
            />
          </div>

          {/* ── ROW 2: Cash Flow Chart + Donut ────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Cash Flow Chart (#14: aria-label for accessibility) */}
            <CardShell className="lg:col-span-2 p-5 min-h-[380px] flex flex-col">
              <SectionTitle
                trailing={
                  <div className="flex items-center gap-4">
                    <div className="hidden sm:flex items-center gap-3 text-[11px] text-text-secondary">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-success inline-block" /> Receitas
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-error inline-block" /> Despesas
                      </span>
                    </div>
                    <div className="flex items-center bg-background/80 rounded-lg border border-border-color/50 p-0.5">
                      <button
                        onClick={() => navigateChart('prev')}
                        className="p-1.5 hover:bg-surface rounded-md text-text-secondary hover:text-primary transition-colors"
                        aria-label="Mês anterior"
                      >
                        <ChevronDownIcon className="w-3.5 h-3.5 rotate-90" />
                      </button>
                      <button
                        onClick={resetChart}
                        className="px-2.5 py-1 text-[11px] font-semibold text-text-secondary hover:text-primary transition-colors border-x border-border-color/50 mx-0.5"
                      >
                        Hoje
                      </button>
                      <button
                        onClick={() => navigateChart('next')}
                        className="p-1.5 hover:bg-surface rounded-md text-text-secondary hover:text-primary transition-colors"
                        aria-label="Próximo mês"
                      >
                        <ChevronDownIcon className="w-3.5 h-3.5 -rotate-90" />
                      </button>
                    </div>
                  </div>
                }
              >
                Fluxo de Caixa
              </SectionTitle>
              <div
                className="flex-1 -ml-2"
                role="img"
                aria-label="Gráfico de fluxo de caixa mostrando receitas e despesas ao longo de 6 meses"
              >
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart
                    data={cashFlowForecast}
                    margin={{ top: 5, right: 10, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="5%"
                          stopColor="hsl(var(--color-success))"
                          stopOpacity={0.25}
                        />
                        <stop offset="95%" stopColor="hsl(var(--color-success))" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--color-error))" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="hsl(var(--color-error))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="hsl(var(--color-border-color) / 0.2)"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="month"
                      stroke="hsl(var(--color-text-secondary))"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(val: string, i: number) =>
                        `${val}/${cashFlowForecast[i]?.year}`
                      }
                    />
                    <YAxis
                      stroke="hsl(var(--color-text-secondary))"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={formatYAxisTick}
                      width={55}
                    />
                    <Tooltip
                      content={<CustomTooltip />}
                      cursor={{ fill: 'hsl(var(--color-primary) / 0.04)' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="income"
                      name="income"
                      stroke="hsl(var(--color-success))"
                      fillOpacity={1}
                      fill="url(#colorIncome)"
                      strokeWidth={2.5}
                      activeDot={{ r: 5, strokeWidth: 2, stroke: 'hsl(var(--color-surface))' }}
                      dot={false}
                    />
                    <Area
                      type="monotone"
                      dataKey="expenses"
                      name="expenses"
                      stroke="hsl(var(--color-error))"
                      fillOpacity={1}
                      fill="url(#colorExpenses)"
                      strokeWidth={2.5}
                      activeDot={{ r: 5, strokeWidth: 2, stroke: 'hsl(var(--color-surface))' }}
                      dot={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardShell>

            {/* Expense Category Donut (#14: aria-label) */}
            <CardShell className="p-5 flex flex-col">
              <SectionTitle>Despesas por Categoria (Mês)</SectionTitle>
              {expensesWithColors.length > 0 ? (
                <>
                  <div
                    className="flex justify-center relative my-1"
                    role="img"
                    aria-label="Gráfico de rosca mostrando a distribuição de despesas por categoria no mês atual"
                  >
                    <ResponsiveContainer width={180} height={180}>
                      <PieChart>
                        <Pie
                          data={expensesWithColors}
                          dataKey="value"
                          nameKey="category"
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={82}
                          paddingAngle={3}
                          stroke="none"
                          cornerRadius={4}
                        >
                          {expensesWithColors.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip content={<DonutTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                    {/* Center label */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="text-center">
                        <p className="text-[10px] text-text-secondary font-medium">Total</p>
                        <p className="text-sm font-bold text-text-primary tabular-nums">
                          {formatCurrency(totalExpenseValue)}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1 mt-2">
                    {expensesWithColors.slice(0, 6).map((cat, i) => {
                      const pct =
                        totalExpenseValue > 0
                          ? ((cat.value / totalExpenseValue) * 100).toFixed(1)
                          : '0';
                      return (
                        <div
                          key={i}
                          className="flex items-center justify-between text-xs py-1.5 px-2 rounded-lg hover:bg-background/60 transition-colors cursor-default group"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className="w-2 h-2 rounded-full shrink-0 ring-2 ring-white/20"
                              style={{ backgroundColor: cat.color }}
                            />
                            <span className="text-text-secondary truncate group-hover:text-text-primary transition-colors">
                              {cat.category}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <span className="text-[10px] text-text-secondary tabular-nums bg-background/80 px-1.5 py-0.5 rounded-full">
                              {pct}%
                            </span>
                            <span className="font-semibold text-text-primary tabular-nums">
                              {formatCurrency(cat.value)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-text-secondary text-xs">
                    Nenhuma despesa registrada neste mês.
                  </p>
                </div>
              )}
            </CardShell>
          </div>

          {/* ── ROW 3: Financial Health + Recent Transactions ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Financial Health (#12: temporal label) */}
            <CardShell className="p-5 flex flex-col">
              <SectionTitle>Saúde Financeira (Acumulado)</SectionTitle>
              <div className="space-y-5 flex-1">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-1 h-4 rounded-full bg-gradient-to-b from-success to-emerald-400" />
                    <p className="text-xs font-semibold text-text-primary">Recebíveis</p>
                  </div>
                  <div className="space-y-3 pl-3">
                    <HealthBar
                      label="Recebidos"
                      value={receivablesHealth.totalPaid}
                      total={totalReceivables}
                      variant="success"
                    />
                    <HealthBar
                      label="Em Aberto"
                      value={receivablesHealth.totalOpen}
                      total={totalReceivables}
                      variant="warning"
                    />
                    <HealthBar
                      label="Inadimplentes"
                      value={receivablesHealth.totalOverdue}
                      total={totalReceivables}
                      variant="error"
                    />
                  </div>
                </div>
                <div className="border-t border-border-color/30 pt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-1 h-4 rounded-full bg-gradient-to-b from-error to-rose-400" />
                    <p className="text-xs font-semibold text-text-primary">Débitos</p>
                  </div>
                  <div className="space-y-3 pl-3">
                    <HealthBar
                      label="Pagos"
                      value={debitsHealth.totalPaid}
                      total={totalDebits}
                      variant="success"
                    />
                    <HealthBar
                      label="Pendentes"
                      value={debitsHealth.totalPending}
                      total={totalDebits}
                      variant="warning"
                    />
                    <HealthBar
                      label="Atrasados"
                      value={debitsHealth.totalOverdue}
                      total={totalDebits}
                      variant="error"
                    />
                  </div>
                </div>
              </div>
            </CardShell>

            {/* Recent Transactions (#1: no Record<string, unknown>, #10: normalized status, #13: aria-labels) */}
            <CardShell className="lg:col-span-2 p-5 flex flex-col">
              <SectionTitle>Últimas Movimentações</SectionTitle>
              <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
                <div className="space-y-2">
                  {recentTransactions.map((tx, idx) => (
                    <div
                      key={`${tx.id}_${idx}`}
                      className="flex items-center justify-between p-3 rounded-xl border border-transparent
                                                bg-background/40 hover:bg-background/80 hover:border-border-color/40 hover:shadow-sm
                                                transition-all duration-200 group cursor-default"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        {/* (#13) aria-label on icon container */}
                        <div
                          className={`p-2 rounded-xl shrink-0 transition-transform duration-200 group-hover:scale-110
                                                        ${tx.type === 'income' ? 'bg-success/10 text-success' : 'bg-error/10 text-error'}`}
                          role="img"
                          aria-label={tx.type === 'income' ? 'Receita' : 'Despesa'}
                        >
                          {tx.type === 'income' ? (
                            <ArrowUpCircleIcon className="w-4 h-4" />
                          ) : (
                            <ArrowDownCircleIcon className="w-4 h-4" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-xs text-text-primary truncate group-hover:text-primary transition-colors">
                            {tx.description}
                          </p>
                          <p className="text-[10px] text-text-secondary mt-0.5">
                            {formatDateDayMonth(tx.date)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0 ml-4">
                        <p
                          className={`font-bold text-sm tabular-nums ${tx.type === 'income' ? 'text-success' : 'text-error'}`}
                        >
                          {tx.type === 'income' ? '+' : '−'} {formatCurrency(tx.value)}
                        </p>
                        <span
                          className={`text-[9px] font-medium px-2 py-0.5 rounded-full inline-block mt-0.5
                                                    ${tx.status === 'Liquidado' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}
                        >
                          {tx.status}
                        </span>
                      </div>
                    </div>
                  ))}
                  {recentTransactions.length === 0 && (
                    <div className="text-center py-12">
                      <p className="text-text-secondary text-sm">Nenhuma movimentação recente.</p>
                      <p className="text-text-secondary/60 text-xs mt-1">
                        As transações aparecerão aqui assim que forem registradas.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardShell>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinanceiroVisaoGeralPage;
