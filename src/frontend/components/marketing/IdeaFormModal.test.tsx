import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import type { ComponentProps } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { MarketingIdea } from '../../types';
import IdeaFormModal from './IdeaFormModal';

const existingIdea: MarketingIdea = {
  id: 'idea-1',
  title: 'Ideia inicial',
  content: 'Conteúdo base',
  color: 'pink',
  date: '2026-03-10T09:00:00.000Z',
  isFavorite: true,
};

const renderModal = (overrides: Partial<ComponentProps<typeof IdeaFormModal>> = {}) =>
  render(
    <IdeaFormModal
      isOpen={true}
      onClose={vi.fn()}
      onSave={vi.fn()}
      onDelete={vi.fn()}
      initialIdea={null}
      {...overrides}
    />,
  );

describe('IdeaFormModal', () => {
  beforeEach(() => {
    const modalRoot = document.createElement('div');
    modalRoot.id = 'modal-root';
    document.body.appendChild(modalRoot);
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    vi.useRealTimers();
    document.getElementById('modal-root')?.remove();
  });

  it('returns null when closed', () => {
    renderModal({ isOpen: false });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('blocks save when idea content is empty or whitespace', () => {
    const onSave = vi.fn();
    renderModal({ onSave });

    fireEvent.change(screen.getByLabelText('Conteúdo da ideia'), { target: { value: '   ' } });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(onSave).not.toHaveBeenCalled();
  });

  it('creates a new idea with defaults and selected color', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-15T12:00:00.000Z'));
    vi.spyOn(Date, 'now').mockReturnValue(1700000000123);

    const onSave = vi.fn();
    renderModal({ onSave });

    fireEvent.change(screen.getByLabelText('Título da ideia'), {
      target: { value: 'Nova campanha' },
    });
    fireEvent.change(screen.getByLabelText('Conteúdo da ideia'), {
      target: { value: 'Criar série semanal de bastidores' },
    });
    fireEvent.click(screen.getByLabelText('Selecionar cor blue'));
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(onSave).toHaveBeenCalledWith({
      id: 'idea_1700000000123',
      date: '2026-03-15T12:00:00.000Z',
      title: 'Nova campanha',
      content: 'Criar série semanal de bastidores',
      color: 'blue',
      isFavorite: false,
    });
  });

  it('supports edit and delete flows with existing idea data', () => {
    const onSave = vi.fn();
    const onDelete = vi.fn();

    renderModal({ initialIdea: existingIdea, onSave, onDelete });

    expect(screen.getByDisplayValue('Ideia inicial')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Conteúdo base')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Excluir' })).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Conteúdo da ideia'), {
      target: { value: 'Conteúdo editado' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));
    fireEvent.click(screen.getByRole('button', { name: 'Excluir' }));

    expect(onSave).toHaveBeenCalledWith({
      id: 'idea-1',
      date: '2026-03-10T09:00:00.000Z',
      title: 'Ideia inicial',
      content: 'Conteúdo editado',
      color: 'pink',
      isFavorite: true,
    });
    expect(onDelete).toHaveBeenCalledWith('idea-1');
  });

  it('resets draft to default color when reopening for a new idea', () => {
    const { rerender } = renderModal();

    fireEvent.click(screen.getByLabelText('Selecionar cor green'));
    fireEvent.change(screen.getByLabelText('Conteúdo da ideia'), {
      target: { value: 'Rascunho temporário' },
    });

    rerender(
      <IdeaFormModal
        isOpen={false}
        onClose={vi.fn()}
        onSave={vi.fn()}
        onDelete={vi.fn()}
        initialIdea={null}
      />,
    );
    rerender(
      <IdeaFormModal
        isOpen={true}
        onClose={vi.fn()}
        onSave={vi.fn()}
        onDelete={vi.fn()}
        initialIdea={null}
      />,
    );

    expect(screen.getByLabelText('Selecionar cor yellow')).toHaveClass('ring-primary');
  });
});
