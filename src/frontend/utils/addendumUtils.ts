import { v4 as uuidv4 } from 'uuid';
import { getApprovedAddendumTotal, getProjectBaseContractValue } from './projectFinancials';
import type { AddendumAuditEntry, ContractAddendum, Project } from '../types';

export function appendAddendumAuditEntry(
  projectState: Project,
  entry: Omit<AddendumAuditEntry, 'id' | 'timestamp'>,
): Project {
  const nextEntry: AddendumAuditEntry = {
    ...entry,
    id: uuidv4(),
    timestamp: new Date().toISOString(),
    actor: entry.actor || 'Sistema',
  };

  return {
    ...projectState,
    financials: {
      ...projectState.financials,
      addendumAuditTrail: [nextEntry, ...(projectState.financials.addendumAuditTrail || [])],
    },
  };
}

export function recalculateProjectTotals(
  projectState: Project,
  nextAddendums: ContractAddendum[],
): Project {
  const approvedNextTotal = getApprovedAddendumTotal(nextAddendums);
  const baseContractValue = getProjectBaseContractValue(projectState);
  const recalculatedTotal = baseContractValue + approvedNextTotal;

  return {
    ...projectState,
    budget: baseContractValue,
    financials: {
      ...projectState.financials,
      baseContractValue,
      totalValue: recalculatedTotal,
      lumpSumValue:
        projectState.financials.paymentType === 'vista'
          ? recalculatedTotal
          : projectState.financials.lumpSumValue,
      addendums: nextAddendums,
    },
  };
}
