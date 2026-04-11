import type { Reminder } from '@/types';

export const isArchivedReminder = (reminder: Reminder): boolean =>
  Boolean(reminder.archived || reminder.completedAt);

export const archiveReminder = (
  reminder: Reminder,
  completedAt = new Date().toISOString(),
): Reminder => ({
  ...reminder,
  archived: true,
  completedAt: reminder.completedAt ?? completedAt,
});

export const reactivateReminder = (reminder: Reminder): Reminder => ({
  ...reminder,
  archived: false,
  completedAt: null,
});
