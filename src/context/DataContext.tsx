import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  PropsWithChildren,
  useCallback,
  useMemo,
} from 'react';
import { AppData, api } from '../services/infrastructure/api';

// The setter type matches the signature of React.Dispatch<React.SetStateAction<T>>
type Setter<T> = (value: T | ((prev: T) => T)) => void;

interface DataContextType extends AppData {
  setProjects: Setter<AppData['projects']>;
  setProposals: Setter<AppData['proposals']>;
  setClients: Setter<AppData['clients']>;
  setDocumentStorage: Setter<AppData['documentStorage']>;
  setSuppliers: Setter<AppData['suppliers']>;
  setProducts: Setter<AppData['products']>;
  setSupplierProductPrices: Setter<AppData['supplierProductPrices']>;
  setQuotations: Setter<AppData['quotations']>;
  setCommissions: Setter<AppData['commissions']>;
  setMarketingProfessionals: Setter<AppData['marketingProfessionals']>;
  setMarketingActivities: Setter<AppData['marketingActivities']>;
  setMarketingIdeas: Setter<AppData['marketingIdeas']>;
  setSocialNetworks: Setter<AppData['socialNetworks']>;
  setFreelancers: Setter<AppData['freelancers']>;
  setAgendaEvents: Setter<AppData['agendaEvents']>;
  setManualExpenses: Setter<AppData['manualExpenses']>;
  setManualIncomes: Setter<AppData['manualIncomes']>;
  setCustomBudgetTemplate: Setter<AppData['customBudgetTemplate']>;
  setGlobalIdentifierCounter: Setter<AppData['globalIdentifierCounter']>;
  setDismissedFocusItems: Setter<AppData['dismissedFocusItems']>;
  setAcceptedPaymentMethods: Setter<AppData['acceptedPaymentMethods']>;
  setHiredServices: Setter<AppData['hiredServices']>;
  setProspects: Setter<AppData['prospects']>;
  setContractDeadlines: Setter<AppData['contractDeadlines']>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<PropsWithChildren<{}>> = ({ children }) => {
  const [data, setData] = useState<AppData>(() => api.getData());

  useEffect(() => {
    const syncState = () => setData(api.getData());
    window.addEventListener('storage', syncState);
    return () => window.removeEventListener('storage', syncState);
  }, []);

  const setField = useCallback(
    <K extends keyof AppData>(key: K, value: AppData[K] | ((prev: AppData[K]) => AppData[K])) => {
      setData((prevData) => {
        const newData = value instanceof Function ? value(prevData[key]) : value;
        api.updateData(key, newData);
        return { ...prevData, [key]: newData };
      });
    },
    [],
  );

  const setters = useMemo(
    () => ({
      setProjects: (
        value: AppData['projects'] | ((prev: AppData['projects']) => AppData['projects']),
      ) => setField('projects', value),
      setProposals: (
        value: AppData['proposals'] | ((prev: AppData['proposals']) => AppData['proposals']),
      ) => setField('proposals', value),
      setClients: (
        value: AppData['clients'] | ((prev: AppData['clients']) => AppData['clients']),
      ) => setField('clients', value),
      setDocumentStorage: (
        value:
          | AppData['documentStorage']
          | ((prev: AppData['documentStorage']) => AppData['documentStorage']),
      ) => setField('documentStorage', value),
      setSuppliers: (
        value: AppData['suppliers'] | ((prev: AppData['suppliers']) => AppData['suppliers']),
      ) => setField('suppliers', value),
      setProducts: (
        value: AppData['products'] | ((prev: AppData['products']) => AppData['products']),
      ) => setField('products', value),
      setSupplierProductPrices: (
        value:
          | AppData['supplierProductPrices']
          | ((prev: AppData['supplierProductPrices']) => AppData['supplierProductPrices']),
      ) => setField('supplierProductPrices', value),
      setQuotations: (
        value: AppData['quotations'] | ((prev: AppData['quotations']) => AppData['quotations']),
      ) => setField('quotations', value),
      setCommissions: (
        value: AppData['commissions'] | ((prev: AppData['commissions']) => AppData['commissions']),
      ) => setField('commissions', value),
      setMarketingProfessionals: (
        value:
          | AppData['marketingProfessionals']
          | ((prev: AppData['marketingProfessionals']) => AppData['marketingProfessionals']),
      ) => setField('marketingProfessionals', value),
      setMarketingActivities: (
        value:
          | AppData['marketingActivities']
          | ((prev: AppData['marketingActivities']) => AppData['marketingActivities']),
      ) => setField('marketingActivities', value),
      setMarketingIdeas: (
        value:
          | AppData['marketingIdeas']
          | ((prev: AppData['marketingIdeas']) => AppData['marketingIdeas']),
      ) => setField('marketingIdeas', value),
      setSocialNetworks: (
        value:
          | AppData['socialNetworks']
          | ((prev: AppData['socialNetworks']) => AppData['socialNetworks']),
      ) => setField('socialNetworks', value),
      setFreelancers: (
        value: AppData['freelancers'] | ((prev: AppData['freelancers']) => AppData['freelancers']),
      ) => setField('freelancers', value),
      setAgendaEvents: (
        value:
          | AppData['agendaEvents']
          | ((prev: AppData['agendaEvents']) => AppData['agendaEvents']),
      ) => setField('agendaEvents', value),
      setManualExpenses: (
        value:
          | AppData['manualExpenses']
          | ((prev: AppData['manualExpenses']) => AppData['manualExpenses']),
      ) => setField('manualExpenses', value),
      setManualIncomes: (
        value:
          | AppData['manualIncomes']
          | ((prev: AppData['manualIncomes']) => AppData['manualIncomes']),
      ) => setField('manualIncomes', value),
      setCustomBudgetTemplate: (
        value:
          | AppData['customBudgetTemplate']
          | ((prev: AppData['customBudgetTemplate']) => AppData['customBudgetTemplate']),
      ) => setField('customBudgetTemplate', value),
      setGlobalIdentifierCounter: (
        value:
          | AppData['globalIdentifierCounter']
          | ((prev: AppData['globalIdentifierCounter']) => AppData['globalIdentifierCounter']),
      ) => setField('globalIdentifierCounter', value),
      setDismissedFocusItems: (
        value:
          | AppData['dismissedFocusItems']
          | ((prev: AppData['dismissedFocusItems']) => AppData['dismissedFocusItems']),
      ) => setField('dismissedFocusItems', value),
      setAcceptedPaymentMethods: (
        value:
          | AppData['acceptedPaymentMethods']
          | ((prev: AppData['acceptedPaymentMethods']) => AppData['acceptedPaymentMethods']),
      ) => setField('acceptedPaymentMethods', value),
      setHiredServices: (
        value:
          | AppData['hiredServices']
          | ((prev: AppData['hiredServices']) => AppData['hiredServices']),
      ) => setField('hiredServices', value),
      setProspects: (
        value: AppData['prospects'] | ((prev: AppData['prospects']) => AppData['prospects']),
      ) => setField('prospects', value),
      setContractDeadlines: (
        value:
          | AppData['contractDeadlines']
          | ((prev: AppData['contractDeadlines']) => AppData['contractDeadlines']),
      ) => setField('contractDeadlines', value),
    }),
    [setField],
  );

  const value: DataContextType = useMemo(
    () => ({
      ...data,
      ...setters,
    }),
    [data, setters],
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

/**
 * Custom hook to access the global application data and state setters.
 */
export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
