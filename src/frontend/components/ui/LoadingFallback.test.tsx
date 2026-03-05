import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import LoadingFallback from './LoadingFallback';

describe('LoadingFallback', () => {
  it('renders a centered spinner', () => {
    const { container } = render(<LoadingFallback />);

    const wrapper = container.firstChild;
    const spinner = container.querySelector('.animate-spin');

    expect(wrapper).toHaveClass('min-h-[60vh]');
    expect(wrapper).toHaveClass('justify-center');
    expect(spinner).not.toBeNull();
    expect(spinner).toHaveClass('border-4');
    expect(spinner).toHaveClass('rounded-full');
  });
});
