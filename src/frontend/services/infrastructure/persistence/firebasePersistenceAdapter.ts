import type { DocumentStorage } from '@/types';
import {
  collection,
  deleteDoc,
  deleteField,
  doc,
  getDoc,
  getDocs,
  increment,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  setDoc,
  writeBatch,
} from 'firebase/firestore';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { getDownloadURL, ref } from 'firebase/storage';
import { firebaseFileService } from '../firebaseFileService';
import { IDENTIFIABLE_ARRAY_DOMAIN_KEYS, VALUE_DOMAIN_KEYS } from '../cloudSyncTypes';
import {
  cloneValue,
  computeHash,
  decodePreferenceKey,
  encodePreferenceKey,
  flattenDocumentStorage,
  getArrayOrderField,
  isIdentifiableArray,
  rebuildDocumentStorage,
  sanitizeDomainValue,
  stripRemoteMetadata,
  type IdentifiableRecord,
} from './firebasePersistenceHelpers';
import {
  ensureFirebaseReady,
  getFirebaseAuth,
  getFirebaseConfigurationError,
  isFirebaseConfigured,
} from './firebaseConfig';
import { IndexedDbPersistenceAdapter } from './IndexedDbPersistenceAdapter';
import type {
  BackupMetadata,
  BackupRecord,
  CounterReservationResult,
  PersistenceExternalChangeEvent,
  PersistenceSyncState,
  RealtimePersistencePort,
  WriteBackupOptions,
} from './PersistencePort';

type ListenerUnsubscribe = () => void;

const DEFAULT_SYNC_STATE: PersistenceSyncState = {
  status: 'offline',
  accessMode: 'none',
  lastSyncTimestamp: null,
  errorMessage: isFirebaseConfigured() ? null : getFirebaseConfigurationError(),
  retryScheduledAt: null,
  pendingWrites: 0,
  userEmail: null,
  quota: null,
};

const REMOTE_ARRAY_DOMAIN_KEYS = new Set<string>(IDENTIFIABLE_ARRAY_DOMAIN_KEYS);
const REMOTE_VALUE_DOMAIN_KEYS = new Set<string>(VALUE_DOMAIN_KEYS);

export class FirebasePersistenceAdapter implements RealtimePersistencePort {
  private readonly localAdapter = new IndexedDbPersistenceAdapter();
  private readonly externalListeners = new Set<(event: PersistenceExternalChangeEvent) => void>();
  private readonly syncListeners = new Set<(state: PersistenceSyncState) => void>();
  private readonly suppressedHashes = new Map<string, string>();
  private readonly remoteUnsubscribers: ListenerUnsubscribe[] = [];
  private readonly deviceId =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `device-${Date.now()}`;

  private syncState: PersistenceSyncState = { ...DEFAULT_SYNC_STATE };
  private authUnsubscribe: ListenerUnsubscribe | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectAttempts = 0;
  private destroyed = false;
  private counterLease: { nextValue: number; endExclusive: number } | null = null;

  constructor() {
    if (!isFirebaseConfigured()) {
      return;
    }

    void this.bootstrap();

    if (typeof window !== 'undefined') {
      window.addEventListener('online', this.handleOnline);
      window.addEventListener('offline', this.handleOffline);
    }
  }

  isSupported(): boolean {
    return this.localAdapter.isSupported();
  }

  async readSnapshot<T>(): Promise<T | null> {
    return this.localAdapter.readSnapshot<T>();
  }

  async writeSnapshot<T>(snapshot: T): Promise<void> {
    await this.localAdapter.writeSnapshot(snapshot);

    if (!this.safeCurrentUser()) {
      return;
    }

    const record = snapshot as Record<string, unknown>;
    await Promise.all(
      Object.entries(record).map(async ([domainKey, value]) => {
        await this.writeRemoteDomain(domainKey, value);
      }),
    );
  }

  async clearSnapshot(): Promise<void> {
    await this.localAdapter.clearSnapshot();

    const user = this.safeCurrentUser();
    if (!user) {
      return;
    }

    for (const domainKey of new Set([...REMOTE_ARRAY_DOMAIN_KEYS, ...REMOTE_VALUE_DOMAIN_KEYS])) {
      await this.clearRemoteDomain(user.uid, domainKey);
    }

    await this.clearRemoteDomain(user.uid, 'documentStorage');

    const { db } = await ensureFirebaseReady();
    await deleteDoc(doc(db, 'users', user.uid, 'preferences', 'ui')).catch(() => undefined);
  }

