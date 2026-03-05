import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Textarea } from './Textarea';

describe('Textarea', () => {
  it('renders with default settings and supports input changes', () => {
    const onChange = vi.fn();
    render(<Textarea aria-label="Descrição" placeholder="Detalhes" onChange={onChange} />);

    const textarea = screen.getByLabelText('Descrição');
    expect(textarea).toHaveAttribute('rows', '3');
    expect(textarea).toHaveClass('text-sm');
    expect(textarea).not.toHaveAttribute('aria-invalid');

    fireEvent.change(textarea, { target: { value: 'Texto' } });
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('applies error style and invalid state', () => {
    render(<Textarea aria-label="Observações" error="Obrigatório" />);

    const textarea = screen.getByLabelText('Observações');
    expect(textarea).toHaveClass('border-error');
    expect(textarea).toHaveAttribute('aria-invalid', 'true');
  });

  it('supports custom rows, size and disabled state', () => {
    render(<Textarea aria-label="Notas" rows={5} size="sm" disabled={true} />);

    const textarea = screen.getByLabelText('Notas');
    expect(textarea).toHaveAttribute('rows', '5');
    expect(textarea).toHaveClass('text-xs');
    expect(textarea).toBeDisabled();
  });
});
