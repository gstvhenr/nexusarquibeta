import type { ReactElement } from 'react';
import type { IconName } from '../components/ui/icons';

// --- Common & Navigation ---
export interface NavLinkItem {
  path?: string;
  label: string;
  icon: ReactElement<{ className?: string }>;
  className?: string;
  iconName: IconName;
  children?: NavLinkItem[];
}
