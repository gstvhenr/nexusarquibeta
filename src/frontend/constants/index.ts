import type {
  DocumentStorage,
  PaymentMethod,
  PaymentStatus,
  ProductUnit,
  ProposalStatus,
} from '../types';

export const PROPOSAL_STATUS_CLASSES: Record<ProposalStatus, { text: string; bg: string }> = {
  Pendente: { text: 'text-warning', bg: 'bg-warning/20' },
  'Em Análise': { text: 'text-info', bg: 'bg-info/20' },
  Concluído: { text: 'text-success', bg: 'bg-success/20' },
  Rejeitado: { text: 'text-error', bg: 'bg-error/20' },
};

export const PAYMENT_STATUS_DOT_COLORS: Record<PaymentStatus, string> = {
  'Em dia': 'bg-success',
  Pendente: 'bg-warning',
  'Em Atraso': 'bg-error',
};

export const IDEA_COLORS: { [key: string]: { bg: string; border: string; hover: string } } = {
  yellow: {
    bg: 'bg-warning/10 dark:bg-warning/20',
    border: 'border-warning/30',
    hover: 'hover:border-warning/50',
  },
  blue: {
    bg: 'bg-info/10 dark:bg-info/20',
    border: 'border-info/30',
    hover: 'hover:border-info/50',
  },
  green: {
    bg: 'bg-success/10 dark:bg-success/20',
    border: 'border-success/30',
    hover: 'hover:border-success/50',
  },
  pink: {
    bg: 'bg-error/10 dark:bg-error/20',
    border: 'border-error/30',
    hover: 'hover:border-error/50',
  },
  teal: {
    bg: 'bg-secondary/10 dark:bg-secondary/20',
    border: 'border-secondary/30',
    hover: 'hover:border-secondary/50',
  },
};

export const PAYMENT_METHODS: PaymentMethod[] = [
  'Dinheiro em espécie',
  'Cartão de débito',
  'Cartão de crédito',
  'PIX',
  'Transferência bancária',
  'Boleto bancário',
  'Pagamento Online',
  'Cheque',
];

export const LEAD_SOURCE_OPTIONS = [
  'Não informado',
  'Indicação de cliente',
  'Indicação de parceiro',
  'WhatsApp',
  'Instagram',
  'Site',
  'Evento',
  'Briefing Interno',
  'Outro',
];

export const SERVICE_INTEREST_OPTIONS = [
  'Acompanhamento de Obra',
  'Acompanhamento em Lojas',
  'Aprovação de Projetos em Condomínio',
  'Aprovação de Projetos na Prefeitura',
  'Assessoria',
  'Consultoria',
  'Desdobro ou Desmembramento de Lotes',
  'Design de Interiores',
  'Design de Mobiliário',
  'Detalhamento de Marcenaria',
  'Gerenciamento e Administração de Obra',
  'Maquete Eletrônica (Volumetria 3D)',
  'Paisagismo e Jardinagem',
  'Projeto Arquitetônico',
  'Projeto de Reforma',
  'Projeto Executivo de Arquitetura',
  'Projeto Executivo de Interiores',
  'Projeto Legal (Prefeitura)',
  'Projeto Luminotécnico',
  'Regularização de Imóvel',
  'Unificação de Lotes (Remembramento)',
];

export const PIPELINE_STATUS_OPTIONS = [
  'Contato Inicial',
  'Briefing',
  'Proposta',
  'Enviando Proposta',
  'Negociação',
  'Layout Aprovado',
  'Projeto Executivo',
  'Obra Iniciada',
  'Finalização',
  'Pós-venda',
  'Serviço Avulso/Parcial',
];

export const SUPPLIER_CATEGORY_OPTIONS = [
  'Iluminação',
  'Marcenaria',
  'Marmoraria',
  'Revestimentos',
  'Mobiliário',
  'Decoração',
  'Vidraçaria',
  'Serralheria',
  'Gesso e Drywall',
  'Elétrica',
  'Hidráulica',
  'Paisagismo',
  'Automação',
  'Materiais de Construção',
  'Toldos e Coberturas',
  'Ar Condicionado',
  'Esquadrias',
  'Papelaria',
  'Outros',
];

export const PRODUCT_UNIT_OPTIONS: ProductUnit[] = ['m²', 'm³', 'un', 'pç'];

export const FREELANCER_SPECIALTIES = [
  'Projeto Executivo',
  'Modelagem 3D',
  'Renderização',
  'Projeto Luminotécnico',
  'Detalhamento de Marcenaria',
  'Paisagismo',
  'Aprovação em Prefeitura',
  'Design de Interiores Comerciais',
  'Consultoria Técnica',
  'Levantamento Arquitetônico',
  'Compatibilização de Projetos',
  'Orçamentação de Obra',
  'Fotografia de Arquitetura',
  'Outros',
];

export const PROSPECT_ORIGIN_OPTIONS = [
  'Instagram',
  'Facebook',
  'LinkedIn',
  'Indicação de Cliente',
  'Indicação de Parceiro',
  'Evento',
  'Site',
  'Pessoalmente',
  'Outro',
];

export const PROSPECT_INTEREST_OPTIONS = [
  'Residencial',
  'Comercial',
  'Reforma',
  'Design de Interiores',
  'Consultoria',
  'Projeto Completo',
  'Regularização',
  'Outro',
];

export const initialDocumentStorage: DocumentStorage = {
  personal: {
    id: 'personal-root',
    name: 'Meus Documentos',
    type: 'folder',
    children: [],
    dateAdded: new Date().toISOString(),
    dateModified: new Date().toISOString(),
  },
  projects: {
    id: 'projects-root',
    name: 'Documentos de Projetos',
    type: 'folder',
    children: [],
    dateAdded: new Date().toISOString(),
    dateModified: new Date().toISOString(),
  },
};

export {
  NAV_LINKS,
  SETTINGS_LINK,
  PROJECT_STATUS_COLORS,
  SOCIAL_NETWORKS_SUPPORTED,
  EXPENSE_CATEGORY_COLORS,
  RECEIVABLE_SOURCE_COLORS,
} from './ui';
