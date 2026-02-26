export interface SkeletonProps {
  width?: string;
  height?: string;
  variant?: 'text' | 'circle' | 'rect';
  className?: string;
}

const VARIANT_STYLES: Record<Required<SkeletonProps>['variant'], string> = {
  text: 'rounded-md',
  circle: 'rounded-full',
  rect: 'rounded-lg',
};

/** Loading skeleton placeholder — variant -> animated pulse block */
export function Skeleton({ width, height, variant = 'text', className = '' }: SkeletonProps) {
  return (
    <div
      className={`bg-border-color/30 animate-pulse ${VARIANT_STYLES[variant]} ${className}`.trim()}
      style={{ width, height }}
      role="status"
      aria-label="Carregando..."
    />
  );
}
