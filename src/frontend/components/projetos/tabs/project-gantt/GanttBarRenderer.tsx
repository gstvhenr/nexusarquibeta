import React from 'react';
import { ROW_H, SECTION_ROW_H, diffDays, durationLabel, fmtFullDate } from './helpers';
import type { TimelineRow, TooltipData } from './types';

interface GanttBarRendererProps {
  rows: TimelineRow[];
  totalWidth: number;
  getBarStyle: (row: TimelineRow) => { left: number; width: number };
  getBarClasses: (row: TimelineRow) => string;
  onTooltipChange: (tooltip: TooltipData | null) => void;
}

export const GanttBarRenderer: (props: GanttBarRendererProps) => React.ReactNode = ({
  rows,
  totalWidth,
  getBarStyle,
  getBarClasses,
  onTooltipChange,
}) => (
  <>
    {rows.map((row, index) => {
      const isSection = row.type === 'section';
      const rowHeight = isSection ? SECTION_ROW_H : ROW_H;
      const topOffset = rows
        .slice(0, index)
        .reduce((acc, current) => acc + (current.type === 'section' ? SECTION_ROW_H : ROW_H), 0);

      if (isSection) {
        return (
          <rect
            key={row.id}
            x={0}
            y={topOffset}
            width={totalWidth}
            height={rowHeight}
            fill="hsl(var(--color-border-color) / 0.15)"
            stroke="hsl(var(--color-border-color) / 0.5)"
            strokeWidth={1}
          />
        );
      }

      const bar = getBarStyle(row);
      const barHeight = 26;
      const barTop = topOffset + (rowHeight - barHeight) / 2;

      return (
        <React.Fragment key={row.id}>
          <line
            x1={0}
            y1={topOffset + rowHeight}
            x2={totalWidth}
            y2={topOffset + rowHeight}
            stroke="hsl(var(--color-border-color) / 0.3)"
            strokeWidth={1}
          />
          <foreignObject x={bar.left} y={barTop} width={bar.width} height={barHeight}>
            <div
              className={`h-full w-full cursor-default overflow-hidden rounded-md transition-all duration-200 ${getBarClasses(row)}`}
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
                <div className="flex h-full items-center px-2">
                  <span className="truncate text-[10px] font-semibold text-white/90 drop-shadow-sm">
                    {row.name}
                  </span>
                </div>
              )}
              {row.isCompleted && bar.width <= 50 && (
                <div className="flex h-full items-center justify-center">
                  <span className="text-[10px] font-bold text-white/90 drop-shadow-sm">✓</span>
                </div>
              )}
            </div>
          </foreignObject>
        </React.Fragment>
      );
    })}
  </>
);
