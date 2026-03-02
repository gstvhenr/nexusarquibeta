import type { Client, ContractDeadlinesSettings } from '../../types';
import { loadData, invalidateCacheAndNotify, updateData } from './loadData';
import type { AppData } from '../../types';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isValidContractDeadlineSettings = (value: unknown): value is ContractDeadlinesSettings =>
  isRecord(value) &&
  typeof value.defaultPreliminarDeadlineDays === 'number' &&
  Number.isFinite(value.defaultPreliminarDeadlineDays) &&
  value.defaultPreliminarDeadlineDays >= 0 &&
  typeof value.defaultExecutiveDeadlineDays === 'number' &&
  Number.isFinite(value.defaultExecutiveDeadlineDays) &&
  value.defaultExecutiveDeadlineDays >= 0;

/**
 * Type guard to validate imported values match expected AppData shapes.
 */
export const canAcceptImportedValue = <K extends keyof AppData>(
  key: K,
  value: unknown,
  currentValue: AppData[K],
): value is AppData[K] => {
  if (key === 'customBudgetTemplate') {
    return value === null || Array.isArray(value);
  }

  if (key === 'contractDeadlines') {
    return isValidContractDeadlineSettings(value);
  }

  if (Array.isArray(currentValue)) {
    return Array.isArray(value);
  }

  if (typeof currentValue === 'number') {
    return typeof value === 'number' && Number.isFinite(value);
  }

  if (typeof currentValue === 'object') {
    return isRecord(value);
  }

  return typeof value === typeof currentValue;
};

/**
 * Input -> Output:
 * - input: JSON string with full or partial AppData.
 * - output: merges valid keys into current state, invalidates cache.
 */
export function importData(jsonString: string): void {
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonString);
  } catch (error) {
    console.error('Invalid JSON while importing data:', error);
    throw new Error('JSON inválido para importação de dados.');
  }

  if (!isRecord(parsed)) {
    throw new Error('Formato inválido. O conteúdo importado deve ser um objeto JSON.');
  }

  const importedData = parsed as Partial<AppData>;
  const currentData = loadData();

  (Object.keys(currentData) as (keyof AppData)[]).forEach((key) => {
    const incomingValue = importedData[key];
    if (incomingValue === undefined) return;

    if (!canAcceptImportedValue(key, incomingValue, currentData[key])) {
      console.warn(`Ignoring invalid imported key: ${String(key)}`);
      return;
    }

    updateData(key, incomingValue);
  });

  invalidateCacheAndNotify();
}

/**
 * Input -> Output:
 * - input: none.
 * - output: JSON string of all current AppData.
 */
export function exportData(): string {
  const data = loadData();
  const exportableData = { ...data };
  return JSON.stringify(exportableData, null, 2);
}

/**
 * Input -> Output:
 * - input: JSON string with an array of Client objects.
 * - output: merges clients by ID into current state, invalidates cache.
 */
export function importClients(jsonString: string): void {
  try {
    const newClients = JSON.parse(jsonString) as Client[];
    if (!Array.isArray(newClients))
      throw new Error('Formato inválido. Esperado um array de clientes.');

    const currentData = loadData();
    const currentClients = currentData.clients;

    // Merge strategy: Update existing by ID, append new ones.
    const updatedClients = [...currentClients];

    newClients.forEach((newClient) => {
      const index = updatedClients.findIndex((c) => c.id === newClient.id);
      if (index > -1) {
        updatedClients[index] = { ...updatedClients[index], ...newClient };
      } else {
        updatedClients.push(newClient);
      }
    });

    updateData('clients', updatedClients);
    invalidateCacheAndNotify();
  } catch (error) {
    console.error('Error importing clients:', error);
    throw error;
  }
}
