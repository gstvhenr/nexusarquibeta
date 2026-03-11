import { memo, startTransition, useCallback, useMemo, useState } from 'react';
import { LockIcon, PencilIcon } from '@/components/ui';
import {
  EMERGENCY_FUND_TARGET_MONTHS,
  getEmergencyFund,
  getEmergencyFundInsight,
  updateEmergencyFund,
} from '@/services/financeService';
import type { EmergencyFund } from '@/types';
import { formatCurrency } from '@/utils/formatters';
import { CardShell } from './CardShell';
import { EmergencyFundEditModal } from './EmergencyFundEditModal';

interface EmergencyFundCardProps {
  monthlyExpenseBaseline: number;
}

type DraftState = {
  currentValue: number | undefined;
  hasTarget: boolean;
  targetValue: number | undefined;
};

const buildDraftState = (fund: EmergencyFund, monthlyExpenseBaseline: number): DraftState => ({
  currentValue: fund.currentValue,
  hasTarget: Boolean(fund.targetValue),
  targetValue:
    fund.targetValue ??
    (monthlyExpenseBaseline > 0
      ? Math.round(monthlyExpenseBaseline * EMERGENCY_FUND_TARGET_MONTHS)
      : undefined),
});

export const EmergencyFundCard = memo(function EmergencyFundCard({
  monthlyExpenseBaseline,
}: EmergencyFundCardProps) {
  const [fund, setFund] = useState<EmergencyFund>(() => getEmergencyFund());
  const [isModalOpen, setModalOpen] = useState(false);
  const [draft, setDraft] = useState<DraftState>(() => buildDraftState(getEmergencyFund(), 0));
  const [formError, setFormError] = useState<string | null>(null);

  const insight = useMemo(
    () => getEmergencyFundInsight(fund, monthlyExpenseBaseline),
    [fund, monthlyExpenseBaseline],
  );

  const suggestionValue =
    monthlyExpenseBaseline > 0 ? monthlyExpenseBaseline * EMERGENCY_FUND_TARGET_MONTHS : null;

  const openModal = useCallback(() => {
    setDraft(buildDraftState(fund, monthlyExpenseBaseline));
    setFormError(null);
    setModalOpen(true);
  }, [fund, monthlyExpenseBaseline]);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setFormError(null);
  }, []);

  const handleCurrentValueChange = useCallback((value: number | undefined) => {
    setDraft((previous) => ({ ...previous, currentValue: value }));
  }, []);

  const handleTargetValueChange = useCallback((value: number | undefined) => {
    setDraft((previous) => ({ ...previous, targetValue: value }));
  }, []);

  const handleTargetToggle = useCallback(
    (checked: boolean) => {
      setDraft((previous) => ({
        ...previous,
        hasTarget: checked,
        targetValue:
          checked && previous.targetValue === undefined
            ? (suggestionValue ?? previous.currentValue)
            : previous.targetValue,
      }));
    },
    [suggestionValue],
  );

  const handleSave = useCallback(() => {
    if (draft.currentValue === undefined || draft.currentValue < 0) {
      setFormError('Informe um valor válido para o fundo atual.');
      return;
    }

    if (draft.hasTarget && (draft.targetValue === undefined || draft.targetValue <= 0)) {
      setFormError('Quando a meta estiver ativa, informe um valor acima de zero.');
      return;
    }

    const nextFund = updateEmergencyFund({
      currentValue: draft.currentValue,
      targetValue: draft.hasTarget ? draft.targetValue : undefined,
    });

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('storage'));
    }

    startTransition(() => {
      setFund(nextFund);
      setModalOpen(false);
      setFormError(null);
    });
  }, [draft]);

  const toneColor =
    insight.tone === 'success'
      ? 'text-success'
      : insight.tone === 'warning'
        ? 'text-warning'
        : 'text-primary';

  return (
    <>
      <CardShell glow="primary" className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
        <button
          type="button"
          onClick={openModal}
          aria-label="Editar fundo de reserva"
          className="relative w-full p-4 flex flex-col justify-between h-full text-left group cursor-pointer"
        >
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
              Fundo de Reserva
            </span>
            <div className={`p-2 rounded-xl bg-primary/10 ${toneColor}`}>
              <LockIcon className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-end justify-between gap-2">
            <span className="text-2xl font-bold font-sans tracking-tight text-primary tabular-nums">
              {formatCurrency(fund.currentValue)}
            </span>
            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary opacity-0 transition-opacity group-hover:opacity-100">
              <PencilIcon className="w-3 h-3" /> Editar
            </div>
          </div>
        </button>
      </CardShell>

      <EmergencyFundEditModal
        currentValue={draft.currentValue}
        formError={formError}
        hasTarget={draft.hasTarget}
        isOpen={isModalOpen}
        onClose={closeModal}
        onCurrentValueChange={handleCurrentValueChange}
        onSave={handleSave}
        onTargetToggle={handleTargetToggle}
        onTargetValueChange={handleTargetValueChange}
        suggestionValue={suggestionValue}
        targetMonths={EMERGENCY_FUND_TARGET_MONTHS}
        targetValue={draft.targetValue}
      />
    </>
  );
});
