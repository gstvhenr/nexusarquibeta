import type { LegacyClientRecord } from './migrations';
import { createSeedClient } from './migrations';

/** Canonical seed client: Gustavo Henrique Geraldo */
const seedGustavo = createSeedClient({
  id: 'seed_client_gustavo',
  Nome: 'Gustavo Henrique Geraldo',
  CPF: '424.940.438-24',
  Email: 'gustavohenrique.dlr@outlook.com',
  Telefone: '(19) 98131-0225',
  WhatsApp: 'Sim',
  Logradouro: 'Rua Arthur de Azevedo',
  Numero: '136',
  Bairro: 'Vila Amorim',
  Cidade: 'Americana',
  Estado: 'SP',
  CEP: '13469-114',
  StatusCliente: 'Potencial Cliente',
  StatusPipeline: 'Contato Inicial',
  FonteLead: 'Instagram',
  ServicosInteresse: 'Design de Interiores',
});

// Extra service interests not supported by single-field seed helper
seedGustavo.serviceInterests = [
  'Design de Interiores',
  'Paisagismo e Jardinagem',
  'Projeto Arquitetônico',
];
seedGustavo.birthDate = '1994-02-25';
seedGustavo.clientType = 'PF';

// --- 10 New Seed Clients (all DDD 19 / SP region) ---

const seedCarlos = createSeedClient({
  id: 'seed_client_carlos_mendes',
  Nome: 'Carlos Eduardo Mendes',
  CPF: '482.719.356-21',
  Email: 'carlos.mendes88@gmail.com',
  Telefone: '(19) 99234-7812',
  WhatsApp: 'Sim',
  Logradouro: 'Rua das Acácias',
  Numero: '245',
  Complemento: 'Apto 32',
  Bairro: 'Jardim Primavera',
  Cidade: 'Campinas',
  Estado: 'SP',
  CEP: '13087-320',
  StatusCliente: 'Cliente Ativo',
  StatusPipeline: 'Obra Iniciada',
  FonteLead: 'Indicação de cliente',
  ServicosInteresse: 'Projeto Arquitetônico',
});
seedCarlos.serviceInterests = [
  'Projeto Arquitetônico',
  'Projeto Executivo de Arquitetura',
  'Gerenciamento e Administração de Obra',
];
seedCarlos.birthDate = '1988-03-14';
seedCarlos.clientType = 'PF';

const seedMariana = createSeedClient({
  id: 'seed_client_mariana_rocha',
  Nome: 'Mariana Alves Rocha',
  CPF: '915.274.638-04',
  Email: 'mariana.rocha93@hotmail.com',
  Telefone: '(19) 98765-4432',
  WhatsApp: 'Sim',
  Logradouro: 'Avenida Brasil',
  Numero: '1578',
  Complemento: 'Sala 45',
  Bairro: 'Centro',
  Cidade: 'Piracicaba',
  Estado: 'SP',
  CEP: '13400-100',
  StatusCliente: 'Potencial Cliente',
  StatusPipeline: 'Proposta',
  FonteLead: 'Instagram',
  ServicosInteresse: 'Design de Interiores',
});
seedMariana.serviceInterests = [
  'Design de Interiores',
  'Projeto Luminotécnico',
  'Detalhamento de Marcenaria',
];
seedMariana.birthDate = '1993-11-22';
seedMariana.clientType = 'PF';

const seedFelipe = createSeedClient({
  id: 'seed_client_felipe_nogueira',
  Nome: 'Felipe Augusto Nogueira',
  CPF: '307.845.129-66',
  Email: 'felipe.nogueira85@yahoo.com.br',
  Telefone: '(19) 99871-2204',
  WhatsApp: 'Sim',
  Logradouro: 'Rua Monte Sinai',
  Numero: '89',
  Complemento: 'Casa',
  Bairro: 'Jardim Europa',
  Cidade: 'Limeira',
  Estado: 'SP',
  CEP: '13480-250',
  StatusCliente: 'Cliente Ativo',
  StatusPipeline: 'Projeto Executivo',
  FonteLead: 'Site',
  ServicosInteresse: 'Projeto Executivo de Arquitetura',
});
seedFelipe.serviceInterests = [
  'Projeto Executivo de Arquitetura',
  'Aprovação de Projetos na Prefeitura',
  'Regularização de Imóvel',
];
seedFelipe.birthDate = '1985-07-09';
seedFelipe.clientType = 'PF';

