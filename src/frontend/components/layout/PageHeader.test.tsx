import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import PageHeader from './PageHeader';

// A simple icon component for testing
const TestIcon = (props: { className?: string }) => (
  <svg data-testid="test-icon" className={props.className} />
);

describe('PageHeader', () => {
  // ── Title rendering ──

  it('renders a string title as an h1', () => {
    render(<PageHeader title="Projetos" />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Projetos');
  });

  it('renders a ReactNode title', () => {
    render(
      <PageHeader title={<span data-testid="custom-title">Custom Title</span>} />,
    );

    expect(screen.getByTestId('custom-title')).toHaveTextContent('Custom Title');
  });

  // ── Subtitle rendering ──

  it('renders the subtitle when provided', () => {
    render(<PageHeader title="Projetos" subtitle="Gerencie seus projetos" />);

    expect(screen.getByText('Gerencie seus projetos')).toBeInTheDocument();
  });

  it('does not render a subtitle paragraph when subtitle is not provided', () => {
    const { container } = render(<PageHeader title="Projetos" />);

    // No <p> element for subtitle should exist
    const paragraphs = container.querySelectorAll('p');
    expect(paragraphs.length).toBe(0);
  });

  // ── Icon rendering ──

  it('renders the icon when provided', () => {
    render(<PageHeader title="Projetos" icon={<TestIcon />} />);

    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
  });

  it('applies the w-8 h-8 className to the cloned icon', () => {
    render(<PageHeader title="Projetos" icon={<TestIcon />} />);

    const icon = screen.getByTestId('test-icon');
    expect(icon).toHaveClass('w-8', 'h-8');
  });

  it('does not render the icon wrapper when icon is not provided', () => {
    const { container } = render(<PageHeader title="Projetos" />);

    // The icon wrapper has bg-primary/5 class
    const iconWrapper = container.querySelector('.bg-primary\\/5');
    expect(iconWrapper).toBeNull();
  });

  // ── Children rendering ──

  it('renders children (action area) when provided', () => {
    render(
      <PageHeader title="Projetos">
        <button type="button">Nova Ação</button>
      </PageHeader>,
    );

    expect(screen.getByRole('button', { name: 'Nova Ação' })).toBeInTheDocument();
  });

  it('does not render the children wrapper when children are not provided', () => {
    const { container } = render(<PageHeader title="Projetos" />);

    // The flex wrapper for children should not be rendered
    // The component uses a conditional: {children && <div className="flex items-center gap-3">...}
    // So we check there's only the title row at the top level
    const topDiv = container.firstElementChild!;
    const flexRow = topDiv.querySelector('.flex.flex-col');
    // Inside flexRow, there should be only the title group, no second child div
    expect(flexRow?.children.length).toBe(1);
  });

  // ── contentGap prop ──

  it('applies default contentGap (mb-6) when not specified', () => {
    const { container } = render(<PageHeader title="Projetos" />);

    const wrapper = container.firstElementChild!;
    expect(wrapper.className).toContain('mb-6');
  });

  it('applies compact contentGap (mb-4)', () => {
    const { container } = render(
      <PageHeader title="Projetos" contentGap="compact" />,
    );

    const wrapper = container.firstElementChild!;
    expect(wrapper.className).toContain('mb-4');
  });

  it('applies spacious contentGap (mb-8)', () => {
    const { container } = render(
      <PageHeader title="Projetos" contentGap="spacious" />,
    );

    const wrapper = container.firstElementChild!;
    expect(wrapper.className).toContain('mb-8');
  });

  // ── Combined props ──

  it('renders title, subtitle, icon and children together', () => {
    render(
      <PageHeader
        title="Financeiro"
        subtitle="Visão geral do financeiro"
        icon={<TestIcon />}
        contentGap="compact"
      >
        <button type="button">Exportar</button>
      </PageHeader>,
    );

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Financeiro');
    expect(screen.getByText('Visão geral do financeiro')).toBeInTheDocument();
    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Exportar' })).toBeInTheDocument();
  });

  // ── Structural / styling ──

  it('has the expected base CSS classes on the root wrapper', () => {
    const { container } = render(<PageHeader title="Test" />);

    const wrapper = container.firstElementChild!;
    expect(wrapper.className).toContain('bg-surface');
    expect(wrapper.className).toContain('rounded-2xl');
    expect(wrapper.className).toContain('shadow-sm');
  });
});
