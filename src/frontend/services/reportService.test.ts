import { describe, expect, it } from 'vitest';
import type {
  Client,
  Commission,
  Freelancer,
  MarketingActivity,
  ProfessionalExpense,
  Project,
  Proposal,
} from '../types';
import { generateReport, type ReportFilter, type ReportDataInput } from './reportService';

// ── Shared factories ──────────────────────────────────────────────────

const buildBaseData = (): ReportDataInput => ({
  projects: [],
  clients: [],
  proposals: [],
  marketingActivities: [],
  commissions: [],
  manualExpenses: [],
  freelancers: [],
});

const buildProject = (overrides: Partial<Project> = {}): Project =>
  ({
    id: 'proj_default',
    code: '#3000',
    name: 'Projeto Default',
    clientName: 'Cliente A',
    clientId: 'cli_a',
    status: 'Em Andamento',
    deadline: '2026-12-31',
    budget: 0,
    description: '',
    sections: [],
    archived: false,
    financials: {
      paymentType: 'vista',
      totalValue: 0,
      baseContractValue: 0,
      lumpSumStatus: 'Em aberto',
    },
    ...overrides,
  }) as Project;

const allTimeFilter: ReportFilter = { type: 'preset', days: 99999, startDate: '', endDate: '' };
const customFeb2026: ReportFilter = {
  type: 'custom',
  days: 0,
  startDate: '2026-02-01',
  endDate: '2026-02-28',
};

// ── Financial Metrics ─────────────────────────────────────────────────

describe('reportService.generateReport — financialMetrics', () => {
  it('calculates revenue, commissions, costs and profitability for a custom period', () => {
    // Given
    const project = buildProject({
      id: 'proj_1',
      code: '#3001',
      status: 'Concluído',
      finalizedAt: '2026-02-10',
      financials: {
        paymentType: 'vista',
        totalValue: 2000,
        baseContractValue: 2000,
        lumpSumStatus: 'Pago',
      },
    });

    const commission: Commission = {
      id: 'comm_1',
      saleDate: '2026-02-01',
      supplierId: 'sup_1',
      supplierName: 'Fornecedor A',
      clientId: 'cli_a',
      clientName: 'Cliente A',
      saleValue: 1000,
      commissionPercentage: 30,
      commissionValue: 300,
      status: 'Recebido',
      paymentDate: '2026-02-12',
    } as Commission;

    const expense: ProfessionalExpense = {
      id: 'exp_1',
      description: 'Software',
      category: 'Software e Assinaturas',
      value: 100,
      dueDate: '2026-02-08',
      status: 'Pago',
      paymentDate: '2026-02-08',
      isRecurring: false,
      source: 'Manual',
    } as ProfessionalExpense;

    const data: ReportDataInput = {
      ...buildBaseData(),
      projects: [project],
      commissions: [commission],
      manualExpenses: [expense],
      marketingActivities: [
        {
          id: 'mkt_1',
          title: 'Campanha ADS',
          status: 'Concluído',
          contentType: 'Campanha de ADS',
          dueDate: '2026-02-09',
          completionDate: '2026-02-09',
          responsibleId: 'architect',
          cost: 50,
        } as MarketingActivity,
      ],
    };

    // When
    const report = generateReport(data, customFeb2026);

    // Then
    expect(report.financialMetrics.revenueFromProjects).toBe(2000);
    expect(report.financialMetrics.revenueFromCommissions).toBe(300);
    expect(report.financialMetrics.totalCosts).toBe(150); // 100 (expense) + 50 (marketing)
    expect(report.financialMetrics.profitability).toBe(2150);
  });

  it('includes freelancer labor costs in totalCosts', () => {
    // Given
    const freelancer: Freelancer = {
      id: 'fl_1',
      name: 'Anna Freelancer',
      projects: [{ id: 'flp_1', projectName: 'Projeto X', cost: 400, date: '2026-02-15' }],
    } as Freelancer;

    // When
    const report = generateReport({ ...buildBaseData(), freelancers: [freelancer] }, customFeb2026);

    // Then
    expect(report.financialMetrics.totalCosts).toBe(400);
  });

  it('builds revenueChartData with sorted month labels for multiple finalized projects', () => {
    // Given — dois projetos concluídos em meses diferentes
    const projJan = buildProject({
      id: 'proj_jan',
      status: 'Concluído',
      finalizedAt: '2026-01-15',
      financials: {
        paymentType: 'vista',
        totalValue: 1000,
        baseContractValue: 1000,
        lumpSumStatus: 'Pago',
      },
    });
    const projFeb = buildProject({
      id: 'proj_feb',
      status: 'Concluído',
      finalizedAt: '2026-02-20',
      financials: {
        paymentType: 'vista',
        totalValue: 500,
        baseContractValue: 500,
        lumpSumStatus: 'Pago',
      },
    });

    // When
    const report = generateReport(
      { ...buildBaseData(), projects: [projJan, projFeb] },
      allTimeFilter,
    );

    // Then
    expect(report.financialMetrics.revenueChartData).toHaveLength(2);
    expect(report.financialMetrics.revenueChartData[0].value).toBe(1000); // jan before feb
    expect(report.financialMetrics.revenueChartData[1].value).toBe(500);
  });

  it('excludes commissions with status Pendente from revenue', () => {
    // Given
    const pendingComm: Commission = {
      id: 'comm_p',
      saleDate: '2026-02-01',
      supplierName: 'Sup',
      clientName: 'Cli',
      commissionValue: 200,
      status: 'Pendente',
    } as Commission;

    // When
    const report = generateReport(
      { ...buildBaseData(), commissions: [pendingComm] },
      customFeb2026,
    );

    // Then
    expect(report.financialMetrics.revenueFromCommissions).toBe(0);
  });
});

