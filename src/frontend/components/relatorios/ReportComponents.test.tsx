import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ReportCard, StatCard, InteractiveBarChart } from './ReportComponents';

// ── Mocks ────────────────────────────────────────────────────────────────────

vi.mock('../../utils/formatters', () => ({
  formatCurrency: (val: number) => `R$ ${val.toFixed(2)}`,
}));

/**
 * recharts relies on ResizeObserver / SVG sizing — jsdom provides neither.
 * A lightweight stub keeps tests from crashing while exercising real logic.
 */
vi.mock('recharts', () => {
  const Stub = ({ children }: { children?: React.ReactNode }) => (
    <div data-testid="recharts-stub">{children}</div>
  );

  const XAxisStub = ({ dataKey }: { dataKey?: string }) => (
    <div data-testid="xaxis" data-key={dataKey} />
  );

  const YAxisStub = ({
    tickFormatter,
  }: {
    tickFormatter?: (val: number) => string;
  }) => (
    <div
      data-testid="yaxis"
      data-formatted-1000={tickFormatter ? tickFormatter(1000) : ''}
      data-formatted-500={tickFormatter ? tickFormatter(500) : ''}
      data-formatted-0={tickFormatter ? tickFormatter(0) : ''}
    />
  );

  const TooltipStub = ({
    content,
  }: {
    content?: React.ReactElement;
  }) => {
    // Clone the custom tooltip with active payload so we can assert its output
    const cloned = content
      ? React.cloneElement(content as React.ReactElement<{
        active?: boolean;
        payload?: { value: number }[];
        label?: string;
      }>, {
        active: true,
        payload: [{ value: 1500 }],
        label: 'Janeiro',
      })
      : null;
    return <div data-testid="tooltip-wrapper">{cloned}</div>;
  };

  const BarStub = () => <div data-testid="bar" />;
  const CartesianGridStub = () => <div data-testid="cartesian-grid" />;

  return {
    ResponsiveContainer: Stub,
    BarChart: Stub,
    Bar: BarStub,
    XAxis: XAxisStub,
    YAxis: YAxisStub,
    CartesianGrid: CartesianGridStub,
    Tooltip: TooltipStub,
  };
});

// ── ReportCard ────────────────────────────────────────────────────────────────

describe('ReportCard', () => {
  it('renders the title and children', () => {
    render(
      <ReportCard title="Resumo Financeiro">
        <p>Conteúdo da seção</p>
      </ReportCard>
    );

    expect(screen.getByText('Resumo Financeiro')).toBeInTheDocument();
    expect(screen.getByText('Conteúdo da seção')).toBeInTheDocument();
  });

  it('applies the default container classes', () => {
    const { container } = render(
      <ReportCard title="Card">
        <span>child</span>
      </ReportCard>
    );

    const root = container.firstChild as HTMLElement;
    expect(root).toHaveClass('bg-surface');
    expect(root).toHaveClass('rounded-xl');
    expect(root).toHaveClass('shadow-soft');
    expect(root).toHaveClass('p-6');
  });

  it('appends an extra className when provided', () => {
    const { container } = render(
      <ReportCard title="Card" className="col-span-2">
        <span>child</span>
      </ReportCard>
    );

    expect((container.firstChild as HTMLElement)).toHaveClass('col-span-2');
  });

  it('does not include extra className when omitted', () => {
    const { container } = render(
      <ReportCard title="Card">
        <span>child</span>
      </ReportCard>
    );

    // className defaults to '' so the final class should not add extra tokens
    const cls = (container.firstChild as HTMLElement).className;
    // trailing space is the only artefact; trim and verify
    expect(cls.trim()).toBe('bg-surface rounded-xl shadow-soft p-6');
  });

  it('renders the title inside an h3 element', () => {
    render(<ReportCard title="Meu Título"><span /></ReportCard>);
    const heading = screen.getByRole('heading', { level: 3 });
    expect(heading).toHaveTextContent('Meu Título');
  });

  it('renders multiple children correctly', () => {
    render(
      <ReportCard title="Multi">
        <p>Filho 1</p>
        <p>Filho 2</p>
      </ReportCard>
    );
    expect(screen.getByText('Filho 1')).toBeInTheDocument();
    expect(screen.getByText('Filho 2')).toBeInTheDocument();
  });
});

// ── StatCard ──────────────────────────────────────────────────────────────────

