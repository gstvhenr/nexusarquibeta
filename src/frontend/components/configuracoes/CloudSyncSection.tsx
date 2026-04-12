import { useCallback, useEffect, useMemo, useState } from 'react';
import { Section } from '@/components/ui';
import { useCloudSync } from '@/hooks/useCloudSync';
import { firebaseAuthService } from '@/services/infrastructure/firebaseAuthService';
import type { SyncOperationResult } from '@/services/infrastructure/cloudSyncTypes';

type FeedbackMessage = {
  type: 'success' | 'error';
  text: string;
};

function formatTimestamp(timestamp: number | null): string {
  if (!timestamp) {
    return 'Nunca';
  }

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(timestamp));
}

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

function CloudSyncSection(): JSX.Element {
  const authState = firebaseAuthService.getState();
  const { accessMode, status, lastSyncTimestamp, isPaused, forcePush, forcePull, pause, resume } =
    useCloudSync();
  const [message, setMessage] = useState<FeedbackMessage | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  useEffect(() => {
    if (!message) {
      return;
    }

    const timer = window.setTimeout(() => setMessage(null), 4000);
    return () => window.clearTimeout(timer);
  }, [message]);

  const syncSummary = useMemo(() => {
    if (isPaused) {
      return 'A sincronização está pausada. Seus dados estão salvos apenas no navegador.';
    }

    if (status === 'syncing') {
      return 'Salvando alterações na nuvem...';
    }

    if (status === 'error') {
      return 'Houve um problema de conexão. Suas alterações continuam salvas localmente.';
    }

    if (status === 'offline') {
      return 'Sem internet no momento. O sistema salvará na nuvem automaticamente quando a conexão voltar.';
    }

    return 'Tudo certo! Seus dados estão sincronizados e seguros na nuvem.';
  }, [status, isPaused]);

  const handleToggleSync = useCallback(() => {
    if (isPaused) {
      resume();
      setMessage({ type: 'success', text: 'Sincronização reativada.' });
    } else {
      pause();
      setMessage({
        type: 'success',
        text: 'Sincronização pausada. Seus dados permanecem salvos localmente.',
      });
    }
  }, [isPaused, pause, resume]);

  const handleAction = useCallback(
    async (
      operation: () => Promise<SyncOperationResult>,
      successFallback: string,
      errorFallback: string,
    ) => {
      setIsBusy(true);
      setMessage(null);

      try {
        const result = await operation();
        setMessage(buildFeedbackMessage(result, successFallback, errorFallback));
      } finally {
        setIsBusy(false);
      }
    },
    [],
  );

  const isActionDisabled = isBusy || isPaused || accessMode !== 'firebase';

  return (
    <Section
      title="Sincronização em Nuvem"
      description="Gerencie a sincronização dos seus projetos e orçamentos de forma segura."
    >
      <div className="space-y-4">
        <div className="rounded-xl border border-border-color bg-surface-card p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex-1">
              <h4 className="font-semibold text-text-primary">
                {authState.userEmail ?? 'Não Autenticado na Nuvem'}
              </h4>
              <p className="mt-1 text-sm text-text-secondary">{syncSummary}</p>
            </div>
            <div className="flex flex-col items-end gap-2 shrink-0">
              <div className="text-xs text-text-secondary sm:text-right">
                <div className="text-muted mb-1">Última sincronização:</div>
                <div className="font-medium text-text-primary text-[13px]">
                  {formatTimestamp(lastSyncTimestamp)}
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={!isPaused}
                aria-label={isPaused ? 'Ativar sincronização' : 'Pausar sincronização'}
                onClick={handleToggleSync}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${
                  isPaused ? 'bg-text-secondary/30' : 'bg-success'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-150 ${
                    isPaused ? 'translate-x-1' : 'translate-x-6'
                  }`}
                />
              </button>
            </div>
          </div>

          {message && (
            <p
              className={`mt-3 rounded-lg px-3 py-2 text-sm ${
                message.type === 'success'
                  ? 'border border-success/20 bg-success/5 text-success'
                  : 'border border-error/20 bg-error/5 text-error'
              }`}
            >
              {message.text}
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-2 justify-end">
          <button
            type="button"
            disabled={isActionDisabled}
            onClick={() =>
              void handleAction(
                forcePush,
                'Forçado o envio de qualquer alteração pendente para a nuvem.',
                'Falha ao forçar o envio.',
              )
            }
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-content hover:bg-primary-hover transition-colors disabled:cursor-not-allowed disabled:opacity-60"
          >
            Forçar Envio
          </button>
          <button
            type="button"
            disabled={isActionDisabled}
            onClick={() =>
              void handleAction(
                forcePull,
                'A tela foi forçadamente atualizada com os arquivos da nuvem.',
                'Falha ao tentar forçar atualização.',
              )
            }
            className="rounded-lg border border-border-color bg-surface px-4 py-2 text-sm font-semibold text-text-primary hover:bg-hover transition-colors disabled:cursor-not-allowed disabled:opacity-60"
          >
            Forçar Atualização
          </button>
        </div>
      </div>
    </Section>
  );
}

export { CloudSyncSection };
