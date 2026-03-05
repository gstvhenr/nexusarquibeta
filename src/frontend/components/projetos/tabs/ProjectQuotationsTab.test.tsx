import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { Project, Quotation } from '@/types';
import { ProjectQuotationsTab } from './ProjectQuotationsTab';

const baseProject: Project = {
  id: 'project-1',
  code: 'PRJ-001',
  name: 'Projeto',
  clientName: 'Cliente',
  clientId: 'client-1',
  status: 'Em Andamento',
  deadline: null,
  budget: 1000,
  description: '',
  sections: [],
  linkedQuotationIds: ['q-1', 'q-missing'],
  financials: { paymentType: 'vista' },
};

const quotations: Quotation[] = [
  {
    id: 'q-1',
    name: 'Cotação Estrutural',
    date: '2026-03-01',
    items: [],
    status: 'Finalizada',
  },
];

describe('ProjectQuotationsTab', () => {
  it('renders linked quotations and dispatches link/unlink callbacks', () => {
    const onLink = vi.fn();
    const onUnlink = vi.fn();

    render(
      <ProjectQuotationsTab
        project={baseProject}
        allQuotations={quotations}
        onLink={onLink}
        onUnlink={onUnlink}
      />,
    );

    expect(screen.getByText('Cotação Estrutural')).toBeInTheDocument();
    expect(screen.queryByText('q-missing')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '+ Vincular Cotação' }));
    fireEvent.click(screen.getByRole('button', { name: 'Desvincular cotação' }));

    expect(onLink).toHaveBeenCalledTimes(1);
    expect(onUnlink).toHaveBeenCalledWith('q-1');
  });

  it('shows empty state when project has no linked quotations', () => {
    render(
      <ProjectQuotationsTab
        project={{ ...baseProject, linkedQuotationIds: [] }}
        allQuotations={quotations}
        onLink={vi.fn()}
        onUnlink={vi.fn()}
      />,
    );

    expect(screen.getByText('Nenhuma cotação vinculada a este projeto.')).toBeInTheDocument();
  });
});
