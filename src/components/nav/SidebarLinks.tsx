import React from 'react';
import { NavLink } from 'react-router-dom';
import type { NavLinkItem } from '../../types';
import { ChevronDownIcon, ICON_MAP } from '../ui/icons';

/**
 * A reusable component for a standard navigation link in the sidebar.
 */
export const SidebarNavLink: React.FC<{
  item: NavLinkItem;
  isChild?: boolean;
  onClick?: () => void;
}> = ({ item, isChild = false, onClick }) => {
  const commonClasses = `flex items-center w-full rounded-lg font-medium transition-colors duration-200 group relative ${isChild ? 'py-2.5 text-xs' : 'py-3 text-sm'}`;
  const padding = isChild ? 'pl-6' : 'px-6';
  const activeClass = 'bg-primary/10 text-primary font-semibold';
  const inactiveClass = 'text-text-secondary hover:bg-primary/5 hover:text-text-primary';

  if (!item.path) return null;

  const iconName = item.iconName;
  const IconComponent = ICON_MAP[iconName] || (() => item.icon);

  return (
    <NavLink
      to={item.path}
      end={item.path === '/'}
      onClick={onClick}
      className={({ isActive }) =>
        `${commonClasses} ${padding} ${isActive ? activeClass : inactiveClass}`
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <div
              className={`absolute left-0 top-1/2 -translate-y-1/2 h-4 w-1 bg-primary rounded-r-full ${isChild ? 'left-2' : ''}`}
            ></div>
          )}
          <div
            className={`${isChild ? 'w-5 h-5' : 'w-6 h-6'} mr-4 transition-transform duration-300 group-hover:scale-110`}
          >
            <IconComponent />
          </div>
          <span>{item.label}</span>
        </>
      )}
    </NavLink>
  );
};

/**
 * A reusable component for a parent navigation link that expands to show child links.
 */
export const SidebarParentLink: React.FC<{
  item: NavLinkItem;
  onChildClick?: () => void;
  isOpen: boolean;
  onToggle: () => void;
}> = ({ item, onChildClick, isOpen, onToggle }) => {
  const commonClasses =
    'flex items-center w-full px-6 py-3 rounded-lg font-medium transition-colors duration-200 group relative';
  const parentClass = 'text-text-secondary hover:bg-primary/5 hover:text-text-primary';

  const iconName = item.iconName;
  const IconComponent = ICON_MAP[iconName] || (() => item.icon);
  const buttonContent = (
    <>
      <div className="w-6 h-6 mr-4 transition-transform duration-300 group-hover:scale-110">
        <IconComponent />
      </div>
      <span className="text-sm flex-1 text-left">{item.label}</span>
      <ChevronDownIcon
        className={`w-5 h-5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
      />
    </>
  );

  return (
    <>
      {isOpen ? (
        <button
          type="button"
          onClick={onToggle}
          className={`${commonClasses} ${parentClass}`}
          aria-expanded="true"
        >
          {buttonContent}
        </button>
      ) : (
        <button
          type="button"
          onClick={onToggle}
          className={`${commonClasses} ${parentClass}`}
          aria-expanded="false"
        >
          {buttonContent}
        </button>
      )}
      {isOpen && (
        <ul className="pl-10 pr-2 py-1 space-y-1.5">
          {item.children?.map((child) => (
            <li key={child.path || child.label}>
              <SidebarNavLink item={child} isChild={true} onClick={onChildClick} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
};
