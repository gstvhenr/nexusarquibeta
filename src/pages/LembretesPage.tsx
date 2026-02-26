import React, { useState, useMemo, useCallback } from 'react';
import { useSystemData } from '../context/DataContext';
import { PageHeader } from '../components/layout';
import {
  CalendarIcon,
  ClockIcon,
  LinkIcon,
  PinIcon,
  POST_IT_COLORS,
  REMINDER_ROTATIONS,
  ReminderEmptyState,
  ReminderFormModal,
  getReminderColorStyle,
} from '../components/agenda';
import { NAV_LINKS } from '../constants';
import {
  DeleteConfirmationModal,
  PlusIcon,
  TrashIcon,
  CheckCircleIcon,
  ArchiveIcon,
} from '../components/ui';
import type { Reminder } from '../types';

// ─── MAIN PAGE ───────────────────────────────────────────────
const LembretesPage: () => React.ReactNode = () => {
  const { reminders, setReminders } = useSystemData();

  const [isFormOpen, setFormOpen] = useState(false);
  const [isDeleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<Reminder | null>(null);
  const [toDelete, setToDelete] = useState<Reminder | null>(null);
  const [rescheduleMode, setRescheduleMode] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);

  // Active = not completed
  const activeReminders = useMemo(() => reminders.filter((r) => !r.completedAt), [reminders]);

  const completedReminders = useMemo(
    () =>
      reminders
        .filter((r) => !!r.completedAt)
        .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime()),
    [reminders],
  );

  // Sort: pinned first, then by remindAt ascending
  const sorted = useMemo(
    () =>
      [...activeReminders].sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return (
          new Date(a.remindAt || a.createdAt).getTime() -
          new Date(b.remindAt || b.createdAt).getTime()
        );
      }),
    [activeReminders],
  );

  const openAdd = () => {
    setSelected(null);
    setRescheduleMode(false);
    setFormOpen(true);
  };
  const openEdit = (r: Reminder) => {
    setSelected(r);
    setRescheduleMode(false);
    setFormOpen(true);
  };
  const openReschedule = (r: Reminder) => {
    setSelected(r);
    setRescheduleMode(true);
    setFormOpen(true);
  };
  const confirmDelete = (r: Reminder) => {
    setToDelete(r);
    setDeleteOpen(true);
  };

  const handleSave = useCallback(
    (r: Reminder) => {
      setReminders((prev) => {
        const exists = prev.find((x) => x.id === r.id);
        return exists ? prev.map((x) => (x.id === r.id ? r : x)) : [...prev, r];
      });
    },
    [setReminders],
  );

  const handleDelete = () => {
    if (!toDelete) return;
    setReminders((prev) => prev.filter((x) => x.id !== toDelete.id));
    setDeleteOpen(false);
    setToDelete(null);
  };

  const togglePin = useCallback(
    (id: string) => {
      setReminders((prev) => prev.map((r) => (r.id === id ? { ...r, pinned: !r.pinned } : r)));
    },
    [setReminders],
  );

  const markComplete = useCallback(
    (id: string) => {
      setReminders((prev) =>
        prev.map((r) => (r.id === id ? { ...r, completedAt: new Date().toISOString() } : r)),
      );
    },
    [setReminders],
  );

  const pageIcon = NAV_LINKS.find((l) => l.label === 'Agenda')?.children?.find(
    (c) => c.label === 'Lembretes',
  )?.icon;

  const formatDateTime = (iso: string) => {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isPast = (iso: string) => {
    if (!iso) return false;
    return new Date(iso) < new Date();
  };

  return (
    <div className="animate-fade-in-up h-full flex flex-col px-2 pt-2 md:px-4 md:pt-4 lg:px-6 lg:pt-6">
      <PageHeader title="Lembretes" icon={pageIcon}>
        <div className="flex items-center gap-3">
          {completedReminders.length > 0 && (
            <button
              onClick={() => setShowCompleted((v) => !v)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-colors flex items-center gap-2 ${
                showCompleted
                  ? 'bg-emerald-500/10 text-emerald-600 border-emerald-300 dark:border-emerald-600'
                  : 'bg-surface text-text-secondary border-border-color hover:bg-background'
              }`}
            >
              <ArchiveIcon className="w-4 h-4" />
              Concluídos ({completedReminders.length})
            </button>
          )}
          <button
            onClick={openAdd}
            className="px-5 py-2 rounded-lg font-semibold text-primary-content bg-primary hover:bg-primary-focus shadow-soft flex items-center gap-2 transition-colors text-sm"
          >
            <PlusIcon className="w-5 h-5" /> Novo Lembrete
          </button>
        </div>
      </PageHeader>

      {/* ── BOARD ── */}
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar py-4">
        {/* Subtle board area */}
        <div className="relative min-h-full rounded-2xl p-6 bg-surface/40 border border-border-color/50 bg-[radial-gradient(circle,_var(--border-color,_rgba(0,0,0,0.06))_1px,_transparent_1px)] bg-[length:24px_24px]">
          {sorted.length === 0 && !showCompleted ? (
            <ReminderEmptyState />
          ) : (
            <div className="relative z-10 space-y-8">
              {/* Active reminders grid */}
              {sorted.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {sorted.map((reminder, i) => {
                    const style = getReminderColorStyle(reminder.color);
                    const rotation = REMINDER_ROTATIONS[i % REMINDER_ROTATIONS.length];
                    const past = isPast(reminder.remindAt);

                    return (
                      <div
                        key={reminder.id}
                        className={`
                          group relative cursor-pointer rounded-lg border p-0 
                          transition-all duration-300 
                          hover:shadow-lg hover:scale-[1.03] hover:!rotate-0 hover:z-20
                          shadow-[0_2px_8px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.06)] min-h-[170px]
                          ${style.bg} ${style.border}
                          ${reminder.pinned ? '!rotate-0 shadow-md ring-2 ring-primary/40' : rotation}
                        `}
                      >
                        {/* Sticky tape / pin at top */}
                        {reminder.pinned ? (
                          <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 z-10">
                            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-red-400 to-red-500 shadow-sm border border-red-300/50 flex items-center justify-center">
                              <div className="w-1.5 h-1.5 rounded-full bg-red-700/50" />
                            </div>
                          </div>
                        ) : (
                          <div className="absolute -top-1 left-1/2 -translate-x-1/2 z-10">
                            <div className="w-14 h-4 bg-border-color/20 dark:bg-white/10 rounded-sm" />
                          </div>
                        )}

                        {/* Content area */}
                        <div
                          className="p-5 pt-6 pr-10 flex flex-col h-full"
                          onClick={() => openEdit(reminder)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              (() => openEdit(reminder))();
                            }
                          }}
                          role="button"
                          tabIndex={0}
                        >
                          {/* Title */}
                          <h3 className="font-bold text-text-primary text-sm leading-snug mb-2 line-clamp-2">
                            {reminder.title}
                          </h3>

                          {/* Comment */}
                          {reminder.comment && (
                            <p className="text-xs text-text-secondary leading-relaxed mb-3 line-clamp-4 flex-1">
                              {reminder.comment}
                            </p>
                          )}

                          {/* Date badge + URL */}
                          {(reminder.remindAt || reminder.externalUrl) && (
                            <div className="mt-auto pt-3 border-t border-black/[0.06] dark:border-white/[0.06] border-dashed flex flex-wrap items-center gap-2">
                              {reminder.remindAt && (
                                <span
                                  className={`
                                      inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full
                                      ${
                                        past
                                          ? 'bg-error/10 text-error'
                                          : 'bg-surface/60 text-text-secondary'
                                      }
                                    `}
                                >
                                  <ClockIcon />
                                  {formatDateTime(reminder.remindAt)}
                                </span>
                              )}
                              {reminder.externalUrl && (
                                <a
                                  href={reminder.externalUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                                >
                                  <LinkIcon />
                                  Link
                                </a>
                              )}
                            </div>
                          )}
                        </div>

                        {/* ── Action buttons (on hover) ── */}
                        <div className="absolute top-1.5 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                          {/* Pin */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              togglePin(reminder.id);
                            }}
                            className={`p-1.5 rounded-full transition-all ${
                              reminder.pinned
                                ? 'text-red-600 bg-red-100/80 dark:bg-red-400/20'
                                : 'text-gray-500 hover:text-amber-700 hover:bg-amber-100/80 dark:hover:bg-amber-400/20'
                            }`}
                            title={reminder.pinned ? 'Desafixar' : 'Fixar'}
                          >
                            <PinIcon className="w-3.5 h-3.5" filled={!!reminder.pinned} />
                          </button>
                          {/* Complete */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              markComplete(reminder.id);
                            }}
                            className="p-1.5 text-gray-500 hover:text-emerald-600 hover:bg-emerald-100/80 dark:hover:bg-emerald-400/20 rounded-full transition-all"
                            title="Concluir"
                          >
                            <CheckCircleIcon className="w-3.5 h-3.5" />
                          </button>
                          {/* Reschedule */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openReschedule(reminder);
                            }}
                            className="p-1.5 text-gray-500 hover:text-sky-600 hover:bg-sky-100/80 dark:hover:bg-sky-400/20 rounded-full transition-all"
                            title="Reagendar"
                          >
                            <CalendarIcon className="w-3.5 h-3.5" />
                          </button>
                          {/* Delete */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              confirmDelete(reminder);
                            }}
                            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-100/80 dark:hover:bg-red-400/20 rounded-full transition-all"
                            title="Excluir"
                          >
                            <TrashIcon className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* ── Completed section (collapsible) ── */}
              {showCompleted && completedReminders.length > 0 && (
                <div className="pt-2">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-px flex-1 bg-border-color/30" />
                    <span className="text-xs font-bold text-text-secondary/60 uppercase tracking-widest flex items-center gap-2">
                      <CheckCircleIcon className="w-4 h-4" /> Concluídos
                    </span>
                    <div className="h-px flex-1 bg-border-color/30" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {completedReminders.map((reminder) => {
                      const style = getReminderColorStyle(reminder.color);
                      return (
                        <div
                          key={reminder.id}
                          className={`relative rounded-lg border p-5 opacity-50 grayscale-[40%] shadow-[0_1px_4px_rgba(0,0,0,0.06)] min-h-[120px] ${style.bg} ${style.border}`}
                        >
                          <h3 className="font-bold text-text-primary text-sm leading-snug mb-1 line-through">
                            {reminder.title}
                          </h3>
                          {reminder.comment && (
                            <p className="text-xs text-text-secondary leading-relaxed mb-2 line-clamp-2">
                              {reminder.comment}
                            </p>
                          )}
                          <div className="flex items-center justify-between mt-auto">
                            <span className="text-[10px] text-text-secondary/60 italic">
                              Concluído em {formatDateTime(reminder.completedAt!)}
                            </span>
                            <button
                              onClick={() => confirmDelete(reminder)}
                              className="p-1 text-text-secondary/40 hover:text-error transition-colors"
                              title="Excluir"
                            >
                              <TrashIcon className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Modals ── */}
      <ReminderFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setFormOpen(false);
          setRescheduleMode(false);
        }}
        onSave={handleSave}
        initial={selected}
        rescheduleMode={rescheduleMode}
        colorOptions={POST_IT_COLORS}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        itemName={toDelete?.title || ''}
        itemType="Lembrete"
      />
    </div>
  );
};

export default LembretesPage;