  async readEntityState<T>(entities?: string[]): Promise<Partial<T> | null> {
    return this.localAdapter.readEntityState<T>(entities);
  }

  async writeEntityState(state: Record<string, unknown>): Promise<void> {
    await this.localAdapter.writeEntityState(state);

    if (!this.safeCurrentUser()) {
      return;
    }

    await Promise.all(
      Object.entries(state).map(async ([domainKey, value]) => {
        await this.writeRemoteDomain(domainKey, value);
      }),
    );
  }

  async readPreference<T>(key: string): Promise<T | null> {
    return this.localAdapter.readPreference<T>(key);
  }

  async writePreference<T>(key: string, value: T): Promise<void> {
    await this.localAdapter.writePreference(key, value);

    const user = this.safeCurrentUser();
    if (!user) {
      return;
    }

    const { db } = await ensureFirebaseReady();
    const encodedKey = encodePreferenceKey(key);
    const preferenceDoc = doc(db, 'users', user.uid, 'preferences', 'ui');

    this.trackPendingWrite();
    try {
      this.suppressedHashes.set(`preference:${key}`, computeHash(value));
      await setDoc(
        preferenceDoc,
        {
          [`entries.${encodedKey}`]: {
            value: cloneValue(value),
            updatedAt: Date.now(),
          },
          updatedAt: Date.now(),
          updatedByDeviceId: this.deviceId,
        },
        { merge: true },
      );
      this.markSyncSuccess();
    } catch (error) {
      this.handleSyncError(error);
      throw error;
    } finally {
      this.completePendingWrite();
    }
  }

  async removePreference(key: string): Promise<void> {
    await this.localAdapter.removePreference(key);

    const user = this.safeCurrentUser();
    if (!user) {
      return;
    }

    const { db } = await ensureFirebaseReady();
    const encodedKey = encodePreferenceKey(key);
    const preferenceDoc = doc(db, 'users', user.uid, 'preferences', 'ui');

    this.trackPendingWrite();
    try {
      await setDoc(
        preferenceDoc,
        {
          [`entries.${encodedKey}`]: deleteField(),
          updatedAt: Date.now(),
          updatedByDeviceId: this.deviceId,
        },
        { merge: true },
      );
      this.markSyncSuccess();
    } catch (error) {
      this.handleSyncError(error);
      throw error;
    } finally {
      this.completePendingWrite();
    }
  }

  async listBackups(): Promise<BackupMetadata[]> {
    const localBackups = await this.localAdapter.listBackups();
    const user = this.safeCurrentUser();

    if (!user) {
      return localBackups;
    }

    const { db } = await ensureFirebaseReady();
    const snapshot = await getDocs(collection(db, 'users', user.uid, 'backups'));
    const remoteBackups = snapshot.docs.map((backupDoc) => {
      const data = backupDoc.data();
      return {
        id: backupDoc.id,
        createdAt: Number(data.createdAt ?? 0),
        sizeBytes: Number(data.sizeBytes ?? 0),
        hash: String(data.hash ?? ''),
        reason: (data.reason ?? 'manual') as 'auto' | 'manual',
      };
    });

    return remoteBackups.length > 0
      ? remoteBackups.sort((a, b) => b.createdAt - a.createdAt)
      : localBackups;
  }

  async writeBackup<T>(payload: T, options?: WriteBackupOptions): Promise<BackupMetadata> {
    const localMetadata = await this.localAdapter.writeBackup(payload, options);
    const user = this.safeCurrentUser();

    if (!user) {
      return localMetadata;
    }

    const { db } = await ensureFirebaseReady();
    const storagePath = await firebaseFileService.uploadJsonBackup(localMetadata.id, payload);

    await setDoc(doc(db, 'users', user.uid, 'backups', localMetadata.id), {
      createdAt: localMetadata.createdAt,
      sizeBytes: localMetadata.sizeBytes,
      hash: localMetadata.hash,
      reason: localMetadata.reason,
      storagePath,
    });

    return localMetadata;
  }

