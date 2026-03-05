import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Project } from '@/types';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { ProjectListItem, ProjectStatusSummaryPanel } from './ProjectComponents';

const { mockCalculateProjectProgress, mockGetDeadlineInfo } = vi.hoisted(() => ({
  mockCalculateProjectProgress: vi.fn(),
  mockGetDeadlineInfo: vi.fn(),
}));

vi.mock('../../services/dashboardService', () => ({
  calculateProjectProgress: mockCalculateProjectProgress,
}));

vi.mock('../../utils/formatters', () => ({
  getDeadlineInfo: mockGetDeadlineInfo,
}));

const baseProject: Project = {
  id: 'project-1',
  code: 'PRJ-001',
  name: 'Projeto Alpha',
  clientName: 'Cliente A',
  clientId: 'client-1',
  status: 'Em Andamento',
  deadline: '2026-06-10',
  budget: 12000,
  description: '',
  sections: [],
  financials: { paymentType: 'vista' },
  priority: 'Alta',
};

const renderProjectListItem = (
  project: Project,
  onArchive: (project: Project, archive: boolean) => void,
  onFinalize: (project: Project) => void,
) => {
  const LocationDisplay = () => {
    const location = useLocation();
    return <div data-testid="location">{location.pathname}</div>;
  };

  render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route
          path="/"
          element={
            <>
              <ProjectListItem project={project} onArchive={onArchive} onFinalize={onFinalize} />
              <LocationDisplay />
            </>
          }
        />
        <Route path="/projetos/:id" element={<LocationDisplay />} />
      </Routes>
    </MemoryRouter>,
  );
};

describe('ProjectComponents', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders status summary counts', () => {
    render(
      <ProjectStatusSummaryPanel
        counts={{
          'Não Iniciado': 1,
          'Em Andamento': 2,
          Pausado: 3,
          Concluído: 4,
          Cancelado: 5,
        }}
      />,
    );

    expect(screen.getByText('Não Iniciado')).toBeInTheDocument();
    expect(screen.getByText('Em Andamento')).toBeInTheDocument();
    expect(screen.getByText('Pausado')).toBeInTheDocument();
    expect(screen.getByText('Concluído')).toBeInTheDocument();
    expect(screen.getByText('Cancelado')).toBeInTheDocument();
  });

  it('navigates to project detail on row click and keyboard', () => {
    mockCalculateProjectProgress.mockReturnValue({
      progress: 42,
      completedCount: 2,
      totalCount: 5,
    });
    mockGetDeadlineInfo.mockReturnValue({
      text: 'Em dia',
      className: 'text-success',
      status: 'ok',
    });

    renderProjectListItem(baseProject, vi.fn(), vi.fn());

    const row = screen.getByRole('button', { name: /Projeto Alpha/i });
    fireEvent.click(row);

    expect(screen.getByTestId('location')).toHaveTextContent('/projetos/project-1');
  });

  it('dispatches finalize/archive callbacks and archived action', () => {
    mockCalculateProjectProgress.mockReturnValue({
      progress: 10,
      completedCount: 0,
      totalCount: 1,
    });
    mockGetDeadlineInfo.mockReturnValue({
      text: 'Atrasado',
      className: 'text-error',
      status: 'overdue',
    });

    const onArchive = vi.fn();
    const onFinalize = vi.fn();

    renderProjectListItem(baseProject, onArchive, onFinalize);

    fireEvent.click(screen.getByRole('button', { name: 'Finalizar Projeto' }));
    fireEvent.click(screen.getByRole('button', { name: 'Inativar Projeto' }));

    expect(onFinalize).toHaveBeenCalledWith(baseProject);
    expect(onArchive).toHaveBeenCalledWith(baseProject, true);
    expect(screen.getByTestId('location')).toHaveTextContent('/');

    const archivedProject: Project = {
      ...baseProject,
      archived: true,
      inactivatedAt: null,
      finalizedAt: null,
    };

    cleanup();
    renderProjectListItem(archivedProject, onArchive, onFinalize);

    fireEvent.click(screen.getByRole('button', { name: 'Desarquivar projeto' }));
    expect(onArchive).toHaveBeenCalledWith(archivedProject, false);
  });
});
