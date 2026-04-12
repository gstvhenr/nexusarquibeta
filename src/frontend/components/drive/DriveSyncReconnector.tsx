import React, { useCallback, useEffect, useState } from 'react';
import { Button, AlertIcon } from '@/components/ui';
import { googleDriveService } from '@/services/infrastructure/googleDriveService';
import { localDriveService } from '@/services/infrastructure/localDriveService';
import { useDriveSync } from '@/hooks/useDriveSync';

export const DriveSyncReconnector: React.FC = () => {
  const { status, accessMode, reconnectWithRepermission } = useDriveSync();
  const [needsLocalReconnect, setNeedsLocalReconnect] = useState(false);
  const [isApiActive, setIsApiActive] = useState(accessMode === 'api');

  const refreshReconnectState = useCallback(async () => {
    const hasFolder = await localDriveService.hasSavedFolder();
    const apiConnected =
      googleDriveService.getState().status === 'connected' || accessMode === 'api';
    setIsApiActive(apiConnected);

    if (!hasFolder) {
      setNeedsLocalReconnect(false);
      return;
    }

    const hasAccess = await localDriveService.hasActivePermission();
    setNeedsLocalReconnect(!hasAccess);
  }, [accessMode]);

  useEffect(() => {
    void refreshReconnectState();
  }, [refreshReconnectState, status]);

  useEffect(() => {
    const unsubscribeLocal = localDriveService.subscribe(() => {
      void refreshReconnectState();
    });

    const unsubscribeApi = googleDriveService.subscribe(() => {
      void refreshReconnectState();
    });

    return () => {
      unsubscribeLocal();
      unsubscribeApi();
    };
  }, [refreshReconnectState]);

  const handleReconnect = useCallback(async () => {
    try {
      await reconnectWithRepermission();
      await refreshReconnectState();
    } catch {
      // Ignore prompt cancellation from the browser permission flow.
    }
  }, [reconnectWithRepermission, refreshReconnectState]);

  useEffect(() => {
    if (!needsLocalReconnect) return;

    const handleFirstUserInteraction = async () => {
      await handleReconnect();
    };

    document.addEventListener('click', handleFirstUserInteraction, { once: true, capture: true });

    return () => {
      document.removeEventListener('click', handleFirstUserInteraction, { capture: true });
    };
  }, [handleReconnect, needsLocalReconnect]);

  if (!needsLocalReconnect) return null;

  const bannerColorClass = isApiActive
    ? 'bg-info/10 border-info/20'
    : 'bg-warning/10 border-warning/20';
  const iconColorClass = isApiActive ? 'text-info' : 'text-warning';
  const iconBgClass = isApiActive ? 'bg-info/20' : 'bg-warning/20';

  const title = isApiActive ? 'Pasta local desconectada' : 'Sincronização pausada';

  const description = isApiActive
    ? 'A sincronização segue pela API. Reconecte a pasta local para restaurar o cache offline do Google Drive Desktop.'
    : 'A pasta local perdeu permissão e não há fallback ativo. Reavalie a conexão para retomar a sincronia.';

  const buttonLabel = isApiActive ? 'Reconectar Pasta' : 'Reavaliar Conexão';

  return (
    <div
      className={`${bannerColorClass} z-50 flex flex-col items-center justify-between gap-4 border-b p-2 md:flex-row md:p-3`}
    >
      <div className="flex items-center gap-3">
        <div className={`${iconBgClass} flex-shrink-0 rounded-full p-1.5`}>
          <AlertIcon className={`${iconColorClass} h-5 w-5`} />
        </div>
        <div>
          <h4 className="m-0 text-sm font-semibold text-text-primary">{title}</h4>
          <p className="m-0 mt-0.5 text-xs text-text-secondary">{description}</p>
        </div>
      </div>
      <Button
        onClick={() => void handleReconnect()}
        variant="primary"
        size="sm"
        className="w-full flex-shrink-0 md:w-auto"
      >
        {buttonLabel}
      </Button>
    </div>
  );
};
