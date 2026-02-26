// --- Cash Box (Gestão de Caixa) Domain Types ---

/** Origin determines which category set is available. */
export type CashBoxOrigin = 'Profissional' | 'Pessoal';

/** Professional-origin categories. */
export type CashBoxProfessionalCategory =
  | 'Transporte e Mobilidade'
  | 'Desenvolvimento'
  | 'Diversos'
  | 'Escritório'
  | 'Equipamentos'
  | 'Relacionamentos Profissionais'
  | 'Investimentos'
  | 'Marketing'
  | 'Operacional'
  | 'Softwares'
  | 'Tributos e Taxas';

/** Personal-origin categories. */
export type CashBoxPersonalCategory =
  | 'Alimentação'
  | 'Desenvolvimento'
  | 'Diversos'
  | 'Finanças e Impostos'
  | 'Habitação'
  | 'Lazer, Social e Cultura'
  | 'Pets'
  | 'Recursos e Equipamento'
  | 'Relacionamentos'
  | 'Saúde e Medicamentos'
  | 'Seguros'
  | 'Transporte e Mobilidade'
  | 'Uso Pessoal'
  | 'Vestuário';

/** Union of all cash box categories. */
export type CashBoxCategory = CashBoxProfessionalCategory | CashBoxPersonalCategory;

/** Recurrence mode for an expense. */
export type CashBoxRecurrence = 'Única' | 'Parcelada' | 'Indeterminada';

/** Runtime list constants for Professional categories. */
export const cashBoxProfessionalCategories: CashBoxProfessionalCategory[] = [
  'Transporte e Mobilidade',
  'Desenvolvimento',
  'Diversos',
  'Escritório',
  'Equipamentos',
  'Relacionamentos Profissionais',
  'Investimentos',
  'Marketing',
  'Operacional',
  'Softwares',
  'Tributos e Taxas',
];

/** Runtime list constants for Personal categories. */
export const cashBoxPersonalCategories: CashBoxPersonalCategory[] = [
  'Alimentação',
  'Desenvolvimento',
  'Diversos',
  'Finanças e Impostos',
  'Habitação',
  'Lazer, Social e Cultura',
  'Pets',
  'Recursos e Equipamento',
  'Relacionamentos',
  'Saúde e Medicamentos',
  'Seguros',
  'Transporte e Mobilidade',
  'Uso Pessoal',
  'Vestuário',
];

/** Items available per professional category. */
export const cashBoxProfessionalItems: Record<CashBoxProfessionalCategory, string[]> = {
  'Transporte e Mobilidade': ['Combustível', 'Gastos com Transporte', 'Pedágio', 'Viagens a Obra'],
  Desenvolvimento: [
    'Certificações Profissionais',
    'Cursos e Especializações',
    'Livros e Publicações Técnicas',
    'Workshops e Palestras',
  ],
  Diversos: ['Demais Pagamentos', 'Outros'],
  Escritório: [
    'Aluguel do Escritório',
    'Café e Copa',
    'Conta e/ou Botijão de Gás',
    'Demais Gastos Escritório',
    'Impressão e/ou Gráfica',
    'Internet e Telefone',
    'Limpeza e Manutenção',
    'Material de Escritório',
  ],
  Equipamentos: [
    'Câmera Fotográfica',
    'Equipamento Profissional',
    'Equipamento (Notebook/Computador)',
    'Equipamento (Outros)',
    'Equipamento (Periféricos)',
    'Equipamento (Smartphone)',
    'Impressora / Plotter',
    'Tablet',
    'Trena Laser / Medidor',
  ],
  'Relacionamentos Profissionais': [
    'Almoço/Jantar com Clientes',
    'Eventos Profissionais',
    'Networking e Associações',
    'Presentes para Clientes',
  ],
  Investimentos: ['Dívidas', 'Empréstimos', 'Investimentos'],
  Marketing: [
    'Brindes para Clientes',
    'Cartão de Visita / Papelaria',
    'Fotografia de Projeto',
    'Marketing',
    'Redes Sociais (Patrocínio)',
    'Tour Virtual / Drone',
  ],
  Operacional: [
    'Advogado',
    'Amostra de Materiais',
    'Contabilidade',
    'Freelancers / Terceirizados',
    'Jurídico',
    'Maquete Física',
    'Material de Trabalho',
    'Motoboy / Entregas',
    'Serviços Externos',
    'Suprimentos',
  ],
  Softwares: [
    'Adobe Creative Cloud',
    'Armazenamento em Nuvem',
    'AutoCAD / Revit (Licença)',
    'Domínio e Hospedagem (Site)',
    'Ferramentas de IA (Mensalidade)',
    'Lumion / Enscape (Renderização)',
    'SketchUp (Licença)',
    'Trello / Asana / Monday (Gestão)',
  ],
  'Tributos e Taxas': ['Impostos e/ou taxas', 'Juros e/ou Multa'],
};

