import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Prospect } from '@/types';
import { ProspectCard } from './ProspectCard';

const buildProspect = (overrides: Partial<Prospect>): Prospect => ({
  id: 'prospect-1',
  name: 'Ana Prospect',
  phone: '(11) 99999-9999',
  hasWhatsApp: true,
  email: 'ana@example.com',
  social: '@ana',
  contact: '',
  origin: 'Instagram',
  interest: 'Residencial',
  priority: 'Alta',
  status: 'Em Aberto',
  createdAt: '2026-01-10T10:00:00.000Z',
  startDate: '2026-01-10',
  followUpDays: 30,
  notes: 'Precisa de retorno rápido',
  archived: false,
  ...overrides,
});

describe('ProspectCard', () => {
  afterEach(() => {
    cleanup();
  });

  it('triggers action callbacks for open prospect flow', () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    const onAction = vi.fn();
    const prospect = buildProspect({});

    render(
      <ProspectCard prospect={prospect} onEdit={onEdit} onDelete={onDelete} onAction={onAction} />,
    );

    fireEvent.click(screen.getByLabelText('Renovar'));
    fireEvent.click(screen.getByLabelText('Converter para cliente'));
    fireEvent.click(screen.getByLabelText('Marcar como perdido'));
    fireEvent.click(screen.getByLabelText('Editar'));
    fireEvent.click(screen.getByLabelText('Excluir'));

    expect(onAction).toHaveBeenCalledWith('prospect-1', 'renew');
    expect(onAction).toHaveBeenCalledWith('prospect-1', 'convert');
    expect(onAction).toHaveBeenCalledWith('prospect-1', 'lost');
    expect(onEdit).toHaveBeenCalledWith(prospect);
    expect(onDelete).toHaveBeenCalledWith(prospect);
  });

  it('shows contact details when details panel is toggled', () => {
    render(
      <ProspectCard
        prospect={buildProspect({})}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onAction={vi.fn()}
      />,
    );

    expect(screen.queryByText('ana@example.com')).not.toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('Visualizar dados cadastrais'));

    expect(screen.getByText('ana@example.com')).toBeInTheDocument();
    expect(screen.getByText('(11) 99999-9999')).toBeInTheDocument();
    expect(screen.getByText('WA')).toBeInTheDocument();
  });
});
