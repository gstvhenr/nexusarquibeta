import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Client, AgendaEvent } from '../types';
import { useClienteMeetings } from './useClienteMeetings';
import { getTodayDateOnly } from '../utils/formatters';

vi.mock('../services/clientService', () => ({
  saveClientAndUpdateState: vi.fn(() => ({ updatedClients: [] })),
}));

import { saveClientAndUpdateState } from '../services/clientService';

const makeClient = (): Client => ({
  id: 'c1',
  name: 'Cliente Teste',
  cpfCnpj: '',
  clientType: 'PF',
  birthDate: '',
  representative: { name: '', relationship: '', role: '' },
  contacts: [],
  email: '',
  status: 'Potencial Cliente',
  leadSource: 'Não informado',
  serviceInterests: [],
  address: {
    street: '',
    number: '',
    neighborhood: '',
    city: '',
    state: 'SP',
    zip: '',
    complement: '',
  },
  isFavorite: false,
  isUrgent: false,
  registrationDate: new Date().toISOString(),
  lastContactDate: new Date().toISOString(),
  pipelineStatus: 'Novo',
  meetings: [],
  behavioralProfile: { notes: '' },
  archived: false,
});

const defaultArgs = () => ({
  client: makeClient(),
  setClient: vi.fn(),
  originalClient: undefined,
  clients: [] as Client[],
  setClients: vi.fn(),
  setAgendaEvents: vi.fn(),
  isEditing: false,
  setShowSaveSuccess: vi.fn(),
  projects: [],
});

describe('useClienteMeetings', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('handleAddMeeting does nothing when reason and notes are empty', () => {
    // Given — reunião sem motivo nem notas
    const args = defaultArgs();
    const { result } = renderHook(() => useClienteMeetings(args));

    act(() => {
      result.current.handleAddMeeting();
    });

    // Then — setClient não chamado
    expect(args.setClient).not.toHaveBeenCalled();
  });

  it('handleAddMeeting adds meeting when reason is provided', () => {
    // Given — motivo preenchido
    const args = defaultArgs();
    const { result } = renderHook(() => useClienteMeetings(args));

    act(() => {
      result.current.setNewMeeting({ reason: 'Alinhamento', notes: '', date: '2026-03-01' });
    });

    act(() => {
      result.current.handleAddMeeting();
    });

    // Then — setClient chamado com updater que adiciona a reunião
    expect(args.setClient).toHaveBeenCalled();
  });

  it('handleAddMeeting resets newMeeting after adding', () => {
    // Given — motivo preenchido
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 2, 8, 23, 30, 0));
    const args = defaultArgs();
    const { result } = renderHook(() => useClienteMeetings(args));

    act(() => {
      result.current.setNewMeeting({ reason: 'Follow-up', notes: '', date: '2026-03-01' });
    });

    act(() => {
      result.current.handleAddMeeting();
    });

    // Then — newMeeting resetado
    expect(result.current.newMeeting.date).toBe(getTodayDateOnly());
    expect(result.current.newMeeting.reason).toBe('');
    expect(result.current.newMeeting.notes).toBe('');
  });

  it('handleDeleteMeeting calls setClient updater that filters meeting out', () => {
    // Given — cliente com uma reunião
    const args = defaultArgs();
    const { result } = renderHook(() => useClienteMeetings(args));

    act(() => {
      result.current.handleDeleteMeeting('meeting-1');
    });

    // Then — setClient chamado com updater que remove a reunião
    expect(args.setClient).toHaveBeenCalled();
    const updater = args.setClient.mock.calls[0][0];
    const client = {
      ...makeClient(),
      meetings: [{ id: 'meeting-1', date: '', reason: 'R', notes: '' }],
    };
    const updated = updater(client);
    expect(updated.meetings).toHaveLength(0);
  });

  it('handleScheduleMeeting sets preFilledEvent and opens modal', () => {
    // Given — cliente válido
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 2, 8, 23, 30, 0));
    const args = defaultArgs();
    const { result } = renderHook(() => useClienteMeetings(args));

    act(() => {
      result.current.handleScheduleMeeting();
    });

    // Then — modal aberto com evento pré-preenchido
    expect(result.current.isMeetingModalOpen).toBe(true);
    expect(result.current.preFilledEvent?.title).toContain('Cliente Teste');
    expect(result.current.preFilledEvent?.date).toBe(getTodayDateOnly());
  });

  it('handleSaveAgendaEvent adds new event and closes modal', () => {
    // Given — modal aberto
    const args = defaultArgs();
    const { result } = renderHook(() => useClienteMeetings(args));

    act(() => {
      result.current.handleScheduleMeeting();
    });

    const event: AgendaEvent = {
      id: 'evt-1',
      title: 'Reunião',
      date: '2026-03-01',
      time: '09:00',
      timeEnd: '10:00',
      type: 'Reunião com Cliente',
      clientId: 'c1',
      clientName: 'Cliente',
      description: '',
      priority: 3,
      recurrence: 'none',
      completed: false,
      kanbanStatus: 'todo',
    };

    act(() => {
      result.current.handleSaveAgendaEvent(event);
    });

    // Then — setAgendaEvents chamado e modal fechado
    expect(args.setAgendaEvents).toHaveBeenCalled();
    expect(result.current.isMeetingModalOpen).toBe(false);
  });

  it('handleAddMeeting auto-saves when not editing', () => {
    // Given — isEditing=false e cliente válido
    const args = defaultArgs();
    const returnedClient = makeClient();
    vi.mocked(saveClientAndUpdateState).mockReturnValue({ updatedClients: [returnedClient] });
    const { result } = renderHook(() => useClienteMeetings(args));

    act(() => {
      result.current.setNewMeeting({ reason: 'Check-in', notes: '', date: '2026-03-01' });
    });

    act(() => {
      result.current.handleAddMeeting();
    });

    // Then — save chamado automaticamente em modo não-edição
    expect(saveClientAndUpdateState).toHaveBeenCalled();
    expect(args.setClients).toHaveBeenCalledWith(
      expect.arrayContaining([expect.objectContaining({ id: 'c1' })]),
    );
  });
});
