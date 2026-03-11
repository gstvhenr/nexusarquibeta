import type { EmergencyFund } from '../../types';
import { api } from '../infrastructure/api';

export const EMERGENCY_FUND_TARGET_MONTHS = 6;

export interface EmergencyFundInsight {
  completionRatio: number | null;
  currentValue: number;
  effectiveTargetValue: number | null;
  hasExplicitTarget: boolean;
  monthlyExpenseBaseline: number;
  monthsCovered: number | null;
  progressPercent: number;
  tone: 'warning' | 'primary' | 'success';
}

const normalizeMoney = (value: unknown, fallback = 0): number =>
  typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : fallback;

const normalizeEmergencyFund = (value: unknown): EmergencyFund => {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return { currentValue: 0 };
  }

  const record = value as Record<string, unknown>;
  const currentValue = normalizeMoney(record.currentValue);
  const targetValue = normalizeMoney(record.targetValue, -1);

  return targetValue > 0 ? { currentValue, targetValue } : { currentValue };
};

/**
 * Input -> Output:
 * - input: none.
 * - output: persisted EmergencyFund snapshot normalized from AppData.
 * Example:
 * const fund = getEmergencyFund();
 */
export const getEmergencyFund = (): EmergencyFund => {
  const snapshot = api.getData();
  return normalizeEmergencyFund(snapshot.emergencyFund);
};

/**
 * Input -> Output:
 * - input: partial EmergencyFund payload.
 * - output: normalized EmergencyFund persisted to AppData.
 * Example:
 * const fund = updateEmergencyFund({ currentValue: 12000, targetValue: 30000 });
 */
export const updateEmergencyFund = (value: EmergencyFund): EmergencyFund => {
  const normalized = normalizeEmergencyFund(value);
  api.updateData('emergencyFund', normalized);
  return normalized;
};

/**
 * Input -> Output:
 * - input: EmergencyFund persisted state + monthly expense baseline.
 * - output: normalized insight payload for runway/progress UI.
 * Example:
 * const insight = getEmergencyFundInsight(fund, 5000);
 */
export const getEmergencyFundInsight = (
  value: EmergencyFund,
  monthlyExpenseBaseline = 0,
): EmergencyFundInsight => {
  const normalized = normalizeEmergencyFund(value);
  const normalizedMonthlyBaseline = normalizeMoney(monthlyExpenseBaseline);
  const explicitTargetValue = normalizeMoney(normalized.targetValue, -1);
  const effectiveTargetValue =
    explicitTargetValue > 0
      ? explicitTargetValue
      : normalizedMonthlyBaseline > 0
        ? normalizedMonthlyBaseline * EMERGENCY_FUND_TARGET_MONTHS
        : null;
  const completionRatio =
    effectiveTargetValue && effectiveTargetValue > 0
      ? normalized.currentValue / effectiveTargetValue
      : null;
  const monthsCovered =
    normalizedMonthlyBaseline > 0 ? normalized.currentValue / normalizedMonthlyBaseline : null;

  let tone: EmergencyFundInsight['tone'] = 'warning';
  if ((completionRatio ?? 0) >= 1 || (monthsCovered ?? 0) >= EMERGENCY_FUND_TARGET_MONTHS) {
    tone = 'success';
  } else if ((completionRatio ?? 0) >= 0.5 || (monthsCovered ?? 0) >= 3) {
    tone = 'primary';
  }

  return {
    completionRatio,
    currentValue: normalized.currentValue,
    effectiveTargetValue,
    hasExplicitTarget: explicitTargetValue > 0,
    monthlyExpenseBaseline: normalizedMonthlyBaseline,
    monthsCovered,
    progressPercent:
      completionRatio === null ? 0 : Math.max(0, Math.min(100, Math.round(completionRatio * 100))),
    tone,
  };
};