/** Items available per personal category. */
export const cashBoxPersonalItems: Record<CashBoxPersonalCategory, string[]> = {
  Alimentação: ['Alimentação', 'Café', 'Delivery', 'Mercado', 'Padaria', 'Restaurante'],
  Desenvolvimento: ['Cursos Online', 'Educação', 'Livros'],
  Diversos: ['Doações', 'Multas de Trânsito', 'Outros', 'Taxas Bancárias'],
  'Finanças e Impostos': [
    'Aposentadoria',
    'Assinaturas',
    'Cartão de crédito',
    'Impostos e/ou taxas',
    'Investimentos',
    'IPVA e licenciamento',
    'Juros e/ou Multa',
    'Pagamento de Financiamento (Carro)',
    'Pagamento de Financiamento (Casa)',
  ],
  Habitação: [
    'Acessórios para Casa',
    'Aluguel',
    'Coleta de lixo',
    'Condomínio',
    'Conta de Água e esgoto',
    'Conta de Energia Elétrica',
    'Conta de Internet Fixa',
    'Conta de Plano Móvel',
    'Conta e/ou Botijão de Gás',
    'Diarista',
    'IPTU',
    'Itens Decorativos',
    'Manutenção ou reparos',
    'Moradia',
    'Móveis',
    'Telefone',
    'TV a cabo',
  ],
  'Lazer, Social e Cultura': [
    'Cinema',
    'Entretenimento',
    'Eventos Culturais',
    'Hobbies',
    'Hotel',
    'Lazer',
    'Motel',
    'Shows',
    'Teatro',
    'Viagem',
  ],
  Pets: [
    'Pets (Banho/Tosa)',
    'Pets (Medicamento)',
    'Pets (Outros)',
    'Pets (Ração)',
    'Pets (Veterinário)',
  ],
  'Recursos e Equipamento': [
    'Celular',
    'Computador',
    'Eletrodomésticos',
    'Eletrônicos',
    'Notebook',
  ],
  Relacionamentos: ['Comemorações', 'Eventos Sociais', 'Família', 'Festas', 'Presentes'],
  'Saúde e Medicamentos': [
    'Academia',
    'Cuidados Pessoais',
    'Dentista',
    'Exames Médicos',
    'Lentes',
    'Médico Particular',
    'Óculos',
    'Plano de Saúde',
    'Plano Odontológico',
    'Psicólogo',
    'Remédios e/ou Medicamentos',
    'Saúde',
    'Terapia',
  ],
  Seguros: ['Seguro (Demais)', 'Seguro de vida', 'Seguro do Carro'],
  'Transporte e Mobilidade': [
    'Acessórios para o Carro',
    'Combustível',
    'Lavagem do Carro',
    'Manutenção do Carro',
    'Taxas de estacionamento',
    'Transporte',
    'Transporte por Aplicativo',
  ],
  'Uso Pessoal': [
    'Barbearia',
    'Compras Pessoais',
    'Cosméticos',
    'Higiene Pessoal',
    'Itens de Uso Íntimo',
    'Perfumes',
    'Salão de Beleza',
  ],
  Vestuário: ['Acessórios', 'Roupas Esportivas', 'Tênis/Sapatos', 'Vestuário'],
};

/** Recurrence options list. */
export const cashBoxRecurrences: CashBoxRecurrence[] = ['Única', 'Parcelada', 'Indeterminada'];

// ── Credit Categories & Items ───────────────────────────────────────

/** Professional-origin credit categories. */
export type CashBoxCreditProfessionalCategory =
  | 'Honorários'
  | 'Consultoria'
  | 'Reembolso Profissional'
  | 'Comissões'
  | 'Rendimentos'
  | 'Outros Profissional';

/** Personal-origin credit categories. */
export type CashBoxCreditPersonalCategory =
  | 'Salário e Renda'
  | 'Investimentos'
  | 'Reembolso Pessoal'
  | 'Vendas'
  | 'Presentes e Doações'
  | 'Outros Pessoal';

