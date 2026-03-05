import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Select } from './Select';

const options = [
  { value: 'pending', label: 'Pendente' },
  { value: 'done', label: 'Concluído' },
];

describe('Select', () => {
  it('renders label, placeholder and options', () => {
    render(
      <Select
        label="Status"
        options={options}
        placeholder="Selecione um status"
        value=""
        onChange={() => undefined}
      />,
    );

    const select = screen.getByLabelText('Status');
    expect(select).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Selecione um status' })).toBeDisabled();
    expect(screen.getByRole('option', { name: 'Pendente' })).toHaveValue('pending');
    expect(screen.getByRole('option', { name: 'Concluído' })).toHaveValue('done');
  });

  it('forwards changes to onChange callback', () => {
    const onChange = vi.fn();
    render(<Select label="Status" options={options} value="pending" onChange={onChange} />);

    fireEvent.change(screen.getByLabelText('Status'), {
      target: { value: 'done' },
    });
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('shows error message and invalid state', () => {
    render(
      <Select
        label="Status"
        options={options}
        value="pending"
        onChange={() => undefined}
        error="Seleção inválida"
      />,
    );

    const select = screen.getByLabelText('Status');
    expect(select).toHaveAttribute('aria-invalid', 'true');
    expect(select).toHaveClass('border-error');
    expect(screen.getByRole('alert')).toHaveTextContent('Seleção inválida');
  });

  it('applies custom id, size and wrapper class', () => {
    const { container } = render(
      <Select
        id="status-select"
        label="Status"
        options={options}
        value="pending"
        size="sm"
        wrapperClassName="wrapper-extra"
        onChange={() => undefined}
      />,
    );

    const select = screen.getByLabelText('Status');
    expect(select).toHaveAttribute('id', 'status-select');
    expect(select).toHaveClass('text-xs');
    expect(container.firstChild).toHaveClass('wrapper-extra');
  });
});
