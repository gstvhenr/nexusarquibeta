import React from 'react';
import { useLocation } from 'react-router-dom';
import { NAV_LINKS } from '../../constants';
import { MenuIcon } from '../ui/icons';

interface HeaderProps {
  onMenuClick: () => void;
}

const findPageLabel = (links: typeof NAV_LINKS, path: string): string | null => {
  for (const link of links) {
    if (link.path === path) {
      return link.label;
    }
    if (link.children) {
      const childLabel = findPageLabel(link.children, path);
      if (childLabel) return childLabel;
    }
  }
  return null;
};

const Header: (props: HeaderProps) => React.ReactNode = ({ onMenuClick }) => {
  const location = useLocation();

  const pageTitle = findPageLabel(NAV_LINKS, location.pathname) || 'Home';

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b bg-surface/80 backdrop-blur-sm px-4 md:hidden">
      <button
        type="button"
        onClick={onMenuClick}
        className="p-2 text-text-primary rounded-md hover:bg-background"
        aria-label="Abrir menu"
      >
        <MenuIcon className="h-6 w-6" />
      </button>
      <h1 className="text-lg font-semibold text-text-primary flex-1 truncate">{pageTitle}</h1>
    </header>
  );
};

export default Header;
