export const SummaryBar = ({
  total,
  completed,
  late,
  inProgress,
  dateRange,
}: {
  total: number;
  completed: number;
  late: number;
  inProgress: number;
  dateRange: string;
}) => {
  const completionPct = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <div className="bg-background/50 rounded-lg p-3 border border-border-color/40">
        <p className="text-[10px] font-bold uppercase tracking-wider text-text-secondary mb-1">
          Total
        </p>
        <p className="text-xl font-bold text-text-primary">{total}</p>
        <p className="text-[10px] text-text-secondary mt-0.5">{dateRange}</p>
      </div>
      <div className="bg-background/50 rounded-lg p-3 border border-border-color/40">
        <p className="text-[10px] font-bold uppercase tracking-wider text-success mb-1">
          Concluídas
        </p>
        <div className="flex items-baseline gap-2">
          <p className="text-xl font-bold text-success">{completed}</p>
          <span className="text-xs text-text-secondary">{completionPct}%</span>
        </div>
        <div className="mt-1.5 h-1 bg-border-color/30 rounded-full overflow-hidden">
          <div
            className="h-full bg-success rounded-full transition-all duration-700"
            style={{ width: `${completionPct}%` }}
          />
        </div>
      </div>
      <div className="bg-background/50 rounded-lg p-3 border border-border-color/40">
        <p className="text-[10px] font-bold uppercase tracking-wider text-primary mb-1">
          Em Andamento
        </p>
        <p className="text-xl font-bold text-primary">{inProgress}</p>
      </div>
      <div className="bg-background/50 rounded-lg p-3 border border-border-color/40">
        <p className="text-[10px] font-bold uppercase tracking-wider text-error mb-1">Atrasadas</p>
        <p className={`text-xl font-bold ${late > 0 ? 'text-error' : 'text-text-secondary'}`}>
          {late}
        </p>
      </div>
    </div>
  );
};
