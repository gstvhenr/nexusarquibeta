import React, { useMemo, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip } from 'recharts';
import { PageHeader } from '@/components/layout';
import {
  useCoreData,
  useFinanceData,
  useMarketingData,
  useSupplyChainData,
  useSystemData,
} from '@/context/DataContext';
import { formatCurrency } from '@/utils/formatters';
import { getFinancialPageData } from '@/services/financeService';
import { NAV_LINKS, EXPENSE_CATEGORY_COLORS, RECEIVABLE_SOURCE_COLORS } from '@/constants';
import { ArrowLeftIcon, Button, IconButton, KeyIcon } from '@/components/ui';
import {
  CardShell,
  SectionTitle,
  KPICard,
  MarginBar,
  HealthBar,
  EmergencyFundCard,
  DonutTooltip,
} from '@/components/finance';
import { ArrowUpCircleIcon, ArrowDownCircleIcon } from '@/components/ui';

const DEFAULT_CATEGORY_COLOR = 'hsl(var(--color-text-secondary))';
const DEFAULT_RECEIVABLE_COLOR = 'hsl(var(--color-success))';

type DonutView = 'all' | 'expenses' | 'income';

const ALL_EXPENSES_COLOR = 'hsl(var(--color-error))';
const ALL_INCOME_COLOR = 'hsl(var(--color-success))';

/** Builds a Date set to the 1st of the month offset from today. */
const getOffsetDate = (offset: number): Date => {
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() + offset);
  return d;
};

/** Contextual label for the selected month. */
const getMonthLabel = (offset: number, date: Date): string => {
  const monthName = date.toLocaleString('pt-BR', { month: 'long' });
  const year = date.getFullYear();
  if (offset === 0) return 'Mês Vigente';
  if (offset < 0) return `Consolidado de ${monthName} de ${year}`;
  return `Previsão estimada para ${monthName} de ${year}`;
};

