import type React from 'react';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import * as Icons from './icons';

type IconComponent = (props: { className?: string }) => React.ReactNode;

describe('icons', () => {
  it('renders LogoIcon with default classes and defs', () => {
    const { container } = render(<Icons.LogoIcon />);
    const svg = container.querySelector('svg');

    expect(svg).not.toBeNull();
    expect(svg).toHaveClass('w-12', 'h-12');
    expect(container.querySelector('linearGradient#nexus-gradient')).not.toBeNull();
    expect(container.querySelector('filter#nexus-shadow')).not.toBeNull();
  });

  it('exports a populated ICON_MAP with shared icon keys', () => {
    expect(Icons.ICON_MAP).toHaveProperty('LogoIcon');
    expect(Icons.ICON_MAP).toHaveProperty('HomeIcon');
    expect(Icons.ICON_MAP).toHaveProperty('ProposalIcon');
    expect(Icons.ICON_MAP).toHaveProperty('SearchIcon');
    expect(Icons.ICON_MAP).toHaveProperty('InstagramIcon');
    expect(Object.keys(Icons.ICON_MAP).length).toBeGreaterThan(30);
  });

  it('renders all ICON_MAP entries as icon components', () => {
    for (const [iconName, iconValue] of Object.entries(Icons.ICON_MAP)) {
      const IconComponent = iconValue as IconComponent;
      const { container, unmount } = render(<IconComponent className="mapped-icon" />);
      const svg = container.querySelector('svg');

      expect(svg, `${iconName} should render an svg`).not.toBeNull();
      expect(svg).toHaveClass('mapped-icon');
      unmount();
    }
  });
});
