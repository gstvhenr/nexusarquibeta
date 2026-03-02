import React from 'react';
import { ROW_H, SECTION_ROW_H, diffDays, durationLabel, fmtFullDate } from './helpers';
import type { TimelineRow, TooltipData } from './types';

interface GanttBarRendererProps {
  rows: TimelineRow[];
  getBarStyle: (row: TimelineRow) => { left: number; width: number };
  getBarClasses: (row: TimelineRow) => string;
  onTooltipChange: (tooltip: TooltipData | null) => void;
}

export const GanttBarRenderer: (props: GanttBarRendererProps) => React.ReactNode = ({
  rows,
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
                <span className="text-[10px] font-bold text-white/90 drop-shadow-sm">✓</span>
              </div>
            )}
          </div>
        </React.Fragment>
      );
    })}
  </>
);
