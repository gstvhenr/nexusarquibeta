import type { CashBoxCredit, CashBoxExpense, CashBoxOrigin } from './cashBox';
import type { Commission, ManualIncome, ProfessionalExpense } from './finance';
import type { Freelancer } from './freelancer';
import type { MarketingActivity } from './marketing';
import type { Project } from './project';

export type PeriodMode = 'LAST_12_MONTHS' | 'QUARTER' | 'SEMESTER' | 'YEAR';

export interface PeriodSelection {
  mode: PeriodMode;
  year?: number;
}

export interface Filters {
  origin?: CashBoxOrigin;
  category?: string;
  item?: string;
}

export interface SeriesPoint {
  label: string; // YYYY-MM
  value: number;
}

export interface SeriesFilterOptions {
  origins: CashBoxOrigin[];
  categories: string[];
  items: string[];
}

export interface FinanceLineChartFilters {
  values: Filters;
  options: SeriesFilterOptions;
}

export interface FinancialSeriesSource {
  projects: Project[];
  commissions: Commission[];
  manualExpenses: ProfessionalExpense[];
  manualIncomes: ManualIncome[];
  marketingActivities: MarketingActivity[];
  freelancers: Freelancer[];
  cashBoxExpenses?: CashBoxExpense[];
  cashBoxCredits?: CashBoxCredit[];
}