const seedJuliana = createSeedClient({
  id: 'seed_client_juliana_ferreira',
  Nome: 'Juliana Martins Ferreira',
  CPF: '629.183.547-90',
  Email: 'juliana.martins90@gmail.com',
  Telefone: '(19) 99123-8890',
  WhatsApp: 'Sim',
  Logradouro: 'Rua Barão de Ipanema',
  Numero: '412',
  Complemento: 'Apto 101',
  Bairro: 'Vila Santa Catarina',
  Cidade: 'Rio Claro',
  Estado: 'SP',
  CEP: '13500-032',
  StatusCliente: 'Potencial Cliente',
  StatusPipeline: 'Briefing',
  FonteLead: 'WhatsApp',
  ServicosInteresse: 'Projeto de Reforma',
});
seedJuliana.serviceInterests = ['Projeto de Reforma', 'Design de Interiores'];
seedJuliana.birthDate = '1990-02-18';
seedJuliana.clientType = 'PF';

const seedRodrigo = createSeedClient({
  id: 'seed_client_rodrigo_lima',
  Nome: 'Rodrigo Henrique Lima',
  CPF: '154.792.830-55',
  Email: 'rodrigo.lima79@gmail.com',
  Telefone: '(19) 98122-3344',
  WhatsApp: 'Sim',
  Logradouro: 'Rua dos Ipês',
  Numero: '560',
  Bairro: 'Parque Novo Mundo',
  Cidade: 'Americana',
  Estado: 'SP',
  CEP: '13467-310',
  StatusCliente: 'Cliente Ativo',
  StatusPipeline: 'Finalização',
  FonteLead: 'Indicação de parceiro',
  ServicosInteresse: 'Acompanhamento de Obra',
});
seedRodrigo.serviceInterests = ['Acompanhamento de Obra', 'Gerenciamento e Administração de Obra'];
seedRodrigo.birthDate = '1979-09-30';
seedRodrigo.clientType = 'PF';

const seedPatricia = createSeedClient({
  id: 'seed_client_patricia_duarte',
  Nome: 'Patrícia Gomes Duarte',
  CPF: '873.260.419-73',
  Email: 'patricia.duarte96@gmail.com',
  Telefone: '(19) 99774-1123',
  WhatsApp: 'Sim',
  Logradouro: 'Rua XV de Novembro',
  Numero: '1320',
  Complemento: 'Apto 704',
  Bairro: 'Centro',
  Cidade: 'Indaiatuba',
  Estado: 'SP',
  CEP: '13330-310',
  StatusCliente: 'Potencial Cliente',
  StatusPipeline: 'Enviando Proposta',
  FonteLead: 'Evento',
  ServicosInteresse: 'Projeto Legal (Prefeitura)',
});
seedPatricia.serviceInterests = ['Projeto Legal (Prefeitura)', 'Projeto Arquitetônico'];
seedPatricia.birthDate = '1996-05-05';
seedPatricia.clientType = 'PF';

const seedAndre = createSeedClient({
  id: 'seed_client_andre_carvalho',
  Nome: 'André Luiz Carvalho',
  CPF: '398.274.615-82',
  Email: 'andre.carvalho82@outlook.com',
  Telefone: '(19) 99654-7788',
  WhatsApp: 'Sim',
  Logradouro: 'Rua Dona Laura',
  Numero: '215',
  Complemento: 'Casa',
  Bairro: 'Jardim São Paulo',
  Cidade: 'Valinhos',
  Estado: 'SP',
  CEP: '13270-090',
  StatusCliente: 'Cliente Ativo',
  StatusPipeline: 'Pós-venda',
  FonteLead: 'Indicação de cliente',
  ServicosInteresse: 'Paisagismo e Jardinagem',
});
seedAndre.serviceInterests = ['Paisagismo e Jardinagem', 'Acompanhamento em Lojas'];
seedAndre.birthDate = '1982-12-12';
seedAndre.clientType = 'PF';

