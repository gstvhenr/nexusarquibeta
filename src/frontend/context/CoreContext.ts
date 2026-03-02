import { createContext, useContext } from 'react';
import type { CoreDataType } from './types';

export const CoreContext = createContext<CoreDataType | undefined>(undefined);
CoreContext.displayName = 'CoreDataContext';

/** Core domain: projects, proposals, clients. */
export const useCoreData = (): CoreDataType => {
  const ctx = useContext(CoreContext);
  if (!ctx) throw new Error('useCoreData must be used within DataProvider');
  return ctx;
};
