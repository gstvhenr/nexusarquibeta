import type React from 'react';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import * as IconsSocial from './icons-social';

type IconComponent = (props: { className?: string }) => React.ReactNode;

describe('icons-social', () => {
  it('renders all social icons as svg', () => {
    for (const [iconName, iconValue] of Object.entries(IconsSocial)) {
      const IconComponent = iconValue as IconComponent;
      const { container, unmount } = render(<IconComponent className="social-icon" />);
      const svg = container.querySelector('svg');

      expect(svg, `${iconName} should render an svg`).not.toBeNull();
      expect(svg).toHaveClass('social-icon');
      unmount();
    }
  });

  it('keeps gradient definitions for Instagram icon', () => {
    const { container } = render(<IconsSocial.InstagramIcon className="instagram" />);
    expect(container.querySelector('radialGradient#insta-gradient-c')).not.toBeNull();
    expect(container.querySelector('radialGradient#insta-gradient-d')).not.toBeNull();
  });
});
