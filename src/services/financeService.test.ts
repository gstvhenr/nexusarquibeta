import { describe, expect, it } from 'vitest';
import type {
  Freelancer,
  ManualIncome,
  MarketingActivity,
  ProfessionalExpense,
  Project,
  Commission,
} from '../types';
import { getFinancialPageData } from './financeService';

describe('financeService.getFinancialPageData', () => {
  it('computes monthly totals from manual income and expense', () => {
    const now = new Date();
    const date = now.toISOString().split('T')[0];

    const projects = [] as Project[];
    const commissions = [] as Commission[];
    const manualExpenses = [
      {
        id: 'e1',
        description: 'Software',
        category: 'Ferramentas',
        value: 200,
        dueDate: date,
        status: 'Pendente',
        paymentDate: null,
        isRecurring: false,
        source: 'Manual',
      },
    ] as unknown as ProfessionalExpense[];
    const manualIncomes = [
      {
        id: 'i1',
        description: 'Consultoria',
        category: 'Serviços',
        value: 1000,
        date,
        status: 'Recebido',
      },
    ] as unknown as ManualIncome[];

    const marketingActivities = [] as MarketingActivity[];
    const freelancers = [] as Freelancer[];

    const result = getFinancialPageData(
      projects,
      commissions,
      manualExpenses,
      manualIncomes,
      marketingActivities,
      freelancers,
      now,
      now,
    );

    expect(result.monthlyReceivables).toHaveLength(1);
    expect(result.monthlyDebits).toHaveLength(1);
    expect(result.overview.kpis.receitaMensal).toBe(1000);
    expect(result.overview.kpis.despesaMensal).toBe(200);
    expect(result.overview.kpis.saldoMensal).toBe(800);
  });
});
