import type { AppData } from './infrastructure/api';
import { projectStatuses, ProfessionalExpense } from '../types';
import { parseDateString } from '../utils/formatters';
import { getProjectTotalContractValue } from '../utils/projectFinancials';

export interface ReportFilter {
  type: 'preset' | 'custom';
  days: number;
  startDate: string;
  endDate: string;
}

/**
 * Input -> Output:
 * - input: snapshot de dados da aplicação + filtro temporal.
 * - output: métricas financeiras, de projetos e de aquisição para relatórios.
 * Example:
 * const report = generateReport(allData, filter);
 */
export const generateReport = (allData: AppData, filter: ReportFilter) => {
  const {
    projects,
    clients,
    proposals,
    marketingActivities,
    commissions,
    manualExpenses,
    freelancers,
  } = allData;

  // --- Date Filtering Logic ---
  let startDate: Date;
  let endDate: Date;
  const now = new Date();

  if (filter.type === 'preset') {
    endDate = new Date(now);
    startDate = new Date(now);
    if (filter.days === 99999) {
      // "Since beginning"
      startDate = new Date(0); // Epoch time
    } else {
      startDate.setDate(now.getDate() - filter.days);
    }
  } else {
    // 'custom'
    startDate = filter.startDate ? (parseDateString(filter.startDate) ?? new Date(0)) : new Date(0);
    endDate = filter.endDate ? (parseDateString(filter.endDate) ?? new Date()) : new Date();
    if (endDate) endDate.setHours(23, 59, 59, 999); // Ensure end date is inclusive
  }

  const filterByDate = (date: string | null | Date) => {
    if (!date) return false;
    const itemDate = date instanceof Date ? date : parseDateString(date);
    if (!itemDate) return false;
    return itemDate >= startDate && itemDate <= endDate;
  };

  const filteredProjects = projects.filter((p) => !p.archived);
  // For historical metrics, we might want archived ones too if they fall in the date range
  const allProjectsInPeriod = projects.filter((p) => {
    // Created date isn't explicitly tracked in simplified types, assuming active or finalized in period
    if (p.finalizedAt && filterByDate(p.finalizedAt)) return true;
    if (!p.archived) return true;
    return false;
  });

  const filteredProposals = proposals.filter((p) => filterByDate(p.date));
  const filteredClients = clients.filter((c) => filterByDate(c.registrationDate));

  // --- Financial Metrics ---
  const revenueFromProjects = projects
    .filter((p) => p.status === 'Concluído' && p.finalizedAt && filterByDate(p.finalizedAt))
    .reduce((sum, p) => sum + getProjectTotalContractValue(p), 0);

  const revenueFromCommissions = commissions
    .filter((c) => c.status === 'Recebido' && c.paymentDate && filterByDate(c.paymentDate))
    .reduce((sum, c) => sum + c.commissionValue, 0);

  const marketingExpensesAsDebits: ProfessionalExpense[] = marketingActivities
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

  const freelancerExpensesAsDebits: ProfessionalExpense[] = freelancers.flatMap((f) =>
    f.projects.map((p) => ({
      id: `fl_rep_${p.id}`,
      description: `Freelancer: ${f.name} (${p.projectName})`,
      category: 'Serviços Terceirizados',
      value: p.cost,
      dueDate: p.date,
      status: 'Pago',
      paymentDate: p.date,
      isRecurring: false,
      source: 'Freelancer',
      freelancerActivityId: p.id,
    })),
  );

  const allDebits = [
    ...manualExpenses,
    ...marketingExpensesAsDebits,
    ...freelancerExpensesAsDebits,
  ];

  const totalCosts = allDebits
    .filter((debit) => filterByDate(debit.dueDate))
    .reduce((sum, debit) => sum + debit.value, 0);

  const profitability = revenueFromProjects + revenueFromCommissions - totalCosts;

  const monthlyRevenue: { [key: string]: number } = {};
  projects.forEach((p) => {
    if (p.status === 'Concluído' && p.finalizedAt && filterByDate(p.finalizedAt)) {
      const date = parseDateString(p.finalizedAt)!;
      const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      monthlyRevenue[monthKey] = (monthlyRevenue[monthKey] || 0) + getProjectTotalContractValue(p);
    }
  });

  const revenueChartData = Object.keys(monthlyRevenue)
    .sort()
    .map((key) => {
      const [year, month] = key.split('-').map(Number);
      const date = new Date(year, month - 1);
      const label = `${date.toLocaleString('pt-BR', { month: 'short' })}/${date.getFullYear() % 100}`;
      return { label, value: monthlyRevenue[key] };
    });

  // --- Project Metrics ---
  const totalProjects = filteredProjects.length;
  const concludedProjects = projects.filter(
    (p) => p.status === 'Concluído' && p.finalizedAt && filterByDate(p.finalizedAt),
  ).length;
  const inProgressProjects = filteredProjects.filter((p) => p.status === 'Em Andamento').length;
  const conclusionRate =
    totalProjects + concludedProjects > 0
      ? (concludedProjects / (totalProjects + concludedProjects)) * 100
      : 0;

  const projectStatusChartData = projectStatuses.map((status) => ({
    label: status,
    value: projects.filter((p) => p.status === status && !p.archived).length, // Snapshot of current active statuses
  }));

  // New Project Metrics
  const totalProjectValue = allProjectsInPeriod.reduce(
    (sum, p) => sum + getProjectTotalContractValue(p),
    0,
  );
  const averageTicket =
    allProjectsInPeriod.length > 0 ? totalProjectValue / allProjectsInPeriod.length : 0;

  // Calculate Average Duration (only for concluded projects in period)
  const concludedInPeriod = projects.filter(
    (p) => p.status === 'Concluído' && p.finalizedAt && filterByDate(p.finalizedAt),
  );
  let totalDays = 0;
  let projectsWithDuration = 0;

  concludedInPeriod.forEach((p) => {
    // Approximation: We don't have created_at in the base type easily accessible without migration,
    // using last contact date of client or proposal date as proxy if available, or just skip for now if not reliable.
    // Assuming we rely on deadlines logic if we had start date.
    // For now, let's use a placeholder logic or if you have 'createdAt' on project add it.
    // Using 'deadline' diff if available as a proxy for "Planned Duration" vs "Actual"
    // Let's stick to Average Ticket and Total Value for now to be safe with existing data.
  });

  // --- Acquisition Metrics ---
  const totalProposals = filteredProposals.length;
  const convertedProposals = filteredProposals.filter((p) =>
    projects.some((proj) => proj.proposalId === p.id),
  ).length;
  const conversionRate = totalProposals > 0 ? (convertedProposals / totalProposals) * 100 : 0;

  const marketingSpend = marketingActivities
    .filter((a) => a.dueDate && filterByDate(a.dueDate))
    .reduce((sum, a) => sum + (a.cost || 0), 0);

  const newClientsCount = filteredClients.length;
  const cac = newClientsCount > 0 ? marketingSpend / newClientsCount : 0;

  const leadSourceConversion = clients.reduce(
    (acc, client) => {
      const source = client.leadSource || 'Não Informado';
      if (!acc[source]) acc[source] = { total: 0, converted: 0 };
      acc[source].total++;
      if (client.projectLinks && client.projectLinks.length > 0) {
        acc[source].converted++;
      }
      return acc;
    },
    {} as Record<string, { total: number; converted: number }>,
  );

  const leadSourceChartData = Object.entries(leadSourceConversion)
    .map(([label, data]) => ({ label, value: data.converted }))
    .sort((a, b) => b.value - a.value);

  return {
    financialMetrics: {
      revenueFromProjects,
      revenueFromCommissions,
      totalCosts,
      profitability,
      revenueChartData,
    },
    projectMetrics: {
      total: totalProjects,
      concluded: concludedProjects,
      inProgress: inProgressProjects,
      conclusionRate,
      projectStatusChartData,
      averageTicket,
      totalProjectValue,
    },
    acquisitionMetrics: {
      totalProposals,
      convertedProposals,
      conversionRate,
      marketingSpend,
      newClientsCount,
      cac,
      leadSourceChartData,
    },
  };
};
