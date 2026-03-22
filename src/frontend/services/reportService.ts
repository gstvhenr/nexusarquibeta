import type {
  AgendaEvent,
  CashBoxCredit,
  CashBoxExpense,
  Client,
  Commission,
  Freelancer,
  HiredService,
  MarketingActivity,
  ProfessionalExpense,
  Product,
  Project,
  Proposal,
  Prospect,
  Quotation,
  SocialNetwork,
  Supplier,
} from '../types';
import { projectStatuses } from '../types';
import { parseDateString } from '../utils/formatters';
import { getProjectTotalContractValue } from '../utils/projectFinancials';

/** Narrowed input — only the fields generateReport actually reads. */
export interface ReportDataInput {
  projects: Project[];
  clients: Client[];
  proposals: Proposal[];
  marketingActivities: MarketingActivity[];
  commissions: Commission[];
  manualExpenses: ProfessionalExpense[];
  freelancers: Freelancer[];
  cashBoxExpenses: CashBoxExpense[];
  cashBoxCredits: CashBoxCredit[];
  agendaEvents: AgendaEvent[];
  hiredServices: HiredService[];
  prospects: Prospect[];
  socialNetworks: SocialNetwork[];
  suppliers: Supplier[];
  quotations: Quotation[];
  products: Product[];
}

export interface ReportFilter {
  type: 'preset' | 'custom';
  days: number;
  startDate: string;
  endDate: string;
}

// ─── Date Filtering Helper ──────────────────────────────────────────

function buildDateRange(filter: ReportFilter): { startDate: Date; endDate: Date } {
  const now = new Date();
  let startDate: Date;
  let endDate: Date;

  if (filter.type === 'preset') {
    endDate = new Date(now);
    startDate = new Date(now);
    if (filter.days === 99999) {
      startDate = new Date(0);
    } else {
      startDate.setDate(now.getDate() - filter.days);
    }
  } else {
    startDate = filter.startDate ? (parseDateString(filter.startDate) ?? new Date(0)) : new Date(0);
    endDate = filter.endDate ? (parseDateString(filter.endDate) ?? new Date()) : new Date();
    endDate.setHours(23, 59, 59, 999);
  }

  return { startDate, endDate };
}

function createDateFilter(startDate: Date, endDate: Date) {
  return (date: string | null | Date): boolean => {
    if (!date) return false;
    const itemDate = date instanceof Date ? date : parseDateString(date);
    if (!itemDate) return false;
    return itemDate >= startDate && itemDate <= endDate;
  };
}

// ─── Main Report Generator ──────────────────────────────────────────

/**
 * input  -> snapshot de dados da aplicação + filtro temporal.
 * output -> métricas financeiras, de projetos, clientes, marketing, suprimentos e operacional.
 *
 * Example:
 * const report = generateReport(data, filter);
 */
