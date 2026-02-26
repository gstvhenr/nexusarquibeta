import React from 'react';
import { CalendarPlusIcon, CheckCircleIcon } from '../../../ui/icons';
import { ROW_H, SECTION_ROW_H, NAME_COL_W, diffDays, durationLabel, fmtFullDate } from './helpers';
import type { GroupHeader, TimeColumn, TimelineRow, TooltipData } from './types';

interface GanttTimelineProps {
  hasTasks: boolean;
  groups: GroupHeader[];
  columns: TimeColumn[];
  totalWidth: number;
  colWidth: number;
  rows: TimelineRow[];
  collapsedSections: Set<string>;
  onToggleSection: (sectionId: string) => void;
  nameColRef: React.RefObject<HTMLDivElement>;
  timelineRef: React.RefObject<HTMLDivElement>;
  headerRef: React.RefObject<HTMLDivElement>;
  onNameScroll: () => void;
  onTimelineScroll: () => void;
  totalHeight: number;
  todayOffset: number | null;
  getBarStyle: (row: TimelineRow) => { left: number; width: number };
  getBarClasses: (row: TimelineRow) => string;
  onTooltipChange: (tooltip: TooltipData | null) => void;
}

export const GanttTimeline = ({
  hasTasks,
  groups,
  columns,
  totalWidth,
  colWidth,
  rows,
  collapsedSections,
  onToggleSection,
  nameColRef,
  timelineRef,
  headerRef,
  onNameScroll,
  onTimelineScroll,
  totalHeight,
  todayOffset,
  getBarStyle,
  getBarClasses,
  onTooltipChange,
}: GanttTimelineProps) => (
  <div className="bg-surface rounded-xl shadow-lifted overflow-hidden border border-border-color">
    {hasTasks ? (
      <div className="flex flex-col">
        <div className="flex border-b border-border-color">
          <div
            className="shrink-0 bg-surface border-r border-border-color px-4 flex items-end pb-2"
            style={{ width: NAME_COL_W, minWidth: NAME_COL_W }}
          >
            <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">
              Tarefas
            </span>
          </div>

          <div ref={headerRef} className="flex-1 overflow-hidden">
            <div style={{ width: totalWidth }}>
              <div className="flex border-b border-border-color/30">
                {groups.map((group, index) => (
                  <div
                    key={`${group.label}-${index}`}
                    className="text-[11px] font-bold text-text-primary uppercase tracking-wide px-2 py-1.5 border-r border-border-color/20"
                    style={{ width: group.span * colWidth }}
                  >
                    {group.label}
                  </div>
                ))}
              </div>
              <div className="flex">
                {columns.map((column, index) => (
                  <div
                    key={index}
                    className={`shrink-0 border-r text-center py-1.5 transition-colors ${
                      column.isToday
                        ? 'bg-primary/10 border-r-primary/20'
                        : column.isWeekend
                          ? 'bg-background/40 border-r-border-color/20'
                          : 'border-r-border-color/20'
                    }`}
                    style={{ width: colWidth }}
                  >
                    {colWidth >= 25 && (
                      <div
                        className={`text-[10px] leading-tight capitalize overflow-hidden whitespace-nowrap ${
                          column.isToday
                            ? 'font-bold text-primary'
                            : column.isWeekend
                              ? 'text-text-secondary/60'
                              : 'font-medium text-text-secondary'
                        }`}
                      >
                        {column.label}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex overflow-hidden" style={{ maxHeight: 520 }}>
          <div
            ref={nameColRef}
            className="shrink-0 border-r border-border-color overflow-y-auto bg-surface"
            style={{ width: NAME_COL_W, minWidth: NAME_COL_W, maxHeight: 520 }}
            onScroll={onNameScroll}
          >
            {rows.map((row) => {
              const isSection = row.type === 'section';
              const isCollapsed = collapsedSections.has(row.id);
              const height = isSection ? SECTION_ROW_H : ROW_H;

              return (
                <div
                  key={row.id}
                  className={`flex items-center gap-2 px-3 border-b transition-colors ${
                    isSection
                      ? 'bg-border-color/15 border-b-border-color/50 cursor-pointer hover:bg-border-color/25'
                      : 'border-b-border-color/30 hover:bg-background/20'
                  }`}
                  style={{ height }}
                  onClick={isSection ? () => onToggleSection(row.id) : undefined}
                  onKeyDown={
                    isSection
                      ? (e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            onToggleSection(row.id);
                          }
                        }
                      : undefined
                  }
                  role={isSection ? 'button' : undefined}
                  tabIndex={isSection ? 0 : undefined}
                >
                  {isSection ? (
                    <>
                      <span
                        className={`text-[9px] text-text-secondary transition-transform duration-200 select-none ${isCollapsed ? '' : 'rotate-90'}`}
                      >
                        ▶
                      </span>
                      <span className="text-[12px] font-bold text-secondary truncate flex-1">
                        {row.name}
                      </span>
                      <span className="text-[10px] text-text-secondary bg-background/60 px-1.5 py-0.5 rounded-md whitespace-nowrap">
                        {row.completedCount}/{row.taskCount}
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="ml-3.5 shrink-0">
                        {row.isCompleted ? (
                          <CheckCircleIcon className="w-3.5 h-3.5 text-success" />
                        ) : (
                          <span
                            className={`block w-2 h-2 rounded-full ${row.isLate ? 'bg-error' : 'bg-primary'}`}
                          />
                        )}
                      </span>
                      <span
                        className={`text-[12px] truncate ${
                          row.isCompleted ? 'text-text-secondary line-through' : 'text-text-primary'
                        }`}
                      >
                        {row.name}
                      </span>
                    </>
                  )}
                </div>
              );
            })}
          </div>

          <div
            ref={timelineRef}
            className="flex-1 overflow-auto custom-scrollbar relative"
            style={{ maxHeight: 520 }}
            onScroll={onTimelineScroll}
          >
            <div className="relative" style={{ width: totalWidth, height: totalHeight }}>
              <div
                className="absolute inset-0 flex pointer-events-none"
                style={{ height: totalHeight }}
              >
                {columns.map((column, index) => (
                  <div
                    key={index}
                    className={`shrink-0 border-r h-full ${
                      column.isToday
                        ? 'bg-primary/[0.04] border-r-border-color/15'
                        : column.isWeekend
                          ? 'bg-background/25 border-r-border-color/10'
                          : 'border-r-border-color/10'
                    }`}
                    style={{ width: colWidth }}
                  />
                ))}
              </div>

              {todayOffset !== null && (
                <div
                  className="absolute top-0 w-[2px] z-10 pointer-events-none"
                  style={{ left: todayOffset, height: totalHeight }}
                >
                  <div className="w-full h-full bg-error/50" />
                  <div className="absolute -top-0.5 left-1/2 -translate-x-1/2">
                    <div className="w-2 h-2 rounded-full bg-error border-[1.5px] border-surface shadow-sm" />
                  </div>
                </div>
              )}

              {rows.map((row, index) => {
                const isSection = row.type === 'section';
                const rowHeight = isSection ? SECTION_ROW_H : ROW_H;
                const topOffset = rows
                  .slice(0, index)
                  .reduce(
                    (acc, current) => acc + (current.type === 'section' ? SECTION_ROW_H : ROW_H),
                    0,
                  );

                if (isSection) {
                  return (
                    <div
                      key={row.id}
                      className="absolute left-0 right-0 border-b bg-border-color/15 border-b-border-color/50"
                      style={{ top: topOffset, height: rowHeight }}
                    />
                  );
                }

                const bar = getBarStyle(row);
                const barHeight = 26;
                const barTop = topOffset + (rowHeight - barHeight) / 2;

                return (
                  <React.Fragment key={row.id}>
                    <div
                      className="absolute left-0 right-0 border-b border-b-border-color/30"
                      style={{ top: topOffset, height: rowHeight }}
                    />
                    <div
                      className={`absolute z-[2] transition-all duration-200 rounded-md cursor-default ${getBarClasses(row)}`}
                      style={{ left: bar.left, width: bar.width, top: barTop, height: barHeight }}
                      onMouseEnter={(event) => {
                        const rect = event.currentTarget.getBoundingClientRect();
                        const days = Math.max(1, diffDays(row.startDate, row.endDate));
                        onTooltipChange({
                          name: row.name,
                          start: fmtFullDate(row.startDate),
                          end: fmtFullDate(row.endDate),
                          duration: durationLabel(days),
                          progress: row.progress,
                          isSection: false,
                          isLate: row.isLate,
                          isCompleted: row.isCompleted,
                          taskCount: row.taskCount,
                          completedCount: row.completedCount,
                          xRight: rect.right,
                          xLeft: rect.left,
                          y: rect.top + rect.height / 2,
                        });
                      }}
                      onMouseLeave={() => onTooltipChange(null)}
                    >
                      {bar.width > 50 && (
                        <div className="absolute inset-0 flex items-center px-2 overflow-hidden">
                          <span className="text-[10px] font-semibold text-white/90 truncate drop-shadow-sm">
                            {row.name}
                          </span>
                        </div>
                      )}
                      {row.isCompleted && bar.width <= 50 && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-[10px] font-bold text-white/90 drop-shadow-sm">
                            ✓
                          </span>
                        </div>
                      )}
                    </div>
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    ) : (
      <div className="h-[400px] flex flex-col items-center justify-center text-text-secondary">
        <div className="bg-background/50 p-8 rounded-full mb-4 ring-1 ring-border-color">
          <CalendarPlusIcon className="w-16 h-16 opacity-30" />
        </div>
        <p className="font-semibold text-lg">O cronograma está vazio.</p>
        <p className="text-sm opacity-70 mt-2 max-w-xs text-center">
          Adicione tarefas com datas na aba "Etapas" para visualizar o gráfico.
        </p>
      </div>
    )}
  </div>
);