const seedCamila = createSeedClient({
  id: 'seed_client_camila_souza',
  Nome: 'Camila Beatriz Souza',
  CPF: '742.951.380-17',
  Email: 'camila.souza94@gmail.com',
  Telefone: '(19) 99433-5566',
  WhatsApp: 'Sim',
  Logradouro: 'Avenida da Saudade',
  Numero: '980',
  Complemento: 'Sala 12',
  Bairro: 'Vila Industrial',
  Cidade: 'Sumaré',
  Estado: 'SP',
  CEP: '13170-030',
  StatusCliente: 'Potencial Cliente',
  StatusPipeline: 'Negociação',
  FonteLead: 'Instagram',
  ServicosInteresse: 'Maquete Eletrônica (Volumetria 3D)',
});
seedCamila.serviceInterests = ['Maquete Eletrônica (Volumetria 3D)', 'Projeto Arquitetônico'];
seedCamila.birthDate = '1994-08-27';
seedCamila.clientType = 'PF';

const seedBruno = createSeedClient({
  id: 'seed_client_bruno_teixeira',
  Nome: 'Bruno Rafael Teixeira',
  CPF: '561.804.297-44',
  Email: 'bruno.teixeira87@gmail.com',
  Telefone: '(19) 99812-6644',
  WhatsApp: 'Sim',
  Logradouro: 'Rua Desembargador Moreira',
  Numero: '402',
  Complemento: 'Apto 1502',
  Bairro: 'Jardim Bela Vista',
  Cidade: "Santa Bárbara d'Oeste",
  Estado: 'SP',
  CEP: '13450-001',
  StatusCliente: 'Cliente Ativo',
  StatusPipeline: 'Serviço Avulso/Parcial',
  FonteLead: 'Site',
  ServicosInteresse: 'Regularização de Imóvel',
});
seedBruno.serviceInterests = ['Regularização de Imóvel'];
seedBruno.birthDate = '1987-01-03';
seedBruno.clientType = 'PF';

const seedLarissa = createSeedClient({
  id: 'seed_client_larissa_faria',
  Nome: 'Larissa Cristina Faria',
  CPF: '284.736.915-08',
  Email: 'larissa.faria91@gmail.com',
  Telefone: '(19) 99145-3322',
  WhatsApp: 'Sim',
  Logradouro: 'Rua Alceu Amoroso Lima',
  Numero: '780',
  Complemento: 'Apto 603',
  Bairro: 'Jardim das Flores',
  Cidade: 'Hortolândia',
  Estado: 'SP',
  CEP: '13184-770',
  StatusCliente: 'Potencial Cliente',
  StatusPipeline: 'Layout Aprovado',
  FonteLead: 'Outro',
  ServicosInteresse: 'Projeto Executivo de Interiores',
});
seedLarissa.serviceInterests = ['Projeto Executivo de Interiores', 'Design de Mobiliário'];
seedLarissa.birthDate = '1991-06-16';
seedLarissa.clientType = 'PF';

// --- All canonical seeds ---
const ALL_SEEDS = [
  seedGustavo,
  seedCarlos,
  seedMariana,
  seedFelipe,
  seedJuliana,
  seedRodrigo,
  seedPatricia,
  seedAndre,
  seedCamila,
  seedBruno,
  seedLarissa,
];

/**
 * Seed sanitization and upsert for client records.
 * Removes obsolete mock/demo clients and ensures canonical seeds exist.
 *
 * Input -> Output:
 * - input: raw client array from localStorage.
 * - output: { clients, changed } — sanitized clients with seeds applied.
 */
export function applySeedClients(rawClients: LegacyClientRecord[]): {
  clients: LegacyClientRecord[];
  changed: boolean;
} {
  const obsoleteIds = new Set([
    'mock_client_gustavo',
    'mock_client_alexandre',
    'mock_client_bruno',
  ]);
  const obsoleteNames = new Set([
    'Gustavo Henrique Geraldo',
    'Alexandre Belfante',
    'Bruno Lacerda',
  ]);

  // 1. Remove obsolete entries
  let clients = rawClients.filter(
    (c) => !obsoleteIds.has(c.id ?? '') && !obsoleteNames.has(c.name ?? ''),
  );
  let changed = clients.length !== rawClients.length;

  // 2. Upsert all canonical seeds
  for (const seed of ALL_SEEDS) {
    const exists = clients.some((c) => c.id === seed.id);
    if (!exists) {
      clients = [seed as unknown as LegacyClientRecord, ...clients];
      changed = true;
    }
  }

  return { clients, changed };
}
