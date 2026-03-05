import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { GroupHeader, TimeColumn, TimelineRow } from './types';
import { GanttTimeline } from './GanttTimeline';

const groups: GroupHeader[] = [{ label: 'Março 2026', span: 2 }];
const columns: TimeColumn[] = [
  {
    label: 'Seg. 01',
    startDate: new Date('2026-03-01'),
    endDate: new Date('2026-03-02'),
    isToday: false,
    isWeekend: false,
    groupKey: '2026-2',
  },
  {
    label: 'Ter. 02',
    startDate: new Date('2026-03-02'),
    endDate: new Date('2026-03-03'),
    isToday: true,
    isWeekend: false,
    groupKey: '2026-2',
  },
];

const rows: TimelineRow[] = [
  {
    id: 'section-1',
    name: 'Etapa 1',
    type: 'section',
    startDate: new Date('2026-03-01'),
    endDate: new Date('2026-03-05'),
    isCompleted: false,
    isLate: false,
    progress: 40,
    taskCount: 1,
    completedCount: 0,
  },
  {
    id: 'task-1',
    sectionId: 'section-1',
    name: 'Task 1',
    type: 'task',
    startDate: new Date('2026-03-02'),
    endDate: new Date('2026-03-04'),
    isCompleted: false,
    isLate: false,
    progress: 20,
  },
];

function renderTimeline(hasTasks: boolean) {
  const onToggleSection = vi.fn();
  const onNameScroll = vi.fn();
  const onTimelineScroll = vi.fn();

  const view = render(
    <GanttTimeline
      hasTasks={hasTasks}
      groups={groups}
      columns={columns}
      totalWidth={600}
      colWidth={300}
      rows={rows}
      collapsedSections={new Set<string>()}
      onToggleSection={onToggleSection}
      nameColRef={{ current: null }}
      timelineRef={{ current: null }}
      headerRef={{ current: null }}
      onNameScroll={onNameScroll}
      onTimelineScroll={onTimelineScroll}
      totalHeight={300}
      todayOffset={50}
      getBarStyle={() => ({ left: 10, width: 120 })}
      getBarClasses={() => 'bar-class'}
      onTooltipChange={vi.fn()}
    />,
  );

  return { ...view, onToggleSection, onNameScroll, onTimelineScroll };
}

describe('GanttTimeline', () => {
  it('renders empty state when hasTasks is false', () => {
    renderTimeline(false);
    expect(screen.getByText('O cronograma está vazio.')).toBeInTheDocument();
  });

  it('renders timeline grid and triggers interactions', () => {
    const { container, onToggleSection, onNameScroll, onTimelineScroll } = renderTimeline(true);

    expect(screen.getByText('Tarefas')).toBeInTheDocument();
    expect(screen.getByText('Etapa 1')).toBeInTheDocument();
    expect(screen.getAllByText('Task 1').length).toBeGreaterThan(0);

    const sectionButton = screen.getByRole('button', { name: /Etapa 1/i });
    fireEvent.click(sectionButton);
    fireEvent.keyDown(sectionButton, { key: ' ' });
    expect(onToggleSection).toHaveBeenCalledWith('section-1');

    const nameScroller = container.querySelector('[class*="overflow-y-auto"]');
    const timelineScroller = container.querySelector('[class*="custom-scrollbar"]');
    fireEvent.scroll(nameScroller!);
    fireEvent.scroll(timelineScroller!);

    expect(onNameScroll).toHaveBeenCalled();
    expect(onTimelineScroll).toHaveBeenCalled();
  });
});
