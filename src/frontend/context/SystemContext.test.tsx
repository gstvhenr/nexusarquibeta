import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { SystemContext, useSystemData } from './SystemContext';
import type { SystemDataType } from './types';

const createSystemValue = (): SystemDataType => ({
  documentStorage: {} as SystemDataType['documentStorage'],
  agendaEvents: [] as SystemDataType['agendaEvents'],
  reminders: [] as SystemDataType['reminders'],
  customBudgetTemplate: null as SystemDataType['customBudgetTemplate'],
  globalIdentifierCounter: 0,
  dismissedFocusItems: [] as SystemDataType['dismissedFocusItems'],
  acceptedPaymentMethods: [] as SystemDataType['acceptedPaymentMethods'],
  hiredServices: [] as SystemDataType['hiredServices'],
  contractDeadlines: {} as SystemDataType['contractDeadlines'],
  setDocumentStorage: vi.fn(),
  setAgendaEvents: vi.fn(),
  setReminders: vi.fn(),
  setCustomBudgetTemplate: vi.fn(),
  setGlobalIdentifierCounter: vi.fn(),
  setDismissedFocusItems: vi.fn(),
  setAcceptedPaymentMethods: vi.fn(),
  setHiredServices: vi.fn(),
  setContractDeadlines: vi.fn(),
});

describe('SystemContext', () => {
  it('throws when useSystemData is used outside provider', () => {
    expect(() => renderHook(() => useSystemData())).toThrowError(
      'useSystemData must be used within DataProvider',
    );
  });

  it('returns provider value when available', () => {
    const value = createSystemValue();
    const wrapper = ({ children }: { children: ReactNode }) => (
      <SystemContext.Provider value={value}>{children}</SystemContext.Provider>
    );

    const { result } = renderHook(() => useSystemData(), { wrapper });

    expect(result.current).toBe(value);
  });
});
