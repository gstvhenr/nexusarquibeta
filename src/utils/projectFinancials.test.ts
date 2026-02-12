import { describe, expect, it } from 'vitest';
import type { ContractAddendum, Project } from '../types';
import {
  getApprovedAddendumTotal,
  getProjectBaseContractValue,
  getProjectLumpSumValue,
  getProjectTotalContractValue,
} from './projectFinancials';

const addendum = (status: ContractAddendum['status'], value: number): ContractAddendum =>
  ({ status, value }) as ContractAddendum;

describe('projectFinancials', () => {
  it('sums only approved/factured addendums', () => {
    const total = getApprovedAddendumTotal([
      addendum('Aprovado', 1000),
      addendum('Faturado', 500),
      addendum('Pendente', 300),
    ]);

    expect(total).toBe(1500);
  });

  it('calculates base and total values', () => {
    const project = {
      budget: 10000,
      financials: {
        totalValue: 12000,
        addendums: [addendum('Aprovado', 2000)],
      },
    } as unknown as Pick<Project, 'budget' | 'financials'>;

    expect(getProjectBaseContractValue(project)).toBe(10000);
    expect(getProjectTotalContractValue(project)).toBe(12000);
  });

  it('prefers explicit lump sum value when present', () => {
    const project = {
      budget: 5000,
      financials: {
        lumpSumValue: 7500,
      },
    } as unknown as Pick<Project, 'budget' | 'financials'>;

    expect(getProjectLumpSumValue(project)).toBe(7500);
  });
});
