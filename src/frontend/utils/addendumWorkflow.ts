import type { ContractAddendumStatus } from '../types';

const STATUS_TRANSITIONS: Record<ContractAddendumStatus, ContractAddendumStatus[]> = {
  Rascunho: ['Pendente', 'Rejeitado'],
  Pendente: ['Rascunho', 'Aprovado', 'Rejeitado'],
  Aprovado: ['Faturado', 'Rejeitado'],
  Faturado: [],
  Rejeitado: ['Rascunho'],
};

export const getAllowedAddendumStatusTransitions = (
  status: ContractAddendumStatus,
): ContractAddendumStatus[] => {
  return STATUS_TRANSITIONS[status];
};

export const canTransitionAddendumStatus = (
  fromStatus: ContractAddendumStatus,
  toStatus: ContractAddendumStatus,
): boolean => {
  if (fromStatus === toStatus) return true;
  return STATUS_TRANSITIONS[fromStatus].includes(toStatus);
};

export const getStatusSelectionOptions = (
  status: ContractAddendumStatus,
): ContractAddendumStatus[] => {
  return [status, ...getAllowedAddendumStatusTransitions(status)];
};