describe('StatCard', () => {
  it('renders label and string value', () => {
    render(<StatCard label="Projetos Ativos" value="12" />);
    expect(screen.getByText('Projetos Ativos')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
  });

  it('renders label and numeric value', () => {
    render(<StatCard label="Taxa de Conversão" value={87.5} />);
    expect(screen.getByText('87.5')).toBeInTheDocument();
  });

  it('renders subtext when provided', () => {
    render(
      <StatCard label="Receita Total" value="R$ 50.000" subtext="vs. mês anterior" />
    );
    expect(screen.getByText('vs. mês anterior')).toBeInTheDocument();
  });

  it('does NOT render subtext element when prop is omitted', () => {
    render(<StatCard label="Receita Total" value="R$ 50.000" />);
    // There should be exactly 2 <p> tags: value and label
    const paragraphs = document.querySelectorAll('p');
    expect(paragraphs).toHaveLength(2);
  });

  it('does NOT render subtext element when prop is empty string', () => {
    render(<StatCard label="Label" value="Val" subtext="" />);
    // empty string is falsy → third <p> must not appear
    const paragraphs = document.querySelectorAll('p');
    expect(paragraphs).toHaveLength(2);
  });

  it('value paragraph has primary text colour class', () => {
    render(<StatCard label="Label" value="99" />);
    const valuePara = screen.getByText('99');
    expect(valuePara).toHaveClass('text-primary');
  });
});

// ── InteractiveBarChart ───────────────────────────────────────────────────────

describe('InteractiveBarChart', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Empty state ─────────────────────────────────────────────────────────────

  it('shows the empty-state message when data array is empty', () => {
    render(<InteractiveBarChart data={[]} format="currency" />);
    expect(
      screen.getByText('Dados insuficientes para exibir o gráfico.')
    ).toBeInTheDocument();
  });

  it('does NOT render recharts stubs when data is empty', () => {
    render(<InteractiveBarChart data={[]} format="number" />);
    expect(screen.queryByTestId('recharts-stub')).not.toBeInTheDocument();
  });

  // ── Non-empty rendering ──────────────────────────────────────────────────────

  it('renders the recharts scaffold when data has entries', () => {
    render(
      <InteractiveBarChart
        data={[{ label: 'Janeiro', value: 5000 }]}
        format="currency"
      />
    );
    expect(screen.queryByText('Dados insuficientes para exibir o gráfico.')).not.toBeInTheDocument();
    expect(screen.getAllByTestId('recharts-stub').length).toBeGreaterThan(0);
  });

  it('renders XAxis with label as dataKey', () => {
    render(
      <InteractiveBarChart
        data={[{ label: 'Fev', value: 2000 }]}
        format="number"
      />
    );
    expect(screen.getByTestId('xaxis')).toHaveAttribute('data-key', 'label');
  });

  // ── YAxis formatter — currency ───────────────────────────────────────────────

  it('formats YAxis tick >= 1000 as R$<n>k for currency format', () => {
    render(
      <InteractiveBarChart
        data={[{ label: 'Março', value: 3000 }]}
        format="currency"
      />
    );
    const yaxis = screen.getByTestId('yaxis');
    // 1000 → R$1k
    expect(yaxis.getAttribute('data-formatted-1000')).toBe('R$1k');
  });

  it('formats YAxis tick < 1000 as R$<n> for currency format', () => {
    render(
      <InteractiveBarChart
        data={[{ label: 'Abril', value: 500 }]}
        format="currency"
      />
    );
    const yaxis = screen.getByTestId('yaxis');
    // 500 → R$500
    expect(yaxis.getAttribute('data-formatted-500')).toBe('R$500');
  });

  it('formats YAxis tick 0 as R$0 for currency format', () => {
    render(
      <InteractiveBarChart
        data={[{ label: 'Maio', value: 0 }]}
        format="currency"
      />
    );
    const yaxis = screen.getByTestId('yaxis');
    expect(yaxis.getAttribute('data-formatted-0')).toBe('R$0');
  });

  // ── YAxis formatter — number ─────────────────────────────────────────────────

  it('formats YAxis tick as plain string for number format', () => {
    render(
      <InteractiveBarChart
        data={[{ label: 'Jun', value: 42 }]}
        format="number"
      />
    );
    const yaxis = screen.getByTestId('yaxis');
    // tickFormatter(1000) → "1000", tickFormatter(500) → "500"
    expect(yaxis.getAttribute('data-formatted-1000')).toBe('1000');
    expect(yaxis.getAttribute('data-formatted-500')).toBe('500');
  });

  // ── CustomTooltip — currency ─────────────────────────────────────────────────

  it('renders CustomTooltip with formatted currency value when active', () => {
    render(
      <InteractiveBarChart
        data={[{ label: 'Janeiro', value: 1500 }]}
        format="currency"
      />
    );
    // The TooltipStub clones the content with active=true, payload=[{value:1500}], label='Janeiro'
    expect(screen.getByText('Janeiro')).toBeInTheDocument();
    // formatCurrency(1500) → "R$ 1500.00"
    expect(screen.getByText('Valor: R$ 1500.00')).toBeInTheDocument();
  });

  // ── CustomTooltip — number ────────────────────────────────────────────────────

  it('renders CustomTooltip with plain numeric value when format is number', () => {
    render(
      <InteractiveBarChart
        data={[{ label: 'Projetos', value: 1500 }]}
        format="number"
      />
    );
    // value stays as number (1500)
    expect(screen.getByText('Valor: 1500')).toBeInTheDocument();
  });

  // ── Multiple data points ──────────────────────────────────────────────────────

  it('renders correctly with multiple data entries', () => {
    const data = [
      { label: 'Jan', value: 100 },
      { label: 'Fev', value: 200 },
      { label: 'Mar', value: 300 },
    ];
    render(<InteractiveBarChart data={data} format="number" />);
    // Chart scaffold should be present
    expect(screen.getAllByTestId('recharts-stub').length).toBeGreaterThan(0);
    expect(screen.queryByText('Dados insuficientes para exibir o gráfico.')).not.toBeInTheDocument();
  });
});
