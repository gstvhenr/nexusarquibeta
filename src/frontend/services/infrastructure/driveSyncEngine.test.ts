import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { SyncMetaFile } from './driveSyncTypes';

const driveDataAdapterMock = {
  detectAccessMode: vi.fn(),
  tryReacquireLocalAccess: vi.fn(),
  writeDomain: vi.fn(),
  readDomain: vi.fn(),
  writeConfig: vi.fn(),
  readConfig: vi.fn(),
  writePreferences: vi.fn(),
  readPreferences: vi.fn(),
  writeMeta: vi.fn(),
  readMeta: vi.fn(),
  hasBeenInitialized: vi.fn(),
  computeChecksum: vi.fn(),
  deleteFile: vi.fn(),
  clearFolder: vi.fn(),
  writeRawFile: vi.fn(),
  writeRawBinaryFile: vi.fn(),
  readRawBinaryFile: vi.fn(),
  getStorageQuota: vi.fn(),
  SCALAR_CONFIG_KEYS: [],
};

const driveMigrationServiceMock = {
  migrateIfNecessary: vi.fn(),
};

const googleDriveServiceMock = {
  ensureDriveAccess: vi.fn(),
  subscribe: vi.fn(() => () => undefined),
};

const localDriveServiceMock = {
  hasSavedFolder: vi.fn(),
  requestRepermission: vi.fn(),
  subscribe: vi.fn(() => () => undefined),
};

vi.mock('./driveDataAdapter', () => ({
  driveDataAdapter: driveDataAdapterMock,
}));

vi.mock('./driveMigrationService', () => ({
  driveMigrationService: driveMigrationServiceMock,
}));

vi.mock('./googleDriveService', () => ({
  googleDriveService: googleDriveServiceMock,
}));

vi.mock('./localDriveService', () => ({
  localDriveService: localDriveServiceMock,
}));

type DriveSyncEngineModule = typeof import('./driveSyncEngine');

const EMPTY_REMOTE_META: SyncMetaFile = {
  version: 2,
  lastFullSync: '2026-04-12T00:00:00.000Z',
  domains: {},
  tombstones: {},
};

function createBindings(clients: unknown[] = []): {
  readLocalDomain: (domainKey: string) => Promise<unknown>;
  writeLocalDomain: ReturnType<typeof vi.fn>;
  readLocalPreference: ReturnType<typeof vi.fn>;
  writeLocalPreference: ReturnType<typeof vi.fn>;
  flushLocalPersistence: ReturnType<typeof vi.fn>;
} {
  const domainState: Record<string, unknown> = {
    clients,
  };

  return {
    readLocalDomain: async (domainKey: string) => domainState[domainKey] ?? null,
    writeLocalDomain: vi.fn(async (domainKey: string, data: unknown) => {
      domainState[domainKey] = data;
    }),
    readLocalPreference: vi.fn(async () => null),
    writeLocalPreference: vi.fn(async () => undefined),
    flushLocalPersistence: vi.fn(async () => undefined),
  };
}

async function importDriveSyncEngine(): Promise<DriveSyncEngineModule> {
  vi.resetModules();
  return import('./driveSyncEngine');
}

let activeEngineModule: DriveSyncEngineModule | null = null;

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  vi.spyOn(console, 'error').mockImplementation(() => undefined);
  vi.spyOn(console, 'warn').mockImplementation(() => undefined);

  driveDataAdapterMock.detectAccessMode.mockResolvedValue('none');
  driveDataAdapterMock.writeDomain.mockResolvedValue('checksum-clients');
  driveDataAdapterMock.readDomain.mockResolvedValue(null);
  driveDataAdapterMock.writeConfig.mockResolvedValue('checksum-config');
  driveDataAdapterMock.readConfig.mockResolvedValue(null);
  driveDataAdapterMock.writePreferences.mockResolvedValue('checksum-preferences');
  driveDataAdapterMock.readPreferences.mockResolvedValue(null);
  driveDataAdapterMock.writeMeta.mockResolvedValue(undefined);
  driveDataAdapterMock.readMeta.mockResolvedValue(EMPTY_REMOTE_META);
  driveDataAdapterMock.hasBeenInitialized.mockResolvedValue(false);
  driveDataAdapterMock.computeChecksum.mockImplementation(
    (content: string) => `checksum-${content.length}`,
  );
  driveDataAdapterMock.deleteFile.mockResolvedValue(undefined);
  driveDataAdapterMock.clearFolder.mockResolvedValue(undefined);
  driveDataAdapterMock.writeRawFile.mockResolvedValue(undefined);
  driveDataAdapterMock.writeRawBinaryFile.mockResolvedValue(undefined);
  driveDataAdapterMock.readRawBinaryFile.mockResolvedValue(null);
  driveDataAdapterMock.getStorageQuota.mockResolvedValue(null);

  driveMigrationServiceMock.migrateIfNecessary.mockResolvedValue(false);
  googleDriveServiceMock.ensureDriveAccess.mockResolvedValue(false);
  localDriveServiceMock.hasSavedFolder.mockResolvedValue(false);
  localDriveServiceMock.requestRepermission.mockResolvedValue(false);
});

afterEach(() => {
  activeEngineModule?.driveSyncEngine.destroy();
  activeEngineModule = null;
  localStorage.clear();
});

