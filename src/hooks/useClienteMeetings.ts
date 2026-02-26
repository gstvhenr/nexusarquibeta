import { useState, useCallback } from 'react';
import type { Client, ProjectMeeting, AgendaEvent, Project } from '../types';
import { saveClientAndUpdateState } from '../services/clientService';
import { v4 as uuidv4 } from 'uuid';

export interface UseClienteMeetingsArgs {
  client: Client | null;
  setClient: React.Dispatch<React.SetStateAction<Client | null>>;
  originalClient: Client | undefined;
  clients: Client[];
  setClients: React.Dispatch<React.SetStateAction<Client[]>>;
  setAgendaEvents: React.Dispatch<React.SetStateAction<AgendaEvent[]>>;
  isEditing: boolean;
  setShowSaveSuccess: (v: boolean) => void;
  projects: Project[];
}

/**
 * Meeting-related handlers for the client details page.
 * Manages local meeting history and agenda-event scheduling.
 */
export function useClienteMeetings({
  client,
  setClient,
  originalClient,
  clients,
  setClients,
  setAgendaEvents,
  isEditing,
  setShowSaveSuccess,
  projects,
}: UseClienteMeetingsArgs) {
  const [newMeeting, setNewMeeting] = useState<Partial<ProjectMeeting>>({
    date: new Date().toISOString().split('T')[0],
    reason: '',
    notes: '',
  });

  const [isMeetingModalOpen, setMeetingModalOpen] = useState(false);
  const [preFilledEvent, setPreFilledEvent] = useState<AgendaEvent | null>(null);

  const handleAddMeeting = useCallback(() => {
    if (!newMeeting.reason?.trim() && !newMeeting.notes?.trim()) return;
    if (!client) return;

    const project = projects.find((p) => p.id === newMeeting.projectId);

    const meetingToAdd: ProjectMeeting = {
      id: uuidv4(),
      date: newMeeting.date || new Date().toISOString(),
      reason: newMeeting.reason || 'Reunião de Acompanhamento',
      notes: newMeeting.notes || '',
      projectId: newMeeting.projectId,
      projectName: project?.name,
    };

    setClient((c) => (c ? { ...c, meetings: [meetingToAdd, ...(c.meetings || [])] } : null));
    setNewMeeting({ date: new Date().toISOString().split('T')[0], reason: '', notes: '' });

    // Auto-save when adding meeting
    if (!isEditing) {
      const updatedClient = { ...client, meetings: [meetingToAdd, ...(client.meetings || [])] };
      const result = saveClientAndUpdateState(updatedClient, originalClient || null, clients);
      if (result.error === 'duplicate_cpf_cnpj') {
        alert('CPF/CNPJ Duplicado!');
        return;
      }
      if (result.error === 'invalid_cpf_cnpj') {
        alert('CPF/CNPJ inválido!');
        return;
      }
      setClients(result.updatedClients);
      setShowSaveSuccess(true);
      setTimeout(() => setShowSaveSuccess(false), 3000);
    }
  }, [
    newMeeting,
    client,
    projects,
    setClient,
    isEditing,
    originalClient,
    clients,
    setClients,
    setShowSaveSuccess,
  ]);

  const handleDeleteMeeting = useCallback(
    (id: string) => {
      setClient((c) =>
        c ? { ...c, meetings: (c.meetings || []).filter((m) => m.id !== id) } : null,
      );
    },
    [setClient],
  );

  const handleScheduleMeeting = useCallback(() => {
    if (!client) return;
    const initialEvent: AgendaEvent = {
      id: '',
      title: `Reunião com ${client.name}`,
      date: new Date().toISOString().split('T')[0],
      time: '09:00',
      timeEnd: '10:00',
      type: 'Reunião com Cliente',
      clientId: client.id,
      clientName: client.name,
      description: '',
      priority: 3,
      recurrence: 'none',
      completed: false,
      kanbanStatus: 'todo',
    };
    setPreFilledEvent(initialEvent);
    setMeetingModalOpen(true);
  }, [client]);

  const handleSaveAgendaEvent = useCallback(
    (event: AgendaEvent) => {
      setAgendaEvents((prev) => {
        const exists = prev.some((e) => e.id === event.id);
        if (exists) return prev.map((e) => (e.id === event.id ? event : e));
        return [...prev, event];
      });
      setMeetingModalOpen(false);
    },
    [setAgendaEvents],
  );

  return {
    newMeeting,
    setNewMeeting,
    isMeetingModalOpen,
    setMeetingModalOpen,
    preFilledEvent,
    handleAddMeeting,
    handleDeleteMeeting,
    handleScheduleMeeting,
    handleSaveAgendaEvent,
  };
}
