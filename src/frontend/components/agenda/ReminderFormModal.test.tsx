import { fireEvent, render, screen } from '@testing-library/react';
import type { ComponentProps } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Reminder } from '../../types';
import { POST_IT_COLORS } from './reminderPalette';
import { ReminderFormModal } from './ReminderFormModal';

function createModalRoot() {
  const modalRoot = document.createElement('div');
  modalRoot.id = 'modal-root';
  document.body.appendChild(modalRoot);
}

function createReminder(overrides: Partial<Reminder> = {}): Reminder {
  return {
    id: 'rem-1',
    title: 'Lembrete existente',
    comment: 'Comentário existente',
    remindAt: '2026-03-11T10:30',
    color: 'blue',
    createdAt: '2026-03-01T10:00:00.000Z',
    pinned: true,
    completedAt: '2026-03-02T10:00:00.000Z',
    externalUrl: 'https://exemplo.com/item',
    ...overrides,
  };
}

function renderModal(overrides: Partial<ComponentProps<typeof ReminderFormModal>> = {}) {
  return render(
    <ReminderFormModal
      isOpen={true}
      onClose={vi.fn()}
      onSave={vi.fn()}
      initial={null}
      colorOptions={POST_IT_COLORS}
      {...overrides}
    />,
  );
}

describe('ReminderFormModal', () => {
  beforeEach(() => {
    createModalRoot();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    document.getElementById('modal-root')?.remove();
    document.body.style.overflow = '';
  });

  it('não renderiza quando está fechado', () => {
    renderModal({ isOpen: false });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('em modo novo, bloqueia submit sem título e mantém labels corretas', () => {
    const onSave = vi.fn();
    const onClose = vi.fn();
    renderModal({ onSave, onClose, initial: null });

    expect(screen.getByRole('heading', { name: 'Novo Lembrete' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Criar' }));

    expect(onSave).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('cria lembrete novo com trim de campos, cor selecionada e fecha modal', () => {
    const onSave = vi.fn();
    const onClose = vi.fn();
    renderModal({ onSave, onClose });

    fireEvent.change(screen.getByPlaceholderText('Ex: Ligar para fornecedor'), {
      target: { value: '  Novo lembrete  ' },
    });
    fireEvent.change(screen.getByPlaceholderText('Detalhes adicionais...'), {
      target: { value: '  Comentário importante  ' },
    });
    const dateTimeInput = document.querySelector('input[type="datetime-local"]') as HTMLInputElement;
    fireEvent.change(dateTimeInput, {
      target: { value: '2026-03-15T08:45' },
    });
    fireEvent.change(screen.getByPlaceholderText('https://exemplo.com/referencia'), {
      target: { value: '   ' },
    });
    fireEvent.click(screen.getByTitle('Verde'));
    fireEvent.click(screen.getByRole('button', { name: 'Criar' }));

    expect(onSave).toHaveBeenCalledTimes(1);
    const savedReminder = onSave.mock.calls[0][0] as Reminder;
    expect(savedReminder.title).toBe('Novo lembrete');
    expect(savedReminder.comment).toBe('Comentário importante');
    expect(savedReminder.remindAt).toBe('2026-03-15T08:45');
    expect(savedReminder.color).toBe('green');
    expect(savedReminder.pinned).toBe(false);
    expect(savedReminder.completedAt).toBeNull();
    expect(savedReminder.externalUrl).toBeUndefined();
    expect(savedReminder.id).toBeTruthy();
    expect(savedReminder.createdAt).toBeTruthy();
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('em modo edição, pré-carrega valores e preserva id/metadados na gravação', () => {
    const onSave = vi.fn();
    const initial = createReminder();
    renderModal({ onSave, initial });

    expect(screen.getByRole('heading', { name: 'Editar Lembrete' })).toBeInTheDocument();
    expect(screen.getByDisplayValue('Lembrete existente')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Comentário existente')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2026-03-11T10:30')).toBeInTheDocument();
    expect(screen.getByDisplayValue('https://exemplo.com/item')).toBeInTheDocument();

    fireEvent.change(screen.getByDisplayValue('Lembrete existente'), {
      target: { value: 'Lembrete atualizado' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'rem-1',
        createdAt: '2026-03-01T10:00:00.000Z',
        pinned: true,
        completedAt: '2026-03-02T10:00:00.000Z',
        title: 'Lembrete atualizado',
      }),
    );
  });

  it('em modo reagendar limpa data inicial e força completedAt para null', () => {
    const onSave = vi.fn();
    const initial = createReminder();
    renderModal({ onSave, initial, rescheduleMode: true });

    expect(screen.getByRole('heading', { name: 'Reagendar Lembrete' })).toBeInTheDocument();
    expect(screen.getByText('Nova Data e Horário *')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reagendar' })).toBeInTheDocument();
    const dateTimeInput = document.querySelector('input[type="datetime-local"]') as HTMLInputElement;
    expect(dateTimeInput).toHaveValue('');

    fireEvent.change(screen.getByDisplayValue('Lembrete existente'), {
      target: { value: '  Reagendar item  ' },
    });
    fireEvent.change(dateTimeInput, {
      target: { value: '2026-04-01T09:30' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Reagendar' }));

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'rem-1',
        title: 'Reagendar item',
        remindAt: '2026-04-01T09:30',
        completedAt: null,
      }),
    );
  });

  it('reseta campos para defaults ao trocar de edição para novo lembrete', () => {
    const { rerender } = renderModal({ initial: createReminder() });

    expect(screen.getByDisplayValue('Lembrete existente')).toBeInTheDocument();

    rerender(
      <ReminderFormModal
        isOpen={true}
        onClose={vi.fn()}
        onSave={vi.fn()}
        initial={null}
        colorOptions={POST_IT_COLORS}
      />,
    );

    expect(screen.getByPlaceholderText('Ex: Ligar para fornecedor')).toHaveValue('');
    expect(screen.getByPlaceholderText('Detalhes adicionais...')).toHaveValue('');
    expect(screen.getByPlaceholderText('https://exemplo.com/referencia')).toHaveValue('');
    expect(screen.getByRole('heading', { name: 'Novo Lembrete' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Criar' })).toBeInTheDocument();
  });
});
