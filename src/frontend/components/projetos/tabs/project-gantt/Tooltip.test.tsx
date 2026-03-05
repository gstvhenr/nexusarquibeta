import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { Tooltip } from './Tooltip';

describe('Tooltip', () => {
  afterEach(() => {
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1024 });
  });

  it('returns null when there is no data', () => {
    const { container } = render(<Tooltip data={null} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders task tooltip and flips position when out of right space', () => {
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 500 });

    render(
      <Tooltip
        data={{
          name: 'Tarefa X',
          start: '01/03/2026',
          end: '05/03/2026',
          duration: '4 dias',
          progress: 40,
          isSection: false,
          isLate: true,
          isCompleted: false,
          xRight: 480,
          xLeft: 460,
          y: 200,
        }}
      />,
    );

    expect(screen.getByText('Tarefa X')).toBeInTheDocument();
    expect(screen.getByText('Atrasado')).toBeInTheDocument();

    const fixedContainer = screen.getByText('Tarefa X').closest('.fixed');
    expect(fixedContainer).toHaveStyle({ right: '52px' });
  });

  it('renders section-specific tooltip data', () => {
    render(
      <Tooltip
        data={{
          name: 'Etapa A',
          start: '',
          end: '',
          duration: '2 sem',
          progress: 0,
          isSection: true,
          isLate: false,
          isCompleted: false,
          taskCount: 5,
          completedCount: 2,
          xRight: 100,
          xLeft: 80,
          y: 120,
        }}
      />,
    );

    expect(screen.getByText('Etapa do Projeto')).toBeInTheDocument();
    expect(screen.getByText('2/5')).toBeInTheDocument();
    expect(screen.getByText('2 sem')).toBeInTheDocument();
  });
});
