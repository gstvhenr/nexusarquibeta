import { Button } from './Button';
import { ChevronLeftIcon, ChevronRightIcon } from './icons';
import type { ReactNode } from 'react';

type LegacyMonthNavigatorProps = {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  label?: never;
  onPrevious?: never;
  onNext?: never;
  onToday?: never;
};

type ComposedMonthNavigatorProps = {
  label: ReactNode;
  onPrevious: () => void;
  onNext: () => void;
  onToday?: () => void;
  currentDate?: never;
  onDateChange?: never;
};

type MonthNavigatorProps = LegacyMonthNavigatorProps | ComposedMonthNavigatorProps;

export function MonthNavigator({
  currentDate,
  onDateChange,
  label,
  onPrevious,
  onNext,
  onToday,
}: MonthNavigatorProps): JSX.Element {
  const isLegacyMode = currentDate instanceof Date && typeof onDateChange === 'function';

  const resolvedLabel = isLegacyMode
    ? currentDate
        .toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
        .replace(/^\w/, (char) => char.toUpperCase())
    : label;

  const handlePrevious = isLegacyMode
    ? () => {
        const nextDate = new Date(currentDate);
        nextDate.setDate(1);
        nextDate.setMonth(nextDate.getMonth() - 1);
        onDateChange(nextDate);
      }
    : onPrevious;

  const handleNext = isLegacyMode
    ? () => {
        const nextDate = new Date(currentDate);
        nextDate.setDate(1);
        nextDate.setMonth(nextDate.getMonth() + 1);
        onDateChange(nextDate);
      }
    : onNext;

  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-border-color bg-surface px-4 py-3 shadow-soft sm:flex-row sm:justify-between">
      <Button variant="secondary" size="sm" onClick={handlePrevious}>
        <ChevronLeftIcon className="h-4 w-4" />
        Anterior
      </Button>
      <h3 className="min-w-[12rem] text-center text-xl font-semibold text-text-primary">
        {resolvedLabel}
      </h3>
      <div className="flex items-center gap-2">
        {onToday ? (
          <Button variant="ghost" size="sm" onClick={onToday}>
            Hoje
          </Button>
        ) : null}
        <Button variant="secondary" size="sm" onClick={handleNext}>
          Próximo
          <ChevronRightIcon className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
