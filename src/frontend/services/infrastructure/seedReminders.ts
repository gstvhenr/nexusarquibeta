import type { Reminder } from '../../types';

/**
 * 14 canonical seed reminders for the Lembretes board.
 * Colors cycle: yellow, green, blue, pink, orange, purple.
 */
const SEED_REMINDERS: Reminder[] = [
  {
    id: 'seed_reminder_01',
    title: 'Quarto Anestesia',
    comment: 'Paredes revestidas com material de caixa de ovo, mas feito de veludo.',
    remindAt: '2026-02-14T03:12',
    color: 'yellow',
    createdAt: '2026-02-14T03:12:00.000Z',
    pinned: false,
    completedAt: null,
  },
  {
    id: 'seed_reminder_02',
    title: 'Reboco Emocional',
    comment:
      'Textura da parede que muda conforme o humor do dono. Lixa grossa para dias de raiva, seda para dias de pagamento.',
    remindAt: '2026-02-14T04:45',
    color: 'green',
    createdAt: '2026-02-14T04:45:00.000Z',
    pinned: false,
    completedAt: null,
  },
  {
    id: 'seed_reminder_03',
    title: 'Apartamento sob Medida',
    comment:
      'Vender o conceito de "cômodos sob demanda" (Ex: A sala de jantar só existe se o cliente jantar).',
    remindAt: '2026-02-15T09:30',
    color: 'blue',
    createdAt: '2026-02-15T09:30:00.000Z',
    pinned: false,
    completedAt: null,
  },
  {
    id: 'seed_reminder_04',
    title: 'Portas Escondidas',
    comment: 'Esconder as portas de cada cômodo em passagens secretas.',
    remindAt: '2026-02-15T11:15',
    color: 'pink',
    createdAt: '2026-02-15T11:15:00.000Z',
    pinned: false,
    completedAt: null,
  },
  {
    id: 'seed_reminder_05',
    title: 'Sol de Bolso',
    comment: 'Ambientes com lâmpadas que imitam o sol do meio-dia.',
    remindAt: '2026-02-15T16:20',
    color: 'orange',
    createdAt: '2026-02-15T16:20:00.000Z',
    pinned: false,
    completedAt: null,
  },
  {
    id: 'seed_reminder_06',
    title: 'Concreto com fermento',
    comment: 'Misturar fermento no cimento e avaliar com o decorrer do tempo se a casa se expande.',
    remindAt: '2026-02-15T22:00',
    color: 'purple',
    createdAt: '2026-02-15T22:00:00.000Z',
    pinned: false,
    completedAt: null,
  },
  {
    id: 'seed_reminder_07',
    title: 'Cores Que Quase Não Existem',
    comment:
      'Análise de paletas extremamente sutis que transitam entre tons neutros e variações quase imperceptíveis.',
    remindAt: '2026-02-15T23:55',
    color: 'yellow',
    createdAt: '2026-02-15T23:55:00.000Z',
    pinned: false,
    completedAt: null,
  },
  {
    id: 'seed_reminder_08',
    title: 'Arquitetura para Insônias Leves',
    comment:
      'Projeto residencial pensado para favorecer conforto noturno, com iluminação indireta, materiais táteis e isolamento acústico sutil.',
    remindAt: '2026-02-16T01:10',
    color: 'green',
    createdAt: '2026-02-16T01:10:00.000Z',
    pinned: false,
    completedAt: null,
  },
  {
    id: 'seed_reminder_09',
    title: 'Vidro',
    comment:
      'Janelas com vidro de lupas para conseguir ver em zoom brigas que acontecem na rua (Contras: Sol)',
    remindAt: '2026-02-16T01:45',
    color: 'blue',
    createdAt: '2026-02-16T01:45:00.000Z',
    pinned: false,
    completedAt: null,
  },
  {
    id: 'seed_reminder_10',
    title: 'Sombras Para Se Sentir Acolhido',
    comment:
      'Luzes posicionadas para que as sombras da mobília sempre pareçam com a de pessoas reais.',
    remindAt: '2026-02-16T02:00',
    color: 'pink',
    createdAt: '2026-02-16T02:00:00.000Z',
    pinned: false,
    completedAt: null,
  },
  {
    id: 'seed_reminder_11',
    title: 'Piso otimizado para facil limpeza',
    comment:
      'Piso do banheiro não é plano (levemente inclinado em 35 graus), visando favorecer o escorrimento da agua.',
    remindAt: '2026-02-16T14:15',
    color: 'orange',
    createdAt: '2026-02-16T14:15:00.000Z',
    pinned: false,
    completedAt: null,
  },
  {
    id: 'seed_reminder_12',
    title: 'Projeto Verde',
    comment: 'Projeto com a vegetação funcional. Pisos internos subsistidos por grama.',
    remindAt: '2026-02-25T19:15',
    color: 'purple',
    createdAt: '2026-02-25T19:15:00.000Z',
    pinned: false,
    completedAt: null,
  },
  {
    id: 'seed_reminder_13',
    title: 'Piscina acima do quarto',
    comment:
      'Avaliar o teto do quarto de casal em vidro e a piscina logo acima para otimização de espaço. (Avaliar possíveis vazamentos).',
    remindAt: '2026-03-11T15:20',
    color: 'yellow',
    createdAt: '2026-03-11T15:20:00.000Z',
    pinned: false,
    completedAt: null,
  },
  {
    id: 'seed_reminder_14',
    title: 'Móveis Levitantes',
    comment:
      'Usar eletroímãs supercondutores no teto e paredes para fixação dos moveis. Apego conceitual. Moveis apoiados ao chão estão saindo de moda.',
    remindAt: '2026-03-30T18:40',
    color: 'green',
    createdAt: '2026-03-30T18:40:00.000Z',
    pinned: false,
    completedAt: null,
  },
];

/**
 * Ensures all canonical seed reminders exist in the given list.
 *
 * Input -> Output:
 * - input: raw reminder array from localStorage.
 * - output: { reminders, changed } — list with seeds upserted.
 */
export function applySeedReminders(rawReminders: Reminder[]): {
  reminders: Reminder[];
  changed: boolean;
} {
  const list = [...rawReminders];
  let changed = false;

  for (const seed of SEED_REMINDERS) {
    const exists = list.some((r) => r.id === seed.id);
    if (!exists) {
      list.push(seed);
      changed = true;
    }
  }

  return { reminders: list, changed };
}
