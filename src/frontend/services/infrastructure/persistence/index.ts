/**
 * Input -> Output:
 * - input: none.
 * - output: re-exports from the persistence module.
 */

export type {
  PersistencePort,
  BackupMetadata,
  BackupRecord,
  WriteBackupOptions,
  CounterReservationResult,
} from './PersistencePort';
export { isRealtimePersistencePort } from './PersistencePort';
export { IndexedDbPersistenceAdapter } from './IndexedDbPersistenceAdapter';
export { SqlitePersistenceAdapter } from './SqlitePersistenceAdapter';
export {
  createPersistenceAdapter,
  setPersistenceAdapter,
  resetPersistenceAdapter,
} from './createPersistenceAdapter';
