import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SummaryBar } from './SummaryBar';

describe('SummaryBar', () => {
  it('renders summary metrics and computed completion percentage', () => {
    render(
      <SummaryBar
        total={10}
        completed={4}
        late={2}
        inProgress={4}
        dateRange="01/03/26 → 10/03/26"
      />,
    );

    expect(screen.getByText('Total')).toBeInTheDocument();
    expect(screen.getByText('Concluídas')).toBeInTheDocument();
    expect(screen.getByText('Em Andamento')).toBeInTheDocument();
    expect(screen.getByText('Atrasadas')).toBeInTheDocument();
    expect(screen.getByText('40%')).toBeInTheDocument();
    expect(screen.getByText('01/03/26 → 10/03/26')).toBeInTheDocument();
  });
});
