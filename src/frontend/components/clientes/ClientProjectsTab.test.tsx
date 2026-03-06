import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ClientProjectsTab } from './ClientProjectsTab';
import * as formatters from '../../utils/formatters';
import * as projectFinancials from '../../utils/projectFinancials';

// Mock dependencies
vi.mock('../../utils/formatters', () => ({
  formatCurrency: vi.fn((val) => `R$ ${val}`),
  formatDate: vi.fn((date) => `Data: ${date}`),
}));

vi.mock('../../utils/projectFinancials', () => ({
  getProjectTotalContractValue: vi.fn((project) => project._mockTotal || 0),
}));

// Mock constants
vi.mock('../../constants', () => ({
  PROJECT_STATUS_COLORS: {
    'Em Andamento': { bg: 'bg-blue-100', text: 'text-blue-800' },
    Pausado: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  },
}));

// Mock icons
vi.mock('../ui/icons', () => ({
  ArrowUpCircleIcon: () => <svg data-testid="arrow-icon" />,
  BriefcaseIcon: () => <svg data-testid="briefcase-icon" />,
  ProjetosIcon: () => <svg data-testid="projetos-icon" />,
}));

describe('ClientProjectsTab', () => {
  const mockOnOpenProject = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should render empty state when there are no projects', () => {
    render(<ClientProjectsTab projects={[]} onOpenProject={mockOnOpenProject} />);

    expect(screen.getByText('Projetos Vinculados')).toBeInTheDocument();
    expect(screen.getByTestId('projetos-icon')).toBeInTheDocument();

    expect(screen.getByText('Nenhum projeto vinculado a este cliente.')).toBeInTheDocument();
    expect(screen.getByText(/Crie um novo projeto ou converta/)).toBeInTheDocument();
    expect(screen.getByTestId('briefcase-icon')).toBeInTheDocument();
  });

  it('should render a list of projects when provided', () => {
    const projects = [
      {
        id: '1',
        name: 'Projeto Alpha',
        code: 'PRJ-001',
        status: 'Em Andamento',
        _mockTotal: 15000,
        deadline: '2026-12-31',
      } as never,
      {
        id: '2',
        name: 'Projeto Beta',
        code: 'PRJ-002',
        status: 'Pausado',
        _mockTotal: 5000,
        // No deadline for this one to test conditional rendering
      } as never,
    ];

    render(<ClientProjectsTab projects={projects} onOpenProject={mockOnOpenProject} />);

    // Alpha checks
    expect(screen.getByText('Projeto Alpha')).toBeInTheDocument();
    expect(screen.getByText('PRJ-001')).toBeInTheDocument();
    expect(screen.getByText('Em Andamento')).toBeInTheDocument();
    expect(screen.getByText('Em Andamento')).toHaveClass('bg-blue-100 text-blue-800');
    expect(screen.getByText('R$ 15000')).toBeInTheDocument();
    expect(screen.getByText('Data: 2026-12-31')).toBeInTheDocument();

    // Beta checks
    expect(screen.getByText('Projeto Beta')).toBeInTheDocument();
    expect(screen.getByText('PRJ-002')).toBeInTheDocument();
    expect(screen.getByText('Pausado')).toBeInTheDocument();
    expect(screen.getByText('Pausado')).toHaveClass('bg-yellow-100 text-yellow-800');
    expect(screen.getByText('R$ 5000')).toBeInTheDocument();

    // Ensure formatters were called
    expect(formatters.formatCurrency).toHaveBeenCalledTimes(2);
    expect(formatters.formatDate).toHaveBeenCalledTimes(1);
    expect(projectFinancials.getProjectTotalContractValue).toHaveBeenCalledTimes(2);
  });

  it('should trigger onOpenProject when clicking the button', () => {
    const projects = [
      {
        id: '123',
        name: 'Projeto Click',
        code: 'PRJ-123',
        status: 'Em Andamento',
      } as never,
    ];

    render(<ClientProjectsTab projects={projects} onOpenProject={mockOnOpenProject} />);

    const viewButton = screen.getByRole('button', { name: /ver projeto/i });
    expect(viewButton).toBeInTheDocument();

    fireEvent.click(viewButton);
    expect(mockOnOpenProject).toHaveBeenCalledWith('123');
  });
});
