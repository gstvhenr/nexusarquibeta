import type React from 'react';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import * as IconsCommonExtra from './icons-common-extra';

type IconComponent = (props: { className?: string }) => React.ReactNode;

describe('icons-common-extra', () => {
  it('renders every exported icon as svg and accepts className', () => {
    for (const [iconName, iconValue] of Object.entries(IconsCommonExtra)) {
      const IconComponent = iconValue as IconComponent;
      const { container, unmount } = render(<IconComponent className="extra-icon" />);
      const svg = container.querySelector('svg');

      expect(svg, `${iconName} should render svg`).not.toBeNull();
      expect(svg).toHaveClass('extra-icon');
      unmount();
    }
  });
});
