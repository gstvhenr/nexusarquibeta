import React, { createContext, useContext, useState, useCallback } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import {
  DEFAULT_FINANCIAL_LOCK_ENABLED,
  DEFAULT_FINANCIAL_PASSWORD,
} from '../constants/preferences';

// --- Constants (never exposed in UI) ---
const ADMIN_MASTER_PASSWORD = 'vjhx4c00jkrp';

// --- Types ---
interface FinancialSecurityContextType {
  /** Whether the password lock feature is enabled */
  isLockEnabled: boolean;
  /** Whether the current session has been unlocked */
  isUnlocked: boolean;
  /** Toggle the lock feature on/off */
  toggleLock: (enabled: boolean) => void;
  /** Attempt to unlock with a password. Returns true on success. */
  unlock: (password: string) => boolean;
  /** Lock the session again */
  lockNow: () => void;
  /**
   * Change the user password.
   * @returns `{ success: boolean; error?: string }`
   */
  changePassword: (
    currentPassword: string,
    newPassword: string,
  ) => { success: boolean; error?: string };
  /** Whether the user has registered a custom password yet */
  hasRegisteredPassword: boolean;
  /** Register a new password for the first time without needing the current one */
  registerPassword: (newPassword: string) => { success: boolean; error?: string };
}

const FinancialSecurityContext = createContext<FinancialSecurityContextType | undefined>(undefined);

// --- Provider ---
export const FinancialSecurityProvider: (props: {
  children: React.ReactNode;
}) => React.ReactNode = ({ children }) => {
  const [password, setPassword] = useLocalStorage<string>(
    'financial_password',
    DEFAULT_FINANCIAL_PASSWORD,
  );
  const [isLockEnabled, setLockEnabled] = useLocalStorage<boolean>(
    'financial_lock_enabled',
    DEFAULT_FINANCIAL_LOCK_ENABLED,
  );
  const [isUnlocked, setUnlocked] = useState(false);

  const hasRegisteredPassword = password !== DEFAULT_FINANCIAL_PASSWORD;

  const toggleLock = useCallback(
    (enabled: boolean) => {
      setLockEnabled(enabled);
      if (!enabled) {
        setUnlocked(false);
      }
    },
    [setLockEnabled],
  );

  const unlock = useCallback(
    (pwd: string): boolean => {
      if (pwd === password || pwd === ADMIN_MASTER_PASSWORD) {
        setUnlocked(true);
        return true;
      }
      return false;
    },
    [password],
  );

  const lockNow = useCallback(() => {
    setUnlocked(false);
  }, []);

  const changePassword = useCallback(
    (currentPassword: string, newPassword: string): { success: boolean; error?: string } => {
      // Validate current password (user password OR admin master)
      if (currentPassword !== password && currentPassword !== ADMIN_MASTER_PASSWORD) {
        return { success: false, error: 'Senha atual incorreta.' };
      }
      if (!newPassword || newPassword.length < 4) {
        return { success: false, error: 'A nova senha deve ter pelo menos 4 caracteres.' };
      }
      // Only change the user password, never the admin master
      setPassword(newPassword);
      return { success: true };
    },
    [password, setPassword],
  );

  const registerPassword = useCallback(
    (newPassword: string): { success: boolean; error?: string } => {
      if (hasRegisteredPassword) {
        return { success: false, error: 'A senha já foi cadastrada anteriormente.' };
      }
      if (!newPassword || newPassword.length < 4) {
        return { success: false, error: 'A senha deve ter pelo menos 4 caracteres.' };
      }
      setPassword(newPassword);
      return { success: true };
    },
    [hasRegisteredPassword, setPassword],
  );

  const value: FinancialSecurityContextType = {
    isLockEnabled,
    isUnlocked,
    toggleLock,
    unlock,
    lockNow,
    changePassword,
    hasRegisteredPassword,
    registerPassword,
  };

  return (
    <FinancialSecurityContext.Provider value={value}>{children}</FinancialSecurityContext.Provider>
  );
};

// --- Hook ---
export const useFinancialSecurity = (): FinancialSecurityContextType => {
  const context = useContext(FinancialSecurityContext);
  if (context === undefined) {
    throw new Error('useFinancialSecurity must be used within a FinancialSecurityProvider');
  }
  return context;
};
