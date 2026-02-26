import type { CommissionStatus } from '../../types';

export type CommissionFilters = {
  status: 'Todos' | CommissionStatus;
  supplierId: string;
};
