import type { ReactNode, ThHTMLAttributes, TdHTMLAttributes } from 'react';

interface TableRootProps {
  children: ReactNode;
  className?: string;
}

/** Composable table primitive — children-based API for maximum flexibility */
function TableRoot({ children, className = '' }: TableRootProps) {
  return (
    <div className="overflow-x-auto">
      <table className={`w-full text-sm text-left ${className}`.trim()}>{children}</table>
    </div>
  );
}

function TableHead({ children, className = '' }: TableRootProps) {
  return (
    <thead
      className={`text-xs text-text-secondary uppercase border-b border-border-color/50 ${className}`.trim()}
    >
      {children}
    </thead>
  );
}

function TableBody({ children, className = '' }: TableRootProps) {
  return (
    <tbody className={`divide-y divide-border-color/30 ${className}`.trim()}>{children}</tbody>
  );
}

function TableRow({ children, className = '' }: TableRootProps) {
  return (
    <tr className={`hover:bg-surface/60 transition-colors ${className}`.trim()}>{children}</tr>
  );
}

interface TableHeaderCellProps extends ThHTMLAttributes<HTMLTableCellElement> {
  children: ReactNode;
}

function TableHeaderCell({ children, className = '', ...rest }: TableHeaderCellProps) {
  return (
    <th className={`px-4 py-3 font-semibold ${className}`.trim()} {...rest}>
      {children}
    </th>
  );
}

interface TableCellProps extends TdHTMLAttributes<HTMLTableCellElement> {
  children: ReactNode;
}

function TableCell({ children, className = '', ...rest }: TableCellProps) {
  return (
    <td className={`px-4 py-3 ${className}`.trim()} {...rest}>
      {children}
    </td>
  );
}

export const Table = Object.assign(TableRoot, {
  Head: TableHead,
  Body: TableBody,
  Row: TableRow,
  Th: TableHeaderCell,
  Td: TableCell,
});
