import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { HealthBar } from './HealthBar';

describe('HealthBar', () => {
  it('renders warning variant with capped percentage and formatted currency', () => {
    const { container } = render(
      <HealthBar label="Recebido" value={500} total={400} variant="warning" />,
    );

    expect(screen.getByText('Recebido')).toBeInTheDocument();
    expect(screen.getByText('100%')).toBeInTheDocument();
    expect(screen.getByText(/500,00/)).toHaveClass('text-warning');

    const dot = container.querySelector('.w-1\\.5.h-1\\.5') as HTMLElement;
    expect(dot).toHaveClass('bg-warning');

    const bar = container.querySelector('.from-warning') as HTMLElement;
    expect(bar.style.width).toBe('100%');
  });

  it('renders zero percent when total is not positive', () => {
    const { container } = render(
      <HealthBar label="Previsto" value={200} total={0} variant="error" />,
    );

    expect(screen.getByText('0%')).toBeInTheDocument();
    expect(screen.getByText(/200,00/)).toHaveClass('text-error');

    const bar = container.querySelector('.from-error') as HTMLElement;
    expect(bar.style.width).toBe('0%');
  });
});
