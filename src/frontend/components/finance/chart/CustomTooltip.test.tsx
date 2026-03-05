import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CustomTooltip } from './CustomTooltip';

describe('CustomTooltip', () => {
  it('returns null when tooltip is inactive', () => {
    const { container } = render(<CustomTooltip active={false} payload={[]} label="2026-03" />);
    expect(container.firstChild).toBeNull();
  });

  it('renders payload rows and formatted values when active', () => {
    const payload = [
      { dataKey: 'income', name: 'income', value: 1500 },
      { dataKey: 'expense', name: 'expense', value: 450 },
    ];

    render(<CustomTooltip active={true} payload={payload} label="Mar/26" />);

    expect(screen.getByText('Mar/26')).toBeInTheDocument();
    expect(screen.getByText('Receitas')).toBeInTheDocument();
    expect(screen.getByText('Despesas')).toBeInTheDocument();
    expect(screen.getByText(/1\.500,00/)).toBeInTheDocument();
    expect(screen.getByText(/450,00/)).toBeInTheDocument();
    expect(document.querySelector('.bg-success')).not.toBeNull();
    expect(document.querySelector('.bg-error')).not.toBeNull();
  });
});
