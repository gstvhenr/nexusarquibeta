import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import Sidebar from './Sidebar';

const renderSidebar = (isOpen: boolean, setOpen?: (v: boolean) => void, path = '/') => {
  const setOpenFn = setOpen ?? vi.fn();
  return {
    ...render(
      <MemoryRouter initialEntries={[path]}>
        <Sidebar isOpen={isOpen} setOpen={setOpenFn} />
      </MemoryRouter>,
    ),
    setOpenFn,
  };
};

describe('Sidebar', () => {
  // ── Branding ──

  it('renders the NexusArqui brand name', () => {
    renderSidebar(true);

    expect(screen.getByText('NexusArqui')).toBeInTheDocument();
  });

  it('renders the business subtitle', () => {
    renderSidebar(true);

    expect(screen.getByText('Rafael Munaro Arquitetura')).toBeInTheDocument();
  });

  // ── Close button ──

  it('renders a close button with aria-label "Fechar menu"', () => {
    renderSidebar(true);

    const closeButton = screen.getByRole('button', { name: 'Fechar menu' });
    expect(closeButton).toBeInTheDocument();
  });

  it('calls setOpen(false) when the close button is clicked', () => {
    const setOpen = vi.fn();
    renderSidebar(true, setOpen);

    const closeButton = screen.getByRole('button', { name: 'Fechar menu' });
    fireEvent.click(closeButton);

    expect(setOpen).toHaveBeenCalledWith(false);
  });

  // ── Overlay ──

  it('renders an overlay that is visible when isOpen is true', () => {
    const { container } = renderSidebar(true);

    const overlay = container.querySelector('[aria-hidden="true"]');
    expect(overlay).not.toBeNull();
    expect(overlay!.className).toContain('opacity-100');
  });

  it('renders an overlay that is hidden when isOpen is false', () => {
    const { container } = renderSidebar(false);

    const overlay = container.querySelector('[aria-hidden="true"]');
    expect(overlay).not.toBeNull();
    expect(overlay!.className).toContain('opacity-0');
    expect(overlay!.className).toContain('pointer-events-none');
  });

  it('calls setOpen(false) when the overlay is clicked', () => {
    const setOpen = vi.fn();
    const { container } = renderSidebar(true, setOpen);

    const overlay = container.querySelector('[aria-hidden="true"]');
    fireEvent.click(overlay!);

    expect(setOpen).toHaveBeenCalledWith(false);
  });

  // ── Sidebar panel translation ──

  it('applies translate-x-0 (visible) to the aside when isOpen is true', () => {
    renderSidebar(true);

    const aside = screen.getByRole('complementary');
    expect(aside.className).toContain('translate-x-0');
  });

  it('applies -translate-x-full (hidden) to the aside when isOpen is false', () => {
    renderSidebar(false);

    const aside = screen.getByRole('complementary');
    expect(aside.className).toContain('-translate-x-full');
  });

  // ── Navigation links ──

  it('renders top-level navigation links from NAV_LINKS', () => {
    renderSidebar(true);

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Projetos')).toBeInTheDocument();
    expect(screen.getByText('Clientes')).toBeInTheDocument();
    expect(screen.getByText('Relatórios')).toBeInTheDocument();
  });

  it('renders parent nav items with children (expandable groups)', () => {
    renderSidebar(true);

    expect(screen.getByText('Agenda')).toBeInTheDocument();
    expect(screen.getByText('Comercial')).toBeInTheDocument();
    expect(screen.getByText('Financeiro')).toBeInTheDocument();
    expect(screen.getByText('Documentos')).toBeInTheDocument();
    expect(screen.getByText('Suprimentos')).toBeInTheDocument();
    expect(screen.getByText('Marketing')).toBeInTheDocument();
    expect(screen.getByText('Subcontratação')).toBeInTheDocument();
  });

  it('renders the Configurações settings link', () => {
    renderSidebar(true);

    expect(screen.getByText('Configurações')).toBeInTheDocument();
  });

  // ── Expanding parent links ──

  it('expands a parent link to show children when clicking the parent button', () => {
    renderSidebar(true);

    const agendaButton = screen.getByText('Agenda');
    fireEvent.click(agendaButton);

    expect(screen.getByText('Calendário')).toBeInTheDocument();
    expect(screen.getByText('Tarefas')).toBeInTheDocument();
    expect(screen.getByText('Lembretes')).toBeInTheDocument();
    expect(screen.getByText('Anotações')).toBeInTheDocument();
  });

  it('collapses an expanded parent link when clicking the parent button again', () => {
    renderSidebar(true);

    const agendaButton = screen.getByText('Agenda');
    // Expand
    fireEvent.click(agendaButton);
    expect(screen.getByText('Calendário')).toBeInTheDocument();

    // Collapse
    fireEvent.click(agendaButton);
    expect(screen.queryByText('Calendário')).not.toBeInTheDocument();
  });

  // ── Structural ──

  it('renders an <aside> element for the sidebar panel', () => {
    renderSidebar(true);

    expect(screen.getByRole('complementary')).toBeInTheDocument();
  });

  it('renders <nav> elements for navigation sections', () => {
    renderSidebar(true);

    const navElements = screen.getAllByRole('navigation');
    // Main nav + settings nav
    expect(navElements.length).toBeGreaterThanOrEqual(2);
  });

  // ── Auto-expand for active route ──

  it('auto-expands the parent group whose child matches the current route', () => {
    const setOpen = vi.fn();
    renderSidebar(true, setOpen, '/agenda/calendario');

    // Agenda's children should be visible because the active route matches
    expect(screen.getByText('Calendário')).toBeInTheDocument();
    expect(screen.getByText('Tarefas')).toBeInTheDocument();
  });

  // ── Child click closes sidebar ──

  it('calls setOpen(false) when a child navigation link is clicked', () => {
    const setOpen = vi.fn();
    renderSidebar(true, setOpen, '/agenda/calendario');

    const calendarLink = screen.getByText('Calendário');
    fireEvent.click(calendarLink);

    expect(setOpen).toHaveBeenCalledWith(false);
  });

  it('calls setOpen(false) when a top-level nav link is clicked', () => {
    const setOpen = vi.fn();
    renderSidebar(true, setOpen);

    const homeLink = screen.getByText('Home');
    fireEvent.click(homeLink);

    expect(setOpen).toHaveBeenCalledWith(false);
  });

  it('calls setOpen(false) when the settings link is clicked', () => {
    const setOpen = vi.fn();
    renderSidebar(true, setOpen);

    const settingsLink = screen.getByText('Configurações');
    fireEvent.click(settingsLink);

    expect(setOpen).toHaveBeenCalledWith(false);
  });
});
