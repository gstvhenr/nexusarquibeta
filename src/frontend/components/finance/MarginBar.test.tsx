import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MarginBar } from './MarginBar';

describe('MarginBar', () => {
  it('renders positive margin with success styles and computed width', () => {
    const { container } = render(<MarginBar receita={400} despesa={100} margin={25.4} />);

    expect(screen.getByText('Margem')).toBeInTheDocument();
    expect(screen.getByText('25.4%')).toHaveClass('text-success');

    const incomeBar = container.querySelector('.via-emerald-400') as HTMLElement;
    expect(incomeBar.style.width).toBe('80%');
  });

  it('renders negative margin with error styles', () => {
    render(<MarginBar receita={100} despesa={300} margin={-15.2} />);

    expect(screen.getByText('-15.2%')).toHaveClass('text-error');
  });

  it('caps width to 100% and handles zero totals safely', () => {
    const { container, rerender } = render(<MarginBar receita={200} despesa={0} margin={10} />);
    const cappedBar = container.querySelector('.via-emerald-400') as HTMLElement;
    expect(cappedBar.style.width).toBe('100%');

    rerender(<MarginBar receita={0} despesa={0} margin={0} />);
    const safeBar = container.querySelector('.via-emerald-400') as HTMLElement;
    expect(safeBar.style.width).toBe('0%');
  });
});
