import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { PasswordInput } from './PasswordInput';

describe('PasswordInput', () => {
  it('toggles input visibility and propagates input changes', () => {
    const onChange = vi.fn();

    render(
      <PasswordInput
        value="1234"
        onChange={onChange}
        placeholder="Digite a senha"
        ariaLabel="Senha financeira"
      />,
    );

    const input = screen.getByLabelText('Senha financeira');
    expect(input).toHaveAttribute('type', 'password');

    fireEvent.click(screen.getByRole('button', { name: 'Mostrar senha' }));
    expect(input).toHaveAttribute('type', 'text');

    fireEvent.click(screen.getByRole('button', { name: 'Ocultar senha' }));
    expect(input).toHaveAttribute('type', 'password');

    fireEvent.change(input, { target: { value: 'nova-senha' } });
    expect(onChange).toHaveBeenCalledWith('nova-senha');
  });

  it('uses placeholder as accessible label fallback', () => {
    render(<PasswordInput value="" onChange={vi.fn()} placeholder="Senha de acesso" />);

    const input = screen.getByLabelText('Senha de acesso');
    expect(input).toHaveAttribute('type', 'password');
    expect(screen.getByRole('button', { name: 'Mostrar senha' })).toBeInTheDocument();
  });
});
