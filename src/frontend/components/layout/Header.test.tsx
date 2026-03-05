import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import Header from './Header';

// Wrap Header in MemoryRouter for useLocation
const renderHeader = (path: string, onMenuClick: () => void) => {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Header onMenuClick={onMenuClick} />
    </MemoryRouter>,
  );
};

describe('Header', () => {
  // ── Page title resolution ──

  it('displays "Home" as the default page title for the root path', () => {
    const onClick = vi.fn();
    renderHeader('/', onClick);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Home');
  });

  it('displays the correct label for a top-level nav link (e.g. Projetos)', () => {
    const onClick = vi.fn();
    renderHeader('/projetos', onClick);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Projetos');
  });

  it('displays the correct label for a nested child nav link (e.g. Calendário)', () => {
    const onClick = vi.fn();
    renderHeader('/agenda/calendario', onClick);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Calendário');
  });

  it('displays "Home" as fallback when the path does not match any nav link', () => {
    const onClick = vi.fn();
    renderHeader('/unknown/page', onClick);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Home');
  });

  it('displays the correct label for a deep child link (e.g. Orçamentos)', () => {
    const onClick = vi.fn();
    renderHeader('/orcamentos', onClick);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Orçamentos');
  });

  // ── Menu button ──

  it('renders a button with aria-label "Abrir menu"', () => {
    const onClick = vi.fn();
    renderHeader('/', onClick);

    const menuButton = screen.getByRole('button', { name: 'Abrir menu' });
    expect(menuButton).toBeInTheDocument();
  });

  it('calls onMenuClick when the menu button is clicked', () => {
    const onClick = vi.fn();
    renderHeader('/', onClick);

    const menuButton = screen.getByRole('button', { name: 'Abrir menu' });
    fireEvent.click(menuButton);

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  // ── Structure ──

  it('renders a <header> element', () => {
    const onClick = vi.fn();
    renderHeader('/', onClick);

    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  // ── Additional routes ──

  it('falls back to "Home" for /configuracoes (uses SETTINGS_LINK, not NAV_LINKS)', () => {
    const onClick = vi.fn();
    renderHeader('/configuracoes', onClick);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Home');
  });

  it('resolves Clientes label for /clientes', () => {
    const onClick = vi.fn();
    renderHeader('/clientes', onClick);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Clientes');
  });

  it('resolves Relatórios label for /relatorios', () => {
    const onClick = vi.fn();
    renderHeader('/relatorios', onClick);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Relatórios');
  });
});
