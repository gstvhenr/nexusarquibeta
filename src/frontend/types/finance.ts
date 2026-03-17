// --- Finance Types (Commissions, Expenses, Payments) ---
export type PaymentMethod =
  | 'Dinheiro em espécie'
  | 'Cartão de débito'
  | 'Cartão de crédito'
  | 'PIX'
  | 'Transferência bancária'
  | 'Boleto bancário'
  | 'Pagamento Online'
  | 'Cheque';
export const paymentMethods: PaymentMethod[] = [
  'Dinheiro em espécie',
  'Cartão de débito',
  'Cartão de crédito',
  'PIX',
  'Transferência bancária',
  'Boleto bancário',
  'Pagamento Online',
  'Cheque',
];

export type CommissionStatus = 'Previsão' | 'Pendente' | 'Recebido';
export const commissionStatuses: CommissionStatus[] = ['Previsão', 'Pendente', 'Recebido'];

export type ProfessionalExpenseStatus = 'Pendente' | 'Pago';

export type ProfessionalExpenseCategory =
  | 'Software e Assinaturas'
  | 'Impostos (DAS, INSS)'
  | 'Anuidade de Conselho (CAU/CREA)'
  | 'Marketing e Publicidade'
  | 'Material de Escritório'
  | 'Contabilidade'
  | 'Cursos e Especializações'
  | 'Transporte e Viagens'
  | 'Aluguel de Escritório'
  | 'Serviços Terceirizados'
  | 'Reembolso a Cliente'
  | 'Outros';

export interface Commission {
  id: string;
  saleDate: string;
  supplierId: string;
  supplierName: string;
  clientId: string;
  clientName: string;
  saleValue: number;
  commissionPercentage: number;
  commissionValue: number;
  status: CommissionStatus;
  paymentDate?: string | null;
  notes?: string;
  expectedPaymentDate?: string | null;
  quotationId?: string;
  archived?: boolean;
}

export interface ProfessionalExpense {
  id: string;
  description: string;
  category: ProfessionalExpenseCategory | 'Outros';
  value: number;
  dueDate: string;
  status: ProfessionalExpenseStatus;
  paymentDate?: string | null;
  isRecurring: boolean;
  source: 'Manual' | 'Marketing' | 'Freelancer';
  marketingActivityId?: string;
  freelancerActivityId?: string;
  recurringId?: string;
  recurringEndDate?: string | null;
}

export interface ManualIncome {
  id: string;
  description: string;
  category: 'Consultoria' | 'Reembolso' | 'Rendimento' | 'Outros';
  value: number;
  date: string; // Receipt date or expected date
  status: 'Recebido' | 'Pendente';
  paymentMethod?: PaymentMethod;
  notes?: string;
}

export interface EmergencyFund {
  currentValue: number;
  targetValue?: number;
}
