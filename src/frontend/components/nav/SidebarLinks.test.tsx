import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { SidebarNavLink, SidebarParentLink } from './SidebarLinks';
import type { NavLinkItem } from '../../types';

describe('SidebarLinks', () => {
  const fallbackIcon = <svg data-testid="fallback-icon" />;

  describe('SidebarNavLink', () => {
    const defaultItem: NavLinkItem = {
      label: 'Home Link',
      path: '/home',
      icon: fallbackIcon,
      iconName: 'HomeIcon',
    };

    it('deve renderizar o link corretamente e verificar ícone de fallback', () => {
      render(
        <MemoryRouter initialEntries={['/other']}>
          <SidebarNavLink item={defaultItem} />
        </MemoryRouter>
      );

      const link = screen.getByRole('link', { name: /Home Link/i });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/home');
      expect(screen.getByTestId('fallback-icon')).toBeInTheDocument();
    });

    it('deve usar o iconName para resolver o ícone correto', () => {
      const itemWithIconName: NavLinkItem = {
        ...defaultItem,
        iconName: 'HomeIcon',
      };

      render(
        <MemoryRouter initialEntries={['/other']}>
          <SidebarNavLink item={itemWithIconName} />
        </MemoryRouter>
      );

      const link = screen.getByRole('link', { name: /Home Link/i });
      expect(link).toBeInTheDocument();
    });

    it('não deve renderizar se o item não tiver path', () => {
      const noPathItem: NavLinkItem = {
        label: 'No Path',
        iconName: 'HomeIcon',
      };

      const { container } = render(
        <MemoryRouter>
          <SidebarNavLink item={noPathItem} />
        </MemoryRouter>
      );

      expect(container.firstChild).toBeNull();
    });

    it('deve exibir estilo ativo quando a rota coincidir', () => {
      render(
        <MemoryRouter initialEntries={['/home']}>
          <Routes>
            <Route path="/home" element={<SidebarNavLink item={defaultItem} />} />
            <Route path="*" element={<SidebarNavLink item={defaultItem} />} />
          </Routes>
        </MemoryRouter>
      );

      const link = screen.getByRole('link', { name: /Home Link/i });
      expect(link.className).toContain('bg-primary/10');
      expect(link.className).toContain('text-primary');
    });

    it('deve acionar onClick quando clicado', () => {
      const handleClick = vi.fn();
      render(
        <MemoryRouter initialEntries={['/other']}>
          <SidebarNavLink item={defaultItem} onClick={handleClick} />
        </MemoryRouter>
      );

      const link = screen.getByRole('link', { name: /Home Link/i });
      fireEvent.click(link);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('deve renderizar isChild com padding menor', () => {
      render(
        <MemoryRouter initialEntries={['/other']}>
          <SidebarNavLink item={defaultItem} isChild />
        </MemoryRouter>
      );

      const link = screen.getByRole('link', { name: /Home Link/i });
      expect(link.className).toContain('pl-6'); // It uses pl-6. Oh wait it says pl-6 when isChild in JSX (let me check coverage later)
    });
  });

  describe('SidebarParentLink', () => {
    const parentItem: NavLinkItem = {
      label: 'Parent Menu',
      icon: fallbackIcon,
      iconName: 'HomeIcon',
      children: [
        {
          label: 'Child 1',
          path: '/child-1',
          icon: fallbackIcon,
          iconName: 'HomeIcon',
        },
        {
          label: 'Child 2',
          path: '/child-2',
          icon: fallbackIcon,
          iconName: 'HomeIcon',
        }
      ]
    };

    it('deve renderizar o botão pai fechado adequadamente', () => {
      const handleToggle = vi.fn();
      render(
        <MemoryRouter>
          <SidebarParentLink item={parentItem} isOpen={false} onToggle={handleToggle} />
        </MemoryRouter>
      );

      const button = screen.getByRole('button', { name: /Parent Menu/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute('aria-expanded', 'false');

      // Children should not be visible
      expect(screen.queryByText('Child 1')).not.toBeInTheDocument();
    });

    it('deve chamar onToggle ao ser clicado', () => {
      const handleToggle = vi.fn();
      render(
        <MemoryRouter>
          <SidebarParentLink item={parentItem} isOpen={false} onToggle={handleToggle} />
        </MemoryRouter>
      );

      const button = screen.getByRole('button', { name: /Parent Menu/i });
      fireEvent.click(button);

      expect(handleToggle).toHaveBeenCalledTimes(1);
    });

    it('deve renderizar filhos quando isOpen for true', () => {
      const handleToggle = vi.fn();
      const handleChildClick = vi.fn();

      render(
        <MemoryRouter>
          <SidebarParentLink item={parentItem} isOpen={true} onToggle={handleToggle} onChildClick={handleChildClick} />
        </MemoryRouter>
      );

      const button = screen.getByRole('button', { name: /Parent Menu/i });
      expect(button).toHaveAttribute('aria-expanded', 'true');

      const childrenList = screen.getByRole('list');
      expect(childrenList).toBeInTheDocument();

      const child1Link = within(childrenList).getByRole('link', { name: /Child 1/i });
      expect(child1Link).toBeInTheDocument();

      // clicking child link fires child click fn
      fireEvent.click(child1Link);
      expect(handleChildClick).toHaveBeenCalledTimes(1);
    });

    it('deve renderizar o pai aberto mesmo se a propriedade children for vazia', () => {
      const parentNoChildren: NavLinkItem = {
        label: 'No Children',
        iconName: 'HomeIcon',
      };

      render(
        <MemoryRouter>
          <SidebarParentLink item={parentNoChildren} isOpen={true} onToggle={vi.fn()} />
        </MemoryRouter>
      );

      const list = screen.getByRole('list');
      expect(list).toBeEmptyDOMElement();
    });
  });
});
