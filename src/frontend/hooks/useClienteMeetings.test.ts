import { describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useState } from 'react';
import { useClienteMeetings } from './useClienteMeetings';
import type { Client, AgendaEvent, Project } from '../types';

vi.mock('../services/clientService', () => ({
  saveClientAndUpdateState: vi.fn(
    (client: Client, _original: Client | null, clients: Client[]) => ({
      updatedClients: clients.map((c) => (c.id === client.id ? client : c)),
      error: null,
    }),
  ),
}));

const createTestClient = (overrides: Partial<Client> = {}): Client => ({
  id: 'client-1',
  name: 'Cliente Teste',
  status: 'Cliente Ativo',
  contacts: [],
  serviceInterests: [],
  address: {
    street: 'Rua A',
    number: '100',
    neighborhood: 'Centro',
    city: 'SP',
    state: 'SP',
    zip: '01000-000',
  },
  isFavorite: false,
  registrationDate: '2026-01-01',
  lastContactDate: '2026-01-15',
  pipelineStatus: 'Novo',
  meetings: [],
  behavioralProfile: { notes: '' },
  archived: false,
  ...overrides,
});

function useMeetingsWrapper(initialClient: Client) {
  const [client, setClient] = useState<Client | null>(initialClient);
  const [agendaEvents, setAgendaEvents] = useState<AgendaEvent[]>([]);
  const meetings = useClienteMeetings({
    client,
    setClient,
    originalClient: initialClient,
    clients: [initialClient],
    setClients: vi.fn(),
    setAgendaEvents,
    isEditing: false,
    setShowSaveSuccess: vi.fn(),
    projects: [] as Project[],
  });
  return { client, meetings, agendaEvents };
}

describe('useClienteMeetings', () => {
  it('handleAddMeeting adds a meeting with reason', () => {
    // Given
    const { result } = renderHook(() => useMeetingsWrapper(createTestClient()));
    act(() =>
      result.current.meetings.setNewMeeting({
        date: '2026-03-10',
        reason: 'Briefing',
        notes: 'Notas de teste',
      }),
    );

    // When
    act(() => result.current.meetings.handleAddMeeting());

    // Then
    expect(result.current.client?.meetings).toHaveLength(1);
    expect(result.current.client?.meetings[0].reason).toBe('Briefing');
    expect(result.current.client?.meetings[0].notes).toBe('Notas de teste');
  });

  it('handleAddMeeting does nothing when reason and notes are empty', () => {
    // Given
    const { result } = renderHook(() => useMeetingsWrapper(createTestClient()));
    act(() =>
      result.current.meetings.setNewMeeting({
        date: '2026-03-10',
        reason: '',
        notes: '',
      }),
    );

    // When
    act(() => result.current.meetings.handleAddMeeting());

    // Then
    expect(result.current.client?.meetings).toHaveLength(0);
  });

  it('handleDeleteMeeting removes meeting by id', () => {
    // Given
    const client = createTestClient({
      meetings: [
        { id: 'meet-1', date: '2026-03-10', reason: 'Briefing', notes: '' },
        { id: 'meet-2', date: '2026-03-15', reason: 'Follow-up', notes: '' },
      ],
    });
    const { result } = renderHook(() => useMeetingsWrapper(client));

    // When
    act(() => result.current.meetings.handleDeleteMeeting('meet-1'));

    // Then
    expect(result.current.client?.meetings).toHaveLength(1);
    expect(result.current.client?.meetings[0].id).toBe('meet-2');
  });

  it('handleScheduleMeeting sets pre-filled event and opens modal', () => {
    // Given
    const { result } = renderHook(() => useMeetingsWrapper(createTestClient()));

    // When
    act(() => result.current.meetings.handleScheduleMeeting());

    // Then
    expect(result.current.meetings.isMeetingModalOpen).toBe(true);
    expect(result.current.meetings.preFilledEvent?.title).toContain('Cliente Teste');
    expect(result.current.meetings.preFilledEvent?.type).toBe('Reunião com Cliente');
  });
});
