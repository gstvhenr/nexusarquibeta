import { useCallback, useEffect, useState } from 'react';
import { Button, Section } from '@/components/ui';
import { useDriveSync } from '../../hooks/useDriveSync';
import { googleDriveService } from '@/services/infrastructure/googleDriveService';
import type { DriveState } from '@/services/infrastructure/googleDriveTypes';
import { localDriveService } from '@/services/infrastructure/localDriveService';
import { GoogleDriveSyncPanel } from './GoogleDriveSyncPanel';

type DriveMode = 'local' | 'api' | 'none';

function GoogleDriveSection(): JSX.Element {
  const {
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
  const [driveMode, setDriveMode] = useState<DriveMode>('none');
  const [apiState, setApiState] = useState<DriveState>({
    status: 'disconnected',
    userEmail: null,
    lastSyncTimestamp: null,
    errorMessage: null,
  });
  const [syncing, setSyncing] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  useEffect(() => {
    setApiState(googleDriveService.getState());
    localDriveService.initDisplayName().then((name) => {
      if (name) {
        setFolderName(name);
        setDriveMode('local');
      } else if (googleDriveService.isSignedIn()) {
        setDriveMode('api');
      }
    });
  }, []);

  useEffect(() => {
    const unsubscribe = googleDriveService.subscribe((state) => {
      setApiState(state);
      if (!folderName) {
        setDriveMode(googleDriveService.isSignedIn() ? 'api' : 'none');
      }
    });

    return unsubscribe;
  }, [folderName]);

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(null), 4000);
    return () => clearTimeout(timer);
  }, [message]);

  // ---------- Local folder ----------

  const handleSelectFolder = useCallback(async () => {
    try {
      setMessage(null);
      const name = await localDriveService.selectFolder();
      setFolderName(name);
      setDriveMode('local');
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
  }, [reconnect]);

  const handleRemoveFolder = useCallback(async () => {
    await localDriveService.clearSavedFolder();
    setFolderName(null);
    setDriveMode(googleDriveService.isSignedIn() ? 'api' : 'none');
    await reconnect();
    setMessage({ type: 'success', text: 'Pasta local removida.' });
  }, [reconnect]);

  // ---------- Sync / Restore ----------

  const handleSync = useCallback(async () => {
    setSyncing(true);
    setMessage(null);
    try {
      await forcePush();
      setMessage({
        type: 'success',
        text: 'Dados enviados para a nuvem!',
      });
    } catch (error) {
      setMessage({
        type: 'error',
        text: `Erro ao subir dados: ${error instanceof Error ? error.message : 'Desconhecido'}`,
      });
    } finally {
      setSyncing(false);
    }
  }, [forcePush]);

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
      await forcePull();
      setMessage({
        type: 'success',
        text: 'Dados remotos aplicados com sucesso.',
      });
    } catch (error) {
      setMessage({
        type: 'error',
        text: `Erro ao baixar resgate: ${error instanceof Error ? error.message : 'Desconhecido'}`,
      });
    } finally {
      setRestoring(false);
    }
  }, [forcePull]);

  const isApiConnected = googleDriveService.isSignedIn();
  const canSync = driveMode === 'local' || (driveMode === 'api' && isApiConnected);

  return (
    <Section
      title="Google Drive"
      description="Sincronize seus dados com o Google Drive para backup e acesso de outras máquinas."
    >
      <div className="space-y-5">
        {/* Local folder selection */}
        <div>
          <h4 className="mb-2 font-semibold text-text-primary">Pasta Local do Google Drive</h4>

          {folderName ? (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-3">
              <div className="flex items-center gap-2">
                <span
                  className="inline-block h-2.5 w-2.5 rounded-full bg-success"
                  aria-hidden="true"
                />
                <span className="text-sm text-text-primary">
                  {folderName}/<span className="font-semibold">01. NexusArqui</span>
                </span>
              </div>
              <div className="flex gap-3">
                <Button variant="secondary" onClick={handleSelectFolder}>
                  Alterar
                </Button>
                <Button variant="secondary" onClick={handleRemoveFolder}>
                  Remover
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-3 rounded-lg border border-dashed border-border-color/50 px-4 py-3">
              <p className="text-sm text-text-secondary">
                Nenhuma pasta selecionada. Selecione a pasta raiz do Google Drive (ex: O:\Meu
                Drive).
              </p>
              <Button variant="primary" onClick={handleSelectFolder}>
                Selecionar Pasta
              </Button>
            </div>
          )}
        </div>

        {/* API status indicator */}
        {!folderName && (
          <div className="border-t border-border-color/50 pt-5">
            <h4 className="mb-2 font-semibold text-text-primary">Conexão via API</h4>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <span
                  className={`inline-block h-2.5 w-2.5 rounded-full ${isApiConnected ? 'bg-success' : 'bg-border-color'}`}
                  aria-hidden="true"
                />
                <span className="text-sm text-text-primary">
                  {isApiConnected ? 'Conectado' : 'Desconectado'}
                </span>
                {apiState.userEmail && (
                  <span className="text-sm text-text-secondary">({apiState.userEmail})</span>
                )}
              </div>

              {!isApiConnected && (
                <Button variant="secondary" onClick={() => void handleConnectApi()}>
                  {apiState.status === 'connecting' ? 'Conectando...' : 'Conectar Google Drive'}
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Sync actions */}
        {canSync && (
          <GoogleDriveSyncPanel
            driveMode={driveMode}
            syncing={syncing}
            restoring={restoring}
            lastSyncTimestamp={lastSyncTimestamp}
            pendingChangesCount={pendingChangesCount}
            dirtyPreferencesCount={dirtyPreferences.length}
            retryScheduledAt={retryScheduledAt}
            onSync={handleSync}
            onRestore={handleRestore}
            onFlush={() => void flushPendingWrites()}
            onReconnect={() => void reconnectWithRepermission()}
          />
        )}

        {/* Feedback message */}
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
