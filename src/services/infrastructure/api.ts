/**
 * Input -> Output:
 * - input: mutações e leituras de `AppData` em memória/IndexedDB.
 * - output: snapshot consistente de dados e operações de import/export.
 * Example:
 * const data = api.getAllData();
 */

import {
  loadData,
  updateData,
  replaceData,
  reserveGlobalIdentifierCounter,
  resetPersistentDataAndNotify,
  type AppData,
} from './loadData';
import { importData, exportData, importClients } from './importExport';

export type { AppData };

export const api = {
  getData: (): AppData => loadData(),

  updateData,
  replaceData,

  exportData,
  importData,

  reserveGlobalIdentifier: async (): Promise<number> => reserveGlobalIdentifierCounter(),

  importClients,

  clearAllData: (): void => resetPersistentDataAndNotify(),
};
