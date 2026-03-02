import type { ProjectSection, ProjectTask } from '../../../../types';

export type ViewMode = 'day' | 'week' | 'month';

export interface ProjectGanttTabProps {
  sections: ProjectSection[];
  onTaskUpdate: (sectionId: string, task: ProjectTask) => void;
}

export interface TimelineRow {
  id: string;
  name: string;
  type: 'section' | 'task';
  sectionId?: string;
  startDate: Date;
  endDate: Date;
  isCompleted: boolean;
  isLate: boolean;
  progress: number;
  taskCount?: number;
  completedCount?: number;
}

export interface TimeColumn {
  label: string;
  startDate: Date;
  endDate: Date;
  isToday?: boolean;
  isWeekend?: boolean;
  groupKey: string;
}

export interface GroupHeader {
  label: string;
  span: number;
}

export interface TooltipData {
  name: string;
  start: string;
  end: string;
  duration: string;
  progress: number;
  isSection: boolean;
  isLate: boolean;
  isCompleted: boolean;
  taskCount?: number;
  completedCount?: number;
  xRight: number;
  xLeft: number;
  y: number;
}

export interface TimelineMetrics {
  timelineStart: Date;
  totalDays: number;
  columns: TimeColumn[];
  groups: GroupHeader[];
  today: Date;
  colWidth: number;
  totalWidth: number;
  todayOffset: number | null;
}

export interface GanttStats {
  total: number;
  completed: number;
  late: number;
  inProgress: number;
  dateRange: string;
}
