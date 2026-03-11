import type { Commission, Project, ProjectFinancials, Proposal } from '../types';
import type { FinancialReceivable, FinancialDebit } from '../types/financial-views';
import type { DocumentFolder, DocumentFile } from '../types/document';
import type { CashBoxExpense } from '../types/cashBox';

/**
 * Input -> Output:
 * - input: partial overrides for Project fields.
 * - output: a fully typed Project with sensible test defaults.
 * Example:
 * const project = createTestProject({ budget: 5000 });
 */
export const createTestProject = (overrides: Partial<Project> = {}): Project => ({
  id: 'test-project-1',
  code: 'PRJ-001',
  name: 'Projeto Teste',
  clientName: 'Cliente Teste',
  clientId: 'client-1',
  status: 'Em Andamento',
  deadline: null,
  budget: 0,
  description: '',
  sections: [],
  financials: { paymentType: 'vista' },
  ...overrides,
});

/**
 * Input -> Output:
 * - input: partial overrides for ProjectFinancials fields.
 * - output: a fully typed ProjectFinancials with sensible test defaults.
 * Example:
 * const financials = createTestFinancials({ paymentType: 'parcelado' });
 */
export const createTestFinancials = (
  overrides: Partial<ProjectFinancials> = {},
): ProjectFinancials => ({
  paymentType: 'vista',
  ...overrides,
});

/**
 * Input -> Output:
 * - input: partial overrides for Commission fields.
 * - output: a fully typed Commission with sensible test defaults.
 * Example:
 * const commission = createTestCommission({ status: 'Recebido' });
 */
export const createTestCommission = (overrides: Partial<Commission> = {}): Commission => ({
  id: 'test-commission-1',
  saleDate: '2026-01-01',
  supplierId: 'supplier-1',
  supplierName: 'Fornecedor Teste',
  clientId: 'client-1',
  clientName: 'Cliente Teste',
  saleValue: 1000,
  commissionPercentage: 10,
  commissionValue: 100,
  status: 'Pendente',
  ...overrides,
});

/**
 * Input -> Output:
 * - input: partial overrides for FinancialReceivable fields.
 * - output: a fully typed FinancialReceivable with sensible test defaults.
 * Example:
 * const receivable = createTestReceivable({ value: 5000, status: 'Pago' });
 */
export const createTestReceivable = (
  overrides: Partial<FinancialReceivable> = {},
): FinancialReceivable => ({
  id: 'test-receivable-1',
  number: 1,
  value: 1000,
  dueDate: '2026-03-15',
  paid: false,
  paymentDate: null,
  projectId: 'project-1',
  projectCode: 'PRJ-001',
  clientName: 'Cliente Teste',
  clientId: 'client-1',
  description: 'Parcela Teste',
  status: 'Em Aberto',
  source: 'Project',
  ...overrides,
});

/**
 * Input -> Output:
 * - input: partial overrides for FinancialDebit fields.
 * - output: a fully typed FinancialDebit with sensible test defaults.
 * Example:
 * const debit = createTestDebit({ value: 200, status: 'Pago' });
 */
export const createTestDebit = (overrides: Partial<FinancialDebit> = {}): FinancialDebit => ({
  id: 'test-debit-1',
  description: 'Despesa Teste',
  category: 'Operacional',
  value: 500,
  dueDate: '2026-03-20',
  status: 'Pendente',
  paymentDate: null,
  isRecurring: false,
  source: 'Manual',
  ...overrides,
});

/**
 * Input -> Output:
 * - input: partial overrides for DocumentFolder fields.
 * - output: a fully typed DocumentFolder with sensible test defaults.
 * Example:
 * const folder = createTestDocumentFolder({ name: 'Plantas' });
 */
export const createTestDocumentFolder = (
  overrides: Partial<DocumentFolder> = {},
): DocumentFolder => ({
  id: 'test-folder-1',
  name: 'Pasta Teste',
  type: 'folder',
  children: [],
  dateAdded: '2026-01-01T00:00:00.000Z',
  dateModified: '2026-01-01T00:00:00.000Z',
  ...overrides,
});

/**
 * Input -> Output:
 * - input: partial overrides for DocumentFile fields.
 * - output: a fully typed DocumentFile with sensible test defaults.
 * Example:
 * const file = createTestDocumentFile({ name: 'planta.pdf' });
 */
export const createTestDocumentFile = (overrides: Partial<DocumentFile> = {}): DocumentFile => ({
  id: 'test-file-1',
  name: 'arquivo-teste.pdf',
  type: 'file',
  sources: [
    {
      id: 'src-1',
      type: 'upload',
      content: 'data:application/pdf;base64,dGVzdA==',
      fileName: 'arquivo-teste.pdf',
      fileType: 'application/pdf',
      fileSize: 1024,
      dateAdded: '2026-01-01T00:00:00.000Z',
    },
  ],
  primarySourceId: 'src-1',
  dateAdded: '2026-01-01T00:00:00.000Z',
  dateModified: '2026-01-01T00:00:00.000Z',
  ...overrides,
});

/**
 * Input -> Output:
 * - input: partial overrides for CashBoxExpense fields.
 * - output: a fully typed CashBoxExpense with sensible test defaults.
 * Example:
 * const expense = createTestCashBoxExpense({ value: 300 });
 */
export const createTestCashBoxExpense = (
  overrides: Partial<CashBoxExpense> = {},
): CashBoxExpense => ({
  id: 'test-cashbox-expense-1',
  origin: 'Profissional',
  category: 'Operacional',
  item: 'Suprimentos',
  recurrence: 'Única',
  dueDate: '2026-03-15',
  paymentDate: null,
  value: 200,
  installmentNumber: null,
  installmentTotal: null,
  recurringGroupId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  ...overrides,
});

/**
 * Input -> Output:
 * - input: partial overrides for Proposal fields.
 * - output: a fully typed Proposal with sensible test defaults.
 * Example:
 * const proposal = createTestProposal({ clientId: undefined });
 */
export const createTestProposal = (overrides: Partial<Proposal> = {}): Proposal => ({
  id: 'prop_101',
  code: '#2601',
  name: 'Proposta Teste',
  date: '13/02/2026',
  status: 'Pendente',
  sections: [
    {
      id: 1,
      title: 'Arquitetura',
      items: [{ id: 1, description: 'Estudo preliminar', unit: 'm²', quantity: 1, unitPrice: 100 }],
    },
  ],
  discount: 0,
  subtotal: 100,
  total: 100,
  clientId: 'client-1',
  archived: false,
  showItemPrices: true,
  showSectionTotals: true,
  showDiscount: false,
  showGrandTotal: true,
  showProposalDate: true,
  totalsAlignment: 'right',
  ...overrides,
});
