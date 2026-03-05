import type React from 'react';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import * as IconsCommon from './icons-common';

type IconComponent = (props: { className?: string }) => React.ReactNode;

describe('icons-common', () => {
  it('renders all exported icons as svg components', () => {
    for (const [iconName, iconValue] of Object.entries(IconsCommon)) {
      const IconComponent = iconValue as IconComponent;
      const { container, unmount } = render(<IconComponent className="common-icon" />);
      const svg = container.querySelector('svg');

      expect(svg, `${iconName} should render an svg`).not.toBeNull();
      expect(svg).toHaveClass('common-icon');
      unmount();
    }
  });

  it('supports StarIcon solid mode', () => {
    const { container: outline } = render(<IconsCommon.StarIcon className="star" />);
    const outlineSvg = outline.querySelector('svg');
    expect(outlineSvg).toHaveAttribute('fill', 'none');

    const { container: solid } = render(<IconsCommon.StarIcon className="star" solid={true} />);
    const solidSvg = solid.querySelector('svg');
    expect(solidSvg).toHaveAttribute('fill', 'currentColor');
  });
});
