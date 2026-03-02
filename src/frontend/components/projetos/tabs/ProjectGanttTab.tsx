import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ClockIcon } from '../../ui/icons';
import {
  ROW_H,
  SECTION_ROW_H,
  buildRows,
  computeStats,
  computeTimelineMetrics,
  dateToPixel,
} from './project-gantt/helpers';
import { GanttTimeline } from './project-gantt/GanttTimeline';
import { SummaryBar } from './project-gantt/SummaryBar';
import { Tooltip } from './project-gantt/Tooltip';
import type {
  ProjectGanttTabProps,
  TimelineRow,
  TooltipData,
  ViewMode,
} from './project-gantt/types';

export const ProjectGanttTab: (props: ProjectGanttTabProps) => React.ReactNode = ({ sections }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('week');
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

  const rows = useMemo(() => buildRows(sections, collapsedSections), [sections, collapsedSections]);
  const stats = useMemo(() => computeStats(sections), [sections]);

  const { columns, groups, colWidth, totalWidth, todayOffset } = useMemo(
    () => computeTimelineMetrics(rows, viewMode),
    [rows, viewMode],
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
      return 'bg-gradient-to-r from-success to-emerald-500 shadow-[0_2px_8px_rgba(16,185,129,0.3)]';
    }
    if (row.isLate) {
      return 'bg-gradient-to-r from-error to-rose-500 shadow-[0_2px_8px_rgba(239,68,68,0.3)]';
    }
    return 'bg-gradient-to-r from-primary to-primary-focus shadow-[0_2px_8px_rgba(0,0,0,0.12)]';
  }, []);

  const hasTasks = sections.length > 0 && sections.some((section) => section.tasks.length > 0);
  const totalHeight = useMemo(
    () => rows.reduce((acc, row) => acc + (row.type === 'section' ? SECTION_ROW_H : ROW_H), 0),
    [rows],
  );

  return (
    <div className="space-y-5 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between items-center bg-surface p-4 rounded-xl shadow-sm border border-border-color gap-4">
        <h3 className="font-serif text-lg font-bold text-secondary flex items-center gap-2">
          <ClockIcon className="w-5 h-5 text-primary" /> Cronograma Interativo
        </h3>
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

      {hasTasks && (
        <SummaryBar
          total={stats.total}
          completed={stats.completed}
          late={stats.late}
          inProgress={stats.inProgress}
          dateRange={stats.dateRange}
        />
      )}

      <GanttTimeline
        hasTasks={hasTasks}
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

      {hasTasks && (
        <div className="flex flex-wrap gap-x-6 gap-y-2 justify-center text-xs text-text-secondary bg-surface/50 py-2.5 px-4 rounded-lg border border-border-color/30">
          <div className="flex items-center gap-2">
            <div className="w-5 h-2.5 rounded-sm bg-gradient-to-r from-primary to-primary-focus" />
            <span>Em Andamento</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-2.5 rounded-sm bg-gradient-to-r from-success to-emerald-500" />
            <span>Concluído</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-2.5 rounded-sm bg-gradient-to-r from-error to-rose-500" />
            <span>Atrasado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-[2px] h-3.5 bg-error/60 rounded-full" />
            <span>Hoje</span>
          </div>
        </div>
      )}

      <Tooltip data={tooltip} />
    </div>
  );
};
