import { describe, expect, it } from 'vitest';
import type { Reminder } from '@/types';
import { archiveReminder, isArchivedReminder, reactivateReminder } from './reminderUtils';

describe('reminderUtils archival contracts', () => {
  it('archives completed reminders for history view', () => {
    const reminder: Reminder = {
      id: 'rem-1',
      title: 'Lembrete concluido',
      comment: 'Detalhes',
      remindAt: '2026-04-11T09:00',
      color: 'yellow',
      createdAt: '2026-04-11T08:00:00.000Z',
      pinned: false,
      archived: false,
      completedAt: null,
    };

    const archived = archiveReminder(reminder, '2026-04-11T10:00:00.000Z');

    expect(archived.archived).toBe(true);
    expect(archived.completedAt).toBe('2026-04-11T10:00:00.000Z');
    expect(isArchivedReminder(archived)).toBe(true);
  });

  it('reactivates archived reminders back into the active board', () => {
    const reminder: Reminder = {
      id: 'rem-2',
      title: 'Lembrete arquivado',
      comment: 'Historico',
      remindAt: '2026-04-11T09:00',
      color: 'green',
      createdAt: '2026-04-11T08:00:00.000Z',
      pinned: false,
      archived: true,
      completedAt: '2026-04-11T10:00:00.000Z',
    };

    expect(reactivateReminder(reminder)).toEqual({
      ...reminder,
      archived: false,
      completedAt: null,
    });
  });
});
