import type {
  Installment,
  Project,
  Commission,
  ProfessionalExpense,
  MarketingActivity,
  Freelancer,
  ManualIncome,
  FinancialReceivable,
  FinancialDebit,
  RecentTransaction,
  TransactionStatus,
} from '../types';
import { parseDateString } from '../utils/formatters';
import { getProjectLumpSumValue, getProjectTotalContractValue } from '../utils/projectFinancials';

// ── Unified date-filtering utility (#6) ─────────────────────────────
/** Returns true if `dateStr` falls within the same year+month as `targetDate`. */
const isInMonth = (dateStr: string | null, targetDate: Date): boolean => {
  const date = parseDateString(dateStr);
  if (!date) return false;
  return (
    date.getFullYear() === targetDate.getFullYear() && date.getMonth() === targetDate.getMonth()
  );
};

// ── Monthly totals helper (#3 — uses Pick for structural clarity) ───
const getMonthlyTotals = (
  receivables: Pick<FinancialReceivable, 'dueDate' | 'value'>[],
  debits: Pick<FinancialDebit, 'dueDate' | 'value'>[],
  targetDate: Date,
) => {
  const receita = receivables
    .filter((r) => isInMonth(r.dueDate, targetDate))
    .reduce((sum, r) => sum + r.value, 0);
  const despesa = debits
    .filter((d) => isInMonth(d.dueDate, targetDate))
    .reduce((sum, d) => sum + d.value, 0);

  return { receita, despesa, saldo: receita - despesa };
};

// ── Status normalization helper (#10) ───────────────────────────────
/** Maps raw domain statuses to the unified TransactionStatus for display. */
const normalizeStatus = (rawStatus: string): TransactionStatus => {
  if (rawStatus === 'Pago' || rawStatus === 'Recebido') return 'Liquidado';
  if (rawStatus === 'Vencido') return 'Vencido';
  return 'Em Aberto';
};

/**
 * Input -> Output:
 * - input: fontes financeiras (projetos, comissões, despesas/receitas manuais, marketing, freelancers) + mês de visualização.
 * - output: visão financeira consolidada (`overview`, `monthlyReceivables`, `monthlyDebits`).
 * Example:
 * const data = getFinancialPageData(projects, commissions, expenses, incomes, marketing, freelancers, viewDate);
 */
