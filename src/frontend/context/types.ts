import type { AppData } from '../services/infrastructure/api';

/** Generic setter type matching React.Dispatch<React.SetStateAction<T>>. */
export type Setter<T> = (value: T | ((prev: T) => T)) => void;

// ---------------------------------------------------------------------------
// DomainContext<K> — Mapped type that auto-generates setters for any AppData keys.
// Given K = 'foo' | 'bar', produces:
//   { foo: AppData['foo']; bar: AppData['bar'];
//     setFoo: Setter<AppData['foo']>; setBar: Setter<AppData['bar']>; }
// ---------------------------------------------------------------------------

type Capitalize<S extends string> = S extends `${infer F}${infer R}` ? `${Uppercase<F>}${R}` : S;

type SetterKey<K extends string> = `set${Capitalize<K>}`;

export type DomainContext<K extends keyof AppData> = {
  [P in K]: AppData[P];
} & {
  [P in K as SetterKey<string & P>]: Setter<AppData[P]>;
};

// ---------------------------------------------------------------------------
// Domain-specific types (now just aliases — no boilerplate setter signatures)
// ---------------------------------------------------------------------------

export type CoreDataType = DomainContext<'projects' | 'proposals' | 'clients'>;

export type FinanceDataType = DomainContext<
  'commissions' | 'manualExpenses' | 'manualIncomes' | 'cashBoxExpenses' | 'cashBoxCredits'
>;

export type SupplyChainDataType = DomainContext<
  'suppliers' | 'products' | 'supplierProductPrices' | 'quotations' | 'freelancers'
>;

export type MarketingDataType = DomainContext<
  'marketingProfessionals' | 'marketingActivities' | 'socialNetworks' | 'prospects'
>;

export type SystemDataType = DomainContext<
  | 'documentStorage'
  | 'agendaEvents'
  | 'reminders'
  | 'customBudgetTemplate'
  | 'globalIdentifierCounter'
  | 'dismissedFocusItems'
  | 'acceptedPaymentMethods'
  | 'hiredServices'
  | 'contractDeadlines'
>;

export interface DataHistoryContextType {
  undo: () => void;
  redo: () => void;
  clearHistory: () => void;
  canUndo: boolean;
  canRedo: boolean;
}
