import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { ProjectSection } from '@/types';
import { ProjectGanttTab } from './ProjectGanttTab';

const populatedSections: ProjectSection[] = [
  {
    id: 'section-1',
    name: 'Etapa Estrutural',
    tasks: [
      {
        id: 'task-1',
        name: 'Modelagem',
        completed: false,
        hours: 8,
        startDate: '2026-03-01',
        endDate: '2026-03-10',
      },
    ],
  },
];

describe('ProjectGanttTab', () => {
  it('renders empty state when there are no tasks', () => {
    render(<ProjectGanttTab sections={[]} onTaskUpdate={vi.fn()} />);
    expect(screen.getByText('O cronograma está vazio.')).toBeInTheDocument();
  });

  it('renders gantt data and allows changing view mode', () => {
    render(<ProjectGanttTab sections={populatedSections} onTaskUpdate={vi.fn()} />);

    expect(screen.getByText('Cronograma Interativo')).toBeInTheDocument();
    expect(screen.getAllByText('Em Andamento').length).toBeGreaterThan(0);
    expect(screen.getByText('Concluído')).toBeInTheDocument();
    expect(screen.getByText('Atrasado')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Dia' }));
    fireEvent.click(screen.getByRole('button', { name: 'Mês' }));

    const sectionButton = screen.getByRole('button', { name: /Etapa Estrutural/i });
    fireEvent.click(sectionButton);
    fireEvent.keyDown(sectionButton, { key: 'Enter' });

    expect(sectionButton).toBeInTheDocument();
  });
});