export const getFinancialPageData = (
  projects: Project[],
  commissions: Commission[],
  manualExpenses: ProfessionalExpense[],
  manualIncomes: ManualIncome[],
  marketingActivities: MarketingActivity[],
  freelancers: Freelancer[],
  viewDate: Date,
  chartReferenceDate: Date = new Date(),
) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const allReceivables: FinancialReceivable[] = [];

  // 1. Project Incomes
  projects.forEach((p) => {
    if (p.status === 'Cancelado') return;

    const totalRemuneration = p.remuneration || 0;
    const totalBudget = getProjectTotalContractValue(p) || 1;

    if (p.financials) {
      const processPayment = (basePayment: Omit<Installment, 'remuneration'> & { id: string }) => {
        const dueDate = parseDateString(basePayment.dueDate);
        let status: 'Pago' | 'Vencido' | 'Em Aberto' = 'Em Aberto';
        if (basePayment.paid) {
          status = 'Pago';
        } else if (dueDate && dueDate < today) {
          status = 'Vencido';
        }
        const remuneration =
          totalBudget > 0 ? (basePayment.value / totalBudget) * totalRemuneration : 0;
        return { ...basePayment, remuneration, status };
      };

      if (p.financials.paymentType === 'vista' && p.financials.lumpSumDueDate) {
        allReceivables.push({
          ...processPayment({
            id: `lump_${p.id}`,
            number: 1,
            value: getProjectLumpSumValue(p),
            dueDate: p.financials.lumpSumDueDate,
            paid: p.financials.lumpSumStatus === 'Pago',
            paymentDate: p.financials.lumpSumPaymentDate || null,
          }),
          projectId: p.id,
          projectCode: p.code,
          clientName: p.clientName,
          clientId: p.clientId,
          description: `Pagamento Único: ${p.name}`,
          source: 'Project',
        });
      } else if (p.financials.paymentType === 'parcelado' && p.financials.installments) {
        p.financials.installments.forEach((inst) => {
          allReceivables.push({
            ...processPayment(inst),
            projectId: p.id,
            projectCode: p.code,
            clientName: p.clientName,
            clientId: p.clientId,
            description: `Parcela ${inst.number}/${p.financials.numberOfInstallments}: ${p.name}`,
            source: 'Project',
          });
        });
      }
    }
  });

  // 2. Commissions
  commissions.forEach((c) => {
    const expectedDate = c.expectedPaymentDate ?? null;
    allReceivables.push({
      id: `comm_${c.id}`,
      number: 1,
      value: c.commissionValue,
      dueDate: expectedDate || c.saleDate,
      paid: c.status === 'Recebido',
      paymentDate: c.paymentDate || null,
      remuneration: c.commissionValue,
      status:
        c.status === 'Recebido'
          ? 'Pago'
          : parseDateString(expectedDate) && parseDateString(expectedDate)! < today
            ? 'Vencido'
            : 'Em Aberto',
      projectId: '',
      projectCode: '',
      clientName: c.clientName,
      clientId: c.clientId,
      description: `Comissão: ${c.supplierName}`,
      source: 'Commission',
    });
  });

  // 3. Manual Incomes
  manualIncomes.forEach((inc) => {
    allReceivables.push({
      id: inc.id,
      number: 1,
      value: inc.value,
      dueDate: inc.date,
      paid: inc.status === 'Recebido',
      paymentDate: inc.status === 'Recebido' ? inc.date : null,
      remuneration: inc.value,
      status:
        inc.status === 'Recebido'
          ? 'Pago'
          : parseDateString(inc.date) && parseDateString(inc.date)! < today
            ? 'Vencido'
            : 'Em Aberto',
      projectId: '',
      projectCode: '',
      clientName: 'Avulso',
      clientId: '',
      description: inc.description,
      source: 'Manual',
      category: inc.category,
    });
  });

  const marketingExpenses: ProfessionalExpense[] = marketingActivities
    .filter((a) => a.cost && a.cost > 0 && a.dueDate)
    .map((a) => ({
      id: `mkt_${a.id}`,
      description: `Marketing: ${a.title}`,
      category: 'Marketing e Publicidade',
      value: a.cost!,
      dueDate: a.dueDate!,
      status: a.status === 'Concluído' ? 'Pago' : 'Pendente',
      paymentDate: a.completionDate || null,
      isRecurring: false,
      source: 'Marketing',
      marketingActivityId: a.id,
    }));

  const freelancerExpenses: ProfessionalExpense[] = [];

  // (#9) allDebits typed explicitly as FinancialDebit[]
  const allDebits: FinancialDebit[] = [
    ...manualExpenses,
    ...marketingExpenses,
    ...freelancerExpenses,
  ]
    .map((d) => {
      let status: 'Pago' | 'Vencido' | 'Pendente' = d.status;
      const dueDate = parseDateString(d.dueDate);
      if (d.status === 'Pendente' && dueDate && dueDate < today) {
        status = 'Vencido';
      }
      return {
        id: d.id,
        description: d.description,
        category: d.category,
        value: d.value,
        dueDate: d.dueDate,
        status,
        paymentDate: d.paymentDate,
        isRecurring: d.isRecurring,
        source: d.source,
        marketingActivityId: d.marketingActivityId,
        freelancerActivityId: d.freelancerActivityId,
      };
    })
    .sort(
      (a, b) =>
        (parseDateString(a.dueDate)?.getTime() ?? 0) - (parseDateString(b.dueDate)?.getTime() ?? 0),
    );

  // --- Current Month Calculations (For KPIs) --- (#6: uses unified isInMonth)
  const monthlyReceivables = allReceivables.filter((r) => isInMonth(r.dueDate, viewDate));
  const monthlyDebits = allDebits.filter((d) => isInMonth(d.dueDate, viewDate));

  // (#9) Explicit saldo property — no getter
  const receita = monthlyReceivables.reduce((sum, r) => sum + r.value, 0);
  const despesa = monthlyDebits.reduce((sum, d) => sum + d.value, 0);
  const currentMonthTotals = { receita, despesa, saldo: receita - despesa };

  // --- Previous Month Calculations for KPI comparison ---
  const prevMonthDate = new Date(viewDate);
  prevMonthDate.setDate(1);
  prevMonthDate.setMonth(viewDate.getMonth() - 1);
  const prevMonthReceivables = allReceivables.filter((r) => isInMonth(r.dueDate, prevMonthDate));
  const prevMonthDebits = allDebits.filter((d) => isInMonth(d.dueDate, prevMonthDate));

  // (#9) Explicit saldo property — no getter
  const prevReceita = prevMonthReceivables.reduce((sum, r) => sum + r.value, 0);
  const prevDespesa = prevMonthDebits.reduce((sum, d) => sum + d.value, 0);
  const prevMonthTotals = {
    receita: prevReceita,
    despesa: prevDespesa,
    saldo: prevReceita - prevDespesa,
  };

  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  // --- Overview Data ---
  const totalInadimplencia = allReceivables
    .filter((r) => r.status === 'Vencido')
    .reduce((sum, r) => sum + r.value, 0);
  const totalDebitosAtrasados = allDebits
    .filter((d) => d.status === 'Vencido')
    .reduce((sum, d) => sum + d.value, 0);

  // --- Cash Flow Forecast (Dynamic based on chartReferenceDate) ---
  const cashFlowForecast = Array.from({ length: 6 }, (_, i) => {
    const forecastDate = new Date(chartReferenceDate);
    forecastDate.setDate(1);
    forecastDate.setMonth(chartReferenceDate.getMonth() + i);

    const totals = getMonthlyTotals(allReceivables, allDebits, forecastDate);
    return {
      month: forecastDate.toLocaleString('pt-BR', { month: 'short' }),
      year: forecastDate.getFullYear().toString().slice(-2),
      income: totals.receita,
      expenses: totals.despesa,
    };
  });

  // --- Recent Transactions (#1: Properly typed as RecentTransaction[]) ---
  const recentTransactions: RecentTransaction[] = [
    ...allReceivables.map((r) => ({
      id: r.id,
      type: 'income' as const,
      date: r.dueDate as string | null,
      description: r.description,
      value: r.value,
      status: normalizeStatus(r.status),
    })),
    ...allDebits.map((d) => ({
      id: d.id,
      type: 'expense' as const,
      date: d.dueDate as string | null,
      description: d.description,
      value: d.value,
      status: normalizeStatus(d.status),
    })),
  ]
    .sort((a, b) => {
      const dateA = parseDateString(a.date)?.getTime() || 0;
      const dateB = parseDateString(b.date)?.getTime() || 0;
      return dateB - dateA;
    })
    .slice(0, 8);

  // --- Expenses by Category (#5: returns data only, NO colors; #11: filtered by month) ---
  const categoryMap = new Map<string, number>();
  monthlyDebits.forEach((d) => {
    const cat = d.category || 'Outros';
    categoryMap.set(cat, (categoryMap.get(cat) || 0) + d.value);
  });
  const expensesByCategory = Array.from(categoryMap.entries())
    .map(([category, value]) => ({ category, value }))
    .sort((a, b) => b.value - a.value);

  // --- Receivables & Debits Health ---
  // NOTE: Health metrics use LIFETIME data (all months), not just current month.
  // This is intentional — the UI labels this section as "(Acumulado)".
  const receivablesHealth = {
    totalOpen: allReceivables
      .filter((r) => r.status === 'Em Aberto')
      .reduce((s, r) => s + r.value, 0),
    totalOverdue: totalInadimplencia,
    totalPaid: allReceivables.filter((r) => r.status === 'Pago').reduce((s, r) => s + r.value, 0),
  };
  const debitsHealth = {
    totalPending: allDebits.filter((d) => d.status === 'Pendente').reduce((s, d) => s + d.value, 0),
    totalOverdue: totalDebitosAtrasados,
    totalPaid: allDebits.filter((d) => d.status === 'Pago').reduce((s, d) => s + d.value, 0),
  };

  // --- Profit Margin ---
  const profitMargin =
    currentMonthTotals.receita > 0
      ? (currentMonthTotals.saldo / currentMonthTotals.receita) * 100
      : 0;

  const overview = {
    kpis: {
      receitaMensal: currentMonthTotals.receita,
      despesaMensal: currentMonthTotals.despesa,
      saldoMensal: currentMonthTotals.saldo,
      totalAtrasado: totalInadimplencia,
      totalDebitosAtrasados,
      receitaChange: calculateChange(currentMonthTotals.receita, prevMonthTotals.receita),
      despesaChange: calculateChange(currentMonthTotals.despesa, prevMonthTotals.despesa),
      saldoChange: calculateChange(currentMonthTotals.saldo, prevMonthTotals.saldo),
    },
    cashFlowForecast,
    recentTransactions,
    expensesByCategory,
    receivablesHealth,
    debitsHealth,
    profitMargin,
  };

  return {
    overview,
    monthlyReceivables,
    monthlyDebits,
  };
};
