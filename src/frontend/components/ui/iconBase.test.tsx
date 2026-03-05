import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Icon } from './iconBase';

describe('Icon (base)', () => {
  it('renders with default svg attributes', () => {
    const { container } = render(
      <Icon>
        <path d="M1 1h2" />
      </Icon>,
    );

    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();
    expect(svg).toHaveClass('w-6', 'h-6');
    expect(svg).toHaveAttribute('viewBox', '0 0 24 24');
    expect(svg).toHaveAttribute('fill', 'none');
    expect(svg).toHaveAttribute('stroke-width', '1.5');
    expect(svg?.querySelector('path')).not.toBeNull();
  });

  it('accepts custom attributes', () => {
    const { container } = render(
      <Icon className="custom-icon" viewBox="0 0 32 32" fill="currentColor" strokeWidth={2}>
        <circle cx="8" cy="8" r="2" />
      </Icon>,
    );

    const svg = container.querySelector('svg');
    expect(svg).toHaveClass('custom-icon');
    expect(svg).toHaveAttribute('viewBox', '0 0 32 32');
    expect(svg).toHaveAttribute('fill', 'currentColor');
    expect(svg).toHaveAttribute('stroke-width', '2');
    expect(svg?.querySelector('circle')).not.toBeNull();
  });
});
