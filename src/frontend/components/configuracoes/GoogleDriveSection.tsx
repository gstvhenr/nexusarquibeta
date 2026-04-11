import { useCallback, useEffect, useState } from 'react';
import { Button, Section } from '@/components/ui';
import { useDriveSync } from '../../hooks/useDriveSync';
import { googleDriveService } from '@/services/infrastructure/googleDriveService';
import type { DriveState } from '@/services/infrastructure/googleDriveTypes';
import { localDriveService } from '@/services/infrastructure/localDriveService';
import { SyncStatusIndicator } from '../layout/SyncStatusIndicator';

type DriveMode = 'local' | 'api' | 'none';

function formatTimestamp(timestamp: number | null): string {
  if (!timestamp) return 'Nunca';
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(timestamp));
}

function GoogleDriveSection(): JSX.Element {
  const { forcePush, forcePull, status: syncStatus, lastSyncTimestamp } = useDriveSync();
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
    localDriveService.initDisplayName().then((name) => {
      if (name) {
        setFolderName(name);
        setDriveMode('local');
      } else if (googleDriveService.getState().status === 'connected') {
        setDriveMode('api');
      }
    });
  }, []);

  useEffect(() => {
    const unsubscribe = googleDriveService.subscribe((state) => {
      setApiState(state);
    });

    // Dynamic api state (from the core service object structure, usually we check if there's a user)
    // Here we can subscribe if we had the direct googleDriveService, but since we rely on sync status:
    if (syncStatus !== 'offline' && driveMode !== 'local') {
      setDriveMode('api');
    }

    return unsubscribe;
  }, [driveMode, syncStatus]);

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
  }, []);

  const handleRemoveFolder = useCallback(async () => {
    await localDriveService.clearSavedFolder();
    setFolderName(null);
    setDriveMode(apiState.status === 'connected' ? 'api' : 'none');
    setMessage({ type: 'success', text: 'Pasta local removida.' });
  }, [apiState.status]);

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
        text: 'Baixado com sucesso! Recarregando...',
      });
      setTimeout(() => window.location.reload(), 1500);
    } catch (error) {
      setMessage({
        type: 'error',
        text: `Erro ao baixar resgate: ${error instanceof Error ? error.message : 'Desconhecido'}`,
      });
    } finally {
      setRestoring(false);
    }
  }, [forcePull]);

  const isApiConnected = apiState.status === 'connected';
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
            <div className="flex items-center justify-between rounded-lg bg-surface-hover px-4 py-3">
              <div className="flex items-center gap-2">
                <span
                  className="inline-block h-2.5 w-2.5 rounded-full bg-success"
                  aria-hidden="true"
                />
                <span className="text-sm text-text-primary">
                  {folderName}/<span className="font-semibold">01. NexusArqui</span>
                </span>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={handleSelectFolder}>
                  Alterar
                </Button>
                <Button variant="secondary" onClick={handleRemoveFolder}>
                  Remover
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between rounded-lg border border-dashed border-border-color/50 px-4 py-3">
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
          </div>
        )}

        {/* Sync actions */}
        {canSync && (
          <div className="space-y-4 border-t border-border-color/50 pt-5">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-text-primary">Sincronizar com Drive</h4>
                <p className="text-sm text-text-secondary">
                  {driveMode === 'local'
                    ? 'Salva os dados na pasta local do Google Drive.'
                    : 'Envia os dados via API para o Google Drive.'}
                </p>
              </div>
              <Button variant="secondary" onClick={handleSync} disabled={syncing}>
                {syncing ? 'Sincronizando…' : 'Sincronizar'}
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-text-primary">Restaurar do Drive</h4>
                <p className="text-sm text-text-secondary">
                  {driveMode === 'local'
                    ? 'Restaura dados da pasta local do Google Drive.'
                    : 'Baixa dados via API do Google Drive.'}
                </p>
              </div>
              <Button variant="secondary" onClick={handleRestore} disabled={restoring}>
                {restoring ? 'Restaurando…' : 'Restaurar'}
              </Button>
            </div>

            <div className="text-xs text-text-secondary">
              Modo ativo:{' '}
              <span className="font-semibold">
                {driveMode === 'local' ? 'Pasta Local' : 'API Web'}
              </span>
              {' · '}Última sincronização:{' '}
              {formatTimestamp(lastSyncTimestamp ? new Date(lastSyncTimestamp).getTime() : null)}
            </div>

            <div className="flex items-center gap-2 pt-2">
              <span className="font-semibold text-text-primary">Status do Motor de Sincronia:</span>
              <SyncStatusIndicator />
            </div>
          </div>
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