// ═══════════════════════════════════════════════════════════════
// PAGE COMPONENT
// ═══════════════════════════════════════════════════════════════
const FinanceiroVisaoGeralPage: () => React.ReactNode = () => {
  const { projects } = useCoreData();
  const { commissions, manualExpenses, manualIncomes, cashBoxExpenses, cashBoxCredits } =
    useFinanceData();
  const { marketingActivities } = useMarketingData();
  const { freelancers } = useSupplyChainData();
  const { hiredServices } = useSystemData();

  const [donutView, setDonutView] = useState<DonutView>('expenses');
  const [monthOffset, setMonthOffset] = useState(0);

  const viewDate = useMemo(() => getOffsetDate(monthOffset), [monthOffset]);
  const monthLabel = useMemo(() => getMonthLabel(monthOffset, viewDate), [monthOffset, viewDate]);

  const financialData = useMemo(
    () =>
      getFinancialPageData(
        projects,
        commissions,
        manualExpenses,
        manualIncomes,
        marketingActivities,
        freelancers,
        hiredServices,
        viewDate,
        new Date(),
        cashBoxExpenses,
        cashBoxCredits,
      ),
    [
      projects,
      commissions,
      manualExpenses,
      manualIncomes,
      marketingActivities,
      freelancers,
      hiredServices,
      cashBoxExpenses,
      cashBoxCredits,
      viewDate,
    ],
  );

  const {
    kpis,
    expensesByCategory,
    receivablesBySource,
    receivablesHealth,
    debitsHealth,
    profitMargin,
  } = financialData.overview;

  const financeiroIcon = NAV_LINKS.find((link) => link.label === 'Financeiro')?.icon;

  const totalReceivables =
    receivablesHealth.totalOpen + receivablesHealth.totalOverdue + receivablesHealth.totalPaid;
  const totalDebits =
    debitsHealth.totalPending + debitsHealth.totalOverdue + debitsHealth.totalPaid;

  // ── Donut data (toggled between expenses and income) ──
  const expensesWithColors = useMemo(
    () =>
      expensesByCategory.map((c) => ({
        ...c,
        color: EXPENSE_CATEGORY_COLORS[c.category] || DEFAULT_CATEGORY_COLOR,
      })),
    [expensesByCategory],
  );

  const receivablesWithColors = useMemo(
    () =>
      receivablesBySource.map((c) => {
        // Try exact match first, then prefix match for "Projeto: XXX" entries
        const color =
          RECEIVABLE_SOURCE_COLORS[c.category] ||
          (c.category.startsWith('Projeto:') ? RECEIVABLE_SOURCE_COLORS['Projeto'] : null) ||
          DEFAULT_RECEIVABLE_COLOR;
        return { ...c, color };
      }),
    [receivablesBySource],
  );

  const combinedAllData = useMemo(() => {
    const totalExpenses = expensesByCategory.reduce((s, c) => s + c.value, 0);
    const totalIncome = receivablesBySource.reduce((s, c) => s + c.value, 0);
    const items: Array<{ category: string; value: number; color: string }> = [];
    if (totalExpenses > 0)
      items.push({ category: 'Despesas', value: totalExpenses, color: ALL_EXPENSES_COLOR });
    if (totalIncome > 0)
      items.push({ category: 'Recebidos', value: totalIncome, color: ALL_INCOME_COLOR });
    return items;
  }, [expensesByCategory, receivablesBySource]);

  const activeDonutData =
    donutView === 'all'
      ? combinedAllData
      : donutView === 'expenses'
        ? expensesWithColors
        : receivablesWithColors;
  const totalDonutValue = activeDonutData.reduce((s, c) => s + c.value, 0);

  return (
    <div className="animate-fade-in-up h-full flex flex-col">
      <div className="flex-1 flex flex-col px-2 pt-2 md:px-4 md:pt-4 lg:px-6 lg:pt-6 min-h-0 overflow-hidden">
        <div className="flex flex-col flex-1 min-h-0 gap-3">
          <PageHeader
            title="Visão Geral"
            subtitle={monthLabel}
            icon={financeiroIcon}
            contentGap="none"
          >
            <div className="flex items-center bg-surface border border-border-color/50 rounded-lg p-1 shadow-sm">
              <IconButton
                type="button"
                variant="default"
                size="sm"
                onClick={() => setMonthOffset((o) => o - 1)}
                className="rounded-md"
                aria-label="Mês anterior"
              >
                <ArrowLeftIcon className="w-5 h-5" />
              </IconButton>
              <div className="w-28 text-center px-2 py-1 text-sm font-semibold capitalize text-text-primary">
                {viewDate
                  .toLocaleString('pt-BR', { month: 'short', year: 'numeric' })
                  .replace(' de ', '/')}
              </div>
              <IconButton
                type="button"
                variant="default"
                size="sm"
                onClick={() => setMonthOffset((o) => o + 1)}
                className="rounded-md"
                aria-label="Próximo mês"
              >
                <ArrowLeftIcon className="w-5 h-5 rotate-180" />
              </IconButton>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setMonthOffset(0)}
              className="text-xs border border-transparent hover:border-primary/20"
            >
              Hoje
            </Button>
          </PageHeader>

          {/* ── ROW 1: KPI Cards + Margin Bar + Reserve ────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
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
            <EmergencyFundCard monthlyExpenseBaseline={kpis.despesaMensal} />
          </div>

          {/* ── ROW 2: Saúde Financeira + Valores Mensais (Donut) ── */}
          <div className="grid grid-cols-1 lg:grid-cols-[5fr_7fr] gap-3 flex-1 min-h-0">
            {/* Saúde Financeira */}
            <CardShell className="p-4 flex flex-col min-h-0 overflow-hidden">
              <SectionTitle>Saúde Financeira</SectionTitle>
              <div className="space-y-3 flex-1 min-h-0 overflow-y-auto custom-scrollbar">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-1 h-4 rounded-full bg-gradient-to-b from-success to-success/60" />
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
                <div className="border-t border-border-color/30 pt-3">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-1 h-4 rounded-full bg-gradient-to-b from-error to-error/60" />
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

            {/* Valores Mensais Donut */}
            <CardShell className="p-4 flex flex-col min-h-0 overflow-hidden">
              {/* Header: title + toggle */}
              <div className="flex items-center justify-between mb-3">
                <SectionTitle>Valores Mensais</SectionTitle>
                <div className="flex gap-1 bg-background/60 rounded-lg p-0.5">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setDonutView('all')}
                    className={`text-[11px] rounded-md transition-all duration-200
                      ${
                        donutView === 'all'
                          ? 'bg-primary/15 text-primary shadow-sm'
                          : 'text-text-secondary hover:text-text-primary hover:bg-background/80'
                      }`}
                  >
                    Todos
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setDonutView('expenses')}
                    className={`text-[11px] rounded-md transition-all duration-200
                      ${
                        donutView === 'expenses'
                          ? 'bg-error/15 text-error shadow-sm'
                          : 'text-text-secondary hover:text-text-primary hover:bg-background/80'
                      }`}
                  >
                    Despesas
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setDonutView('income')}
                    className={`text-[11px] rounded-md transition-all duration-200
                      ${
                        donutView === 'income'
                          ? 'bg-success/15 text-success shadow-sm'
                          : 'text-text-secondary hover:text-text-primary hover:bg-background/80'
                      }`}
                  >
                    Recebidos
                  </Button>
                </div>
              </div>
              {activeDonutData.length > 0 ? (
                <>
                  <div
                    className="flex justify-center relative my-1"
                    role="img"
                    aria-label={
                      donutView === 'all'
                        ? 'Gráfico de rosca mostrando despesas e receitas do mês atual'
                        : donutView === 'expenses'
                          ? 'Gráfico de rosca mostrando a distribuição de despesas por categoria no mês atual'
                          : 'Gráfico de rosca mostrando a distribuição de receitas recebidas por fonte no mês atual'
                    }
                  >
                    <PieChart width={150} height={150}>
                      <Pie
                        data={activeDonutData}
                        dataKey="value"
                        nameKey="category"
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={68}
                        paddingAngle={3}
                        stroke="none"
                        cornerRadius={4}
                      >
                        {activeDonutData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<DonutTooltip />} />
                    </PieChart>
                    {/* Center label */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="text-center">
                        <p className="text-[10px] text-text-secondary font-medium">Total</p>
                        <p className="text-sm font-bold text-text-primary tabular-nums">
                          {formatCurrency(totalDonutValue)}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar space-y-1 mt-1">
                    {activeDonutData.slice(0, 6).map((cat, i) => {
                      const pct =
                        totalDonutValue > 0
                          ? ((cat.value / totalDonutValue) * 100).toFixed(1)
                          : '0';
                      return (
                        <div
                          key={i}
                          className="flex items-center justify-between text-xs py-1.5 px-2 rounded-lg hover:bg-background/60 transition-colors cursor-default group"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className="w-2 h-2 rounded-full shrink-0 ring-2 ring-white/20"
                              style={{ backgroundColor: cat.color }} // NOSONAR
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
                    {donutView === 'all'
                      ? 'Nenhum registro financeiro neste mês.'
                      : donutView === 'expenses'
                        ? 'Nenhuma despesa registrada neste mês.'
                        : 'Nenhum recebimento registrado neste mês.'}
                  </p>
                </div>
              )}
            </CardShell>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinanceiroVisaoGeralPage;
