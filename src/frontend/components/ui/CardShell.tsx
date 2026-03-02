interface CardShellProps {
  children: React.ReactNode;
  className?: string;
  glow?: 'success' | 'warning' | 'error' | 'primary' | 'none';
}

const GLOW_RING: Record<Required<CardShellProps>['glow'], string> = {
  success: 'hover:ring-success/20',
  warning: 'hover:ring-warning/20',
  error: 'hover:ring-error/20',
  primary: 'hover:ring-primary/20',
  none: 'hover:ring-border-color/20',
};

export function CardShell({ children, className = '', glow = 'none' }: CardShellProps) {
  return (
    <div
      className={`bg-surface/80 backdrop-blur-sm rounded-2xl border border-border-color/40 shadow-soft
        hover:shadow-lifted hover:ring-1 ${GLOW_RING[glow]}
        transition-all duration-300 ease-out ${className}`}
    >
      {children}
    </div>
  );
}
