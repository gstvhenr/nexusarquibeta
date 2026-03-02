-- ==========================================================================
-- Nexus-Arqui — PRAGMAs de Durabilidade
-- ==========================================================================
-- Configurações aplicadas na inicialização do banco para MÁXIMA segurança
-- contra perda de dados. Priorizamos durabilidade sobre performance.
-- ==========================================================================

PRAGMA journal_mode = WAL;
PRAGMA synchronous = FULL;
PRAGMA wal_autocheckpoint = 100;
PRAGMA busy_timeout = 5000;
PRAGMA foreign_keys = ON;
PRAGMA auto_vacuum = INCREMENTAL;
PRAGMA cache_size = -2000;
PRAGMA temp_store = MEMORY;
