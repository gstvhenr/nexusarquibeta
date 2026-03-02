import type {
  CashBoxCredit,
  CashBoxExpense,
  CashBoxOrigin,
  Commission,
  FinancialDebit,
  FinancialReceivable,
  Freelancer,
  Installment,
  ManualIncome,
  MarketingActivity,
  ProfessionalExpense,
  Project,
} from '../../types';
import { parseDateString } from '../../utils/formatters';
import {
  getProjectLumpSumValue,
  getProjectTotalContractValue,
} from '../../utils/projectFinancials';

export type UnifiedFinancialEntries = {
  allReceivables: FinancialReceivable[];
  allDebits: FinancialDebit[];
  receivableOriginById: Record<string, CashBoxOrigin>;
  cashBoxOriginById: Record<string, CashBoxOrigin>;
  cashBoxItemById: Record<string, string | null>;
};

export const buildUnifiedFinancialEntries = (
  projects: Project[],
  commissions: Commission[],
  manualExpenses: ProfessionalExpense[],
  manualIncomes: ManualIncome[],
  marketingActivities: MarketingActivity[],
  freelancers: Freelancer[],
  cashBoxExpenses: CashBoxExpense[] = [],
  cashBoxCredits: CashBoxCredit[] = [],
): UnifiedFinancialEntries => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const allReceivables: FinancialReceivable[] = [];
  const receivableOriginById: Record<string, CashBoxOrigin> = {};

  projects.forEach((project) => {
    if (project.status === 'Cancelado') return;

    const totalRemuneration = project.remuneration || 0;
    const totalBudget = getProjectTotalContractValue(project) || 1;

    if (!project.financials) return;

    const processPayment = (basePayment: Omit<Installment, 'remuneration'> & { id: string }) => {
      const dueDate = parseDateString(basePayment.dueDate);
      let status: 'Pago' | 'Vencido' | 'Em Aberto' = 'Em Aberto';
      if (basePayment.paid) {
        status = 'Pago';
      } else if (dueDate && dueDate < today) {
        status = 'Vencido';
      }

      const remuneration =
        totalBudget > 0 ? (basePayment.value / totalBudget) * totalRemuneration : 0;
      return { ...basePayment, remuneration, status };
    };

    if (project.financials.paymentType === 'vista' && project.financials.lumpSumDueDate) {
      const receivable: FinancialReceivable = {
        ...processPayment({
          id: `lump_${project.id}`,
          number: 1,
          value: getProjectLumpSumValue(project),
          dueDate: project.financials.lumpSumDueDate,
          paid: project.financials.lumpSumStatus === 'Pago',
          paymentDate: project.financials.lumpSumPaymentDate || null,
        }),
        projectId: project.id,
        projectCode: project.code,
        clientName: project.clientName,
        clientId: project.clientId,
        description: `Pagamento Único: ${project.name}`,
        source: 'Project',
      };
      allReceivables.push(receivable);
      receivableOriginById[receivable.id] = 'Profissional';
      return;
    }

    if (project.financials.paymentType === 'parcelado' && project.financials.installments) {
      project.financials.installments.forEach((installment) => {
        const receivable: FinancialReceivable = {
          ...processPayment(installment),
          projectId: project.id,
          projectCode: project.code,
          clientName: project.clientName,
          clientId: project.clientId,
          description: `Parcela ${installment.number}/${project.financials?.numberOfInstallments}: ${project.name}`,
          source: 'Project',
        };
        allReceivables.push(receivable);
        receivableOriginById[receivable.id] = 'Profissional';
      });
    }
  });

  commissions.forEach((commission) => {
    const expectedDate = commission.expectedPaymentDate ?? null;
    const expectedDateParsed = parseDateString(expectedDate);

    const receivable: FinancialReceivable = {
      id: `comm_${commission.id}`,
      number: 1,
      value: commission.commissionValue,
      dueDate: expectedDate || commission.saleDate,
      paid: commission.status === 'Recebido',
      paymentDate: commission.paymentDate || null,
      remuneration: commission.commissionValue,
      status:
        commission.status === 'Recebido'
          ? 'Pago'
          : expectedDateParsed && expectedDateParsed < today
            ? 'Vencido'
            : 'Em Aberto',
      projectId: '',
      projectCode: '',
      clientName: commission.clientName,
      clientId: commission.clientId,
      description: `Comissão: ${commission.supplierName}`,
      source: 'Commission',
    };
    allReceivables.push(receivable);
    receivableOriginById[receivable.id] = 'Profissional';
  });

  manualIncomes.forEach((income) => {
    const incomeDate = parseDateString(income.date);
    const incomeWithOrigin = income as ManualIncome & { origin?: CashBoxOrigin };
    const origin = incomeWithOrigin.origin ?? 'Profissional';

    const receivable: FinancialReceivable = {
      id: income.id,
      number: 1,
      value: income.value,
      dueDate: income.date,
      paid: income.status === 'Recebido',
      paymentDate: income.status === 'Recebido' ? income.date : null,
      remuneration: income.value,
      status:
        income.status === 'Recebido'
          ? 'Pago'
          : incomeDate && incomeDate < today
            ? 'Vencido'
            : 'Em Aberto',
      projectId: '',
      projectCode: '',
      clientName: 'Avulso',
      clientId: '',
      description: income.description,
      source: 'Manual',
      category: income.category,
    };
    allReceivables.push(receivable);
    receivableOriginById[receivable.id] = origin;
  });

  cashBoxCredits.forEach((credit) => {
    const creditDate = parseDateString(credit.date);
    let status: 'Pago' | 'Vencido' | 'Em Aberto' = 'Em Aberto';
    if (credit.confirmed) {
      status = 'Pago';
    } else if (creditDate && creditDate < today) {
      status = 'Vencido';
    }

    const receivable: FinancialReceivable = {
      id: `cbcr_${credit.id}`,
      number: 1,
      value: credit.value,
      dueDate: credit.date,
      paid: credit.confirmed,
      paymentDate: credit.confirmed ? credit.date : null,
      remuneration: credit.value,
      status,
      projectId: '',
      projectCode: '',
      clientName: 'Gestão de Caixa',
      clientId: '',
      description: credit.description,
      source: 'Manual',
      category: 'Crédito Caixa',
    };
    allReceivables.push(receivable);
    receivableOriginById[receivable.id] = credit.origin;
  });

  const marketingExpenses: ProfessionalExpense[] = marketingActivities
    .filter((activity) => activity.cost && activity.cost > 0 && activity.dueDate)
    .map((activity) => ({
      id: `mkt_${activity.id}`,
      description: `Marketing: ${activity.title}`,
      category: 'Marketing e Publicidade',
      value: activity.cost!,
      dueDate: activity.dueDate!,
      status: activity.status === 'Concluído' ? 'Pago' : 'Pendente',
      paymentDate: activity.completionDate || null,
      isRecurring: false,
      source: 'Marketing',
      marketingActivityId: activity.id,
    }));

  const freelancerExpenses: ProfessionalExpense[] = [];

  const allDebits: FinancialDebit[] = [
    ...manualExpenses,
    ...marketingExpenses,
    ...freelancerExpenses,
  ].map((debit) => {
    let status: 'Pago' | 'Vencido' | 'Pendente' = debit.status;
    const dueDate = parseDateString(debit.dueDate);
    if (debit.status === 'Pendente' && dueDate && dueDate < today) {
      status = 'Vencido';
    }

    return {
      id: debit.id,
      description: debit.description,
      category: debit.category,
      value: debit.value,
      dueDate: debit.dueDate,
      status,
      paymentDate: debit.paymentDate,
      isRecurring: debit.isRecurring,
      source: debit.source,
      marketingActivityId: debit.marketingActivityId,
      freelancerActivityId: debit.freelancerActivityId,
    };
  });

  const cashBoxOriginById: Record<string, CashBoxOrigin> = {};
  const cashBoxItemById: Record<string, string | null> = {};

  const cashBoxDebits: FinancialDebit[] = cashBoxExpenses.map((expense) => {
    const dueDate = parseDateString(expense.dueDate);
    const isOverdue = dueDate ? dueDate < today : false;
    const label =
      expense.recurrence === 'Parcelada' && expense.installmentNumber && expense.installmentTotal
        ? `${expense.category} (${expense.installmentNumber}/${expense.installmentTotal})`
        : expense.category;

    cashBoxOriginById[expense.id] = expense.origin;
    cashBoxItemById[expense.id] = expense.item;

    return {
      id: expense.id,
      description: label,
      category: expense.category,
      value: expense.value,
      dueDate: expense.dueDate,
      status: isOverdue ? ('Vencido' as const) : ('Pendente' as const),
      paymentDate: null,
      isRecurring: expense.recurrence !== 'Única',
      source: 'CashBox',
    };
  });

  allDebits.push(...cashBoxDebits);
  allDebits.sort(
    (a, b) =>
      (parseDateString(a.dueDate)?.getTime() ?? 0) - (parseDateString(b.dueDate)?.getTime() ?? 0),
  );

  return {
    allReceivables,
    allDebits,
    receivableOriginById,
    cashBoxOriginById,
    cashBoxItemById,
  };
};
