import { describe, expect, it } from 'vitest';
import type { Project } from '../types';
import { calculateProjectFinancialSummary } from './clientFinancialSummaryService';

const buildProject = (overrides: Partial<Project> = {}): Project =>
  ({
    id: 'proj_1',
    code: '#5001',
    name: 'Projeto Teste',
    clientName: 'Cliente Teste',
    clientId: 'cli_1',
    status: 'Em Andamento',
    deadline: '2099-12-31',
    budget: 1000,
    description: 'Projeto para testes',
    sections: [],
    financials: {
      paymentType: 'vista',
      lumpSumValue: 1000,
      lumpSumStatus: 'Em aberto',
      lumpSumDueDate: '2099-12-31',
    },
    ...overrides,
  }) as Project;

describe('clientFinancialSummaryService.calculateProjectFinancialSummary', () => {
  it('returns zeroed status when project has no financials', () => {
    // Given
    const project = buildProject({ financials: undefined });

    // When
    const summary = calculateProjectFinancialSummary(project);

    // Then
    expect(summary.totalValue).toBe(1000);
    expect(summary.paid).toBe(0);
    expect(summary.pending).toBe(0);
    expect(summary.overdue).toBe(0);
  });

  it('marks vista payment as paid when lump sum is settled', () => {
    // Given
    const project = buildProject({
      budget: 2500,
      financials: {
        paymentType: 'vista',
        lumpSumValue: 2500,
        lumpSumStatus: 'Pago',
        lumpSumDueDate: '2099-12-31',
      },
    });

    // When
    const summary = calculateProjectFinancialSummary(project);

    // Then
    expect(summary.totalValue).toBe(2500);
    expect(summary.paid).toBe(2500);
    expect(summary.pending).toBe(0);
    expect(summary.overdue).toBe(0);
  });

  it('marks vista payment as overdue when due date is in the past', () => {
    // Given
    const project = buildProject({
      budget: 1800,
      financials: {
        paymentType: 'vista',
        lumpSumValue: 1800,
        lumpSumStatus: 'Em aberto',
        lumpSumDueDate: '2000-01-01',
      },
    });

    // When
    const summary = calculateProjectFinancialSummary(project);

    // Then
    expect(summary.totalValue).toBe(1800);
    expect(summary.paid).toBe(0);
    expect(summary.pending).toBe(0);
    expect(summary.overdue).toBe(1800);
  });

  it('splits parcelado installments between paid, pending and overdue', () => {
    // Given
    const project = buildProject({
      budget: 1800,
      financials: {
        paymentType: 'parcelado',
        installments: [
          {
            id: 'inst_1',
            number: 1,
            value: 600,
            dueDate: '2000-01-01',
            paid: false,
            paymentDate: null,
          },
          {
            id: 'inst_2',
            number: 2,
            value: 700,
            dueDate: '2999-01-01',
            paid: false,
            paymentDate: null,
          },
          {
            id: 'inst_3',
            number: 3,
            value: 500,
            dueDate: '2099-01-01',
            paid: true,
            paymentDate: '2099-01-02',
          },
        ],
      },
    });

    // When
    const summary = calculateProjectFinancialSummary(project);

    // Then
    expect(summary.totalValue).toBe(1800);
    expect(summary.paid).toBe(500);
    expect(summary.pending).toBe(700);
    expect(summary.overdue).toBe(600);
  });
});
