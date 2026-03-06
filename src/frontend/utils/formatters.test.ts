import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  formatBytes,
  formatCEP,
  formatCpfCnpj,
  formatCurrency,
  formatDate,
  formatDateDayMonth,
  formatDateWithTime,
  formatPhone,
  formatYAxisTick,
  getDeadlineInfo,
  parseDateString,
} from './formatters';

// ---------------------------------------------------------------------------
// parseDateString
// ---------------------------------------------------------------------------

describe('parseDateString', () => {
  it('parses DD/MM/YYYY format', () => {
    // Given
    const input = '15/01/2026';

    // When
    const date = parseDateString(input);

    // Then
    expect(date).not.toBeNull();
    expect(date?.getFullYear()).toBe(2026);
    expect(date?.getMonth()).toBe(0);
    expect(date?.getDate()).toBe(15);
  });

  it('parses YYYY-MM-DD format at local midnight', () => {
    // Given
    const input = '2026-02-12';

    // When
    const date = parseDateString(input);

    // Then
    expect(date).not.toBeNull();
    expect(date?.getFullYear()).toBe(2026);
    expect(date?.getMonth()).toBe(1);
    expect(date?.getDate()).toBe(12);
  });

  it('parses full ISO datetime string', () => {
    // Given
    const input = '2026-06-15T14:30:00.000Z';

    // When
    const date = parseDateString(input);

    // Then
    expect(date).not.toBeNull();
    expect(date?.getFullYear()).toBe(2026);
  });

  it('returns null for undefined', () => {
    expect(parseDateString(undefined)).toBeNull();
  });

  it('returns null for null', () => {
    expect(parseDateString(null)).toBeNull();
  });

  it('returns null for empty string', () => {
    expect(parseDateString('')).toBeNull();
  });

  it('returns null for non-date string', () => {
    expect(parseDateString('not-a-date')).toBeNull();
  });

  it('trims whitespace before parsing', () => {
    // Given
    const input = '  2026-03-10  ';

    // When
    const date = parseDateString(input);

    // Then
    expect(date).not.toBeNull();
    expect(date?.getMonth()).toBe(2); // March
  });
});

// ---------------------------------------------------------------------------
// getDeadlineInfo
// ---------------------------------------------------------------------------

describe('getDeadlineInfo', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-05T12:00:00'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ── status: none ──

  it('returns none status for undefined deadline', () => {
    // Given / When
    const result = getDeadlineInfo(undefined);

    // Then
    expect(result.status).toBe('none');
    expect(result.text).toBe('Sem prazo');
    expect(result.diffDays).toBe(Infinity);
  });

  it('returns none status for null deadline', () => {
    // Given / When
    const result = getDeadlineInfo(null);

    // Then
    expect(result.status).toBe('none');
    expect(result.text).toBe('Sem prazo');
  });

  it('returns none status for invalid date string', () => {
    // Given / When
    const result = getDeadlineInfo('invalid-date-string');

    // Then
    expect(result.status).toBe('none');
    expect(result.text).toBe('Data inválida');
  });

  // ── status: overdue ──

  it('returns overdue status for past deadline', () => {
    // Given — deadline was 3 days ago (March 2)
    const result = getDeadlineInfo('2026-03-02');

    // Then
    expect(result.status).toBe('overdue');
    expect(result.text).toContain('Atrasado');
    expect(result.text).toContain('3 dias');
    expect(result.diffDays).toBe(-3);
    expect(result.className).toContain('text-error');
  });

  // ── status: soon (today) ──

  it('returns soon status for deadline today', () => {
    // Given — deadline is today (March 5)
    const result = getDeadlineInfo('2026-03-05');

    // Then
    expect(result.status).toBe('soon');
    expect(result.text).toBe('Entrega hoje!');
    expect(result.diffDays).toBe(0);
    expect(result.className).toContain('text-warning');
  });

  // ── status: soon (within 7 days) ──

  it('returns soon status for deadline within 7 days', () => {
    // Given — deadline in 3 days (March 8)
    const result = getDeadlineInfo('2026-03-08');

    // Then
    expect(result.status).toBe('soon');
    expect(result.text).toBe('Em 3 dias');
    expect(result.diffDays).toBe(3);
    expect(result.className).toContain('amber');
  });

  it('returns soon for deadline exactly 7 days away', () => {
    // Given — March 12 = 7 days from March 5
    const result = getDeadlineInfo('2026-03-12');

    // Then
    expect(result.status).toBe('soon');
    expect(result.text).toBe('Em 7 dias');
  });

  // ── status: ok ──

  it('returns ok status for deadline more than 7 days away', () => {
    // Given — March 20 = 15 days
    const result = getDeadlineInfo('2026-03-20');

    // Then
    expect(result.status).toBe('ok');
    expect(result.diffDays).toBe(15);
    expect(result.className).toContain('text-text-primary');
  });

  // ── isCompleted overrides ──

  it('returns ok status with formatted date when isCompleted is true, even for past deadline', () => {
    // Given — deadline was 3 days ago but project is completed
    const result = getDeadlineInfo('2026-03-02', true);

    // Then
    expect(result.status).toBe('ok');
    expect(result.className).toContain('text-text-secondary');
    expect(result.diffDays).toBe(-3);
  });
});

