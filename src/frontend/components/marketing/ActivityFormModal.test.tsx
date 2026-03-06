import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import type { ComponentProps } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { MarketingActivity, MarketingProfessional, Project } from '../../types';
import ActivityFormModal from './ActivityFormModal';

const createProject = (overrides: Partial<Project>): Project =>
  ({
    id: 'project-1',
    code: 'PRJ-001',
    name: 'Casa Jardim',
    ...overrides,
  }) as Project;

const professionals: MarketingProfessional[] = [
  {
    id: 'professional-1',
    name: 'Studio ADS',
    email: 'studio@ads.com',
    phone: '(11) 95555-0000',
  },
];

const projects: Project[] = [
  createProject({ id: 'project-1', code: 'PRJ-001', name: 'Casa Jardim' }),
  createProject({ id: 'project-2', code: 'PRJ-002', name: 'Apartamento Central' }),
];

const initialActivity: MarketingActivity = {
  id: 'activity-1',
  title: 'Post semanal',
  status: 'Pendente',
  contentType: 'Post (Instagram)',
  dueDate: '2026-03-20T14:30:00',
  responsibleId: 'professional-1',
  linkedProjectId: 'project-1',
  linkedProjectName: 'PRJ-001 - Casa Jardim',
  description: 'Descrição inicial',
  notes: 'Notas iniciais',
  cost: 150,
};

const renderModal = (overrides: Partial<ComponentProps<typeof ActivityFormModal>> = {}) =>
  render(
    <ActivityFormModal
      isOpen={true}
      onClose={vi.fn()}
      onSave={vi.fn()}
      onDelete={vi.fn()}
      initialActivity={null}
      professionals={professionals}
      projects={projects}
      readOnly={false}
      {...overrides}
    />,
  );

describe('ActivityFormModal', () => {
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

  it('saves edited activity with normalized dueDate and linked project metadata', () => {
    const onSave = vi.fn();

    renderModal({ initialActivity, onSave });
    fireEvent.change(screen.getByPlaceholderText('Ex: Reels Obra Residência Silva'), {
      target: { value: 'Post semanal editado' },
    });
    fireEvent.change(screen.getByDisplayValue('2026-03-20'), { target: { value: '2026-03-22' } });
    fireEvent.change(screen.getByDisplayValue('14:30'), { target: { value: '16:45' } });
    fireEvent.change(screen.getByLabelText('Projeto vinculado'), {
      target: { value: 'project-2' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'activity-1',
        title: 'Post semanal editado',
        dueDate: '2026-03-22T16:45:00',
        linkedProjectId: 'project-2',
        linkedProjectName: 'PRJ-002 - Apartamento Central',
      }),
    );
    expect(onSave.mock.calls[0][0]).not.toHaveProperty('datePart');
    expect(onSave.mock.calls[0][0]).not.toHaveProperty('timePart');
  });

  it('blocks save when required title or date are empty', () => {
    const onSave = vi.fn();
    renderModal({ onSave });

    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));
    expect(onSave).not.toHaveBeenCalled();

    fireEvent.change(screen.getByPlaceholderText('Ex: Reels Obra Residência Silva'), {
      target: { value: 'Atividade válida' },
    });
    fireEvent.change(screen.getByDisplayValue(/\d{4}-\d{2}-\d{2}/), { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));
    expect(onSave).not.toHaveBeenCalled();
  });

  it('shows delete button only in editable mode and forwards delete callback', () => {
    const onDelete = vi.fn();
    const { rerender } = renderModal({ initialActivity, onDelete, readOnly: false });

    fireEvent.click(screen.getByRole('button', { name: 'Excluir' }));
    expect(onDelete).toHaveBeenCalledWith('activity-1');

    rerender(
      <ActivityFormModal
        isOpen={true}
        onClose={vi.fn()}
        onSave={vi.fn()}
        onDelete={onDelete}
        initialActivity={initialActivity}
        professionals={professionals}
        projects={projects}
        readOnly={true}
      />,
    );
    expect(screen.queryByRole('button', { name: 'Excluir' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Salvar' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Fechar' })).toBeInTheDocument();
  });

  it('restores initial values when reopening the modal', () => {
    const { rerender } = renderModal({ initialActivity });
    fireEvent.change(screen.getByPlaceholderText('Ex: Reels Obra Residência Silva'), {
      target: { value: 'Edição temporária' },
    });
    expect(screen.getByDisplayValue('Edição temporária')).toBeInTheDocument();

    rerender(
      <ActivityFormModal
        isOpen={false}
        onClose={vi.fn()}
        onSave={vi.fn()}
        onDelete={vi.fn()}
        initialActivity={initialActivity}
        professionals={professionals}
        projects={projects}
        readOnly={false}
      />,
    );
    rerender(
      <ActivityFormModal
        isOpen={true}
        onClose={vi.fn()}
        onSave={vi.fn()}
        onDelete={vi.fn()}
        initialActivity={initialActivity}
        professionals={professionals}
        projects={projects}
        readOnly={false}
      />,
    );

    expect(screen.getByDisplayValue('Post semanal')).toBeInTheDocument();
  });
});
