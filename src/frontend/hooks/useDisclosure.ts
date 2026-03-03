import { useCallback, useState } from 'react';

interface UseDisclosureReturn {
  /** Whether the disclosure is currently open */
  isOpen: boolean;
  /** Set disclosure to open */
  open: () => void;
  /** Set disclosure to closed */
  close: () => void;
  /** Toggle disclosure between open and closed */
  toggle: () => void;
}

/** Generic open/close/toggle state — (initialState?) -> { isOpen, open, close, toggle } */
export function useDisclosure(initialState = false): UseDisclosureReturn {
  const [isOpen, setIsOpen] = useState(initialState);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  return { isOpen, open, close, toggle };
}
