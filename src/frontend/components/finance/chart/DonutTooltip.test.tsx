import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DonutTooltip } from './DonutTooltip';

describe('DonutTooltip', () => {
  it('returns null when tooltip is inactive', () => {
    const { container } = render(<DonutTooltip active={false} payload={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders first payload item with formatted value and color dot', () => {
    const payload = [
      {
        name: 'Escritorio',
        value: 980,
        payload: { color: 'tomato' },
      },
    ];

    const { container } = render(<DonutTooltip active={true} payload={payload} />);

    expect(screen.getByText('Escritorio')).toBeInTheDocument();
    expect(screen.getByText(/980,00/)).toBeInTheDocument();

    const dot = container.querySelector('[style*="background-color"]') as HTMLElement;
    expect(dot.getAttribute('style')).toContain('tomato');
  });
});
