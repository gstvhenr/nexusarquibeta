// --- Marketing Types ---
export type MarketingBillingFormat = 'Mensal' | 'Semanal' | 'Por Conteúdo' | 'Por Pacote';
export const marketingBillingFormats: MarketingBillingFormat[] = [
  'Mensal',
  'Semanal',
  'Por Conteúdo',
  'Por Pacote',
];

export type MarketingActivityStatus = 'Pendente' | 'Em Andamento' | 'Concluído';
export const marketingActivityStatuses: MarketingActivityStatus[] = [
  'Pendente',
  'Em Andamento',
  'Concluído',
];

export type MarketingContentType =
  | 'Post (Instagram)'
  | 'Carrossel (Instagram)'
  | 'Stories (Instagram)'
  | 'Reels (Instagram)'
  | 'Post (Facebook)'
  | 'Vídeo (Tik Tok)'
  | 'Post (X)'
  | 'Campanha de ADS'
  | 'Atualização de Site'
  | 'Outro';

export const marketingContentTypes: MarketingContentType[] = [
  'Post (Instagram)',
  'Carrossel (Instagram)',
  'Stories (Instagram)',
  'Reels (Instagram)',
  'Post (Facebook)',
  'Vídeo (Tik Tok)',
  'Post (X)',
  'Campanha de ADS',
  'Atualização de Site',
  'Outro',
];

export type SocialNetworkName =
  | 'Facebook'
  | 'Instagram'
  | 'LinkedIn'
  | 'TikTok'
  | 'YouTube'
  | 'Google';

export interface MarketingProfessional {
  id: string;
  name: string;
  email: string;
  phone: string;
  photo?: string;
  billingFormat?: MarketingBillingFormat;
  cost?: number;
  notes?: string;
  servicesOffered?: string[];
}

export interface MarketingActivity {
  id: string;
  title: string;
  description?: string;
  status: MarketingActivityStatus;
  contentType: MarketingContentType;
  dueDate: string | null;
  responsibleId: string;
  linkedProjectId?: string;
  linkedProjectName?: string;
  completionDate?: string | null;
  notes?: string;
  cost?: number;
}

/** Registro manual de métricas do Instagram em um ponto no tempo. */
export interface InstagramSnapshot {
  id: string;
  posts: number;
  followers: number;
  following: number;
  /** ISO date — imutável (data/hora do cadastro). */
  recordedAt: string;
}

export interface SocialNetwork {
  id: SocialNetworkName;
  url: string;
  profileHandle?: string;
  followers?: number;
  notes?: string;
  lastUpdated: string;
  /** Credenciais de acesso à plataforma. */
  credentials?: { username: string; password: string };
  /** Histórico de snapshots do Instagram. */
  instagramSnapshots?: InstagramSnapshot[];
  /** Total acumulado investido em marketing nesta plataforma (BRL). */
  totalInvested?: number;
  /** Data da última postagem na rede (ISO date, apenas data). */
  lastPostDate?: string;
}
