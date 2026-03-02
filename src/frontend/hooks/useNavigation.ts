import { useState, useMemo, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { NAV_LINKS } from '../constants';
import type { NavLinkItem } from '../types';

/**
 * Custom hook to manage the state and logic of the main sidebar navigation.
 * It determines which parent link should be open based on the current route
 * and provides a handler to toggle parent links.
 */
export const useNavigation = () => {
  const location = useLocation();

  // Determine the active parent label based on the current path
  const activeParentLabel = useMemo(() => {
    const activeParent = NAV_LINKS.find((item: NavLinkItem) =>
      item.children?.some((child) => child.path && location.pathname.startsWith(child.path)),
    );
    return activeParent ? activeParent.label : null;
  }, [location.pathname]);

  const [openParent, setOpenParent] = useState<string | null>(activeParentLabel);

  // Effect to update the open parent when the route changes
  useEffect(() => {
    setOpenParent(activeParentLabel);
  }, [activeParentLabel]);

  // Stable callback to toggle a parent link's state
  const toggleParent = useCallback((label: string) => {
    setOpenParent((prev) => (prev === label ? null : label));
  }, []);

  return { openParent, toggleParent };
};
