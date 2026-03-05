import { describe, expect, it } from 'vitest';
import { POST_IT_COLORS, REMINDER_ROTATIONS, getReminderColorStyle } from './reminderPalette';

describe('reminderPalette', () => {
  it('expõe paleta de cores com estrutura esperada', () => {
    expect(POST_IT_COLORS).toHaveLength(6);
    expect(POST_IT_COLORS[0]).toMatchObject({
      key: 'yellow',
      label: 'Amarelo',
    });
    expect(POST_IT_COLORS[5]).toMatchObject({
      key: 'purple',
      label: 'Roxo',
    });
  });

  it('retorna estilo da cor solicitada ou fallback para primeira cor', () => {
    expect(getReminderColorStyle('green')).toMatchObject({
      key: 'green',
      label: 'Verde',
    });
    expect(getReminderColorStyle('inexistente')).toEqual(POST_IT_COLORS[0]);
  });

  it('expõe lista de rotações para distribuição visual dos post-its', () => {
    expect(REMINDER_ROTATIONS).toHaveLength(8);
    expect(REMINDER_ROTATIONS).toContain('rotate-[-1.5deg]');
    expect(REMINDER_ROTATIONS).toContain('rotate-[2.2deg]');
  });
});
