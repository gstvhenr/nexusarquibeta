import React from 'react';
import { createPortal } from 'react-dom';
import type { TooltipData } from './types';

export const Tooltip = ({ data }: { data: TooltipData | null }) => {
  if (!data) return null;

  const tooltipWidth = 260;
  const margin = 12;
  const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 1920;
  const spaceRight = screenWidth - (data.xRight + margin + tooltipWidth);
  const showLeft = spaceRight < 0;

  const style: React.CSSProperties = showLeft
    ? { right: screenWidth - data.xLeft + margin, top: data.y, transform: 'translateY(-50%)' }
    : { left: data.xRight + margin, top: data.y, transform: 'translateY(-50%)' };

  return createPortal(
    <div className="fixed z-[100] pointer-events-none" style={style}>
      <div className="bg-surface border border-border-color shadow-lifted rounded-xl p-4 min-w-[220px] max-w-[360px] backdrop-blur-md">
        <p className="font-bold text-sm mb-2.5 text-secondary whitespace-nowrap">{data.name}</p>
        {data.isSection ? (
          <div className="space-y-1.5 text-xs text-text-secondary">
            <p className="font-semibold text-primary/80 uppercase tracking-wider text-[10px]">
              Etapa do Projeto
            </p>
            {data.taskCount !== undefined && (
              <div className="flex justify-between pt-1 border-t border-border-color/50">
                <span>Tarefas:</span>
                <span className="font-medium text-text-primary">
                  {data.completedCount}/{data.taskCount}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Período:</span>
              <span className="font-medium text-text-primary">{data.duration}</span>
            </div>
          </div>
        ) : (
          <div className="space-y-1.5 text-xs text-text-secondary">
            <div className="flex justify-between gap-4">
              <span>Início:</span>
              <span className="font-medium text-text-primary">{data.start}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span>Fim:</span>
              <span className="font-medium text-text-primary">{data.end}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span>Duração:</span>
              <span className="font-medium text-text-primary">{data.duration}</span>
            </div>
            <div className="pt-1.5 border-t border-border-color/50 flex justify-between items-center">
              <span>Status:</span>
              <span
                className={`font-bold px-2 py-0.5 rounded-full text-[11px] ${
                  data.isCompleted
                    ? 'bg-success/15 text-success'
                    : data.isLate
                      ? 'bg-error/15 text-error'
                      : 'bg-primary/15 text-primary'
                }`}
              >
                {data.isCompleted ? '✓ Concluído' : data.isLate ? 'Atrasado' : 'Em andamento'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
};
