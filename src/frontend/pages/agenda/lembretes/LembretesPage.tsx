import React, { useState, useMemo, useCallback } from 'react';
import { useDisclosure } from '@/hooks/useDisclosure';
import { useSystemData } from '@/context/DataContext';
import { PageHeader } from '@/components/layout';
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
} from '@/components/agenda';
import { NAV_LINKS } from '@/constants';
import {
  Button,
  DeleteConfirmationModal,
  IconButton,
  PlusIcon,
  TrashIcon,
  CheckCircleIcon,
  ArchiveIcon,
} from '@/components/ui';
import type { Reminder } from '@/types';

// ─── MAIN PAGE ───────────────────────────────────────────────
const LembretesPage: () => React.ReactNode = () => {
  const { reminders, setReminders } = useSystemData();

  const formModal = useDisclosure();
  const deleteModal = useDisclosure();
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
    formModal.open();
  };
  const openEdit = (r: Reminder) => {
    setSelected(r);
    setRescheduleMode(false);
    formModal.open();
  };
  const openReschedule = (r: Reminder) => {
    setSelected(r);
    setRescheduleMode(true);
    formModal.open();
  };
  const confirmDelete = (r: Reminder) => {
    setToDelete(r);
    deleteModal.open();
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
    deleteModal.close();
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
            <Button
              variant="ghost"
              onClick={() => setShowCompleted((v) => !v)}
              className={`px-4 py-2 text-sm font-semibold border gap-2 ${
                showCompleted
                  ? 'bg-success/10 text-success border-success/30 dark:border-success/50'
                  : 'bg-surface text-text-secondary border-border-color hover:bg-background'
              }`}
            >
              <ArchiveIcon className="w-4 h-4" />
              Concluídos ({completedReminders.length})
            </Button>
          )}
          <Button
            variant="primary"
            onClick={openAdd}
            className="shadow-soft flex items-center gap-2 text-sm"
          >
            <PlusIcon className="w-5 h-5" /> Novo Lembrete
          </Button>
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
                            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-error/70 to-error shadow-sm border border-error/30 flex items-center justify-center">
                              <div className="w-1.5 h-1.5 rounded-full bg-error/50" />
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
                              openEdit(reminder);
                            }
                          }}
                          role="button"
                          tabIndex={0}
                          aria-label={`Editar lembrete: ${reminder.title}`}
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

                          {/* Date badge (no interactive children) */}
                          {reminder.remindAt && (
                            <div className="mt-auto pt-3 border-t border-black/[0.06] dark:border-white/[0.06] border-dashed flex flex-wrap items-center gap-2">
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
                            </div>
                          )}
                        </div>

                        {/* External URL link - outside role=button to avoid nested interactive controls */}
                        {reminder.externalUrl && (
                          <div className="px-5 pb-3">
                            {!reminder.remindAt && (
                              <div className="border-t border-black/[0.06] dark:border-white/[0.06] border-dashed mb-2" />
                            )}
                            <a
                              href={reminder.externalUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                            >
                              <LinkIcon />
                              Link
                            </a>
                          </div>
                        )}

                        {/* ── Action buttons (on hover) ── */}
                        <div className="absolute top-1.5 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                          {/* Pin */}
                          <IconButton
                            variant="default"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              togglePin(reminder.id);
                            }}
                            className={`p-1.5 rounded-full ${
                              reminder.pinned
                                ? 'text-error bg-error/10 dark:bg-error/20'
                                : 'text-text-secondary hover:text-warning hover:bg-warning/10 dark:hover:bg-warning/20'
                            }`}
                            title={reminder.pinned ? 'Desafixar' : 'Fixar'}
                            aria-label={reminder.pinned ? 'Desafixar' : 'Fixar'}
                          >
                            <PinIcon className="w-3.5 h-3.5" filled={!!reminder.pinned} />
                          </IconButton>
                          {/* Complete */}
                          <IconButton
                            variant="default"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              markComplete(reminder.id);
                            }}
                            aria-label="Concluir"
                            title="Concluir"
                            className="hover:text-success hover:bg-success/10 dark:hover:bg-success/20"
                          >
                            <CheckCircleIcon className="w-3.5 h-3.5" />
                          </IconButton>
                          {/* Reschedule */}
                          <IconButton
                            variant="default"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              openReschedule(reminder);
                            }}
                            aria-label="Reagendar"
                            title="Reagendar"
                            className="hover:text-info hover:bg-info/10 dark:hover:bg-info/20"
                          >
                            <CalendarIcon className="w-3.5 h-3.5" />
                          </IconButton>
                          {/* Delete */}
                          <IconButton
                            variant="danger"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              confirmDelete(reminder);
                            }}
                            aria-label="Excluir"
                            title="Excluir"
                          >
                            <TrashIcon className="w-3.5 h-3.5" />
                          </IconButton>
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
                            <IconButton
                              variant="danger"
                              size="sm"
                              onClick={() => confirmDelete(reminder)}
                              aria-label="Excluir"
                              title="Excluir"
                            >
                              <TrashIcon className="w-3 h-3" />
                            </IconButton>
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
        isOpen={formModal.isOpen}
        onClose={() => {
          formModal.close();
          setRescheduleMode(false);
        }}
        onSave={handleSave}
        initial={selected}
        rescheduleMode={rescheduleMode}
        colorOptions={POST_IT_COLORS}
      />

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.close}
        onConfirm={handleDelete}
        itemName={toDelete?.title || ''}
        itemType="Lembrete"
      />
    </div>
  );
};

export default LembretesPage;
