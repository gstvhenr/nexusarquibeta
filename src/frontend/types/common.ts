export type NavIconName = `${string}Icon` | `${string}IconNew`;

// --- Common & Navigation ---
export interface NavLinkItem {
  path?: string;
  label: string;
  icon: JSX.Element;
  className?: string;
  iconName: NavIconName;
  children?: NavLinkItem[];
}