  async readBackup<T>(id: string): Promise<BackupRecord<T> | null> {
    const localRecord = await this.localAdapter.readBackup<T>(id);
    const user = this.safeCurrentUser();

    if (!user || localRecord) {
      return localRecord;
    }

    const { db, storage } = await ensureFirebaseReady();
    const backupDoc = await getDoc(doc(db, 'users', user.uid, 'backups', id));
    if (!backupDoc.exists()) {
      return null;
    }

    const data = backupDoc.data();
    const storagePath = data.storagePath;
    if (typeof storagePath !== 'string') {
      return null;
    }

    const url = await getDownloadURL(ref(storage, storagePath));
    const response = await fetch(url);
    const payload = (await response.json()) as T;

    return {
      id,
      createdAt: Number(data.createdAt ?? Date.now()),
      payload,
      sizeBytes: Number(data.sizeBytes ?? 0),
      hash: String(data.hash ?? ''),
      reason: (data.reason ?? 'manual') as 'auto' | 'manual',
    };
  }

  async clearBackups(): Promise<void> {
    await this.localAdapter.clearBackups();

    const user = this.safeCurrentUser();
    if (!user) {
      return;
    }

    const { db } = await ensureFirebaseReady();
    const backupDocs = await getDocs(collection(db, 'users', user.uid, 'backups'));
    await Promise.all(
      backupDocs.docs.map(async (backupDoc) => {
        const storagePath = backupDoc.data().storagePath;
        if (typeof storagePath === 'string') {
          await firebaseFileService.deleteManagedFile(storagePath).catch(() => undefined);
        }

        await deleteDoc(backupDoc.ref);
      }),
    );
  }

  async reserveGlobalIdentifier(defaultCounter = 741): Promise<CounterReservationResult> {
    const user = this.safeCurrentUser();
    if (!user) {
      return this.localAdapter.reserveGlobalIdentifier(defaultCounter);
    }

    if (!this.counterLease || this.counterLease.nextValue >= this.counterLease.endExclusive) {
      const { db } = await ensureFirebaseReady();
      const counterRef = doc(db, 'users', user.uid, 'counters', 'globalIdentifier');

      const lease = await runTransaction(db, async (transaction) => {
        const snapshot = await transaction.get(counterRef);
        const startValue = snapshot.exists()
          ? Number(snapshot.data().nextValue ?? defaultCounter)
          : defaultCounter;
        const leaseSize = 25;
        const endExclusive = startValue + leaseSize;

        transaction.set(
          counterRef,
          {
            nextValue: endExclusive,
            updatedAt: Date.now(),
            updatedByDeviceId: this.deviceId,
          },
          { merge: true },
        );

        return { nextValue: startValue, endExclusive };
      });

      this.counterLease = lease;
    }

    const reservedValue = this.counterLease.nextValue;
    const nextValue = reservedValue + 1;
    this.counterLease.nextValue = nextValue;
    await this.localAdapter.writeEntityState({ globalIdentifierCounter: nextValue });

    return { reservedValue, nextValue };
  }

  subscribeExternalChanges(listener: (event: PersistenceExternalChangeEvent) => void): () => void {
    this.externalListeners.add(listener);
    return () => this.externalListeners.delete(listener);
  }

  subscribeSyncState(listener: (state: PersistenceSyncState) => void): () => void {
    this.syncListeners.add(listener);
    listener(this.syncState);
    return () => this.syncListeners.delete(listener);
  }

  async forceReconnect(): Promise<void> {
    const user = this.safeCurrentUser();
    if (!user) {
      this.updateSyncState({
        status: 'offline',
        accessMode: 'none',
        errorMessage: null,
      });
      return;
    }

    this.clearRemoteListeners();
    await this.attachRemoteListeners(user);
  }

  dispose(): void {
    if (this.destroyed) {
      return;
    }

    this.destroyed = true;
    this.authUnsubscribe?.();
    this.authUnsubscribe = null;
    this.clearRemoteListeners();

    if (typeof window !== 'undefined') {
      window.removeEventListener('online', this.handleOnline);
      window.removeEventListener('offline', this.handleOffline);
    }
  }

  private async bootstrap(): Promise<void> {
    try {
      const { auth } = await ensureFirebaseReady();
      this.authUnsubscribe = onAuthStateChanged(auth, (user) => {
        void this.handleAuthStateChanged(user);
      });
    } catch (error) {
      this.handleSyncError(error);
    }
  }

