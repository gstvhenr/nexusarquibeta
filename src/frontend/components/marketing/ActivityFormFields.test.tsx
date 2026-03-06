import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { MarketingActivity, MarketingProfessional, Project } from '../../types';
import { marketingActivityStatuses, marketingContentTypes } from '../../types';
import ActivityFormFields from './ActivityFormFields';

type EditableActivity = MarketingActivity & { datePart: string; timePart: string };

const createProject = (overrides: Partial<Project>): Project =>
  ({
    id: 'project-1',
    code: 'PRJ-001',
    name: 'PRJ-001 - Casa Jardim',
    ...overrides,
  }) as Project;

const baseActivity: EditableActivity = {
  id: 'activity-1',
  title: 'Post semanal',
  status: 'Pendente',
  contentType: 'Post (Instagram)',
  dueDate: '2026-03-12T09:00:00',
  datePart: '2026-03-12',
  timePart: '09:00',
  responsibleId: 'architect',
  linkedProjectId: '',
  linkedProjectName: '',
  description: 'Descrição inicial',
  notes: 'Notas iniciais',
  cost: 150,
};

describe('ActivityFormFields', () => {
  it('renders dynamic options for status, content type, professionals and projects', () => {
    const professionals: MarketingProfessional[] = [
      {
        id: 'professional-1',
        name: 'Studio ADS',
        email: 'studio@ads.com',
        phone: '(11) 95555-0000',
      },
    ];
    const projects: Project[] = [
      createProject({ id: 'project-1', code: 'PRJ-001', name: 'PRJ-001 - Casa Jardim' }),
      createProject({ id: 'project-2', code: 'PRJ-002', name: 'Apartamento Central' }),
    ];

    render(
      <ActivityFormFields
        activity={baseActivity}
        readOnly={false}
        professionals={professionals}
        projects={projects}
        onChange={vi.fn()}
        onProjectChange={vi.fn()}
      />,
    );

    for (const status of marketingActivityStatuses) {
      expect(screen.getByRole('option', { name: status })).toBeInTheDocument();
    }

    for (const contentType of marketingContentTypes) {
      expect(screen.getByRole('option', { name: contentType })).toBeInTheDocument();
    }

    expect(screen.getByRole('option', { name: 'Eu (Arquiteto)' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Studio ADS' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Nenhum' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'PRJ-001 - Casa Jardim' })).toBeInTheDocument();
    expect(
      screen.getByRole('option', { name: 'PRJ-002 - Apartamento Central' }),
    ).toBeInTheDocument();
  });

  it('forwards field updates through callbacks', () => {
    const onChange = vi.fn();
    const onProjectChange = vi.fn();
    const { container } = render(
      <ActivityFormFields
        activity={baseActivity}
        readOnly={false}
        professionals={[
          {
            id: 'professional-1',
            name: 'Studio ADS',
            email: 'studio@ads.com',
            phone: '(11) 95555-0000',
          },
        ]}
        projects={[
          createProject({ id: 'project-2', code: 'PRJ-002', name: 'Apartamento Central' }),
        ]}
        onChange={onChange}
        onProjectChange={onProjectChange}
      />,
    );

    fireEvent.change(screen.getByPlaceholderText('Ex: Reels Obra Residência Silva'), {
      target: { value: 'Novo título' },
    });
    fireEvent.change(container.querySelector('input[type="date"]') as HTMLInputElement, {
      target: { value: '2026-03-15' },
    });
    fireEvent.change(container.querySelector('input[type="time"]') as HTMLInputElement, {
      target: { value: '14:45' },
    });
    fireEvent.change(screen.getByLabelText('Status'), { target: { value: 'Concluído' } });
    fireEvent.change(screen.getByLabelText('Plataforma ou tipo'), {
      target: { value: 'Stories (Instagram)' },
    });
    fireEvent.change(screen.getByLabelText('Responsável'), { target: { value: 'professional-1' } });
    fireEvent.change(screen.getByPlaceholderText('0.00'), { target: { value: '' } });
    fireEvent.change(screen.getByLabelText('Projeto vinculado'), {
      target: { value: 'project-2' },
    });
    fireEvent.change(screen.getByPlaceholderText('Detalhes do post, legenda, links...'), {
      target: { value: 'Nova descrição' },
    });
    fireEvent.change(screen.getByPlaceholderText('Observações para equipe...'), {
      target: { value: 'Novas notas' },
    });

    expect(onChange).toHaveBeenCalledWith('title', 'Novo título');
    expect(onChange).toHaveBeenCalledWith('datePart', '2026-03-15');
    expect(onChange).toHaveBeenCalledWith('timePart', '14:45');
    expect(onChange).toHaveBeenCalledWith('status', 'Concluído');
    expect(onChange).toHaveBeenCalledWith('contentType', 'Stories (Instagram)');
    expect(onChange).toHaveBeenCalledWith('responsibleId', 'professional-1');
    expect(onChange).toHaveBeenCalledWith('cost', 0);
    expect(onProjectChange).toHaveBeenCalledWith('project-2');
    expect(onChange).toHaveBeenCalledWith('description', 'Nova descrição');
    expect(onChange).toHaveBeenCalledWith('notes', 'Novas notas');
  });

  it('disables all controls in read-only mode', () => {
    const { container } = render(
      <ActivityFormFields
        activity={baseActivity}
        readOnly={true}
        professionals={[]}
        projects={[]}
        onChange={vi.fn()}
        onProjectChange={vi.fn()}
      />,
    );

    expect(screen.getByPlaceholderText('Ex: Reels Obra Residência Silva')).toBeDisabled();
    expect(container.querySelector('input[type="date"]') as HTMLInputElement).toBeDisabled();
    expect(container.querySelector('input[type="time"]') as HTMLInputElement).toBeDisabled();
    expect(screen.getByLabelText('Status')).toBeDisabled();
    expect(screen.getByLabelText('Plataforma ou tipo')).toBeDisabled();
    expect(screen.getByLabelText('Responsável')).toBeDisabled();
    expect(screen.getByPlaceholderText('0.00')).toBeDisabled();
    expect(screen.getByLabelText('Projeto vinculado')).toBeDisabled();
    expect(screen.getByPlaceholderText('Detalhes do post, legenda, links...')).toBeDisabled();
    expect(screen.getByPlaceholderText('Observações para equipe...')).toBeDisabled();
  });
});
