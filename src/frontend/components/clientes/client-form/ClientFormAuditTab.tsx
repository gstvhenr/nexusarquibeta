import { formatDateWithTime } from '../../../utils/formatters';
import type { ClientFormAuditTabProps } from './types';

export const ClientFormAuditTab = ({ auditLog }: ClientFormAuditTabProps) => (
  <div className="space-y-2 text-sm">
    {(auditLog || [])
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .map((log) => (
        <div
          key={`${log.timestamp}-${log.field}-${JSON.stringify(log.newValue)}`}
          className="bg-background p-3 rounded-lg"
        >
          <p>
            <strong className="text-secondary">{log.field}</strong> alterado de{' '}
            <span className="italic text-text-secondary">"{JSON.stringify(log.oldValue)}"</span>{' '}
            para <span className="italic text-text-primary">"{JSON.stringify(log.newValue)}"</span>
          </p>
          <p className="text-xs text-text-secondary mt-1">{formatDateWithTime(log.timestamp)}</p>
        </div>
      ))}
  </div>
);
