import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as cashBoxService from '../../services/cashBoxService';
import CashBoxCreditFormModal from './CashBoxCreditFormModal';

describe('CashBoxCreditFormModal', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-20T10:00:00.000Z'));

    vi.spyOn(cashBoxService, 'getCreditCategoriesForOrigin').mockImplementation((origin) =>
      origin === 'Profissional' ? ['Honorários'] : ['Salário e Renda'],
    );
    vi.spyOn(cashBoxService, 'getCreditItemsForCategory').mockImplementation((_origin, category) =>
      category === 'Honorários' ? ['Pagamento de Projeto'] : [],
    );
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('returns null when closed', () => {
    render(<CashBoxCreditFormModal isOpen={false} onClose={vi.fn()} onSave={vi.fn()} />);
    expect(screen.queryByText('Adicionar Crédito')).not.toBeInTheDocument();
  });

  it('shows validation messages when required fields are missing', () => {
    const onSave = vi.fn();
    render(<CashBoxCreditFormModal isOpen={true} onClose={vi.fn()} onSave={onSave} />);

    fireEvent.click(screen.getByRole('button', { name: 'Salvar Crédito' }));

    expect(onSave).not.toHaveBeenCalled();
    expect(screen.getByText(/Selecione a origem\./i)).toBeInTheDocument();
    expect(screen.getByText(/Selecione a categoria\./i)).toBeInTheDocument();
    expect(screen.getByText(/Informe a data\./i)).toBeInTheDocument();
    expect(screen.getByText(/Informe um valor positivo\./i)).toBeInTheDocument();
  });

  it('renders conditional category and item fields based on selections', () => {
    render(<CashBoxCreditFormModal isOpen={true} onClose={vi.fn()} onSave={vi.fn()} />);

    expect(screen.queryByLabelText('Categoria')).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Origem'), { target: { value: 'Profissional' } });
    expect(screen.getByLabelText('Categoria')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Categoria'), { target: { value: 'Honorários' } });
    expect(screen.getByLabelText('Item')).toBeInTheDocument();
  });

  it('creates credit payload with trimmed description and deterministic id shape', () => {
    vi.spyOn(Date, 'now').mockReturnValue(12345);
    vi.spyOn(Math, 'random').mockReturnValue(0.123456);

    const onSave = vi.fn();
    const onClose = vi.fn();
    render(<CashBoxCreditFormModal isOpen={true} onClose={onClose} onSave={onSave} />);

    fireEvent.change(screen.getByLabelText('Origem'), { target: { value: 'Profissional' } });
    fireEvent.change(screen.getByLabelText('Categoria'), { target: { value: 'Honorários' } });
    fireEvent.change(screen.getByLabelText('Item'), { target: { value: '' } });
    fireEvent.change(screen.getByLabelText('Descrição'), { target: { value: '  Entrada  ' } });
    fireEvent.change(screen.getByLabelText('Data do crédito'), { target: { value: '2026-04-21' } });
    fireEvent.change(screen.getByLabelText('Valor'), { target: { value: '2500' } });

    fireEvent.click(screen.getByRole('button', { name: 'Salvar Crédito' }));

    expect(onSave).toHaveBeenCalledTimes(1);
    const createdCredit = onSave.mock.calls[0][0];
    expect(createdCredit.id).toMatch(/^cbc_12345_[a-z0-9]{4}$/);
    expect(createdCredit.origin).toBe('Profissional');
    expect(createdCredit.category).toBe('Honorários');
    expect(createdCredit.item).toBeNull();
    expect(createdCredit.description).toBe('Entrada');
    expect(createdCredit.date).toBe('2026-04-21');
    expect(createdCredit.value).toBe(2500);
    expect(createdCredit.confirmed).toBe(false);
    expect(createdCredit.createdAt).toBe('2026-04-20T10:00:00.000Z');

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
