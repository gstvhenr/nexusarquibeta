import React from 'react';

export const ReminderEmptyState: () => React.ReactNode = () => (
  <div className="flex flex-col items-center justify-center py-20 text-text-secondary/50 gap-4">
    <svg
      className="w-20 h-20 opacity-30"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1}
      aria-hidden="true"
    >
      <path d="M12 2a7 7 0 0 0-7 7c0 3.5-1.5 5.5-2.5 6.5a1 1 0 0 0 .7 1.7h17.6a1 1 0 0 0 .7-1.7c-1-1-2.5-3-2.5-6.5a7 7 0 0 0-7-7Z" />
      <path d="M9.5 18.5A2.5 2.5 0 0 0 12 21a2.5 2.5 0 0 0 2.5-2.5" />
    </svg>
    <p className="text-base font-medium text-text-secondary">Nenhum lembrete ainda</p>
    <p className="text-sm text-text-secondary/60">
      Clique em &quot;Novo Lembrete&quot; para fixar o primeiro no quadro
    </p>
  </div>
);
