import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ClientFormAuditTab } from './ClientFormAuditTab';

vi.mock('@/utils/formatters', () => ({
  formatDateWithTime: vi.fn((date) => `Formatted: ${date}`),
}));

describe('ClientFormAuditTab', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const mockAuditLog = [
    {
      timestamp: '2026-03-04T10:00:00.000Z',
      field: 'name',
      oldValue: 'Old Name',
      newValue: 'New Name',
    },
    {
      timestamp: '2026-03-05T12:00:00.000Z', // Later date (should appear first)
      field: 'address',
      oldValue: 'Rua A',
      newValue: 'Rua B',
    },
  ];

  it('should render nothing if auditLog is empty or undefined', () => {
    const { container } = render(<ClientFormAuditTab auditLog={undefined} />);
    expect(container.firstChild).toBeEmptyDOMElement();

    const { container: container2 } = render(<ClientFormAuditTab auditLog={[]} />);
    expect(container2.firstChild).toBeEmptyDOMElement();
  });

  it('should sort and render audit logs in descending order by timestamp', () => {
    render(<ClientFormAuditTab auditLog={mockAuditLog} />);

    // Query the strong tags which contain the field names
    const fields = screen.getAllByText(/address|name/);
    expect(fields.length).toBe(2);

    // Address change is more recent, should appear first
    expect(fields[0]).toHaveTextContent('address');
    expect(fields[1]).toHaveTextContent('name');
  });

  it('should format dates using formatDateWithTime', () => {
    render(<ClientFormAuditTab auditLog={mockAuditLog} />);

    expect(screen.getByText('Formatted: 2026-03-04T10:00:00.000Z')).toBeInTheDocument();
    expect(screen.getByText('Formatted: 2026-03-05T12:00:00.000Z')).toBeInTheDocument();
  });
});
