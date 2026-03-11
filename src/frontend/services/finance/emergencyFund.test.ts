import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AppData } from '../../types';
import {
  EMERGENCY_FUND_TARGET_MONTHS,
  getEmergencyFund,
  getEmergencyFundInsight,
  updateEmergencyFund,
} from './emergencyFund';

const { mockGetData, mockUpdateData } = vi.hoisted(() => ({
  mockGetData: vi.fn<() => AppData>(),
  mockUpdateData: vi.fn<(key: keyof AppData, value: unknown) => void>(),
}));

vi.mock('../infrastructure/api', () => ({
  api: {
    getData: mockGetData,
    updateData: mockUpdateData,
  },
}));

const makeSnapshot = (partial: Partial<AppData> = {}): AppData =>
  ({
    emergencyFund: { currentValue: 0 },
    ...partial,
  }) as unknown as AppData;

describe('emergencyFund service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetData.mockReturnValue(makeSnapshot());
    mockUpdateData.mockReturnValue(undefined);
  });

  it('returns a normalized emergency fund snapshot', () => {
    mockGetData.mockReturnValue(
      makeSnapshot({
        emergencyFund: {
          currentValue: 18000,
          targetValue: -5000,
        },
      }),
    );

    expect(getEmergencyFund()).toEqual({ currentValue: 18000 });
  });

  it('persists the normalized emergency fund through AppData', () => {
    const result = updateEmergencyFund({
      currentValue: 12000,
      targetValue: -1,
    });

    expect(result).toEqual({ currentValue: 12000 });
    expect(mockUpdateData).toHaveBeenCalledWith('emergencyFund', { currentValue: 12000 });
  });

  it('builds insight from an explicit target and monthly baseline', () => {
    const insight = getEmergencyFundInsight(
      {
        currentValue: 24000,
        targetValue: 30000,
      },
      8000,
    );

    expect(insight.hasExplicitTarget).toBe(true);
    expect(insight.progressPercent).toBe(80);
    expect(insight.monthsCovered).toBe(3);
    expect(insight.tone).toBe('primary');
  });

  it('infers a 6-month target when no target is configured', () => {
    const insight = getEmergencyFundInsight(
      {
        currentValue: 12000,
      },
      4000,
    );

    expect(insight.hasExplicitTarget).toBe(false);
    expect(insight.effectiveTargetValue).toBe(4000 * EMERGENCY_FUND_TARGET_MONTHS);
    expect(insight.completionRatio).toBeCloseTo(0.5, 4);
    expect(insight.progressPercent).toBe(50);
    expect(insight.monthsCovered).toBe(3);
  });
});
