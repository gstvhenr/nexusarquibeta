import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { uiPreferenceService } from '../services/infrastructure/uiPreferenceService';
import { FinancialSecurityProvider, useFinancialSecurity } from './FinancialSecurityContext';

const ADMIN_MASTER_PASSWORD = 'vjhx4c00jkrp';
const DEFAULT_PASSWORD = '#Umbrella911';

const wrapper = ({ children }: { children: ReactNode }) => (
  <FinancialSecurityProvider>{children}</FinancialSecurityProvider>
);

describe('FinancialSecurityContext', () => {
  beforeEach(() => {
    vi.restoreAllMocks();

    vi.spyOn(uiPreferenceService, 'getItem').mockImplementation(async (_key, initialValue) => {
      return initialValue;
    });
    vi.spyOn(uiPreferenceService, 'setItem').mockResolvedValue();
  });

  it('throws when useFinancialSecurity is used outside provider', () => {
    expect(() => renderHook(() => useFinancialSecurity())).toThrow(
      'useFinancialSecurity must be used within a FinancialSecurityProvider',
    );
  });

  it('unlocks session with user password and admin password', async () => {
    const { result } = renderHook(() => useFinancialSecurity(), { wrapper });

    await waitFor(() => {
      expect(result.current.isUnlocked).toBe(false);
    });

    act(() => {
      expect(result.current.unlock(DEFAULT_PASSWORD)).toBe(true);
    });
    expect(result.current.isUnlocked).toBe(true);

    act(() => {
      result.current.lockNow();
    });
    expect(result.current.isUnlocked).toBe(false);

    act(() => {
      expect(result.current.unlock(ADMIN_MASTER_PASSWORD)).toBe(true);
    });
    expect(result.current.isUnlocked).toBe(true);
  });

  it('keeps session locked when unlock password is invalid', async () => {
    const { result } = renderHook(() => useFinancialSecurity(), { wrapper });

    await waitFor(() => {
      expect(result.current.isUnlocked).toBe(false);
    });

    act(() => {
      expect(result.current.unlock('wrong-password')).toBe(false);
    });

    expect(result.current.isUnlocked).toBe(false);
  });

  it('disables lock and forces locked state when toggleLock(false) is called', async () => {
    const { result } = renderHook(() => useFinancialSecurity(), { wrapper });

    await waitFor(() => {
      expect(result.current.isUnlocked).toBe(false);
    });

    act(() => {
      result.current.unlock(DEFAULT_PASSWORD);
    });
    expect(result.current.isUnlocked).toBe(true);

    act(() => {
      result.current.toggleLock(false);
    });

    expect(result.current.isLockEnabled).toBe(false);
    expect(result.current.isUnlocked).toBe(false);
  });

  it('validates current password and minimum length when changing password', () => {
    const { result } = renderHook(() => useFinancialSecurity(), { wrapper });

    const wrongCurrentResponse = result.current.changePassword('wrong-current', 'new-pass');
    expect(wrongCurrentResponse).toEqual({ success: false, error: 'Senha atual incorreta.' });

    const shortPasswordResponse = result.current.changePassword(DEFAULT_PASSWORD, '123');
    expect(shortPasswordResponse).toEqual({
      success: false,
      error: 'A nova senha deve ter pelo menos 4 caracteres.',
    });
  });

  it('changes password when current password is valid', async () => {
    const setItemSpy = vi.spyOn(uiPreferenceService, 'setItem').mockResolvedValue();
    const { result } = renderHook(() => useFinancialSecurity(), { wrapper });

    const response = result.current.changePassword(DEFAULT_PASSWORD, 'new-password');
    expect(response).toEqual({ success: true });

    await waitFor(() => {
      expect(setItemSpy).toHaveBeenCalledWith('financial_password', 'new-password');
    });
  });
});
