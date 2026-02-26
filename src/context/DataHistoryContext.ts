import { createContext, useContext } from 'react';
import type { DataHistoryContextType } from './types';

export const DataHistoryContext = createContext<DataHistoryContextType | undefined>(undefined);
DataHistoryContext.displayName = 'DataHistoryContext';

/** Undo/redo history for DataContext state transitions. */
export const useDataHistory = (): DataHistoryContextType => {
  const ctx = useContext(DataHistoryContext);
  if (!ctx) throw new Error('useDataHistory must be used within DataProvider');
  return ctx;
};
