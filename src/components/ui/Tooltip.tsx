import { useState, type ReactNode } from 'react';

export interface TooltipProps {
  content: string;
  children: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

const POSITION_STYLES: Record<Required<TooltipProps>['position'], string> = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  right: 'left-full top-1/2 -translate-y-1/2 ml-2',
};

/**
 * Tooltip primitive — hover to show content string positioned around children.
 * Known limitation: keyboard-only (focus) not yet supported.
 */
export function Tooltip({ content, children, position = 'top' }: TooltipProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div
          role="tooltip"
          className={`absolute z-50 px-2.5 py-1.5 text-xs font-medium
            text-primary-content bg-text-primary rounded-md shadow-lifted
            whitespace-nowrap pointer-events-none
            animate-fade-in-up
            ${POSITION_STYLES[position]}`.trim()}
        >
          {content}
        </div>
      )}
    </div>
  );
}
