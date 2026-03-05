import type React from 'react';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import * as IconsNavigation from './icons-navigation';

type IconComponent = (props: { className?: string }) => React.ReactNode;

describe('icons-navigation', () => {
  it('renders every exported icon', () => {
    for (const [iconName, iconValue] of Object.entries(IconsNavigation)) {
      const IconComponent = iconValue as IconComponent;
      const { container, unmount } = render(<IconComponent className="nav-icon" />);
      const svg = container.querySelector('svg');

      expect(svg, `${iconName} should render an svg`).not.toBeNull();
      expect(svg).toHaveClass('nav-icon');
      unmount();
    }
  });
});
