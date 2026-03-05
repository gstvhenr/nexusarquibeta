import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { FormField } from './FormField';

describe('FormField', () => {
  it('renders label and required mark', () => {
    render(
      <FormField label="Nome" required={true}>
        <input />
      </FormField>,
    );

    const label = screen.getByText('Nome');
    expect(label.tagName).toBe('LABEL');
    expect(screen.getByText('*')).toHaveClass('text-error');
  });

  it('shows error and hides hint when both are provided', () => {
    render(
      <FormField label="E-mail" error="Campo obrigatório" hint="Digite um e-mail válido">
        <input />
      </FormField>,
    );

    expect(screen.getByRole('alert')).toHaveTextContent('Campo obrigatório');
    expect(screen.queryByText('Digite um e-mail válido')).not.toBeInTheDocument();
  });

  it('shows hint when there is no error', () => {
    render(
      <FormField label="Telefone" hint="Formato: (00) 00000-0000">
        <input />
      </FormField>,
    );

    expect(screen.getByText('Formato: (00) 00000-0000')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('supports missing label and custom className', () => {
    const { container } = render(
      <FormField className="custom-wrapper">
        <input aria-label="Sem rótulo" />
      </FormField>,
    );

    expect(screen.getByLabelText('Sem rótulo')).toBeInTheDocument();
    expect(container.firstChild).toHaveClass('custom-wrapper');
    expect(container.querySelector('label')).toBeNull();
  });
});
