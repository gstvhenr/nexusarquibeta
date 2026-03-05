import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { AppData } from '../services/infrastructure/api';
import { useDomain } from './useDomain';

const makeAppData = (overrides: Partial<AppData> = {}): AppData => ({
  projects: [],
  proposals: [],
  clients: [],
  documentStorage: {} as AppData['documentStorage'],
  suppliers: [],
  products: [],
  supplierProductPrices: [],
  quotations: [],
  commissions: [],
  marketingProfessionals: [],
  marketingActivities: [],
  marketingIdeas: [],
  socialNetworks: [],
  freelancers: [],
  agendaEvents: [],
  manualExpenses: [],
  manualIncomes: [],
  customBudgetTemplate: null,
  globalIdentifierCounter: 1,
  dismissedFocusItems: [],
  acceptedPaymentMethods: [],
  hiredServices: [],
  prospects: [],
  contractDeadlines: {} as AppData['contractDeadlines'],
  cashBoxExpenses: [],
  cashBoxCredits: [],
  reminders: [],
  ...overrides,
});

describe('useDomain', () => {
  it('returns selected data keys plus generated setters', () => {
    const setField = vi.fn();
    const projects = [{ id: 'project-1' }] as unknown as AppData['projects'];
    const clients = [{ id: 'client-1' }] as unknown as AppData['clients'];
    const data = makeAppData({ projects, clients });

    const { result } = renderHook(() =>
      useDomain<'projects' | 'clients'>(data, setField, ['projects', 'clients']),
    );

    expect(result.current.projects).toBe(projects);
    expect(result.current.clients).toBe(clients);

    const nextProjects = [{ id: 'project-2' }] as unknown as AppData['projects'];
    act(() => {
      result.current.setProjects(nextProjects);
    });

    expect(setField).toHaveBeenCalledWith('projects', nextProjects);

    const updateClients = vi.fn((prev: AppData['clients']) => prev);
    act(() => {
      result.current.setClients(updateClients);
    });

    expect(setField).toHaveBeenCalledWith('clients', updateClients);
  });

  it('memoizes the domain object until selected deps change', () => {
    const setField = vi.fn();
    const projects = [{ id: 'project-1' }] as unknown as AppData['projects'];
    const initialData = makeAppData({ projects });

    const { result, rerender } = renderHook(
      ({ snapshot }) => useDomain<'projects'>(snapshot, setField, ['projects']),
      { initialProps: { snapshot: initialData } },
    );

    const firstResult = result.current;

    rerender({ snapshot: initialData });
    expect(result.current).toBe(firstResult);

    const nextProjects = [{ id: 'project-2' }] as unknown as AppData['projects'];
    const updatedData = makeAppData({ projects: nextProjects });
    rerender({ snapshot: updatedData });

    expect(result.current).not.toBe(firstResult);
    expect(result.current.projects).toBe(nextProjects);
  });
});
