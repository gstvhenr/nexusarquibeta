import { describe, expect, it } from 'vitest';
import type { Commission, ProfessionalExpense, Project } from '../types';
import { generateReport, type ReportFilter, type ReportDataInput } from './reportService';

const buildBaseData = (): ReportDataInput => ({
  projects: [],
  clients: [],
  proposals: [],
  marketingActivities: [],
  commissions: [],
  manualExpenses: [],
  freelancers: [],
});

describe('reportService.generateReport', () => {
  it('calculates financial metrics for custom period', () => {
    // Given
    const project = {
      id: 'proj_1',
      code: '#3001',
      name: 'Projeto Alpha',
      clientName: 'Cliente A',
      clientId: 'cli_1',
      status: 'Concluído',
      deadline: '2026-02-28',
      budget: 2000,
      description: 'Projeto de teste',
      sections: [],
      archived: false,
      finalizedAt: '2026-02-10',
      financials: {
        paymentType: 'vista',
        totalValue: 2000,
        baseContractValue: 2000,
        lumpSumStatus: 'Pago',
      },
    } as Project;

    const commission = {
      id: 'comm_1',
      saleDate: '2026-02-01',
      supplierId: 'sup_1',
      supplierName: 'Fornecedor A',
      clientId: 'cli_1',
      clientName: 'Cliente A',
      saleValue: 1000,
      commissionPercentage: 30,
      commissionValue: 300,
      status: 'Recebido',
      paymentDate: '2026-02-12',
    } as Commission;

    const expense = {
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
        },
      ],
    };

    const filter: ReportFilter = {
      type: 'custom',
      days: 0,
      startDate: '2026-02-01',
      endDate: '2026-02-28',
    };

    // When
    const report = generateReport(data, filter);

    // Then
    expect(report.financialMetrics.revenueFromProjects).toBe(2000);
    expect(report.financialMetrics.revenueFromCommissions).toBe(300);
    expect(report.financialMetrics.totalCosts).toBe(150);
    expect(report.financialMetrics.profitability).toBe(2150);
  });

  it('includes all history when preset uses since-beginning sentinel', () => {
    // Given
    const data: ReportDataInput = {
      ...buildBaseData(),
      proposals: [
        {
          id: 'prop_1',
          code: '#4001',
          name: 'Proposta antiga',
          date: '2020-01-15',
          status: 'Pendente',
          sections: [],
          discount: 0,
          subtotal: 1000,
          total: 1000,
        },
      ],
      clients: [
        {
          id: 'cli_1',
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
        },
      ],
    };

    const filter: ReportFilter = {
      type: 'preset',
      days: 99999,
      startDate: '',
      endDate: '',
    };

    // When
    const report = generateReport(data, filter);

    // Then
    expect(report.acquisitionMetrics.totalProposals).toBe(1);
    expect(report.acquisitionMetrics.newClientsCount).toBe(1);
  });
});