// ---------------------------------------------------------------------------
// formatCurrency
// ---------------------------------------------------------------------------

describe('formatCurrency', () => {
  it('formats positive number as BRL', () => {
    const result = formatCurrency(1234.56);
    expect(result).toContain('1.234,56');
  });

  it('formats zero as BRL', () => {
    const result = formatCurrency(0);
    expect(result).toContain('0,00');
  });

  it('returns R$ 0,00 for null', () => {
    const result = formatCurrency(null);
    expect(result).toContain('0,00');
  });

  it('returns R$ 0,00 for undefined', () => {
    const result = formatCurrency(undefined);
    expect(result).toContain('0,00');
  });

  it('formats negative number correctly', () => {
    const result = formatCurrency(-500);
    expect(result).toContain('500,00');
  });
});

// ---------------------------------------------------------------------------
// formatDate
// ---------------------------------------------------------------------------

describe('formatDate', () => {
  it('formats ISO date string', () => {
    const result = formatDate('2026-01-15');
    expect(result).toBe('15/01/2026');
  });

  it('returns N/D for null', () => {
    expect(formatDate(null)).toBe('N/D');
  });

  it('returns N/D for undefined', () => {
    expect(formatDate(undefined)).toBe('N/D');
  });

  it('returns N/D for empty string', () => {
    expect(formatDate('')).toBe('N/D');
  });
});

// ---------------------------------------------------------------------------
// formatDateWithTime
// ---------------------------------------------------------------------------

describe('formatDateWithTime', () => {
  it('returns N/D for null', () => {
    expect(formatDateWithTime(null)).toBe('N/D');
  });

  it('returns N/D for invalid date', () => {
    expect(formatDateWithTime('not-a-date')).toBe('N/D');
  });

  it('formats valid ISO datetime with time', () => {
    const result = formatDateWithTime('2026-06-15T14:30:00Z');
    expect(result).toBeTruthy();
    expect(result).not.toBe('N/D');
  });
});

// ---------------------------------------------------------------------------
// formatDateDayMonth
// ---------------------------------------------------------------------------

describe('formatDateDayMonth', () => {
  it('returns N/D for null', () => {
    expect(formatDateDayMonth(null)).toBe('N/D');
  });

  it('returns N/D for undefined', () => {
    expect(formatDateDayMonth(undefined)).toBe('N/D');
  });

  it('formats valid date to day + short month', () => {
    const result = formatDateDayMonth('2026-01-15');
    expect(result).toContain('15');
  });
});

// ---------------------------------------------------------------------------
// formatBytes
// ---------------------------------------------------------------------------

describe('formatBytes', () => {
  it('returns 0 Bytes for zero', () => {
    expect(formatBytes(0)).toBe('0 Bytes');
  });

  it('formats bytes below 1024', () => {
    expect(formatBytes(512)).toBe('512 Bytes');
  });

  it('formats kilobytes', () => {
    expect(formatBytes(1024)).toBe('1 KB');
  });

  it('formats megabytes', () => {
    expect(formatBytes(1048576)).toBe('1 MB');
  });

  it('respects decimal parameter', () => {
    expect(formatBytes(1536, 1)).toBe('1.5 KB');
  });
});

// ---------------------------------------------------------------------------
// formatPhone
// ---------------------------------------------------------------------------

describe('formatPhone', () => {
  it('formats 11-digit phone number', () => {
    expect(formatPhone('11988887777')).toBe('(11) 98888-7777');
  });

  it('returns empty for empty string', () => {
    expect(formatPhone('')).toBe('');
  });
});

// ---------------------------------------------------------------------------
// formatCpfCnpj
// ---------------------------------------------------------------------------

describe('formatCpfCnpj', () => {
  it('formats CPF (11 digits)', () => {
    const result = formatCpfCnpj('12345678901');
    expect(result).toBe('123.456.789-01');
  });

  it('formats CNPJ (14 digits)', () => {
    const result = formatCpfCnpj('12345678000195');
    expect(result).toBe('12.345.678/0001-95');
  });

  it('returns empty for empty string', () => {
    expect(formatCpfCnpj('')).toBe('');
  });
});

// ---------------------------------------------------------------------------
// formatCEP
// ---------------------------------------------------------------------------

describe('formatCEP', () => {
  it('formats 8-digit CEP', () => {
    expect(formatCEP('13070178')).toBe('13070-178');
  });

  it('returns empty for empty string', () => {
    expect(formatCEP('')).toBe('');
  });
});

// ---------------------------------------------------------------------------
// formatYAxisTick
// ---------------------------------------------------------------------------

describe('formatYAxisTick', () => {
  it('formats thousands with k suffix', () => {
    expect(formatYAxisTick(5000)).toBe('R$5k');
  });

  it('formats small numbers without k', () => {
    expect(formatYAxisTick(500)).toBe('R$500');
  });

  it('returns string input as-is', () => {
    expect(formatYAxisTick('label')).toBe('label');
  });
});
