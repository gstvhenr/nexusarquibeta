import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ProjectFinanceKPISection } from './ProjectFinanceKPISection';

describe('ProjectFinanceKPISection', () => {
  it('renders all KPI cards with formatted values', () => {
    render(
      <ProjectFinanceKPISection
        totalValue={1500}
        totalAddendums={300}
        totalPaid={500}
        totalToPay={1000}
      />,
    );

    expect(screen.getByText('Total do Projeto')).toBeInTheDocument();
    expect(screen.getByText('Aditivos')).toBeInTheDocument();
    expect(screen.getByText('Recebido')).toBeInTheDocument();
    expect(screen.getByText('A Receber')).toBeInTheDocument();
    expect(screen.getAllByText(/R\$/).length).toBeGreaterThan(0);
  });
});
