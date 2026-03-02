import type { ContractAddendum, Project } from '../types';

const APPROVED_ADDENDUM_STATUSES: ContractAddendum['status'][] = ['Aprovado', 'Faturado'];

const toSafeNumber = (value: unknown): number => {
  if (typeof value !== 'number' || Number.isNaN(value) || !Number.isFinite(value)) {
    return 0;
  }
  return value;
};

export const getApprovedAddendumTotal = (addendums: ContractAddendum[] = []): number => {
  return addendums
    .filter((addendum) => APPROVED_ADDENDUM_STATUSES.includes(addendum.status))
    .reduce((sum, addendum) => sum + toSafeNumber(addendum.value), 0);
};

export const getProjectBaseContractValue = (
  project: Pick<Project, 'budget' | 'financials'>,
): number => {
  const explicitBase = project.financials?.baseContractValue;
  if (typeof explicitBase === 'number' && Number.isFinite(explicitBase)) {
    return Math.max(0, explicitBase);
  }

  const totalContracted = toSafeNumber(project.financials?.totalValue ?? project.budget);
  const approvedAddendums = getApprovedAddendumTotal(project.financials?.addendums || []);
  return Math.max(0, totalContracted - approvedAddendums);
};

export const getProjectTotalContractValue = (
  project: Pick<Project, 'budget' | 'financials'>,
): number => {
  const baseContractValue = getProjectBaseContractValue(project);
  const approvedAddendums = getApprovedAddendumTotal(project.financials?.addendums || []);
  return baseContractValue + approvedAddendums;
};

export const getProjectLumpSumValue = (project: Pick<Project, 'budget' | 'financials'>): number => {
  const explicitLumpSum = project.financials?.lumpSumValue;
  if (typeof explicitLumpSum === 'number' && Number.isFinite(explicitLumpSum)) {
    return Math.max(0, explicitLumpSum);
  }

  return getProjectTotalContractValue(project);
};
