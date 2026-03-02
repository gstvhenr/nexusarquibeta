/**
 * Input -> Output:
 * - input: PersistencePort method calls.
 * - output: delegates 1:1 to the existing indexedDbService singleton.
 * Example:
 *   const adapter = new IndexedDbPersistenceAdapter();
 *   const snapshot = await adapter.readSnapshot<AppData>();
 */

import { indexedDbService } from '../indexedDbService';
import type { AutomaticBackupRecord } from '../indexedDbService';
import type {
  PersistencePort,
  BackupMetadata,
  BackupRecord,
  WriteBackupOptions,
  CounterReservationResult,
} from './PersistencePort';

export class IndexedDbPersistenceAdapter implements PersistencePort {
  // ---------------------------------------------------------------------------
  // Lifecycle
  // ---------------------------------------------------------------------------

  isSupported(): boolean {
    return indexedDbService.isSupported();
  }

  // ---------------------------------------------------------------------------
  // Snapshot
  // ---------------------------------------------------------------------------

  async readSnapshot<T>(): Promise<T | null> {
    return indexedDbService.readSnapshot<T>();
  }

  async writeSnapshot<T>(snapshot: T): Promise<void> {
    return indexedDbService.writeSnapshot(snapshot);
  }

  async clearSnapshot(): Promise<void> {
    return indexedDbService.clearSnapshot();
  }

  // ---------------------------------------------------------------------------
  // Entity state
  // ---------------------------------------------------------------------------

  async readEntityState<T>(entities?: string[]): Promise<Partial<T> | null> {
    return indexedDbService.readEntityState<T>(entities);
  }

  async writeEntityState(state: Record<string, unknown>): Promise<void> {
    return indexedDbService.writeEntityState(state);
  }

  // ---------------------------------------------------------------------------
  // UI Preferences
  // ---------------------------------------------------------------------------

  async readPreference<T>(key: string): Promise<T | null> {
    return indexedDbService.readPreference<T>(key);
  }

  async writePreference<T>(key: string, value: T): Promise<void> {
    return indexedDbService.writePreference(key, value);
  }

  async removePreference(key: string): Promise<void> {
    return indexedDbService.removePreference(key);
  }

  // ---------------------------------------------------------------------------
  // Backups
  // ---------------------------------------------------------------------------

  async listBackups(): Promise<BackupMetadata[]> {
    return indexedDbService.listAutomaticBackups();
  }

  async writeBackup<T>(payload: T, options?: WriteBackupOptions): Promise<BackupMetadata> {
    return indexedDbService.writeAutomaticBackup(payload, options);
  }

  async readBackup<T>(id: string): Promise<BackupRecord<T> | null> {
    const record: AutomaticBackupRecord<T> | null =
      await indexedDbService.readAutomaticBackup<T>(id);
    return record;
  }

  async clearBackups(): Promise<void> {
    return indexedDbService.clearAutomaticBackups();
  }

  // ---------------------------------------------------------------------------
  // Counter reservation
  // ---------------------------------------------------------------------------

  async reserveGlobalIdentifier(defaultCounter?: number): Promise<CounterReservationResult> {
    return indexedDbService.reserveGlobalIdentifier(defaultCounter);
  }
}
