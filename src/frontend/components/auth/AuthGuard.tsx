import React, { useEffect, useRef, useState } from 'react';
import { LoginPage } from './LoginPage';
import LoadingFallback from '../ui/LoadingFallback';
import { googleDriveService } from '../../services/infrastructure/googleDriveService';

/** Tempo máximo (ms) que o AuthGuard espera pela inicialização antes de mostrar LoginPage. */
const INIT_TIMEOUT_MS = 10000;

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const [isInitializing, setIsInitializing] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const initCompletedRef = useRef(false);
  const initTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let isMounted = true;

    function completeInit(authenticated: boolean) {
      if (!isMounted || initCompletedRef.current) return;
      initCompletedRef.current = true;
      if (initTimerRef.current) {
        clearTimeout(initTimerRef.current);
        initTimerRef.current = null;
      }
      setIsAuthenticated(authenticated);
      setIsInitializing(false);
    }

    // Timeout de segurança: se tryRestoreSession() travar (SDK não carrega, rede lenta),
    // forçar a tela de login em vez de LoadingFallback infinito.
    initTimerRef.current = setTimeout(() => {
      completeInit(false);
    }, INIT_TIMEOUT_MS);

    async function initAuth() {
      try {
        const restored = await googleDriveService.tryRestoreSession();
        if (!isMounted) return;
        completeInit(restored);
      } catch {
        completeInit(false);
      }
    }

    initAuth();

    return () => {
      isMounted = false;
      if (initTimerRef.current) {
        clearTimeout(initTimerRef.current);
      }
    };
  }, []);

  // Escutar mudanças de estado para reagir ao login/logout via popup
  useEffect(() => {
    const unsubscribe = googleDriveService.subscribe((driveState) => {
      if (driveState.status === 'connected') {
        setIsAuthenticated(true);
        setIsInitializing(false);
      } else if (driveState.status === 'disconnected') {
        setIsAuthenticated(false);
        setIsInitializing(false);
      }
      // 'connecting' é transitório — não alterar estado React para evitar flickering
    });

    return unsubscribe;
  }, []);

  if (isInitializing) {
    return <LoadingFallback />;
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return <>{children}</>;
}