// ── Project Metrics ───────────────────────────────────────────────────

describe('reportService.generateReport — projectMetrics', () => {
  it('computes conclusionRate, inProgress and total correctly', () => {
    // Given — 2 ativos, 1 concluído no período
    const active1 = buildProject({ id: 'pa1', status: 'Em Andamento', archived: false });
    const active2 = buildProject({ id: 'pa2', status: 'Em Andamento', archived: false });
    const concluded = buildProject({
      id: 'pc1',
      status: 'Concluído',
      archived: false,
      finalizedAt: '2026-02-10',
      financials: {
        paymentType: 'vista',
        totalValue: 1000,
        baseContractValue: 1000,
        lumpSumStatus: 'Pago',
      },
    });

    // When
    const report = generateReport(
      { ...buildBaseData(), projects: [active1, active2, concluded] },
      customFeb2026,
    );

    // Then — filteredProjects = !archived, includes all statuses (active AND concluded)
    const { total, inProgress, concluded: concludedCount, conclusionRate } = report.projectMetrics;
    expect(total).toBe(3); // 2 Em Andamento + 1 Concluído (all non-archived)
    expect(inProgress).toBe(2);
    expect(concludedCount).toBe(1);
    // conclusionRate = concluded / (total + concluded) * 100 = 1 / (3 + 1) * 100 = 25%
    expect(conclusionRate).toBeCloseTo(25, 1);
  });

  it('computes averageTicket from all projects in period (including finalized)', () => {
    // Given — 1 ativo + 1 concluído no período (allProjectsInPeriod = ambos)
    const active = buildProject({
      id: 'pa',
      status: 'Em Andamento',
      archived: false,
      financials: {
        paymentType: 'vista',
        totalValue: 500,
        baseContractValue: 500,
        lumpSumStatus: 'Em aberto',
      },
    });
    const concluded = buildProject({
      id: 'pc',
      status: 'Concluído',
      archived: false,
      finalizedAt: '2026-02-05',
      financials: {
        paymentType: 'vista',
        totalValue: 1500,
        baseContractValue: 1500,
        lumpSumStatus: 'Pago',
      },
    });

    // When
    const report = generateReport(
      { ...buildBaseData(), projects: [active, concluded] },
      customFeb2026,
    );

    // Then — averageTicket = (500 + 1500) / 2
    expect(report.projectMetrics.averageTicket).toBe(1000);
    expect(report.projectMetrics.totalProjectValue).toBe(2000);
  });

  it('returns 0 for conclusionRate when there are no projects', () => {
    // When
    const report = generateReport(buildBaseData(), allTimeFilter);

    // Then
    expect(report.projectMetrics.conclusionRate).toBe(0);
    expect(report.projectMetrics.averageTicket).toBe(0);
  });

  it('excludes archived projects from filteredProjects (total count)', () => {
    // Given — 1 ativo + 1 arquivado
    const active = buildProject({ id: 'pa', status: 'Em Andamento', archived: false });
    const archived = buildProject({ id: 'parch', status: 'Em Andamento', archived: true });

    // When
    const report = generateReport(
      { ...buildBaseData(), projects: [active, archived] },
      allTimeFilter,
    );

    // Then — archived should not contribute to total
    expect(report.projectMetrics.total).toBe(1);
    expect(report.projectMetrics.inProgress).toBe(1);
  });

  it('builds projectStatusChartData with a count per status', () => {
    // Given — 2 projetos Em Andamento, 1 Concluído
    const projects = [
      buildProject({ id: 'p1', status: 'Em Andamento', archived: false }),
      buildProject({ id: 'p2', status: 'Em Andamento', archived: false }),
      buildProject({ id: 'p3', status: 'Concluído', archived: false }),
    ];

    // When
    const report = generateReport({ ...buildBaseData(), projects }, allTimeFilter);

    // Then
    const statusChart = report.projectMetrics.projectStatusChartData;
    const andamento = statusChart.find((d) => d.label === 'Em Andamento');
    const concluido = statusChart.find((d) => d.label === 'Concluído');
    expect(andamento?.value).toBe(2);
    expect(concluido?.value).toBe(1);
  });
});

