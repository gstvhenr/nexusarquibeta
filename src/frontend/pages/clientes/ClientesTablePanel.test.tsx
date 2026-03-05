import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Client } from '@/types';
import { ClientesTablePanel } from './ClientesTablePanel';

const makeClient = (overrides: Partial<Client> = {}): Client => ({
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
  meetings: [],
  behavioralProfile: { notes: '' },
  archived: false,
  ...overrides,
});

describe('ClientesTablePanel', () => {
  afterEach(() => {
    cleanup();
  });

  it('emits filter updater when search input changes', () => {
    const onFilterChange = vi.fn();

    render(
      <ClientesTablePanel
        showArchived={false}
        filter={{ search: '', status: 'Todos', paymentStatus: 'Todos' }}
        onFilterChange={onFilterChange}
        selectedClientIds={new Set()}
        filteredClients={[makeClient()]}
        totalActiveClients={1}
        totalArchivedClients={0}
        paymentStatusByClientId={new Map([['client-1', 'Em dia']])}
        clientDeadlines={new Map([['client-1', null]])}
        onSelectAll={vi.fn()}
        onSelectClient={vi.fn()}
        onToggleUrgent={vi.fn()}
        onViewClient={vi.fn()}
        onBulkArchive={vi.fn()}
        onBulkDelete={vi.fn()}
        currentPage={1}
        totalPages={1}
        pageSize={30}
        totalFilteredCount={1}
        onPageChange={vi.fn()}
        onPageSizeChange={vi.fn()}
      />,
    );

    fireEvent.change(screen.getByLabelText('Buscar cliente'), { target: { value: 'novo termo' } });

    expect(onFilterChange).toHaveBeenCalled();
  });

  it('triggers bulk actions and pagination callbacks', () => {
    const onBulkArchive = vi.fn();
    const onBulkDelete = vi.fn();
    const onPageChange = vi.fn();
    const onPageSizeChange = vi.fn();

    render(
      <ClientesTablePanel
        showArchived={false}
        filter={{ search: '', status: 'Todos', paymentStatus: 'Todos' }}
        onFilterChange={vi.fn()}
        selectedClientIds={new Set(['client-1'])}
        filteredClients={[makeClient()]}
        totalActiveClients={1}
        totalArchivedClients={0}
        paymentStatusByClientId={new Map([['client-1', 'Em dia']])}
        clientDeadlines={new Map([['client-1', null]])}
        onSelectAll={vi.fn()}
        onSelectClient={vi.fn()}
        onToggleUrgent={vi.fn()}
        onViewClient={vi.fn()}
        onBulkArchive={onBulkArchive}
        onBulkDelete={onBulkDelete}
        currentPage={1}
        totalPages={2}
        pageSize={30}
        totalFilteredCount={31}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />,
    );

    fireEvent.click(screen.getByLabelText('Arquivar clientes selecionados'));
    fireEvent.click(screen.getByLabelText('Excluir clientes selecionados'));
    fireEvent.click(screen.getByLabelText('Próxima página'));
    fireEvent.click(screen.getByRole('button', { name: 'Exibir 10 por página' }));

    expect(onBulkArchive).toHaveBeenCalledTimes(1);
    expect(onBulkDelete).toHaveBeenCalledTimes(1);
    expect(onPageChange).toHaveBeenCalledWith(2);
    expect(onPageSizeChange).toHaveBeenCalledWith(10);
  });
});