export const generateReport = (data: ReportDataInput, filter: ReportFilter) => {
  const {
    projects,
    clients,
    proposals,
    marketingActivities,
    commissions,
    manualExpenses,
    freelancers,
    cashBoxExpenses,
    cashBoxCredits,
    agendaEvents,
    hiredServices,
    prospects,
    suppliers,
    quotations,
    socialNetworks,
  } = data;

  const { startDate, endDate } = buildDateRange(filter);
  const filterByDate = createDateFilter(startDate, endDate);

  // ═══════════════════════════════════════════════════════════════
  // FINANCIAL METRICS
  // ═══════════════════════════════════════════════════════════════

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
      category: 'Marketing e Publicidade' as const,
      value: a.cost!,
      dueDate: a.dueDate!,
      status: (a.status === 'Concluído' ? 'Pago' : 'Pendente') as 'Pago' | 'Pendente',
      paymentDate: a.completionDate || null,
      isRecurring: false,
      source: 'Marketing' as const,
      marketingActivityId: a.id,
    }));

  const freelancerExpensesAsDebits: ProfessionalExpense[] = freelancers.flatMap((f) =>
    f.projects.map((p) => ({
      id: `fl_rep_${p.id}`,
      description: `Freelancer: ${f.name} (${p.projectName})`,
      category: 'Serviços Terceirizados' as const,
      value: p.cost,
      dueDate: p.date,
      status: 'Pago' as const,
      paymentDate: p.date,
      isRecurring: false,
      source: 'Freelancer' as const,
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

  const monthlyRevenue: Record<string, number> = {};
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

  // ═══════════════════════════════════════════════════════════════
  // PROJECT METRICS
  // ═══════════════════════════════════════════════════════════════

  const activeProjects = projects.filter((p) => !p.archived);
  const concludedProjects = projects.filter(
    (p) => p.status === 'Concluído' && p.finalizedAt && filterByDate(p.finalizedAt),
  );
  const inProgressProjects = activeProjects.filter((p) => p.status === 'Em Andamento');
  const allProjectsInPeriod = projects.filter((p) => {
    if (p.finalizedAt && filterByDate(p.finalizedAt)) return true;
    if (!p.archived) return true;
    return false;
  });

  const totalProjectsForRate = activeProjects.length + concludedProjects.length;
  const conclusionRate =
    totalProjectsForRate > 0 ? (concludedProjects.length / totalProjectsForRate) * 100 : 0;

  const projectStatusChartData = projectStatuses.map((status) => ({
    label: status,
    value: projects.filter((p) => p.status === status && !p.archived).length,
  }));

  const totalProjectValue = allProjectsInPeriod.reduce(
    (sum, p) => sum + getProjectTotalContractValue(p),
    0,
  );
  const averageTicket =
    allProjectsInPeriod.length > 0 ? totalProjectValue / allProjectsInPeriod.length : 0;

  // Task completion across all active projects
  const allTasks = activeProjects.flatMap((p) => p.sections.flatMap((s) => s.tasks));
  const completedTasks = allTasks.filter((t) => t.completed);
  const taskCompletionRate =
    allTasks.length > 0 ? (completedTasks.length / allTasks.length) * 100 : 0;

  // ═══════════════════════════════════════════════════════════════
  // CLIENT & COMMERCIAL METRICS
  // ═══════════════════════════════════════════════════════════════

  const activeClients = clients.filter((c) => !c.archived);
  const filteredClients = clients.filter((c) => filterByDate(c.registrationDate));
  const filteredProposals = proposals.filter((p) => filterByDate(p.date));

  const clientsByStatus = {
    active: activeClients.filter((c) => c.status === 'Cliente Ativo').length,
    inactive: activeClients.filter((c) => c.status === 'Cliente Desabilitado').length,
    potential: activeClients.filter((c) => c.status === 'Potencial Cliente').length,
  };

  const clientsByType = {
    pf: activeClients.filter((c) => c.clientType === 'PF').length,
    pj: activeClients.filter((c) => c.clientType === 'PJ').length,
    undefined: activeClients.filter((c) => !c.clientType).length,
  };

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
    .map(([label, d]) => ({ label, value: d.converted, total: d.total }))
    .sort((a, b) => b.value - a.value);

  // Prospects
  const activeProspects = prospects.filter((p) => !p.archived);
  const prospectsByStatus = {
    open: activeProspects.filter((p) => p.status === 'Em Aberto').length,
    converted: activeProspects.filter((p) => p.status === 'Convertido').length,
    lost: activeProspects.filter((p) => p.status === 'Perdido').length,
  };

  // ═══════════════════════════════════════════════════════════════
  // MARKETING METRICS
  // ═══════════════════════════════════════════════════════════════

  const filteredActivities = marketingActivities.filter(
    (a) => a.dueDate && filterByDate(a.dueDate),
  );

  const activitiesByStatus = {
    pending: filteredActivities.filter((a) => a.status === 'Pendente').length,
    inProgress: filteredActivities.filter((a) => a.status === 'Em Andamento').length,
    completed: filteredActivities.filter((a) => a.status === 'Concluído').length,
  };

  const contentByType: Record<string, number> = {};
  filteredActivities.forEach((a) => {
    const t = a.contentType || 'Outro';
    contentByType[t] = (contentByType[t] || 0) + 1;
  });
  const contentTypeChartData = Object.entries(contentByType)
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);

  const totalMarketingContentCount = filteredActivities.length;

  // ═══════════════════════════════════════════════════════════════
  // SUPPLY CHAIN METRICS
  // ═══════════════════════════════════════════════════════════════

  const activeSuppliers = suppliers.filter((s) => !s.archived);
  const activeQuotations = quotations.filter((q) => !q.archived);

  const quotationsByStatus = {
    open: activeQuotations.filter((q) => q.status === 'Em Aberto').length,
    accepted: activeQuotations.filter((q) => q.status === 'Aceita').length,
    rejected: activeQuotations.filter((q) => q.status === 'Rejeitada').length,
  };

  const activeFreelancers = freelancers.filter((f) => !f.archived);
  const activeHiredServices = hiredServices.filter((h) => !h.archived);

  const hiredServicesByStatus = {
    inProgress: activeHiredServices.filter((h) => h.status === 'Em Andamento').length,
    completed: activeHiredServices.filter((h) => h.status === 'Concluído').length,
    cancelled: activeHiredServices.filter((h) => h.status === 'Cancelado').length,
  };

  const totalHiredServicesCost = activeHiredServices.reduce((sum, h) => sum + h.cost, 0);

  // ═══════════════════════════════════════════════════════════════
  // OPERATIONAL METRICS
  // ═══════════════════════════════════════════════════════════════

  const now = new Date();
  const sevenDaysFromNow = new Date(now);
  sevenDaysFromNow.setDate(now.getDate() + 7);

  const upcomingDeadlines = activeProjects.filter((p) => {
    if (!p.deadline) return false;
    const deadlineDate = parseDateString(p.deadline);
    if (!deadlineDate) return false;
    return deadlineDate >= now && deadlineDate <= sevenDaysFromNow;
  }).length;

  const futureEvents = agendaEvents.filter((e) => {
    if (e.archived || e.completed) return false;
    const eventDate = parseDateString(e.date);
    if (!eventDate) return false;
    return eventDate >= now;
  });

  const eventsByType: Record<string, number> = {};
  agendaEvents
    .filter((e) => !e.archived && filterByDate(e.date))
    .forEach((e) => {
      eventsByType[e.type] = (eventsByType[e.type] || 0) + 1;
    });
  const eventTypeChartData = Object.entries(eventsByType)
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  // CashBox summary
  const periodExpenses = cashBoxExpenses
    .filter((e) => filterByDate(e.dueDate))
    .reduce((sum, e) => sum + e.value, 0);
  const periodCredits = cashBoxCredits
    .filter((c) => filterByDate(c.date))
    .reduce((sum, c) => sum + c.value, 0);

  // ═══════════════════════════════════════════════════════════════
  // RETURN
  // ═══════════════════════════════════════════════════════════════

  return {
    overviewMetrics: {
      totalRevenue: revenueFromProjects + revenueFromCommissions,
      totalCosts,
      netProfit: profitability,
      activeProjectCount: inProgressProjects.length,
      totalClientCount: activeClients.length,
      cashBoxBalance: periodCredits - periodExpenses,
    },
    financialMetrics: {
      revenueFromProjects,
      revenueFromCommissions,
      totalCosts,
      profitability,
      revenueChartData,
      periodExpenses,
      periodCredits,
    },
    projectMetrics: {
      total: activeProjects.length,
      concluded: concludedProjects.length,
      inProgress: inProgressProjects.length,
      conclusionRate,
      projectStatusChartData,
      averageTicket,
      totalProjectValue,
      taskCompletionRate,
      totalTasks: allTasks.length,
      completedTasks: completedTasks.length,
    },
    clientMetrics: {
      totalActive: activeClients.length,
      newInPeriod: newClientsCount,
      clientsByStatus,
      clientsByType,
      totalProposals,
      convertedProposals,
      conversionRate,
      marketingSpend,
      cac,
      leadSourceChartData,
      prospectsByStatus,
      totalProspects: activeProspects.length,
    },
    marketingMetrics: {
      activitiesByStatus,
      totalSpend: marketingSpend,
      totalContentCount: totalMarketingContentCount,
      contentTypeChartData,
      socialNetworks: socialNetworks.map((n) => ({
        id: n.id,
        name: n.id,
        snapshots: (n.instagramSnapshots || [])
          .sort((a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime())
          .map((s) => ({
            date: s.recordedAt,
            followers: s.followers,
          })),
      })),
    },
    supplyChainMetrics: {
      supplierCount: activeSuppliers.length,
      quotationsByStatus,
      totalQuotations: activeQuotations.length,
      freelancerCount: activeFreelancers.length,
      hiredServicesByStatus,
      totalHiredServicesCost,
      totalHiredServices: activeHiredServices.length,
    },
    operationalMetrics: {
      taskCompletionRate,
      totalTasks: allTasks.length,
      completedTasks: completedTasks.length,
      upcomingDeadlines,
      futureEventsCount: futureEvents.length,
      eventTypeChartData,
    },
  };
};
