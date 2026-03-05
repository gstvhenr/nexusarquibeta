import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { TimelineRow } from './types';
import { GanttBarRenderer } from './GanttBarRenderer';

const baseRows: TimelineRow[] = [
  {
    id: 'section-1',
    name: 'Etapa 1',
    type: 'section',
    startDate: new Date('2026-03-01'),
    endDate: new Date('2026-03-20'),
    isCompleted: false,
    isLate: false,
    progress: 20,
    taskCount: 1,
    completedCount: 0,
  },
  {
    id: 'task-1',
    name: 'Task Bar',
    type: 'task',
    sectionId: 'section-1',
    startDate: new Date('2026-03-01'),
    endDate: new Date('2026-03-05'),
    isCompleted: false,
    isLate: true,
    progress: 30,
  },
];

describe('GanttBarRenderer', () => {
  it('renders bars and emits tooltip data on hover', () => {
    const onTooltipChange = vi.fn();

    render(
      <div>
        <GanttBarRenderer
          rows={baseRows}
          getBarStyle={(row) => ({ left: row.type === 'task' ? 20 : 0, width: 120 })}
          getBarClasses={() => 'bar-class'}
          onTooltipChange={onTooltipChange}
        />
      </div>,
    );

    const taskLabel = screen.getByText('Task Bar');
    const taskBar = taskLabel.parentElement?.parentElement;
    expect(taskBar).toBeInTheDocument();

    fireEvent.mouseEnter(taskBar!);
    expect(onTooltipChange).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Task Bar',
        isLate: true,
        isCompleted: false,
      }),
    );

    fireEvent.mouseLeave(taskBar!);
    expect(onTooltipChange).toHaveBeenCalledWith(null);
  });

  it('shows check marker for completed short bars', () => {
    render(
      <div>
        <GanttBarRenderer
          rows={[
            {
              ...baseRows[1],
              id: 'task-complete',
              name: 'Curta',
              isCompleted: true,
              isLate: false,
            },
          ]}
          getBarStyle={() => ({ left: 0, width: 20 })}
          getBarClasses={() => 'bar-class'}
          onTooltipChange={vi.fn()}
        />
      </div>,
    );

    expect(screen.getByText('✓')).toBeInTheDocument();
  });
});
