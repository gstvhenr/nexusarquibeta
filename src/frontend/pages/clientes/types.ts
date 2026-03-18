import type { PaymentStatus } from '../../types';

export interface ClientesFilterState {
  search: string;
  status: string;
  paymentStatus: PaymentStatus | 'Todos';
}
