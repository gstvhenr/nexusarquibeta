import { describe, expect, it } from 'vitest';
import type { Project } from '../types';
import { calculateProjectProgress, getFinancialOverview } from './dashboardService';

describe('dashboardService.calculateProjectProgress', () => {
  it('returns correct progress percentage', () => {
    const project = {
      sections: [
        {
          tasks: [{ completed: true }, { completed: false }, { completed: true }],
        },
      ],
    } as unknown as Project;

    const { progress, completedCount, totalCount } = calculateProjectProgress(project);

    expect(totalCount).toBe(3);
    expect(completedCount).toBe(2);
    expect(progress).toBeCloseTo(66.666, 2);
  });
});

describe('dashboardService.getFinancialOverview', () => {
  it('splits overdue and upcoming values for open payments', () => {
    const overdueProject = {
      budget: 1000,
      archived: false,
      financials: {
        paymentType: 'vista',
        lumpSumStatus: 'Em aberto',
        lumpSumDueDate: '2000-01-01',
      },
    } as unknown as Project;

    const upcomingDate = new Date();
    upcomingDate.setDate(upcomingDate.getDate() + 3);

    const upcomingProject = {
      budget: 500,
      archived: false,
      financials: {
        paymentType: 'vista',
        lumpSumStatus: 'Em aberto',
        lumpSumDueDate: upcomingDate.toISOString().split('T')[0],
      },
    } as unknown as Project;

    const summary = getFinancialOverview([overdueProject, upcomingProject]);

    expect(summary.overdue).toBe(1000);
    expect(summary.upcoming).toBe(500);
  });
});
