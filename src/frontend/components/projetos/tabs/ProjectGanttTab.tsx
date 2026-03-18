import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ClockIcon } from '../../ui/icons';
import {
  ROW_H,
  SECTION_ROW_H,
  buildRows,
  computeTimelineMetrics,
  dateToPixel,
} from './project-gantt/helpers';
import { GanttTimeline } from './project-gantt/GanttTimeline';

import { Tooltip } from './project-gantt/Tooltip';
import type {
  ProjectGanttTabProps,
  TimelineRow,
  TooltipData,
  ViewMode,
} from './project-gantt/types';

export const ProjectGanttTab: (props: ProjectGanttTabProps) => React.ReactNode = ({ sections }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [containerWidth, setContainerWidth] = useState(0);
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());

  const timelineRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const nameColRef = useRef<HTMLDivElement>(null);

  const handleHorizontalScroll = useCallback(() => {
    if (timelineRef.current && headerRef.current) {
      headerRef.current.scrollLeft = timelineRef.current.scrollLeft;
    }
  }, []);

  const handleVerticalScroll = useCallback(() => {
    if (timelineRef.current && nameColRef.current) {
      nameColRef.current.scrollTop = timelineRef.current.scrollTop;
    }
  }, []);

  const handleTimelineScroll = useCallback(() => {
    handleHorizontalScroll();
    handleVerticalScroll();
  }, [handleHorizontalScroll, handleVerticalScroll]);

  const handleNameScroll = useCallback(() => {
    if (nameColRef.current && timelineRef.current) {
      timelineRef.current.scrollTop = nameColRef.current.scrollTop;
    }
  }, []);

  const toggleSection = useCallback((sectionId: string) => {
    setCollapsedSections((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) next.delete(sectionId);
      else next.add(sectionId);
      return next;
    });
  }, []);

  // Measure the timeline container width so the chart fills it
  useEffect(() => {
    const element = timelineRef.current;
    if (!element) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) setContainerWidth(entry.contentRect.width);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const rows = useMemo(() => buildRows(sections, collapsedSections), [sections, collapsedSections]);

  const { columns, groups, colWidth, totalWidth, todayOffset } = useMemo(
    () => computeTimelineMetrics(rows, viewMode, containerWidth),
    [rows, viewMode, containerWidth],
  );

  useEffect(() => {
    if (todayOffset !== null && timelineRef.current) {
      const containerWidth = timelineRef.current.clientWidth;
      timelineRef.current.scrollLeft = Math.max(0, todayOffset - containerWidth / 3);
      if (headerRef.current) {
        headerRef.current.scrollLeft = timelineRef.current.scrollLeft;
      }
    }
  }, [todayOffset, viewMode]);

  const minBarWidth = viewMode === 'day' ? colWidth : viewMode === 'week' ? 22 : 14;

  const getBarStyle = useCallback(
    (row: TimelineRow) => {
      const rawLeft = dateToPixel(row.startDate, columns, colWidth);
      const rawRight = dateToPixel(row.endDate, columns, colWidth);
      const rawWidth = rawRight - rawLeft;

      if (rawWidth >= minBarWidth) {
        return { left: rawLeft, width: rawWidth };
      }

      // Center-anchor: expand outward from midpoint so the bar doesn't shift
      const midpoint = rawLeft + rawWidth / 2;
      const adjustedLeft = midpoint - minBarWidth / 2;
      return { left: Math.max(0, adjustedLeft), width: minBarWidth };
    },
    [columns, colWidth, minBarWidth],
  );

  const getBarClasses = useCallback((row: TimelineRow) => {
    if (row.isCompleted) {
      return 'bg-gradient-to-r from-success to-success/80 shadow-[0_2px_8px_hsl(var(--color-success)/0.3)]';
    }
    if (row.isLate) {
      return 'bg-gradient-to-r from-error to-error/80 shadow-[0_2px_8px_hsl(var(--color-error)/0.3)]';
    }
    return 'bg-gradient-to-r from-primary to-primary-focus shadow-[0_2px_8px_rgba(var(--color-shadow-rgb),0.12)]';
  }, []);

  const hasTasks = sections.length > 0 && sections.some((section) => section.tasks.length > 0);
  const totalHeight = useMemo(
    () => rows.reduce((acc, row) => acc + (row.type === 'section' ? SECTION_ROW_H : ROW_H), 0),
    [rows],
  );

  return (
    <div className="animate-fade-in-up">
      <div className="bg-background/30 rounded-xl border border-border-color/50 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-color/50">
          <div className="flex items-center gap-3">
            <ClockIcon className="w-5 h-5 text-primary" />
            <h3 className="font-serif text-xl font-bold text-secondary">Cronograma do Projeto</h3>
          </div>
          <div className="flex p-1 bg-background rounded-lg border border-border-color/50">
            {(['day', 'week', 'month'] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setViewMode(mode)}
                className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all duration-200 ${
                  viewMode === mode
                    ? 'bg-surface text-primary shadow-sm ring-1 ring-border-color'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                {mode === 'day' ? 'Dia' : mode === 'week' ? 'Semana' : 'Mês'}
              </button>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div className="p-4">
          <GanttTimeline
            hasTasks={hasTasks}
            viewMode={viewMode}
            groups={groups}
            columns={columns}
            totalWidth={totalWidth}
            colWidth={colWidth}
            rows={rows}
            collapsedSections={collapsedSections}
            onToggleSection={toggleSection}
            nameColRef={nameColRef}
            timelineRef={timelineRef}
            headerRef={headerRef}
            onNameScroll={handleNameScroll}
            onTimelineScroll={handleTimelineScroll}
            totalHeight={totalHeight}
            todayOffset={todayOffset}
            getBarStyle={getBarStyle}
            getBarClasses={getBarClasses}
            onTooltipChange={setTooltip}
          />
        </div>

        {/* Legend */}
        {hasTasks && (
          <div className="flex flex-wrap gap-x-6 gap-y-2 justify-center text-xs text-text-secondary py-2.5 px-4 border-t border-border-color/30">
            <div className="flex items-center gap-2">
              <div className="w-5 h-2.5 rounded-sm bg-gradient-to-r from-primary to-primary-focus" />
              <span>Em Andamento</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-2.5 rounded-sm bg-gradient-to-r from-success to-success/80" />
              <span>Concluído</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-2.5 rounded-sm bg-gradient-to-r from-error to-error/80" />
              <span>Atrasado</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-[2px] h-3.5 bg-error/60 rounded-full" />
              <span>Hoje</span>
            </div>
          </div>
        )}
      </div>

      <Tooltip data={tooltip} />
    </div>
  );
};
