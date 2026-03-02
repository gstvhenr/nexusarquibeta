import React from 'react';

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
      <button
        type="button"
        onClick={() => changeMonth(-1)}
        className="p-2 rounded-full hover:bg-surface transition-colors"
        aria-label="Mês anterior"
      >
        &lt;
      </button>
      <h3 className="font-serif text-2xl font-bold text-secondary min-w-[12rem] text-center">
        {currentDate
          .toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
          .replace(/^\w/, (char) => char.toUpperCase())}
      </h3>
      <button
        type="button"
        onClick={() => changeMonth(1)}
        className="p-2 rounded-full hover:bg-surface transition-colors"
        aria-label="Próximo mês"
      >
        &gt;
      </button>
    </div>
  );
};