  private safeCurrentUser(): User | null {
    if (!isFirebaseConfigured()) {
      return null;
    }

    try {
      return getFirebaseAuth().currentUser;
    } catch {
      return null;
    }
  }

  private readonly handleOnline = () => {
    if (this.syncState.accessMode === 'firebase') {
      this.updateSyncState({
        status: 'idle',
        errorMessage: null,
      });
      void this.forceReconnect();
    }
  };

  private readonly handleOffline = () => {
    if (this.syncState.accessMode === 'firebase') {
      this.updateSyncState({
        status: 'offline',
      });
    }
  };

  private updateSyncState(nextState: Partial<PersistenceSyncState>): void {
    this.syncState = { ...this.syncState, ...nextState };
    this.syncListeners.forEach((listener) => listener(this.syncState));
  }

  private emitExternalChange(event: PersistenceExternalChangeEvent): void {
    this.externalListeners.forEach((listener) => listener(event));
  }

  private trackPendingWrite(): void {
    this.updateSyncState({
      pendingWrites: this.syncState.pendingWrites + 1,
      status: 'syncing',
      accessMode: 'firebase',
    });
  }

  private completePendingWrite(): void {
    const pendingWrites = Math.max(0, this.syncState.pendingWrites - 1);
    this.updateSyncState({
      pendingWrites,
      status:
        pendingWrites > 0
          ? 'syncing'
          : typeof navigator !== 'undefined' && !navigator.onLine
            ? 'offline'
            : 'idle',
    });
  }

  private markSyncSuccess(): void {
    this.reconnectAttempts = 0;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    this.updateSyncState({
      lastSyncTimestamp: Date.now(),
      errorMessage: null,
      retryScheduledAt: null,
      accessMode: 'firebase',
    });
  }

