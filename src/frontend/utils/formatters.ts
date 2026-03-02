export const formatCurrency = (value: number | undefined | null) => {
  if (value === undefined || value === null)
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(0);
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

export const parseDateString = (dateStr: string | null | undefined): Date | null => {
  if (!dateStr) return null;
  const trimmedDate = dateStr.trim();

  // DD/MM/YYYY
  const brDateMatch = trimmedDate.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (brDateMatch) {
    const day = Number(brDateMatch[1]);
    const month = Number(brDateMatch[2]) - 1;
    const year = Number(brDateMatch[3]);
    const parsed = new Date(year, month, day);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  // YYYY-MM-DD (force local midnight to avoid UTC shift)
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmedDate)) {
    const parsed = new Date(`${trimmedDate}T00:00:00`);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  // Full ISO / datetime fallback
  const parsed = new Date(trimmedDate);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

export const formatDate = (isoDate: string | null | undefined) => {
  if (!isoDate) return 'N/D';
  const date = parseDateString(isoDate);
  if (!date || isNaN(date.getTime())) return 'N/D';
  return date.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
};

export const formatDateWithTime = (isoDate: string | null | undefined) => {
  if (!isoDate) return 'N/D';
  const date = new Date(isoDate);
  if (isNaN(date.getTime())) return 'N/D';
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatDateDayMonth = (isoDate: string | null | undefined) => {
  if (!isoDate) return 'N/D';
  const date = parseDateString(isoDate);
  if (!date || isNaN(date.getTime())) return 'N/D';
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', timeZone: 'UTC' });
};

export const formatBytes = (bytes: number, decimals = 2): string => {
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

export const formatPhone = (phone: string): string => {
  if (!phone) return '';
  return phone
    .replace(/\D/g, '')
    .replace(/^(\d{2})(\d)/g, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .substring(0, 15);
};

export const formatCpfCnpj = (value: string): string => {
  if (!value) return '';
  const digitsOnly = value.replace(/\D/g, '');
  if (digitsOnly.length <= 11) {
    // CPF
    return digitsOnly
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .substring(0, 14);
  } else {
    // CNPJ
    return digitsOnly
      .replace(/(\d{2})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1/$2')
      .replace(/(\d{4})(\d{1,2})/, '$1-$2')
      .substring(0, 18);
  }
};

export const formatCEP = (cep: string): string => {
  if (!cep) return '';
  return cep
    .replace(/\D/g, '') // Remove all non-digit characters
    .replace(/^(\d{5})(\d)/, '$1-$2') // Add hyphen after the first 5 digits
    .substring(0, 9); // Ensure the length does not exceed 9 characters (XXXXX-XXX)
};

export const getDeadlineInfo = (
  deadline: string | null | undefined,
  isCompleted?: boolean,
): {
  text: string;
  className: string;
  diffDays: number;
  status: 'overdue' | 'soon' | 'ok' | 'none';
} => {
  if (!deadline)
    return {
      text: 'Sem prazo',
      className: 'text-text-secondary',
      diffDays: Infinity,
      status: 'none',
    };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const deadlineDate = parseDateString(deadline);
  if (!deadlineDate)
    return { text: 'Data inválida', className: 'text-error', diffDays: Infinity, status: 'none' };

  const diffTime = deadlineDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (isCompleted) {
    return {
      text: formatDateDayMonth(deadline),
      className: 'text-text-secondary',
      diffDays,
      status: 'ok',
    };
  }

  if (diffDays < 0)
    return {
      text: `Atrasado há ${Math.abs(diffDays)} dias`,
      className: 'text-error font-bold',
      diffDays,
      status: 'overdue',
    };
  if (diffDays === 0)
    return { text: `Entrega hoje!`, className: 'text-warning font-bold', diffDays, status: 'soon' };
  if (diffDays <= 7)
    return {
      text: `Em ${diffDays} dias`,
      className: 'text-amber-500 font-semibold',
      diffDays,
      status: 'soon',
    };
  return {
    text: formatDateDayMonth(deadline),
    className: 'text-text-primary',
    diffDays,
    status: 'ok',
  };
};

/** Format Y-axis ticks for financial charts (e.g. 5000 → "R$5k"). */
export const formatYAxisTick = (tick: number | string): string => {
  if (typeof tick !== 'number') return String(tick);
  if (tick >= 1000) return `R$${(tick / 1000).toFixed(0)}k`;
  return `R$${tick}`;
};
