import type { PaymentStatus } from '../../types';

export type DataModalTab = 'export' | 'import';

export type ExportMode = 'selected' | 'all';

export type ExportStatusFilter = 'active' | 'archived' | 'both';

export interface ClientesFilterState {
  search: string;
  status: string;
  paymentStatus: PaymentStatus | 'Todos';
}
