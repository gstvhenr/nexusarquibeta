import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CalendarIcon, ClockIcon, LinkIcon, PinIcon } from './ReminderIcons';

describe('ReminderIcons', () => {
  it('renderiza PinIcon com defaults e sem preenchimento quando filled=false', () => {
    const { container } = render(<PinIcon />);
    const svg = container.querySelector('svg');

    expect(svg).toBeInTheDocument();
    expect(svg).toHaveClass('w-4', 'h-4');
    expect(svg).toHaveAttribute('fill', 'none');
  });

  it('renderiza PinIcon preenchido com className customizado', () => {
    const { container } = render(<PinIcon className="w-6 h-6" filled={true} />);
    const svg = container.querySelector('svg');

    expect(svg).toHaveClass('w-6', 'h-6');
    expect(svg).toHaveAttribute('fill', 'currentColor');
  });

  it('renderiza CalendarIcon, LinkIcon e ClockIcon com classes padrão', () => {
    const calendar = render(<CalendarIcon />);
    const link = render(<LinkIcon />);
    const clock = render(<ClockIcon />);

    expect(calendar.container.querySelector('svg')).toHaveClass('w-3', 'h-3');
    expect(link.container.querySelector('svg')).toHaveClass('w-3', 'h-3');
    expect(clock.container.querySelector('svg')).toHaveClass('w-3', 'h-3');
  });
});
