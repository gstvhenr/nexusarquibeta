import type { Prospect } from '../../types';

/**
 * 3 canonical seed prospects for the Prospects board.
 */
const SEED_PROSPECTS: Prospect[] = [
  {
    id: 'seed_prospect_01',
    name: 'Sóestou Dando Uma Olhadinha da Silva',
    phone: '(19) 99911-9911',
    email: '',
    social: 'MySpace: @SóEstouVendo',
    origin: 'Outro',
    interest: 'Residencial',
    priority: 'Média',
    status: 'Em Aberto',
    followUpDays: 30,
    startDate: '2026-02-14',
    createdAt: '2026-02-14T04:45:00.000Z',
    notes:
      'Sóestou adentrou o escritou, olhou em volta, e foi embora. Sondar melhor nas redes sociais para prospecção.',
  },
  {
    id: 'seed_prospect_02',
    name: 'Pedesconto Emtudo Gomes',
    phone: '(19) 98765-4321',
    email: 've_se_tem_como_fazer_mais_em_conta@hotmail.com',
    social: '',
    origin: 'Pessoalmente',
    interest: 'Regularização',
    priority: 'Baixa',
    status: 'Em Aberto',
    followUpDays: 15,
    startDate: '2026-02-14',
    createdAt: '2026-02-14T04:45:00.000Z',
    notes:
      'O cliente entrou pedindo desconto no preço do m² e logo após perguntou qual seria o valor.',
  },
  {
    id: 'seed_prospect_03',
    name: 'Taiscondida Pereira',
    phone: '',
    email: '',
    social: '',
    origin: 'Indicação de Parceiro',
    interest: 'Comercial',
    priority: 'Média',
    status: 'Em Aberto',
    followUpDays: 25,
    startDate: '2026-02-14',
    createdAt: '2026-02-14T04:45:00.000Z',
    notes:
      'Quase cliente avisou que iria fechar negocio há 3 anos mas ainda não entrou em contato. Paradeiro não localizado.',
  },
];

/**
 * Ensures all canonical seed prospects exist in the given list.
 *
 * Input -> Output:
 * - input: raw prospect array from localStorage.
 * - output: { prospects, changed } — list with seeds upserted.
 */
export function applySeedProspects(rawProspects: Prospect[]): {
  prospects: Prospect[];
  changed: boolean;
} {
  const list = [...rawProspects];
  let changed = false;

  for (const seed of SEED_PROSPECTS) {
    const exists = list.some((p) => p.id === seed.id);
    if (!exists) {
      list.push(seed);
      changed = true;
    }
  }

  return { prospects: list, changed };
}
