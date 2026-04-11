import React from 'react';
import { NAV_LINKS, SETTINGS_LINK } from '../../constants';
import { XIcon, LogoIcon } from '../ui/icons';
import { IconButton } from '../ui';
import { useNavigation } from '../../hooks';
import { SidebarNavLink, SidebarParentLink } from '../nav';

interface SidebarProps {
  isOpen: boolean;
  setOpen: (isOpen: boolean) => void;
}

const Sidebar: (props: SidebarProps) => React.ReactNode = ({ isOpen, setOpen }) => {
  const { openParent, toggleParent } = useNavigation();
  const closeSidebar = () => setOpen(false);

  return (
    <>
      {/* Overlay for mobile view */}
      <div
        className={`fixed inset-0 bg-black/60 z-30 md:hidden transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={closeSidebar}
        aria-hidden="true"
      />

      {/* Sidebar Navigation */}
      <aside
        className={`
        fixed inset-y-0 left-0 z-40
        w-64 lg:w-80 bg-surface dark:bg-black text-text-primary flex flex-col shadow-2xl
        transform transition-transform duration-300 ease-in-out
        md:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
      >
        <div className="flex items-center justify-between gap-4 px-6 pt-8 pb-5">
          <div className="flex items-center gap-4 min-w-0">
            <LogoIcon className="w-12 h-12 text-primary shrink-0" />
            <div className="min-w-0">
              <h1 className="font-serif text-3xl font-bold tracking-tight text-text-primary leading-none truncate">
                NexusArqui
              </h1>
              <p className="text-xs font-medium tracking-wide text-text-secondary normal-case mt-1 truncate">
                Rafael Munaro Arquitetura
              </p>
            </div>
          </div>
          <IconButton
            onClick={closeSidebar}
            aria-label="Fechar menu"
            className="-mr-2 shrink-0 md:hidden"
          >
            <XIcon className="w-6 h-6" />
          </IconButton>
        </div>

        <div className="px-6">
          <hr className="border-t border-border-color/50" />
        </div>

        <nav className="flex-1 px-4 overflow-y-auto pt-5 pb-6 no-scrollbar">
          <ul className="space-y-1">
            {NAV_LINKS.map((item) => (
              <li key={item.label}>
                {item.children ? (
                  <SidebarParentLink
                    item={item}
                    onChildClick={closeSidebar}
                    isOpen={openParent === item.label}
                    onToggle={() => toggleParent(item.label)}
                  />
                ) : (
                  item.path && <SidebarNavLink item={item} onClick={closeSidebar} />
                )}
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-auto p-6">
          <div className="pt-4 border-t border-border-color">
            <nav className="px-0">
              <ul className="mb-4">
                <li>
                  <SidebarNavLink item={SETTINGS_LINK} onClick={closeSidebar} />
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
