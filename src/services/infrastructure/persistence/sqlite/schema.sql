-- ==========================================================================
-- Nexus-Arqui — SQLite Schema v1
-- ==========================================================================
-- Este arquivo define TODAS as tabelas do banco de dados.
-- Cada entidade do AppData possui sua própria tabela.
-- Padrão: JSON Column Store (dados armazenados como JSON TEXT).
-- ==========================================================================

-- Versionamento do schema
CREATE TABLE IF NOT EXISTS schema_meta (
  version    INTEGER NOT NULL DEFAULT 1,
  migrated_at INTEGER NOT NULL DEFAULT (strftime('%s','now') * 1000)
);

-- Configurações escalares do sistema
CREATE TABLE IF NOT EXISTS system_config (
  key        TEXT    PRIMARY KEY NOT NULL,
  value      TEXT    NOT NULL,
  updated_at INTEGER NOT NULL DEFAULT (strftime('%s','now') * 1000)
);

-- ==========================================================================
-- Entidades de Negócio (JSON Column Store — uma linha por registro)
-- ==========================================================================

CREATE TABLE IF NOT EXISTS clients (
  id         TEXT    PRIMARY KEY NOT NULL,
  data       TEXT    NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS projects (
  id         TEXT    PRIMARY KEY NOT NULL,
  data       TEXT    NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS proposals (
  id         TEXT    PRIMARY KEY NOT NULL,
  data       TEXT    NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS suppliers (
  id         TEXT    PRIMARY KEY NOT NULL,
  data       TEXT    NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS products (
  id         TEXT    PRIMARY KEY NOT NULL,
  data       TEXT    NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS supplier_product_prices (
  id         TEXT    PRIMARY KEY NOT NULL,
  data       TEXT    NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS quotations (
  id         TEXT    PRIMARY KEY NOT NULL,
  data       TEXT    NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS commissions (
  id         TEXT    PRIMARY KEY NOT NULL,
  data       TEXT    NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS marketing_professionals (
  id         TEXT    PRIMARY KEY NOT NULL,
  data       TEXT    NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS marketing_activities (
  id         TEXT    PRIMARY KEY NOT NULL,
  data       TEXT    NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS marketing_ideas (
  id         TEXT    PRIMARY KEY NOT NULL,
  data       TEXT    NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS social_networks (
  id         TEXT    PRIMARY KEY NOT NULL,
  data       TEXT    NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS freelancers (
  id         TEXT    PRIMARY KEY NOT NULL,
  data       TEXT    NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS agenda_events (
  id         TEXT    PRIMARY KEY NOT NULL,
  data       TEXT    NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS manual_expenses (
  id         TEXT    PRIMARY KEY NOT NULL,
  data       TEXT    NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS manual_incomes (
  id         TEXT    PRIMARY KEY NOT NULL,
  data       TEXT    NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS prospects (
  id         TEXT    PRIMARY KEY NOT NULL,
  data       TEXT    NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS hired_services (
  id         TEXT    PRIMARY KEY NOT NULL,
  data       TEXT    NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS cash_box_expenses (
  id         TEXT    PRIMARY KEY NOT NULL,
  data       TEXT    NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS cash_box_credits (
  id         TEXT    PRIMARY KEY NOT NULL,
  data       TEXT    NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS reminders (
  id         TEXT    PRIMARY KEY NOT NULL,
  data       TEXT    NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS accepted_payment_methods (
  id         TEXT    PRIMARY KEY NOT NULL,
  data       TEXT    NOT NULL,
  updated_at INTEGER NOT NULL
);

-- ==========================================================================
-- Backups automáticos
-- ==========================================================================

CREATE TABLE IF NOT EXISTS automatic_backups (
  id         TEXT    PRIMARY KEY NOT NULL,
  created_at INTEGER NOT NULL,
  payload    TEXT    NOT NULL,
  size_bytes INTEGER NOT NULL,
  hash       TEXT    NOT NULL,
  reason     TEXT    NOT NULL DEFAULT 'auto'
);

-- ==========================================================================
-- Preferências de UI
-- ==========================================================================

CREATE TABLE IF NOT EXISTS ui_preferences (
  key        TEXT    PRIMARY KEY NOT NULL,
  value      TEXT    NOT NULL,
  updated_at INTEGER NOT NULL DEFAULT (strftime('%s','now') * 1000)
);
