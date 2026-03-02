import { createContext, useContext } from 'react';
import type { SystemDataType } from './types';

export const SystemContext = createContext<SystemDataType | undefined>(undefined);
SystemContext.displayName = 'SystemDataContext';

/** System domain: documents, agenda, reminders, config, identifiers. */
export const useSystemData = (): SystemDataType => {
  const ctx = useContext(SystemContext);
  if (!ctx) throw new Error('useSystemData must be used within DataProvider');
  return ctx;
};
