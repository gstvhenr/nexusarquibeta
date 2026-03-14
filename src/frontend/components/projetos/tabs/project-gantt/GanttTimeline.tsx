import React from 'react';
import { CalendarPlusIcon, CheckCircleIcon } from '@/components/ui/icons';
import type { GroupHeader, TimeColumn, TimelineRow, TooltipData } from './types';
import { GanttBarRenderer } from './GanttBarRenderer';

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

const HEADER_GROUP_ROW_H = 24;
const HEADER_COLUMN_ROW_H = 32;
const HEADER_TOTAL_H = HEADER_GROUP_ROW_H + HEADER_COLUMN_ROW_H;

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
}: GanttTimelineProps) => {
  let groupOffset = 0;

  return (
    <div className="overflow-hidden rounded-xl border border-border-color bg-surface shadow-lifted">
      {hasTasks ? (
        <div className="flex flex-col">
          <div className="flex border-b border-border-color">
            <div className="flex h-[56px] w-60 min-w-60 items-end border-r border-border-color bg-surface px-4 pb-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">
                Tarefas
              </span>
            </div>

            <div ref={headerRef} className="flex-1 overflow-hidden">
              <svg width={totalWidth} height={HEADER_TOTAL_H} className="block">
                {groups.map((group, index) => {
                  const width = group.span * colWidth;
                  const x = groupOffset;
                  groupOffset += width;

                  return (
                    <g key={`${group.label}-${index}`}>
                      <rect
                        x={x}
                        y={0}
                        width={width}
                        height={HEADER_GROUP_ROW_H}
                        fill="transparent"
                        stroke="hsl(var(--color-border-color) / 0.2)"
                        strokeWidth={1}
                      />
                      <text
                        x={x + 8}
                        y={15}
                        fill="currentColor"
                        className="text-[11px] font-bold uppercase tracking-wide text-text-primary"
                      >
                        {group.label}
                      </text>
                    </g>
                  );
                })}

                {columns.map((column, index) => {
                  const x = index * colWidth;
                  const fill = column.isToday
                    ? 'hsl(var(--color-primary) / 0.1)'
                    : column.isWeekend
                      ? 'hsl(var(--color-background) / 0.4)'
                      : 'transparent';
                  const stroke = column.isToday
                    ? 'hsl(var(--color-primary) / 0.2)'
                    : 'hsl(var(--color-border-color) / 0.2)';

                  return (
                    <g key={index}>
                      <rect
                        x={x}
                        y={HEADER_GROUP_ROW_H}
                        width={colWidth}
                        height={HEADER_COLUMN_ROW_H}
                        fill={fill}
                        stroke={stroke}
                        strokeWidth={1}
                      />
                      {colWidth >= 25 && (
                        <text
                          x={x + colWidth / 2}
                          y={HEADER_GROUP_ROW_H + 19}
                          textAnchor="middle"
                          fill="currentColor"
                          className={`text-[10px] capitalize ${
                            column.isToday
                              ? 'font-bold text-primary'
                              : column.isWeekend
                                ? 'text-text-secondary/60'
                                : 'font-medium text-text-secondary'
                          }`}
                        >
                          {column.label}
                        </text>
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          <div className="flex overflow-hidden max-h-[520px]">
            <div
              ref={nameColRef}
              className="w-60 min-w-60 overflow-y-auto border-r border-border-color bg-surface"
              onScroll={onNameScroll}
            >
              {rows.map((row) => {
                const isSection = row.type === 'section';
                const isCollapsed = collapsedSections.has(row.id);
                const rowHeightClass = isSection ? 'h-[38px]' : 'h-[42px]';

                if (isSection) {
                  return (
                    <button
                      key={row.id}
                      type="button"
                      className={`flex w-full items-center gap-2 border-b border-b-border-color/50 bg-border-color/15 px-3 transition-colors hover:bg-border-color/25 ${rowHeightClass}`}
                      onClick={() => onToggleSection(row.id)}
                    >
                      <span
                        className={`select-none text-[9px] text-text-secondary transition-transform duration-200 ${
                          isCollapsed ? '' : 'rotate-90'
                        }`}
                      >
                        ▶
                      </span>
                      <span className="flex-1 truncate text-left text-[12px] font-bold text-secondary">
                        {row.name}
                      </span>
                      <span className="whitespace-nowrap rounded-md bg-background/60 px-1.5 py-0.5 text-[10px] text-text-secondary">
                        {row.completedCount}/{row.taskCount}
                      </span>
                    </button>
                  );
                }

                return (
                  <div
                    key={row.id}
                    className={`flex items-center gap-2 border-b border-b-border-color/30 px-3 transition-colors hover:bg-background/20 ${rowHeightClass}`}
                  >
                    <span className="ml-3.5 shrink-0">
                      {row.isCompleted ? (
                        <CheckCircleIcon className="h-3.5 w-3.5 text-success" />
                      ) : (
                        <span
                          className={`block h-2 w-2 rounded-full ${
                            row.isLate ? 'bg-error' : 'bg-primary'
                          }`}
                        />
                      )}
                    </span>
                    <span
                      className={`truncate text-[12px] ${
                        row.isCompleted ? 'text-text-secondary line-through' : 'text-text-primary'
                      }`}
                    >
                      {row.name}
                    </span>
                  </div>
                );
              })}
            </div>

            <div
              ref={timelineRef}
              className="relative flex-1 overflow-auto custom-scrollbar"
              onScroll={onTimelineScroll}
            >
              <svg width={totalWidth} height={totalHeight} className="block">
                <g pointerEvents="none">
                  {columns.map((column, index) => {
                    const x = index * colWidth;
                    const fill = column.isToday
                      ? 'hsl(var(--color-primary) / 0.04)'
                      : column.isWeekend
                        ? 'hsl(var(--color-background) / 0.25)'
                        : 'transparent';
                    const stroke = column.isToday
                      ? 'hsl(var(--color-border-color) / 0.15)'
                      : 'hsl(var(--color-border-color) / 0.1)';

                    return (
                      <rect
                        key={index}
                        x={x}
                        y={0}
                        width={colWidth}
                        height={totalHeight}
                        fill={fill}
                        stroke={stroke}
                        strokeWidth={1}
                      />
                    );
                  })}

                  {todayOffset !== null && (
                    <g>
                      <line
                        x1={todayOffset}
                        y1={0}
                        x2={todayOffset}
                        y2={totalHeight}
                        stroke="hsl(var(--color-error) / 0.5)"
                        strokeWidth={2}
                      />
                      <circle
                        cx={todayOffset}
                        cy={4}
                        r={4}
                        fill="hsl(var(--color-error))"
                        stroke="hsl(var(--color-surface))"
                        strokeWidth={1.5}
                      />
                    </g>
                  )}
                </g>

                <GanttBarRenderer
                  rows={rows}
                  totalWidth={totalWidth}
                  getBarStyle={getBarStyle}
                  getBarClasses={getBarClasses}
                  onTooltipChange={onTooltipChange}
                />
              </svg>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex h-[400px] flex-col items-center justify-center text-text-secondary">
          <div className="mb-4 rounded-full bg-background/50 p-8 ring-1 ring-border-color">
            <CalendarPlusIcon className="h-16 w-16 opacity-30" />
          </div>
          <p className="text-lg font-semibold">O cronograma está vazio.</p>
          <p className="mt-2 max-w-xs text-center text-sm opacity-70">
            Adicione tarefas com datas na aba "Etapas" para visualizar o gráfico.
          </p>
        </div>
      )}
    </div>
  );
};