/** Union of all credit categories. */
export type CashBoxCreditCategory =
  | CashBoxCreditProfessionalCategory
  | CashBoxCreditPersonalCategory;

/** Runtime list constants for Professional credit categories. */
export const cashBoxCreditProfessionalCategories: CashBoxCreditProfessionalCategory[] = [
  'Honorários',
  'Consultoria',
  'Reembolso Profissional',
  'Comissões',
  'Rendimentos',
  'Outros Profissional',
];

/** Runtime list constants for Personal credit categories. */
export const cashBoxCreditPersonalCategories: CashBoxCreditPersonalCategory[] = [
  'Salário e Renda',
  'Investimentos',
  'Reembolso Pessoal',
  'Vendas',
  'Presentes e Doações',
  'Outros Pessoal',
];

/** Items available per professional credit category. */
export const cashBoxCreditProfessionalItems: Record<CashBoxCreditProfessionalCategory, string[]> = {
  Honorários: [
    'Pagamento de Projeto',
    'Parcela de Contrato',
    'Adiantamento de Cliente',
    'Medição de Obra',
    'Taxa de Aprovação',
  ],
  Consultoria: [
    'Consultoria Técnica',
    'Laudo / Parecer Técnico',
    'Acompanhamento de Obra',
    'Visita Técnica',
  ],
  'Reembolso Profissional': [
    'Reembolso de Despesa',
    'Devolução de Fornecedor',
    'Reembolso de Viagem',
    'Estorno Bancário',
  ],
  Comissões: ['Comissão de Indicação', 'Comissão de Parceiro', 'Bônus de Performance'],
  Rendimentos: [
    'Rendimento de Aplicação',
    'Dividendos',
    'Juros Recebidos',
    'Aluguel de Imóvel Comercial',
  ],
  'Outros Profissional': ['Prêmio / Bonificação', 'Patrocínio Recebido', 'Outros'],
};

/** Items available per personal credit category. */
export const cashBoxCreditPersonalItems: Record<CashBoxCreditPersonalCategory, string[]> = {
  'Salário e Renda': ['Salário', 'Pró-Labore', 'Renda Extra', '13° Salário', 'Férias', 'PLR'],
  Investimentos: [
    'Resgate de Investimento',
    'Rendimento de Poupança',
    'Dividendos de Ações',
    'Rendimento de Fundo',
    'Venda de Criptomoeda',
  ],
  'Reembolso Pessoal': [
    'Reembolso de Seguro',
    'Reembolso de Plano de Saúde',
    'Reembolso de Compra',
    'Restituição IR',
    'Estorno de Cartão',
  ],
  Vendas: ['Venda de Objeto Pessoal', 'Venda de Veículo', 'Venda de Imóvel', 'Venda Online'],
  'Presentes e Doações': ['Presente Recebido', 'Doação Recebida', 'Herança'],
  'Outros Pessoal': ['Empréstimo Recebido', 'Devolução', 'Outros'],
};

/**
 * A single cash-box expense entry (persisted instance).
 * For recurring/installment expenses, one record is stored per due date.
 * `recurringGroupId` links all installments in a group.
 */
export interface CashBoxExpense {
  id: string;
  origin: CashBoxOrigin;
  category: CashBoxCategory;
  /** Sub-item within the category. */
  item: string | null;
  recurrence: CashBoxRecurrence;
  dueDate: string; // ISO date string (YYYY-MM-DD)
  /** Date the expense was actually paid. Determines the financial period. */
  paymentDate: string | null; // ISO date string (YYYY-MM-DD)
  value: number;
  /** For installment expenses, which installment number (1-based). */
  installmentNumber: number | null;
  /** For installment expenses, total installments count. */
  installmentTotal: number | null;
  /** Groups recurring/installment entries together. */
  recurringGroupId: string | null;
  createdAt: string; // ISO datetime string
}

/**
 * A single cash-box credit entry (income / balance addition).
 * Simpler than expenses — no recurrence or installments.
 */
export interface CashBoxCredit {
  id: string;
  origin: CashBoxOrigin;
  /** Credit category (e.g. 'Honorários', 'Salário e Renda'). */
  category: CashBoxCreditCategory;
  /** Sub-item within the category. */
  item: string | null;
  /** Free-text description of the credit source. */
  description: string;
  /** Expected date for the credit. */
  date: string; // ISO date string (YYYY-MM-DD)
  value: number;
  /** Whether the credit has been confirmed as received. */
  confirmed: boolean;
  createdAt: string; // ISO datetime string
}
