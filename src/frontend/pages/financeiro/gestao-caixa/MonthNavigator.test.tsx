import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MonthNavigator } from './MonthNavigator';

describe('MonthNavigator', () => {
  afterEach(() => {
    cleanup();
  });

  it('shows the current month/year label', () => {
    render(<MonthNavigator currentDate={new Date('2026-03-20T00:00:00')} onDateChange={vi.fn()} />);

    expect(screen.getByText(/2026/)).toBeInTheDocument();
  });

  it('emits previous and next month with day normalized to first day', () => {
    const onDateChange = vi.fn();
    render(
      <MonthNavigator currentDate={new Date('2026-03-20T15:00:00')} onDateChange={onDateChange} />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Mês anterior' }));
    fireEvent.click(screen.getByRole('button', { name: 'Próximo mês' }));

    const previous = onDateChange.mock.calls[0][0] as Date;
    const next = onDateChange.mock.calls[1][0] as Date;

    expect(previous.getDate()).toBe(1);
    expect(next.getDate()).toBe(1);
    expect(previous.getMonth()).toBe(1);
    expect(next.getMonth()).toBe(3);
  });
});