  private handleSyncError(error: unknown): void {
    const message = error instanceof Error ? error.message : String(error);
    const delayMs = Math.min(30000, 1000 * 2 ** this.reconnectAttempts);
    this.reconnectAttempts += 1;

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      void this.forceReconnect();
    }, delayMs);

    this.updateSyncState({
      status: 'error',
      errorMessage: message,
      retryScheduledAt: Date.now() + delayMs,
      accessMode: this.syncState.accessMode === 'none' ? 'none' : 'firebase',
    });
  }

  private clearRemoteListeners(): void {
    while (this.remoteUnsubscribers.length > 0) {
      const unsubscribe = this.remoteUnsubscribers.pop();
      unsubscribe?.();
    }
  }

  private async handleAuthStateChanged(user: User | null): Promise<void> {
    this.clearRemoteListeners();
    this.counterLease = null;

    if (!user) {
      this.updateSyncState({
        status: 'offline',
        accessMode: 'none',
        userEmail: null,
        errorMessage: null,
        retryScheduledAt: null,
      });
      return;
    }

    this.updateSyncState({
      status: 'initializing',
      accessMode: 'firebase',
      userEmail: user.email ?? null,
      errorMessage: null,
      retryScheduledAt: null,
    });

    try {
      await this.ensureRemoteWorkspace(user.uid);
      await this.attachRemoteListeners(user);
      this.markSyncSuccess();
      this.updateSyncState({
        status: typeof navigator !== 'undefined' && !navigator.onLine ? 'offline' : 'idle',
      });
    } catch (error) {
      this.handleSyncError(error);
    }
  }

  private async ensureRemoteWorkspace(uid: string): Promise<void> {
    const { db } = await ensureFirebaseReady();
    const userRef = doc(db, 'users', uid);
    const snapshot = await getDoc(userRef);
    const now = Date.now();

    if (!snapshot.exists()) {
      await setDoc(userRef, {
        schemaVersion: 1,
        migratedAt: now,
        lastSeenAt: now,
      });

      const localSnapshot = await this.localAdapter.readSnapshot<Record<string, unknown>>();
      if (localSnapshot && Object.keys(localSnapshot).length > 0) {
        await this.writeSnapshot(localSnapshot);
      }
      return;
    }

    await setDoc(userRef, { lastSeenAt: now }, { merge: true });
  }

  private async attachRemoteListeners(user: User): Promise<void> {
    const { db } = await ensureFirebaseReady();
    const uid = user.uid;

    for (const domainKey of REMOTE_ARRAY_DOMAIN_KEYS) {
      const itemsRef = collection(db, 'users', uid, 'domains', domainKey, 'items');
      const unsubscribe = onSnapshot(
        query(itemsRef, orderBy('__order', 'asc')),
        async (snapshot) => {
          const value = snapshot.docs.map((entry) =>
            stripRemoteMetadata(entry.data() as IdentifiableRecord),
          );
          await this.applyRemoteDomainValue(domainKey, value);
        },
        (error) => this.handleSyncError(error),
      );

      this.remoteUnsubscribers.push(unsubscribe);
    }

    for (const domainKey of REMOTE_VALUE_DOMAIN_KEYS) {
      const domainRef = doc(db, 'users', uid, 'domains', domainKey);
      const unsubscribe = onSnapshot(
        domainRef,
        async (snapshot) => {
          if (!snapshot.exists()) {
            return;
          }

          await this.applyRemoteDomainValue(domainKey, snapshot.data().value);
        },
        (error) => this.handleSyncError(error),
      );

      this.remoteUnsubscribers.push(unsubscribe);
    }

    const nodesRef = collection(db, 'users', uid, 'domains', 'documentStorage', 'nodes');
    this.remoteUnsubscribers.push(
      onSnapshot(
        query(nodesRef, orderBy('rootKey', 'asc'), orderBy('id', 'asc')),
        async (snapshot) => {
          if (snapshot.empty) {
            return;
          }

          const storage = rebuildDocumentStorage(
            snapshot.docs.map((entry) => entry.data()) as ReturnType<typeof flattenDocumentStorage>,
          );
          await this.applyRemoteDomainValue('documentStorage', storage);
        },
        (error) => this.handleSyncError(error),
      ),
    );

    const preferencesRef = doc(db, 'users', uid, 'preferences', 'ui');
    this.remoteUnsubscribers.push(
      onSnapshot(
        preferencesRef,
        async (snapshot) => {
          if (!snapshot.exists()) {
            return;
          }

          const entries = (snapshot.data().entries ?? {}) as Record<
            string,
            { value: unknown; updatedAt: number }
          >;

          for (const [encodedKey, entry] of Object.entries(entries)) {
            const key = decodePreferenceKey(encodedKey);
            const hashKey = `preference:${key}`;
            const nextHash = computeHash(entry.value);
            if (this.suppressedHashes.get(hashKey) === nextHash) {
              this.suppressedHashes.delete(hashKey);
              continue;
            }

            await this.localAdapter.writePreference(key, entry.value);
            this.emitExternalChange({
              kind: 'preference',
              key,
              value: cloneValue(entry.value),
            });
          }

          this.markSyncSuccess();
        },
        (error) => this.handleSyncError(error),
      ),
    );
  }

  private async applyRemoteDomainValue(domainKey: string, value: unknown): Promise<void> {
    const nextHash = computeHash(value);
    const hashKey = `domain:${domainKey}`;

    if (this.suppressedHashes.get(hashKey) === nextHash) {
      this.suppressedHashes.delete(hashKey);
      return;
    }

    await this.localAdapter.writeEntityState({
      [domainKey]: cloneValue(value),
    });

    this.emitExternalChange({
      kind: 'domain',
      domainKey,
      value: cloneValue(value),
    });
    this.markSyncSuccess();
  }

  private async writeRemoteDomain(domainKey: string, value: unknown): Promise<void> {
    const user = await this.requireCurrentUser();
    const sanitizedValue = await sanitizeDomainValue(domainKey, value);
    this.suppressedHashes.set(`domain:${domainKey}`, computeHash(sanitizedValue));

    this.trackPendingWrite();

    try {
      if (domainKey === 'documentStorage') {
        await this.writeDocumentStorageDomain(user.uid, sanitizedValue as DocumentStorage);
      } else if (REMOTE_ARRAY_DOMAIN_KEYS.has(domainKey) && isIdentifiableArray(sanitizedValue)) {
        await this.writeIdentifiableArrayDomain(user.uid, domainKey, sanitizedValue);
      } else {
        await this.writeValueDomain(user.uid, domainKey, sanitizedValue);
      }

      this.markSyncSuccess();
    } catch (error) {
      this.handleSyncError(error);
      throw error;
    } finally {
      this.completePendingWrite();
    }
  }

  private async writeValueDomain(uid: string, domainKey: string, value: unknown): Promise<void> {
    const { db } = await ensureFirebaseReady();
    await setDoc(
      doc(db, 'users', uid, 'domains', domainKey),
      {
        kind: 'value',
        value: cloneValue(value),
        updatedAt: Date.now(),
        updatedByDeviceId: this.deviceId,
        revision: increment(1),
      },
      { merge: true },
    );
  }

  private async writeIdentifiableArrayDomain(
    uid: string,
    domainKey: string,
    records: IdentifiableRecord[],
  ): Promise<void> {
    const { db } = await ensureFirebaseReady();
    const itemsRef = collection(db, 'users', uid, 'domains', domainKey, 'items');
    const existingDocs = await getDocs(itemsRef);
    const nextIds = new Set(records.map((entry) => entry.id));
    const batch = writeBatch(db);

    batch.set(
      doc(db, 'users', uid, 'domains', domainKey),
      {
        kind: 'collection',
        updatedAt: Date.now(),
        updatedByDeviceId: this.deviceId,
        revision: increment(1),
      },
      { merge: true },
    );

    records.forEach((record, index) => {
      batch.set(doc(db, 'users', uid, 'domains', domainKey, 'items', record.id), {
        ...cloneValue(record),
        __order: getArrayOrderField(record, index),
        __deviceId: this.deviceId,
        __updatedAt: Date.now(),
      });
    });

    existingDocs.docs
      .filter((entry) => !nextIds.has(entry.id))
      .forEach((entry) => batch.delete(entry.ref));

    await batch.commit();
  }

  private async writeDocumentStorageDomain(uid: string, storage: DocumentStorage): Promise<void> {
    const { db } = await ensureFirebaseReady();
    const nodeRecords = flattenDocumentStorage(storage);
    const nodesRef = collection(db, 'users', uid, 'domains', 'documentStorage', 'nodes');
    const existingDocs = await getDocs(nodesRef);
    const nextNodeIds = new Set(nodeRecords.map((node) => node.id));
    const batch = writeBatch(db);

    batch.set(
      doc(db, 'users', uid, 'domains', 'documentStorage'),
      {
        kind: 'documentStorage',
        updatedAt: Date.now(),
        updatedByDeviceId: this.deviceId,
        revision: increment(1),
      },
      { merge: true },
    );

    nodeRecords.forEach((node) => {
      batch.set(
        doc(db, 'users', uid, 'domains', 'documentStorage', 'nodes', node.id),
        cloneValue(node),
      );
    });

    existingDocs.docs
      .filter((entry) => !nextNodeIds.has(entry.id))
      .forEach((entry) => batch.delete(entry.ref));

    await batch.commit();
  }

  private async clearRemoteDomain(uid: string, domainKey: string): Promise<void> {
    const { db } = await ensureFirebaseReady();

    if (domainKey === 'documentStorage') {
      const nodesRef = collection(db, 'users', uid, 'domains', domainKey, 'nodes');
      const docsSnapshot = await getDocs(nodesRef);
      const batch = writeBatch(db);
      docsSnapshot.docs.forEach((entry) => batch.delete(entry.ref));
      batch.delete(doc(db, 'users', uid, 'domains', domainKey));
      await batch.commit();
      return;
    }

    if (REMOTE_ARRAY_DOMAIN_KEYS.has(domainKey)) {
      const itemsRef = collection(db, 'users', uid, 'domains', domainKey, 'items');
      const docsSnapshot = await getDocs(itemsRef);
      const batch = writeBatch(db);
      docsSnapshot.docs.forEach((entry) => batch.delete(entry.ref));
      batch.delete(doc(db, 'users', uid, 'domains', domainKey));
      await batch.commit();
      return;
    }

    await deleteDoc(doc(db, 'users', uid, 'domains', domainKey)).catch(() => undefined);
  }

  private async requireCurrentUser(): Promise<User> {
    const user = this.safeCurrentUser();
    if (!user) {
      throw new Error('Usuário não autenticado no Firebase.');
    }

    return user;
  }
}
