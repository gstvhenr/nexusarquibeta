import { describe, expect, it } from 'vitest';
import { tokens } from './theme';

const parseTokenValue = (rawValue: string): number => {
  if (rawValue === '0') return 0;
  return Number.parseFloat(rawValue.replace('rem', ''));
};

describe('constants/theme', () => {
  it('defines the top-level token groups required by the design system', () => {
    expect(Object.keys(tokens)).toEqual([
      'typography',
      'spacing',
      'borderRadius',
      'shadows',
      'zIndex',
      'transitions',
      'colors',
    ]);
  });

  it('keeps spacing scale monotonic by numeric key order', () => {
    const spacingEntries = Object.entries(tokens.spacing)
      .map(([key, value]) => ({ step: Number(key), value: parseTokenValue(value) }))
      .sort((a, b) => a.step - b.step);

    spacingEntries.forEach((entry, index) => {
      if (index === 0) return;
      expect(entry.value).toBeGreaterThanOrEqual(spacingEntries[index - 1].value);
    });
  });

  it('keeps zIndex layers strictly ordered from hide to tooltip', () => {
    expect(tokens.zIndex.hide).toBeLessThan(tokens.zIndex.base);
    expect(tokens.zIndex.base).toBeLessThan(tokens.zIndex.dropdown);
    expect(tokens.zIndex.dropdown).toBeLessThan(tokens.zIndex.sticky);
    expect(tokens.zIndex.sticky).toBeLessThan(tokens.zIndex.overlay);
    expect(tokens.zIndex.overlay).toBeLessThan(tokens.zIndex.modal);
    expect(tokens.zIndex.modal).toBeLessThan(tokens.zIndex.popover);
    expect(tokens.zIndex.popover).toBeLessThan(tokens.zIndex.toast);
    expect(tokens.zIndex.toast).toBeLessThan(tokens.zIndex.tooltip);
  });

  it('keeps light and dark themes with the same color-token keys', () => {
    const lightKeys = Object.keys(tokens.colors.light).sort();
    const darkKeys = Object.keys(tokens.colors.dark).sort();

    expect(lightKeys).toEqual(darkKeys);
  });

  it('keeps typography and transition contracts stable', () => {
    expect(tokens.typography.fontFamily.sans).toContain('Segoe UI');
    expect(tokens.typography.fontFamily.serif).toContain('Georgia');
    expect(tokens.typography.lineHeight.tight).toBeLessThan(tokens.typography.lineHeight.normal);
    expect(tokens.typography.lineHeight.normal).toBeLessThan(tokens.typography.lineHeight.loose);
    expect(tokens.transitions.duration).toMatch(/^\d+ms$/);
    expect(tokens.transitions.timing).toContain('cubic-bezier');
  });
});
