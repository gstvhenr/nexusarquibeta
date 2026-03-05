import type React from 'react';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import * as IconsSubmenu from './icons-submenu';

type IconComponent = (props: { className?: string }) => React.ReactNode;

describe('icons-submenu', () => {
  it('renders every exported icon', () => {
    for (const [iconName, iconValue] of Object.entries(IconsSubmenu)) {
      const IconComponent = iconValue as IconComponent;
      const { container, unmount } = render(<IconComponent className="submenu-icon" />);
      const svg = container.querySelector('svg');

      expect(svg, `${iconName} should render an svg`).not.toBeNull();
      expect(svg).toHaveClass('submenu-icon');
      unmount();
    }
  });
});