// ── Acquisition Metrics ───────────────────────────────────────────────

describe('reportService.generateReport — acquisitionMetrics', () => {
  it('counts proposals in period and computes conversionRate', () => {
    // Given — 2 propostas no período, 1 convertida em projeto
    const convertedProposal = {
      id: 'prop_1',
      code: '#001',
      name: 'Proposta 1',
      date: '2026-02-05',
      status: 'Concluído',
      archived: false,
      sections: [],
      discount: 0,
      subtotal: 100,
      total: 100,
    } as Proposal;
    const pendingProposal = {
      id: 'prop_2',
      code: '#002',
      name: 'Proposta 2',
      date: '2026-02-12',
      status: 'Pendente',
      archived: false,
      sections: [],
      discount: 0,
      subtotal: 200,
      total: 200,
    } as Proposal;
    const linkedProject = buildProject({ id: 'p_conv', proposalId: 'prop_1' });

    // When
    const report = generateReport(
      {
        ...buildBaseData(),
        proposals: [convertedProposal, pendingProposal],
        projects: [linkedProject],
      },
      customFeb2026,
    );

    // Then
    expect(report.acquisitionMetrics.totalProposals).toBe(2);
    expect(report.acquisitionMetrics.convertedProposals).toBe(1);
    expect(report.acquisitionMetrics.conversionRate).toBeCloseTo(50, 1);
  });

  it('computes marketingSpend for activities in period', () => {
    // Given
    const mkt: MarketingActivity = {
      id: 'mkt_1',
      title: 'Campanha FB',
      status: 'Concluído',
      contentType: 'Campanha de ADS',
      dueDate: '2026-02-10',
      responsibleId: 'arch',
      cost: 300,
    } as MarketingActivity;

    // When
    const report = generateReport(
      { ...buildBaseData(), marketingActivities: [mkt] },
      customFeb2026,
    );

    // Then
    expect(report.acquisitionMetrics.marketingSpend).toBe(300);
  });

  it('computes CAC correctly when there are new clients and marketing spend', () => {
    // Given — 2 novos clientes registrados no mês e R$200 de spend
    const clients: Client[] = [
      {
        id: 'cli_1',
        name: 'Cliente Novo 1',
        contacts: [],
        status: 'Potencial Cliente',
        serviceInterests: [],
        address: { street: '', number: '', neighborhood: '', city: '', state: '', zip: '' },
        isFavorite: false,
        registrationDate: '2026-02-05',
        lastContactDate: '2026-02-05',
        pipelineStatus: 'Novo',
        meetings: [],
        behavioralProfile: { notes: '' },
        archived: false,
      } as Client,
      {
        id: 'cli_2',
        name: 'Cliente Novo 2',
        contacts: [],
        status: 'Potencial Cliente',
        serviceInterests: [],
        address: { street: '', number: '', neighborhood: '', city: '', state: '', zip: '' },
        isFavorite: false,
        registrationDate: '2026-02-15',
        lastContactDate: '2026-02-15',
        pipelineStatus: 'Novo',
        meetings: [],
        behavioralProfile: { notes: '' },
        archived: false,
      } as Client,
    ];

    const mkt: MarketingActivity = {
      id: 'mkt_cac',
      title: 'ADS',
      status: 'Concluído',
      contentType: 'Campanha de ADS',
      dueDate: '2026-02-08',
      responsibleId: 'arch',
      cost: 200,
    } as MarketingActivity;

    // When
    const report = generateReport(
      { ...buildBaseData(), clients, marketingActivities: [mkt] },
      customFeb2026,
    );

    // Then — cac = 200 / 2
    expect(report.acquisitionMetrics.newClientsCount).toBe(2);
    expect(report.acquisitionMetrics.marketingSpend).toBe(200);
    expect(report.acquisitionMetrics.cac).toBe(100);
  });

  it('builds leadSourceChartData grouped by client.leadSource', () => {
    // Given — 2 clientes por Indicação, 1 por Google Ads; 1 com projeto vinculado
    const clients: Client[] = [
      {
        id: 'c1',
        name: 'C1',
        leadSource: 'Indicação',
        projectLinks: [
          { projectId: 'p1', projectCode: '#1', projectName: 'P1', status: 'Em Andamento' },
        ],
        contacts: [],
        status: 'Cliente Ativo',
        serviceInterests: [],
        address: { street: '', number: '', neighborhood: '', city: '', state: '', zip: '' },
        isFavorite: false,
        registrationDate: '2025-01-01',
        lastContactDate: '2025-01-01',
        pipelineStatus: 'Novo',
        meetings: [],
        behavioralProfile: { notes: '' },
        archived: false,
      } as Client,
      {
        id: 'c2',
        name: 'C2',
        leadSource: 'Indicação',
        projectLinks: [],
        contacts: [],
        status: 'Potencial Cliente',
        serviceInterests: [],
        address: { street: '', number: '', neighborhood: '', city: '', state: '', zip: '' },
        isFavorite: false,
        registrationDate: '2025-02-01',
        lastContactDate: '2025-02-01',
        pipelineStatus: 'Novo',
        meetings: [],
        behavioralProfile: { notes: '' },
        archived: false,
      } as Client,
      {
        id: 'c3',
        name: 'C3',
        leadSource: 'Google Ads',
        projectLinks: [
          { projectId: 'p2', projectCode: '#2', projectName: 'P2', status: 'Em Andamento' },
        ],
        contacts: [],
        status: 'Cliente Ativo',
        serviceInterests: [],
        address: { street: '', number: '', neighborhood: '', city: '', state: '', zip: '' },
        isFavorite: false,
        registrationDate: '2025-03-01',
        lastContactDate: '2025-03-01',
        pipelineStatus: 'Novo',
        meetings: [],
        behavioralProfile: { notes: '' },
        archived: false,
      } as Client,
    ];

    // When
    const report = generateReport({ ...buildBaseData(), clients }, allTimeFilter);

    // Then
    const chart = report.acquisitionMetrics.leadSourceChartData;
    const indicacao = chart.find((d) => d.label === 'Indicação');
    const googleAds = chart.find((d) => d.label === 'Google Ads');
    expect(indicacao?.value).toBe(1); // only c1 has projectLinks
    expect(googleAds?.value).toBe(1);
  });

  it('returns 0 for conversionRate when no proposals in period', () => {
    // When
    const report = generateReport(buildBaseData(), customFeb2026);

    // Then
    expect(report.acquisitionMetrics.conversionRate).toBe(0);
    expect(report.acquisitionMetrics.cac).toBe(0);
  });

  it('includes all history when preset uses since-beginning sentinel (days=99999)', () => {
    // Given
    const data: ReportDataInput = {
      ...buildBaseData(),
      proposals: [
        {
          id: 'prop_old',
          code: '#4001',
          name: 'Proposta antiga',
          date: '2020-01-15',
          status: 'Pendente',
          sections: [],
          discount: 0,
          subtotal: 1000,
          total: 1000,
        } as Proposal,
      ],
      clients: [
        {
          id: 'cli_old',
          name: 'Cliente Antigo',
          contacts: [],
          status: 'Potencial Cliente',
          serviceInterests: [],
          address: {
            street: 'Rua X',
            number: '1',
            neighborhood: 'Centro',
            city: 'São Paulo',
            state: 'SP',
            zip: '01000-000',
          },
          isFavorite: false,
          registrationDate: '2020-01-10',
          lastContactDate: '2020-01-10',
          pipelineStatus: 'Contato Inicial',
          meetings: [],
          behavioralProfile: { notes: '' },
          archived: false,
        } as Client,
      ],
    };

    // When
    const report = generateReport(data, allTimeFilter);

    // Then
    expect(report.acquisitionMetrics.totalProposals).toBe(1);
    expect(report.acquisitionMetrics.newClientsCount).toBe(1);
  });
});

