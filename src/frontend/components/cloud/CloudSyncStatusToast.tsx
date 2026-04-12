import { useCallback, useEffect, useState } from 'react';

const SESSION_KEY = 'nexus-cloud-sync-toast-shown';

type CloudSyncStatusToastProps = {
  visible: boolean;
  onDismiss: () => void;
};

function CloudSyncStatusToast({
  visible,
  onDismiss,
}: CloudSyncStatusToastProps): JSX.Element | null {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!visible) {
      return;
    }

    const alreadyShown = sessionStorage.getItem(SESSION_KEY);
    if (alreadyShown) {
      return;
    }

    setShow(true);
    sessionStorage.setItem(SESSION_KEY, 'true');
  }, [visible]);

  const handleDismiss = useCallback(() => {
    setShow(false);
    onDismiss();
  }, [onDismiss]);

  if (!show) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-fade-in-up">
      <div className="flex items-center gap-4 rounded-xl bg-surface-card px-5 py-3 shadow-lifted ring-1 ring-border-color/30">
        <div className="flex items-center gap-2">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500"
            aria-hidden="true"
          />
          <span className="text-sm font-semibold text-text-primary">
            Conexão estabelecida com o Firebase
          </span>
        </div>
        <button
          type="button"
          onClick={handleDismiss}
          className="rounded-lg bg-accent-primary/10 px-3 py-1 text-xs font-semibold text-accent-primary transition-colors hover:bg-accent-primary/20"
        >
          OK
        </button>
      </div>
    </div>
  );
}

export { CloudSyncStatusToast };
