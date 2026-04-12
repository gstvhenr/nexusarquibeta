import { useCallback, useEffect, useState } from 'react';
import { Section } from '@/components/ui';
import { useDriveSync } from '../../hooks/useDriveSync';
import { googleDriveService } from '@/services/infrastructure/googleDriveService';
import type { DriveState } from '@/services/infrastructure/googleDriveTypes';
import { localDriveService } from '@/services/infrastructure/localDriveService';
import type { SyncOperationResult } from '@/services/infrastructure/driveSyncTypes';
import { GoogleDriveApiStatus, GoogleDriveFolderStatus } from './GoogleDriveAccessStatus';
import { GoogleDriveSyncPanel } from './GoogleDriveSyncPanel';

type DriveMode = 'local' | 'api' | 'none';

type FeedbackMessage = {
  type: 'success' | 'error';
  text: string;
};

function buildFeedbackMessage(
  result: SyncOperationResult,
  successFallback: string,
  errorFallback: string,
): FeedbackMessage {
  if (result.ok) {
    return {
      type: 'success',
      text: result.message ?? successFallback,
    };
  }

  return {
    type: 'error',
    text: result.message ?? errorFallback,
  };
}

function GoogleDriveSection(): JSX.Element {
  const {
    accessMode,
    forcePush,
    forcePull,
    flushPendingWrites,
    reconnect,
    reconnectWithRepermission,
    lastSyncTimestamp,
    pendingChangesCount,
    retryScheduledAt,
    dirtyPreferences,
  } = useDriveSync();
  const [folderName, setFolderName] = useState<string | null>(null);
  const [localPermissionActive, setLocalPermissionActive] = useState(false);
  const [apiState, setApiState] = useState<DriveState>(googleDriveService.getState());
  const [syncing, setSyncing] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [message, setMessage] = useState<FeedbackMessage | null>(null);

  const refreshLocalFolderState = useCallback(async () => {
    const name = await localDriveService.initDisplayName();
    setFolderName(name);

    if (!name) {
      setLocalPermissionActive(false);
      return;
    }

    const hasPermission = await localDriveService.hasActivePermission();
    setLocalPermissionActive(hasPermission);
  }, []);

  useEffect(() => {
    void refreshLocalFolderState();
  }, [refreshLocalFolderState]);

  useEffect(() => {
    const unsubscribeApi = googleDriveService.subscribe((state) => {
      setApiState(state);
    });

    const unsubscribeLocal = localDriveService.subscribe(() => {
      void refreshLocalFolderState();
    });

    setApiState(googleDriveService.getState());

    return () => {
      unsubscribeApi();
      unsubscribeLocal();
    };
  }, [refreshLocalFolderState]);

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(null), 4000);
    return () => clearTimeout(timer);
  }, [message]);

  const handleSelectFolder = useCallback(async () => {
    try {
      setMessage(null);
      const name = await localDriveService.selectFolder();
      await refreshLocalFolderState();
      await reconnect();
      setMessage({
        type: 'success',
        text: `Pasta selecionada: ${name}/01. NexusArqui`,
      });
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      setMessage({
        type: 'error',
        text: `Erro ao selecionar pasta: ${error instanceof Error ? error.message : 'Desconhecido'}`,
      });
    }
  }, [reconnect, refreshLocalFolderState]);

  const handleRemoveFolder = useCallback(async () => {
    await localDriveService.clearSavedFolder();
    await refreshLocalFolderState();
    await reconnect();
    setMessage({ type: 'success', text: 'Pasta local removida.' });
  }, [reconnect, refreshLocalFolderState]);

  const handleSync = useCallback(async () => {
    setSyncing(true);
    setMessage(null);

    try {
      const result = await forcePush();
      setMessage(
        buildFeedbackMessage(
          result,
          'Dados enviados para a nuvem.',
          'Falha ao enviar dados para o Google Drive.',
        ),
      );
    } finally {
      await refreshLocalFolderState();
      setSyncing(false);
    }
  }, [forcePush, refreshLocalFolderState]);

  const handleConnectApi = useCallback(async () => {
    setMessage(null);
    try {
      await googleDriveService.signIn();
    } catch (error) {
      setMessage({
        type: 'error',
        text: `Erro ao conectar Google Drive: ${error instanceof Error ? error.message : 'Desconhecido'}`,
      });
    }
  }, []);

  const handleRestore = useCallback(async () => {
    const confirmed = window.confirm(
      'Baixar dados na núvem? Isso unirá e possivelmente substituirá dados locais pelo que estiver remoto.',
    );
    if (!confirmed) return;

    setRestoring(true);
    setMessage(null);

    try {
      const result = await forcePull();
      setMessage(
        buildFeedbackMessage(
          result,
          'Dados remotos aplicados com sucesso.',
          'Falha ao restaurar dados do Google Drive.',
        ),
      );
    } finally {
      await refreshLocalFolderState();
      setRestoring(false);
    }
  }, [forcePull, refreshLocalFolderState]);

  const handleFlush = useCallback(async () => {
    setMessage(null);
    const result = await flushPendingWrites();
    setMessage(
      buildFeedbackMessage(
        result,
        'Fila local enviada com sucesso.',
        'Falha ao processar a fila local.',
      ),
    );
    await refreshLocalFolderState();
  }, [flushPendingWrites, refreshLocalFolderState]);

  const handleReconnectAccess = useCallback(async () => {
    setMessage(null);
    const result = await reconnectWithRepermission();
    setMessage(
      buildFeedbackMessage(
        result,
        result.accessMode === 'local'
          ? 'Permissão da pasta local restabelecida.'
          : 'Acesso ao Google Drive restabelecido via API.',
        'Falha ao reavaliar a conexão com o Google Drive.',
      ),
    );
    await refreshLocalFolderState();
  }, [reconnectWithRepermission, refreshLocalFolderState]);

  const isApiConnected = apiState.status === 'connected';
  const canSync = accessMode !== 'none';
  const activeDriveMode: DriveMode = accessMode;

  return (
    <Section
      title="Google Drive"
      description="Sincronize seus dados com o Google Drive para backup e acesso de outras máquinas."
    >
      <div className="space-y-5">
        <GoogleDriveFolderStatus
          folderName={folderName}
          localPermissionActive={localPermissionActive}
          onSelectFolder={handleSelectFolder}
          onRemoveFolder={handleRemoveFolder}
        />

        <GoogleDriveApiStatus
          apiState={apiState}
          folderName={folderName}
          localPermissionActive={localPermissionActive}
          isApiConnected={isApiConnected}
          onConnectApi={handleConnectApi}
        />

        {canSync && (
          <GoogleDriveSyncPanel
            driveMode={activeDriveMode}
            syncing={syncing}
            restoring={restoring}
            lastSyncTimestamp={lastSyncTimestamp}
            pendingChangesCount={pendingChangesCount}
            dirtyPreferencesCount={dirtyPreferences.length}
            retryScheduledAt={retryScheduledAt}
            onSync={handleSync}
            onRestore={handleRestore}
            onFlush={handleFlush}
            onReconnect={handleReconnectAccess}
          />
        )}

        {message && (
          <div
            className={`rounded-lg px-4 py-2 text-sm ${
              message.type === 'success' ? 'bg-success/10 text-success' : 'bg-error/10 text-error'
            }`}
          >
            {message.text}
          </div>
        )}
      </div>
    </Section>
  );
}

export { GoogleDriveSection };
