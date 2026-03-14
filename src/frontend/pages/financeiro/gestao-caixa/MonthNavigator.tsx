import React from 'react';
import { IconButton } from '@/components/ui';
import { ChevronLeftIcon, ChevronRightIcon } from '@/components/ui/icons';

type MonthNavigatorProps = {
  currentDate: Date;
  onDateChange: (date: Date) => void;
};

export const MonthNavigator: (props: MonthNavigatorProps) => React.ReactNode = ({
  currentDate,
  onDateChange,
}) => {
  const changeMonth = (offset: number) => {
    const nextDate = new Date(currentDate);
    nextDate.setDate(1);
    nextDate.setMonth(nextDate.getMonth() + offset);
    onDateChange(nextDate);
  };

  return (
    <div className="flex justify-center items-center gap-4">
      <IconButton variant="default" onClick={() => changeMonth(-1)} aria-label="Mês anterior">
        <ChevronLeftIcon className="w-5 h-5" />
      </IconButton>
      <h3 className="font-serif text-2xl font-bold text-secondary min-w-[12rem] text-center">
        {currentDate
          .toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
          .replace(/^\w/, (char) => char.toUpperCase())}
      </h3>
      <IconButton variant="default" onClick={() => changeMonth(1)} aria-label="Próximo mês">
        <ChevronRightIcon className="w-5 h-5" />
      </IconButton>
    </div>
  );
};
