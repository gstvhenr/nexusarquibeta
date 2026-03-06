import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Client } from '@/types';
import { ClienteDetalhesSecondaryTabs } from './ClienteDetalhesSecondaryTabs';

const client: Client = {
  id: 'client-1',
  name: 'Cliente Teste',
  contacts: [{ id: 'contact-1', phone: '(11) 99999-0000', hasWhatsApp: true, isPrimary: true }],
  status: 'Cliente Ativo',
  serviceInterests: [],
  address: {
    street: 'Rua A',
    number: '10',
    neighborhood: 'Centro',
    city: 'São Paulo',
    state: 'SP',
    zip: '01000-000',
  },
  isFavorite: false,
  registrationDate: '2026-01-01',
  lastContactDate: '2026-01-02',
  pipelineStatus: 'Contato Inicial',
  meetings: [
    {
      id: 'meeting-1',
      date: '2026-03-01T10:00:00.000Z',
      reason: 'Alinhamento',
      notes: 'Notas da reunião',
    },
  ],
  generalNotes: 'nota inicial',
  behavioralProfile: { notes: '' },
  archived: false,
};

describe('ClienteDetalhesSecondaryTabs', () => {
  afterEach(() => {
    cleanup();
  });

  it('dispatches add meeting action in meetings tab', () => {
    const handleAddMeeting = vi.fn();

    render(
      <ClienteDetalhesSecondaryTabs
        activeTab="meetings"
        client={client}
        clientProjects={[]}
        financialSummaries={[]}
        isEditing={true}
        newMeeting={{ date: '2026-03-10', reason: 'Nova reunião' }}
        setNewMeeting={vi.fn()}
        handleAddMeeting={handleAddMeeting}
        handleDeleteMeeting={vi.fn()}
        handleChange={vi.fn()}
        originalClient={client}
        getModifiedClass={() => ''}
        newLink={{ title: '', url: '' }}
        setNewLink={vi.fn()}
        handleAddLink={vi.fn()}
        handleRemoveLink={vi.fn()}
        onOpenProject={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Adicionar Registro' }));
    expect(handleAddMeeting).toHaveBeenCalledTimes(1);
  });

  it('propagates note changes in notes tab', () => {
    const handleChange = vi.fn();

    render(
      <ClienteDetalhesSecondaryTabs
        activeTab="notes"
        client={client}
        clientProjects={[]}
        financialSummaries={[]}
        isEditing={true}
        newMeeting={{}}
        setNewMeeting={vi.fn()}
        handleAddMeeting={vi.fn()}
        handleDeleteMeeting={vi.fn()}
        handleChange={handleChange}
        originalClient={client}
        getModifiedClass={() => ''}
        newLink={{ title: '', url: '' }}
        setNewLink={vi.fn()}
        handleAddLink={vi.fn()}
        handleRemoveLink={vi.fn()}
        onOpenProject={vi.fn()}
      />,
    );

    fireEvent.change(
      screen.getByPlaceholderText(
        'Adicione anotações gerais sobre o cliente, preferências, histórico de contatos, etc.',
      ),
      {
        target: { value: 'novo texto' },
      },
    );

    expect(handleChange).toHaveBeenCalledWith('generalNotes', 'novo texto');
  });
});
