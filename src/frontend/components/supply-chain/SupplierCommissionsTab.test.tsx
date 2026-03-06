import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { SupplierCommissionsTab } from './SupplierCommissionsTab';
import type { Commission } from '../../types';

// ── Factories ──────────────────────────────────────────────────────────────────

const makeCommission = (overrides: Partial<Commission> = {}): Commission => ({
  id: 'comm-1',
  saleDate: '2026-01-15',
  supplierId: 'sup-1',
  supplierName: 'Marmoraria Pedra Fina',
  clientId: 'cli-1',
  clientName: 'Cliente Alpha',
  saleValue: 5000,
  commissionPercentage: 10,
  commissionValue: 500,
  status: 'Pendente',
  ...overrides,
});

// ── Suite ──────────────────────────────────────────────────────────────────────

describe('SupplierCommissionsTab', () => {
  // ── Table Headers ────────────────────────────────────────────────────────────

  it('renders all table column headers', () => {
    render(<SupplierCommissionsTab supplierCommissions={[]} />);
    expect(screen.getByText('Cliente / Projeto')).toBeInTheDocument();
    expect(screen.getByText('Data Venda')).toBeInTheDocument();
    expect(screen.getByText('Valor Venda')).toBeInTheDocument();
    expect(screen.getByText('Comissão')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
  });

  it('renders section title "Histórico de Comissões"', () => {
    render(<SupplierCommissionsTab supplierCommissions={[]} />);
    expect(screen.getByText('Histórico de Comissões')).toBeInTheDocument();
  });

  // ── Empty State ──────────────────────────────────────────────────────────────

  it('shows empty state when no commissions', () => {
    render(<SupplierCommissionsTab supplierCommissions={[]} />);
    expect(screen.getByText('Nenhuma comissão registrada.')).toBeInTheDocument();
  });

  it('does not show empty state when commissions exist', () => {
    render(<SupplierCommissionsTab supplierCommissions={[makeCommission()]} />);
    expect(screen.queryByText('Nenhuma comissão registrada.')).not.toBeInTheDocument();
  });

  // ── Commission Row Data ──────────────────────────────────────────────────────

  it('renders commission row with client name', () => {
    render(<SupplierCommissionsTab supplierCommissions={[makeCommission()]} />);
    expect(screen.getByText('Cliente Alpha')).toBeInTheDocument();
  });

  it('renders formatted sale value', () => {
    render(<SupplierCommissionsTab supplierCommissions={[makeCommission({ saleValue: 5000 })]} />);
    expect(screen.getByText('R$ 5.000,00')).toBeInTheDocument();
  });

  it('renders formatted commission value', () => {
    render(
      <SupplierCommissionsTab supplierCommissions={[makeCommission({ commissionValue: 500 })]} />,
    );
    expect(screen.getByText('R$ 500,00')).toBeInTheDocument();
  });

  it('renders formatted sale date', () => {
    render(
      <SupplierCommissionsTab supplierCommissions={[makeCommission({ saleDate: '2026-01-15' })]} />,
    );
    expect(screen.getByText(/15/)).toBeInTheDocument();
  });

  // ── Status Badges ────────────────────────────────────────────────────────────

  it('renders Pendente status badge with warning styling', () => {
    render(
      <SupplierCommissionsTab supplierCommissions={[makeCommission({ status: 'Pendente' })]} />,
    );
    const badge = screen.getByText('Pendente');
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain('text-warning');
  });

  it('renders Recebido status badge with success styling', () => {
    render(
      <SupplierCommissionsTab supplierCommissions={[makeCommission({ status: 'Recebido' })]} />,
    );
    const badge = screen.getByText('Recebido');
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain('text-success');
  });

  // ── Multiple Commissions ─────────────────────────────────────────────────────

  it('renders multiple commissions', () => {
    const commissions = [
      makeCommission({ id: 'c1', clientName: 'Cliente A' }),
      makeCommission({ id: 'c2', clientName: 'Cliente B' }),
      makeCommission({ id: 'c3', clientName: 'Cliente C' }),
    ];
    render(<SupplierCommissionsTab supplierCommissions={commissions} />);
    expect(screen.getByText('Cliente A')).toBeInTheDocument();
    expect(screen.getByText('Cliente B')).toBeInTheDocument();
    expect(screen.getByText('Cliente C')).toBeInTheDocument();
  });

  it('renders correct number of table rows', () => {
    const commissions = [
      makeCommission({ id: 'c1', clientName: 'A' }),
      makeCommission({ id: 'c2', clientName: 'B' }),
    ];
    const { container } = render(<SupplierCommissionsTab supplierCommissions={commissions} />);
    const rows = container.querySelectorAll('tbody tr');
    expect(rows.length).toBe(2);
  });

  // ── Zero Values ──────────────────────────────────────────────────────────────

  it('renders zero-value commission gracefully', () => {
    render(
      <SupplierCommissionsTab
        supplierCommissions={[makeCommission({ saleValue: 0, commissionValue: 0 })]}
      />,
    );
    expect(screen.getAllByText('R$ 0,00').length).toBe(2);
  });
});
