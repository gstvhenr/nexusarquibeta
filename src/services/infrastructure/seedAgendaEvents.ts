import type { AgendaEvent } from '../../types';

/**
 * 10 canonical seed agenda events (Tarefas) for the Kanban board.
 * All are "Pessoal" type, non-recurring, with subtasks.
 */
const SEED_EVENTS: AgendaEvent[] = [
  {
    id: 'seed_event_01',
    title: 'Auditoria de Ecos no Corredor',
    date: '2026-02-02',
    time: '09:00',
    timeEnd: '09:45',
    type: 'Pessoal',
    recurrence: 'none',
    priority: 1,
    kanbanStatus: 'todo',
    subtasks: [
      { id: 'seed_st_01a', title: 'Gritar "Olá?" em três tons diferentes', completed: false },
      {
        id: 'seed_st_01b',
        title: 'Anotar se o eco respondeu algo diferente do que foi dito',
        completed: false,
      },
    ],
  },
  {
    id: 'seed_event_02',
    title: 'Reunião de Pauta com os Móveis',
    date: '2026-02-05',
    time: '14:00',
    timeEnd: '15:30',
    type: 'Pessoal',
    recurrence: 'none',
    priority: 2,
    kanbanStatus: 'in_progress',
    subtasks: [
      {
        id: 'seed_st_02a',
        title: 'Perguntar para a poltrona do cliente Astolfo se o peso do morado está confortável.',
        completed: false,
      },
      { id: 'seed_st_02b', title: 'Oferecer aumento da mesa de centro', completed: false },
      {
        id: 'seed_st_02c',
        title: 'Trocar o estofado por algo que as visitas não julguem.',
        completed: false,
      },
    ],
  },
  {
    id: 'seed_event_03',
    title: 'Calibragem da Realidade Aumentada',
    date: '2026-02-09',
    time: '08:00',
    timeEnd: '08:15',
    type: 'Pessoal',
    recurrence: 'none',
    priority: 3,
    kanbanStatus: 'review',
    subtasks: [
      { id: 'seed_st_03a', title: 'Limpar o vidro com água benta e Windex', completed: false },
    ],
  },
  {
    id: 'seed_event_04',
    title: 'Inventário de Clientes',
    date: '2026-02-12',
    time: '16:00',
    timeEnd: '17:00',
    type: 'Pessoal',
    recurrence: 'none',
    priority: 4,
    kanbanStatus: 'done',
    completed: true,
    subtasks: [
      {
        id: 'seed_st_04a',
        title: 'Checar se não caíram em buracos escondidos pela casa',
        completed: false,
      },
      {
        id: 'seed_st_04b',
        title: 'Fazer um círculo de sal grosso caso aja uma vitima viva.',
        completed: false,
      },
    ],
  },
  {
    id: 'seed_event_05',
    title: 'Teste de Resistência do Tempo',
    date: '2026-02-14',
    time: '10:00',
    timeEnd: '12:00',
    type: 'Pessoal',
    recurrence: 'none',
    priority: 5,
    kanbanStatus: 'review',
    subtasks: [
      {
        id: 'seed_st_05a',
        title: 'Olhar para o relógio fixamente até os ponteiros pararem.',
        completed: false,
      },
      {
        id: 'seed_st_05b',
        title: 'Cronometrar quanto tempo leva para o café esfriar (deve ser instantâneo)',
        completed: false,
      },
      {
        id: 'seed_st_05c',
        title: 'Tentar piscar em código morse para o passado',
        completed: false,
      },
    ],
  },
  {
    id: 'seed_event_06',
    title: 'Tradução de Ruídos do Ar-Condicionado',
    date: '2026-02-17',
    time: '13:50',
    timeEnd: '14:15',
    type: 'Pessoal',
    recurrence: 'none',
    priority: 1,
    kanbanStatus: 'review',
    subtasks: [
      { id: 'seed_st_06a', title: 'Gravar o zumbido das 14h', completed: false },
      {
        id: 'seed_st_06b',
        title: 'Decifrar se é um pedido de manutenção ou uma profecia',
        completed: false,
      },
    ],
  },
  {
    id: 'seed_event_07',
    title: 'Organização de Arquivos por "Vibe"',
    date: '2026-02-20',
    time: '15:00',
    timeEnd: '18:00',
    type: 'Pessoal',
    recurrence: 'none',
    priority: 2,
    kanbanStatus: 'todo',
    subtasks: [
      {
        id: 'seed_st_07a',
        title: 'Colocar documentos tristes na ultima pasta do Google Drive',
        completed: false,
      },
      {
        id: 'seed_st_07b',
        title: 'Arquivar boletos na pasta "NÃO ABRA. É VIRUS."',
        completed: false,
      },
    ],
  },
  {
    id: 'seed_event_08',
    title: 'Fotossíntese Coletiva',
    date: '2026-02-23',
    time: '12:00',
    timeEnd: '12:15',
    type: 'Pessoal',
    recurrence: 'none',
    priority: 3,
    kanbanStatus: 'in_progress',
    subtasks: [
      {
        id: 'seed_st_08a',
        title: 'Estender os braços com os veganos do centro em direção à luz',
        completed: false,
      },
      { id: 'seed_st_08b', title: 'Evitar falar; apenas absorver fótons', completed: false },
    ],
  },
  {
    id: 'seed_event_09',
    title: 'Foco na Leitura',
    date: '2026-02-26',
    time: '19:00',
    timeEnd: '22:00',
    type: 'Pessoal',
    recurrence: 'none',
    priority: 4,
    kanbanStatus: 'todo',
    subtasks: [
      {
        id: 'seed_st_09a',
        title: 'Ler historicos antigos WhatsApp de trás para frente',
        completed: false,
      },
      {
        id: 'seed_st_09b',
        title: 'Restaurar a pontuação e corrigir erros gramáticais encontrados',
        completed: false,
      },
      {
        id: 'seed_st_09c',
        title: 'Mandar mensagem de errata ao destinatário para cada erro encontrado.',
        completed: false,
      },
    ],
  },
  {
    id: 'seed_event_10',
    title: 'Fechamento do Mês',
    date: '2026-02-28',
    time: '23:30',
    timeEnd: '23:59',
    type: 'Pessoal',
    recurrence: 'none',
    priority: 5,
    kanbanStatus: 'todo',
    subtasks: [
      { id: 'seed_st_10a', title: 'Verificar se sobraram dias não utilizados', completed: false },
      {
        id: 'seed_st_10b',
        title: 'Caso aja dia extra, verificar possibilidade de folga.',
        completed: false,
      },
    ],
  },
];

/**
 * Ensures all canonical seed agenda events exist in the given list.
 *
 * Input -> Output:
 * - input: raw agenda events array from localStorage.
 * - output: { events, changed } — list with seeds upserted.
 */
export function applySeedAgendaEvents(rawEvents: AgendaEvent[]): {
  events: AgendaEvent[];
  changed: boolean;
} {
  const list = [...rawEvents];
  let changed = false;

  for (const seed of SEED_EVENTS) {
    const exists = list.some((e) => e.id === seed.id);
    if (!exists) {
      list.push(seed);
      changed = true;
    }
  }

  return { events: list, changed };
}
