import { createContext } from 'react';
import type { DataHistoryContextType } from './types';

export const DataHistoryContext = createContext<DataHistoryContextType | undefined>(undefined);
DataHistoryContext.displayName = 'DataHistoryContext';