// ── Preset filter with N days window ─────────────────────────────────

describe('reportService.generateReport — preset filter with N days', () => {
  it('limits proposals and clients to the last 30 days window', () => {
    // Given — proposta de hoje vs. proposta de 60 dias atrás
    const today = new Date();
    const getLocalYYYYMMDD = (d: Date) => {
      const offset = d.getTimezoneOffset() * 60000;
      return new Date(d.getTime() - offset).toISOString().split('T')[0];
    };
    const sixtyDaysAgo = new Date(today);
    sixtyDaysAgo.setDate(today.getDate() - 60);

    const recentProposal = {
      id: 'prop_recent',
      code: '#R1',
      name: 'Recente',
      date: getLocalYYYYMMDD(today),
      status: 'Pendente',
      sections: [],
      discount: 0,
      subtotal: 100,
      total: 100,
    } as Proposal;
    const oldProposal = {
      id: 'prop_old',
      code: '#O1',
      name: 'Antiga',
      date: getLocalYYYYMMDD(sixtyDaysAgo),
      status: 'Pendente',
      sections: [],
      discount: 0,
      subtotal: 100,
      total: 100,
    } as Proposal;

    const last30Filter: ReportFilter = { type: 'preset', days: 30, startDate: '', endDate: '' };

    // When
    const report = generateReport(
      { ...buildBaseData(), proposals: [recentProposal, oldProposal] },
      last30Filter,
    );

    // Then — only the recent proposal falls in the last-30-days window
    expect(report.acquisitionMetrics.totalProposals).toBe(1);
  });
});