describe('driveSyncEngine manual operations', () => {
  it('should return a typed no-access failure without clearing the pending queue', async () => {
    const driveSyncEngineModule = await importDriveSyncEngine();
    activeEngineModule = driveSyncEngineModule;

    localDriveServiceMock.hasSavedFolder.mockResolvedValue(true);
    localDriveServiceMock.requestRepermission.mockResolvedValue(false);
    googleDriveServiceMock.ensureDriveAccess.mockResolvedValue(false);

    const bindings = createBindings([{ id: 'client-1', name: 'Cliente' }]);
    await driveSyncEngineModule.driveSyncEngine.initialize(
      bindings.readLocalDomain,
      bindings.writeLocalDomain,
      bindings.readLocalPreference,
      bindings.writeLocalPreference,
      bindings.flushLocalPersistence,
    );

    driveSyncEngineModule.driveSyncEngine.notifyDomainChanged(
      'clients',
      [],
      [{ id: 'client-1', name: 'Cliente' }],
    );

    const result = await driveSyncEngineModule.driveSyncEngine.forcePush();

    expect(result).toMatchObject({
      ok: false,
      action: 'forcePush',
      cause: 'no_access',
      accessMode: 'none',
      attemptedLocalRepermission: true,
      attemptedApiReauth: true,
      performedPush: false,
    });
    expect(driveDataAdapterMock.writeDomain).not.toHaveBeenCalled();
    expect(driveSyncEngineModule.driveSyncEngine.getState().pendingChangesCount).toBe(1);
  });

  it('should try silent API recovery before declaring no access', async () => {
    const driveSyncEngineModule = await importDriveSyncEngine();
    activeEngineModule = driveSyncEngineModule;

    driveDataAdapterMock.detectAccessMode
      .mockResolvedValueOnce('none')
      .mockResolvedValueOnce('api');
    googleDriveServiceMock.ensureDriveAccess.mockResolvedValue(true);

    const bindings = createBindings();
    await driveSyncEngineModule.driveSyncEngine.initialize(
      bindings.readLocalDomain,
      bindings.writeLocalDomain,
      bindings.readLocalPreference,
      bindings.writeLocalPreference,
      bindings.flushLocalPersistence,
    );

    const result = await driveSyncEngineModule.driveSyncEngine.reconnectWithRepermission();

    expect(googleDriveServiceMock.ensureDriveAccess).toHaveBeenCalledTimes(1);
    expect(result).toMatchObject({
      ok: true,
      action: 'reconnectWithRepermission',
      accessMode: 'api',
      attemptedApiReauth: true,
    });
    expect(driveSyncEngineModule.driveSyncEngine.getState().accessMode).toBe('api');
  });

  it('should enter error state when remote _meta.json is invalid without pushing local data', async () => {
    const driveSyncEngineModule = await importDriveSyncEngine();
    activeEngineModule = driveSyncEngineModule;

    driveDataAdapterMock.detectAccessMode.mockResolvedValue('api');
    driveDataAdapterMock.readMeta.mockRejectedValue(
      new Error('Arquivo _meta.json inválido ou corrompido no Google Drive.'),
    );

    const bindings = createBindings();
    await driveSyncEngineModule.driveSyncEngine.initialize(
      bindings.readLocalDomain,
      bindings.writeLocalDomain,
      bindings.readLocalPreference,
      bindings.writeLocalPreference,
      bindings.flushLocalPersistence,
    );

    expect(driveSyncEngineModule.driveSyncEngine.getState().status).toBe('error');
    expect(driveSyncEngineModule.driveSyncEngine.getState().errorMessage).toContain('_meta.json');
    expect(driveDataAdapterMock.writeDomain).not.toHaveBeenCalled();
    expect(driveDataAdapterMock.writeMeta).not.toHaveBeenCalled();
  });

  it('should flush local durability and push pending domains after API recovery succeeds', async () => {
    const driveSyncEngineModule = await importDriveSyncEngine();
    activeEngineModule = driveSyncEngineModule;

    googleDriveServiceMock.ensureDriveAccess.mockResolvedValue(true);

    const bindings = createBindings([{ id: 'client-1', name: 'Cliente Local' }]);
    await driveSyncEngineModule.driveSyncEngine.initialize(
      bindings.readLocalDomain,
      bindings.writeLocalDomain,
      bindings.readLocalPreference,
      bindings.writeLocalPreference,
      bindings.flushLocalPersistence,
    );

    driveSyncEngineModule.driveSyncEngine.notifyDomainChanged(
      'clients',
      [],
      [{ id: 'client-1', name: 'Cliente Local' }],
    );

    const result = await driveSyncEngineModule.driveSyncEngine.forcePush();
    await Promise.resolve();
    await Promise.resolve();

    expect(bindings.flushLocalPersistence).toHaveBeenCalled();
    expect(driveDataAdapterMock.writeDomain).toHaveBeenCalledWith('api', 'clients', [
      { id: 'client-1', name: 'Cliente Local' },
    ]);
    expect(driveDataAdapterMock.writeMeta).toHaveBeenCalledTimes(1);
    expect(result).toMatchObject({
      ok: true,
      action: 'forcePush',
      accessMode: 'api',
      performedPush: true,
    });
    expect(driveSyncEngineModule.driveSyncEngine.getState().pendingChangesCount).toBe(0);
  });
});
