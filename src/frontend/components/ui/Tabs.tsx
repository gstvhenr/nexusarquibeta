import {
  createContext,
  useContext,
  useId,
  useMemo,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from 'react';

interface TabsProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** Currently selected tab value */
  value: string;
  /** Callback fired when the selected value changes */
  onValueChange: (value: string) => void;
  children: ReactNode;
}

interface TabsContextValue {
  value: string;
  onValueChange: (value: string) => void;
  baseId: string;
}

interface TabListProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

type TabClassName = string | ((state: { active: boolean }) => string);

interface TabProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type' | 'className'> {
  value: string;
  children: ReactNode;
  className?: TabClassName;
}

interface TabPanelProps extends HTMLAttributes<HTMLDivElement> {
  value: string;
  children: ReactNode;
  /** Unmount inactive content to match legacy conditional rendering behavior */
  unmountOnExit?: boolean;
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext(componentName: 'Tab' | 'TabPanel') {
  const context = useContext(TabsContext);

  if (!context) {
    throw new Error(`${componentName} must be used inside <Tabs>.`);
  }

  return context;
}

function normalizeTabValue(value: string): string {
  return value.replace(/[^a-zA-Z0-9_-]/g, '-');
}

function resolveTabClassName(className: TabClassName | undefined, active: boolean): string {
  if (!className) {
    return '';
  }

  if (typeof className === 'function') {
    return className({ active });
  }

  return className;
}

function handleTabListKeyboardNavigation(event: KeyboardEvent<HTMLDivElement>) {
  if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
    return;
  }

  const tabs = Array.from(
    event.currentTarget.querySelectorAll<HTMLButtonElement>('button[role="tab"]'),
  ).filter((tab) => !tab.disabled);

  if (tabs.length === 0) {
    return;
  }

  const currentIndex = tabs.indexOf(document.activeElement as HTMLButtonElement);
  if (currentIndex < 0) {
    return;
  }

  event.preventDefault();

  if (event.key === 'Home') {
    tabs[0]?.focus();
    tabs[0]?.click();
    return;
  }

  if (event.key === 'End') {
    tabs[tabs.length - 1]?.focus();
    tabs[tabs.length - 1]?.click();
    return;
  }

  const step = event.key === 'ArrowRight' ? 1 : -1;
  const nextIndex = (currentIndex + step + tabs.length) % tabs.length;
  tabs[nextIndex]?.focus();
  tabs[nextIndex]?.click();
}

/** Compound Tabs root — controlled value + context wiring for Tab/TabPanel */
export function Tabs({ value, onValueChange, children, className = '', ...rest }: TabsProps) {
  const baseId = useId();

  const contextValue = useMemo(
    () => ({
      value,
      onValueChange,
      baseId,
    }),
    [value, onValueChange, baseId],
  );

  return (
    <TabsContext.Provider value={contextValue}>
      <div className={className} {...rest}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

/** TabList wrapper — adds WAI-ARIA role and keyboard navigation */
export function TabList({ children, onKeyDown, className = '', ...rest }: TabListProps) {
  return (
    <div
      role="tablist"
      tabIndex={0}
      className={className}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (event.defaultPrevented) {
          return;
        }
        handleTabListKeyboardNavigation(event);
      }}
      {...rest}
    >
      {children}
    </div>
  );
}

/** Single tab trigger — selects a value within Tabs context */
export function Tab({ value, children, className, onClick, disabled, ...rest }: TabProps) {
  const tabsContext = useTabsContext('Tab');
  const active = tabsContext.value === value;
  const normalizedValue = normalizeTabValue(value);
  const tabId = `${tabsContext.baseId}-tab-${normalizedValue}`;
  const panelId = `${tabsContext.baseId}-panel-${normalizedValue}`;
  const resolvedClassName = resolveTabClassName(className, active);

  return (
    <button
      {...rest}
      type="button"
      role="tab"
      id={tabId}
      aria-controls={panelId}
      aria-selected={active}
      tabIndex={active ? 0 : -1}
      disabled={disabled}
      className={resolvedClassName}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented || disabled) {
          return;
        }
        tabsContext.onValueChange(value);
      }}
    >
      {children}
    </button>
  );
}

/** Tab content container — renders only when selected (default) */
export function TabPanel({
  value,
  children,
  className = '',
  unmountOnExit = true,
  ...rest
}: TabPanelProps) {
  const tabsContext = useTabsContext('TabPanel');
  const active = tabsContext.value === value;
  const normalizedValue = normalizeTabValue(value);
  const tabId = `${tabsContext.baseId}-tab-${normalizedValue}`;
  const panelId = `${tabsContext.baseId}-panel-${normalizedValue}`;

  if (!active && unmountOnExit) {
    return null;
  }

  return (
    <div
      role="tabpanel"
      id={panelId}
      aria-labelledby={tabId}
      hidden={!active}
      className={className}
      {...rest}
    >
      {children}
    </div>
  );
}
