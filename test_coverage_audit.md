# 📊 Test Coverage Audit — Nexus-Arqui

> Gerado automaticamente em: **2026-03-05**
> Base: `src/frontend/` · **344 arquivos** de produção · **274 arquivos** de teste

---

## Legenda

| Símbolo       | Significado                                       |
| ------------- | ------------------------------------------------- |
| ✅            | Possui testes                                     |
| ❌            | Sem testes                                        |
| **Qualidade** | `—` N/A · `🟡 Médio` · `🟢 Alto` · `⭐ Excelente` |

> **Nota:** arquivos `index.ts` (barrels) e `types.ts` puros são marcados como `—` (N/A).

---

## 1. 🧰 Utils

| Qualidade    | Arquivo                      | Testes |
| ------------ | ---------------------------- | ------ |
| ⭐ Excelente | `utils/addendumUtils.ts`     | ✅     |
| ⭐ Excelente | `utils/addendumWorkflow.ts`  | ✅     |
| ⭐ Excelente | `utils/budgetHelpers.ts`     | ✅     |
| ⭐ Excelente | `utils/documents.ts`         | ✅     |
| ⭐ Excelente | `utils/formatters.ts`        | ✅     |
| ⭐ Excelente | `utils/projectFinancials.ts` | ✅     |
| ⭐ Excelente | `utils/prospectUtils.ts`     | ✅     |
| ⭐ Excelente | `utils/supplierHelpers.ts`   | ✅     |
| ⭐ Excelente | `utils/taskUtils.ts`         | ✅     |
| ⭐ Excelente | `utils/tree.ts`              | ✅     |

**Cobertura:** 10/10 (100%) ✅

---

## 2. 🔗 Hooks

| Qualidade    | Arquivo                           | Testes |
| ------------ | --------------------------------- | ------ |
| ⭐ Excelente | `hooks/useAutoReset.ts`           | ✅     |
| ⭐ Excelente | `hooks/useClientFormHandlers.ts`  | ✅     |
| ⭐ Excelente | `hooks/useClienteDetalhesForm.ts` | ✅     |
| ⭐ Excelente | `hooks/useClienteLinks.ts`        | ✅     |
| ⭐ Excelente | `hooks/useClienteMeetings.ts`     | ✅     |
| ⭐ Excelente | `hooks/useDisclosure.ts`          | ✅     |
| ⭐ Excelente | `hooks/useFinanceSeriesPage.ts`   | ✅     |
| ⭐ Excelente | `hooks/useLegacyCleanup.ts`       | ✅     |
| ⭐ Excelente | `hooks/useLocalStorage.ts`        | ✅     |
| ⭐ Excelente | `hooks/useNavigation.ts`          | ✅     |
| ⭐ Excelente | `hooks/useProjectChecklist.ts`    | ✅     |
| ⭐ Excelente | `hooks/useProjectFinancials.ts`   | ✅     |
| ⭐ Excelente | `hooks/useReportData.ts`          | ✅     |
| ⭐ Excelente | `hooks/useUndoRedo.ts`            | ✅     |
| ⭐ Excelente | `hooks/useUnifiedEvents.ts`       | ✅     |
| — (barrel)   | `hooks/index.ts`                  | —      |

**Cobertura:** 15/15 funcionais (100%) ✅

---

## 3. ⚙️ Services — Raiz

| Qualidade    | Arquivo                                     | Testes |
| ------------ | ------------------------------------------- | ------ |
| ⭐ Excelente | `services/agendaService.ts`                 | ✅     |
| ⭐ Excelente | `services/cashBoxService.ts`                | ✅     |
| ⭐ Excelente | `services/clientExportService.ts`           | ✅     |
| ⭐ Excelente | `services/clientFinancialSummaryService.ts` | ✅     |
| ⭐ Excelente | `services/clientService.ts`                 | ✅     |
| ⭐ Excelente | `services/dashboardFocusItems.ts`           | ✅     |
| ⭐ Excelente | `services/dashboardService.ts`              | ✅     |
| ⭐ Excelente | `services/financeService.ts`                | ✅     |
| ⭐ Excelente | `services/proposalService.ts`               | ✅     |
| ⭐ Excelente | `services/reportService.ts`                 | ✅     |

**Cobertura:** 10/10 (100%) ✅

---

## 4. 💰 Services — Finance

| Qualidade    | Arquivo                                     | Testes |
| ------------ | ------------------------------------------- | ------ |
| ⭐ Excelente | `services/finance/financeShared.ts`         | ✅     |
| ⭐ Excelente | `services/finance/financeUnifiedEntries.ts` | ✅     |
| — (barrel)   | `services/finance/index.ts`                 | —      |

**Cobertura:** 2/2 funcionais (100%) ✅

---

## 5. 🏗️ Services — Infrastructure

| Qualidade    | Arquivo                                          | Testes |
| ------------ | ------------------------------------------------ | ------ |
| ⭐ Excelente | `services/infrastructure/api.ts`                 | ✅     |
| ⭐ Excelente | `services/infrastructure/autoBackupService.ts`   | ✅     |
| ⭐ Excelente | `services/infrastructure/importExport.ts`        | ✅     |
| ⭐ Excelente | `services/infrastructure/indexedDbService.ts`    | ✅     |
| ⭐ Excelente | `services/infrastructure/loadData.ts`            | ✅     |
| ⭐ Excelente | `services/infrastructure/migrations.ts`          | ✅     |
| ⭐ Excelente | `services/infrastructure/seedAgendaEvents.ts`    | ✅     |
| ⭐ Excelente | `services/infrastructure/seedData.ts`            | ✅     |
| ⭐ Excelente | `services/infrastructure/seedProspects.ts`       | ✅     |
| ⭐ Excelente | `services/infrastructure/seedReminders.ts`       | ✅     |
| ⭐ Excelente | `services/infrastructure/storageQuotaService.ts` | ✅     |
| ⭐ Excelente | `services/infrastructure/storageService.ts`      | ✅     |
| ⭐ Excelente | `services/infrastructure/uiPreferenceService.ts` | ✅     |
| — (barrel)   | `services/infrastructure/index.ts`               | —      |

**Cobertura:** 13/13 funcionais (100%) ✅

---

## 6. 🗄️ Services — Persistence

| Qualidade    | Arquivo                                                              | Testes |
| ------------ | -------------------------------------------------------------------- | ------ |
| ⭐ Excelente | `services/infrastructure/persistence/createPersistenceAdapter.ts`    | ✅     |
| ⭐ Excelente | `services/infrastructure/persistence/IndexedDbPersistenceAdapter.ts` | ✅     |
| ⭐ Excelente | `services/infrastructure/persistence/PersistencePort.ts`             | ✅     |
| ⭐ Excelente | `services/infrastructure/persistence/SqlitePersistenceAdapter.ts`    | ✅     |
| ⭐ Excelente | `services/infrastructure/persistence/sqlite/sqliteMigrations.ts`     | ✅     |
| ⭐ Excelente | `services/infrastructure/persistence/sqlite/sqliteRpc.ts`            | ✅     |
| ⭐ Excelente | `services/infrastructure/persistence/sqlite/sqliteSchema.ts`         | ✅     |
| ⭐ Excelente | `services/infrastructure/persistence/sqlite/sqliteWorker.ts`         | ✅     |
| — (barrel)   | `services/infrastructure/persistence/index.ts`                       | —      |
| — (barrel)   | `services/infrastructure/persistence/sqlite/index.ts`                | —      |

**Cobertura:** 8/8 funcionais (100%) ✅

---

## 7. 🖥️ Pages — Agenda

| Qualidade    | Arquivo                                            | Testes |
| ------------ | -------------------------------------------------- | ------ |
| ⭐ Excelente | `pages/agenda/AgendaPage.tsx`                      | ✅     |
| ⭐ Excelente | `pages/agenda/DayDetailSidebar.tsx`                | ✅     |
| ⭐ Excelente | `pages/agenda/MonthlyCalendarGrid.tsx`             | ✅     |
| ⭐ Excelente | `pages/agenda/WeeklyTimeGrid.tsx`                  | ✅     |
| ⭐ Excelente | `pages/agenda/agendaConstants.ts`                  | ✅     |
| ⭐ Excelente | `pages/agenda/bloco-de-notas/BlocoDeNotasPage.tsx` | ✅     |
| ⭐ Excelente | `pages/agenda/lembretes/LembretesPage.tsx`         | ✅     |
| ⭐ Excelente | `pages/agenda/tarefas/ArchivedTasksView.tsx`       | ✅     |
| ⭐ Excelente | `pages/agenda/tarefas/KanbanColumn.tsx`            | ✅     |
| ⭐ Excelente | `pages/agenda/tarefas/TarefasPage.tsx`             | ✅     |
| ⭐ Excelente | `pages/agenda/tarefas/TaskCard.tsx`                | ✅     |
| ⭐ Excelente | `pages/agenda/tarefas/TaskToast.tsx`               | ✅     |
| — (barrel)   | `pages/agenda/index.ts`                            | —      |
| — (barrel)   | `pages/agenda/tarefas/index.ts`                    | —      |

**Cobertura:** 12/12 funcionais (100%) ✅

---

## 8. 👥 Pages — Clientes

| Qualidade        | Arquivo                                                    | Testes |
| ---------------- | ---------------------------------------------------------- | ------ |
| ⭐ Excelente     | `pages/clientes/ClientesDataManagementModal.tsx`           | ✅     |
| ⭐ Excelente     | `pages/clientes/ClientesPage.tsx`                          | ✅     |
| ⭐ Excelente     | `pages/clientes/ClientesTablePanel.tsx`                    | ✅     |
| ⭐ Excelente     | `pages/clientes/detalhes/ClienteAddressFieldset.tsx`       | ✅     |
| ⭐ Excelente     | `pages/clientes/detalhes/ClienteDetalhesInfoTab.tsx`       | ✅     |
| ⭐ Excelente     | `pages/clientes/detalhes/ClienteDetalhesPage.tsx`          | ✅     |
| ⭐ Excelente     | `pages/clientes/detalhes/ClienteDetalhesSecondaryTabs.tsx` | ✅     |
| — (barrel/types) | `pages/clientes/index.ts`                                  | —      |
| — (barrel/types) | `pages/clientes/detalhes/index.ts`                         | —      |
| — (types only)   | `pages/clientes/types.ts`                                  | —      |

**Cobertura:** 7/7 funcionais (100%) ✅

---

## 9. 💼 Pages — Comercial

| Qualidade      | Arquivo                                              | Testes |
| -------------- | ---------------------------------------------------- | ------ |
| ⭐ Excelente   | `pages/comercial/orcamentos/OrcamentosPage.tsx`      | ✅     |
| ⭐ Excelente   | `pages/comercial/orcamentos/SaveProposalModal.tsx`   | ✅     |
| ⭐ Excelente   | `pages/comercial/propostas/PropostaDetalhesPage.tsx` | ✅     |
| ⭐ Excelente   | `pages/comercial/propostas/PropostasPage.tsx`        | ✅     |
| ⭐ Excelente   | `pages/comercial/prospects/ProspectCard.tsx`         | ✅     |
| ⭐ Excelente   | `pages/comercial/prospects/ProspectFormModal.tsx`    | ✅     |
| ⭐ Excelente   | `pages/comercial/prospects/ProspectsPage.tsx`        | ✅     |
| — (barrel)     | `pages/comercial/orcamentos/index.ts`                | —      |
| — (barrel)     | `pages/comercial/propostas/index.ts`                 | —      |
| — (barrel)     | `pages/comercial/prospects/index.ts`                 | —      |
| — (types only) | `pages/comercial/prospects/types.ts`                 | —      |

**Cobertura:** 7/7 funcionais (100%) ✅

---

## 10. ⚙️ Pages — Configurações

| Qualidade    | Arquivo                                      | Testes |
| ------------ | -------------------------------------------- | ------ |
| ⭐ Excelente | `pages/configuracoes/ClearDataModal.tsx`     | ✅     |
| ⭐ Excelente | `pages/configuracoes/ConfiguracoesPage.tsx`  | ✅     |
| ⭐ Excelente | `pages/configuracoes/ImportDataModal.tsx`    | ✅     |
| ⭐ Excelente | `pages/configuracoes/PasswordInput.tsx`      | ✅     |
| ⭐ Excelente | `pages/configuracoes/PasswordResetModal.tsx` | ✅     |
| ⭐ Excelente | `pages/configuracoes/Section.tsx`            | ✅     |
| ⭐ Excelente | `pages/configuracoes/Toggle.tsx`             | ✅     |
| — (barrel)   | `pages/configuracoes/index.ts`               | —      |

**Cobertura:** 7/7 funcionais (100%) ✅

---

## 11. 📄 Pages — Documentos

| Qualidade    | Arquivo                                       | Testes |
| ------------ | --------------------------------------------- | ------ |
| ⭐ Excelente | `pages/documentos/AddModal.tsx`               | ✅     |
| ⭐ Excelente | `pages/documentos/DocumentosPage.tsx`         | ✅     |
| ⭐ Excelente | `pages/documentos/DocumentosPessoalPage.tsx`  | ✅     |
| ⭐ Excelente | `pages/documentos/DocumentosProjetosPage.tsx` | ✅     |
| ⭐ Excelente | `pages/documentos/DocumentsBreadcrumb.tsx`    | ✅     |
| ⭐ Excelente | `pages/documentos/DocumentsGridView.tsx`      | ✅     |
| ⭐ Excelente | `pages/documentos/DocumentsListView.tsx`      | ✅     |
| ⭐ Excelente | `pages/documentos/DocumentsToolbar.tsx`       | ✅     |
| — (barrel)   | `pages/documentos/index.ts`                   | —      |

**Cobertura:** 8/8 funcionais (100%) ✅

---

## 12. 💰 Pages — Financeiro

| Qualidade      | Arquivo                                                       | Testes |
| -------------- | ------------------------------------------------------------- | ------ |
| ⭐ Excelente   | `pages/financeiro/FinanceiroDebitosPage.tsx`                  | ✅     |
| ⭐ Excelente   | `pages/financeiro/FinanceiroPrevisaoCaixaPage.tsx`            | ✅     |
| ⭐ Excelente   | `pages/financeiro/FinanceiroRecebiveisPage.tsx`               | ✅     |
| ⭐ Excelente   | `pages/financeiro/FinanceiroVisaoGeralPage.tsx`               | ✅     |
| ⭐ Excelente   | `pages/financeiro/gestao-caixa/CashBoxEntriesTable.tsx`       | ✅     |
| ⭐ Excelente   | `pages/financeiro/gestao-caixa/CashBoxToast.tsx`              | ✅     |
| ⭐ Excelente   | `pages/financeiro/gestao-caixa/CashBoxTotals.tsx`             | ✅     |
| ⭐ Excelente   | `pages/financeiro/gestao-caixa/FinanceiroGestaoCaixaPage.tsx` | ✅     |
| ⭐ Excelente   | `pages/financeiro/gestao-caixa/MonthNavigator.tsx`            | ✅     |
| ⭐ Excelente   | `pages/financeiro/gestao-caixa/OriginBadge.tsx`               | ✅     |
| ⭐ Excelente   | `pages/financeiro/gestao-caixa/RecurrenceBadge.tsx`           | ✅     |
| — (barrel)     | `pages/financeiro/index.ts`                                   | —      |
| — (barrel)     | `pages/financeiro/gestao-caixa/index.ts`                      | —      |
| — (types only) | `pages/financeiro/gestao-caixa/types.ts`                      | —      |

**Cobertura:** 11/11 funcionais (100%) ✅

---

## 13. 📣 Pages — Gestão de Marketing

| Qualidade    | Arquivo                                                                  | Testes |
| ------------ | ------------------------------------------------------------------------ | ------ |
| ⭐ Excelente | `pages/gestao-marketing/GestaoMarketingBancoIdeiasPage.tsx`              | ✅     |
| ⭐ Excelente | `pages/gestao-marketing/GestaoMarketingConteudosPage.tsx`                | ✅     |
| ⭐ Excelente | `pages/gestao-marketing/GestaoMarketingPage.tsx`                         | ✅     |
| ⭐ Excelente | `pages/gestao-marketing/GestaoMarketingPainelPage.tsx`                   | ✅     |
| ⭐ Excelente | `pages/gestao-marketing/MarketingContentListView.tsx`                    | ✅     |
| ⭐ Excelente | `pages/gestao-marketing/MarketingDashboardView.tsx`                      | ✅     |
| ⭐ Excelente | `pages/gestao-marketing/MarketingIdeasView.tsx`                          | ✅     |
| ⭐ Excelente | `pages/gestao-marketing/redes-sociais/constants.ts`                      | ✅     |
| ⭐ Excelente | `pages/gestao-marketing/redes-sociais/InstagramDetailHeader.tsx`         | ✅     |
| ⭐ Excelente | `pages/gestao-marketing/redes-sociais/InstagramDetailPage.tsx`           | ✅     |
| ⭐ Excelente | `pages/gestao-marketing/redes-sociais/InstagramLatestSnapshotCard.tsx`   | ✅     |
| ⭐ Excelente | `pages/gestao-marketing/redes-sociais/InstagramNotesCard.tsx`            | ✅     |
| ⭐ Excelente | `pages/gestao-marketing/redes-sociais/InstagramProfileInfoCard.tsx`      | ✅     |
| ⭐ Excelente | `pages/gestao-marketing/redes-sociais/InstagramSnapshotHistoryTable.tsx` | ✅     |
| ⭐ Excelente | `pages/gestao-marketing/redes-sociais/InstagramTopBar.tsx`               | ✅     |
| ⭐ Excelente | `pages/gestao-marketing/redes-sociais/NewSnapshotModal.tsx`              | ✅     |
| ⭐ Excelente | `pages/gestao-marketing/redes-sociais/RedesSociaisPage.tsx`              | ✅     |
| — (barrel)   | `pages/gestao-marketing/index.ts`                                        | —      |
| — (barrel)   | `pages/gestao-marketing/redes-sociais/index.ts`                          | —      |

**Cobertura:** 17/17 funcionais (100%) ✅

---

## 14. 🏠 Pages — Home

| Qualidade    | Arquivo                   | Testes |
| ------------ | ------------------------- | ------ |
| ⭐ Excelente | `pages/home/HomePage.tsx` | ✅     |

**Cobertura:** 1/1 (100%) ✅

---

## 15. 🧑‍💼 Pages — Prestadores & Freelancers

| Qualidade    | Arquivo                                                                          | Testes |
| ------------ | -------------------------------------------------------------------------------- | ------ |
| ⭐ Excelente | `pages/prestadores-freelancers/FreelancerDetailFormModal.tsx`                    | ✅     |
| ⭐ Excelente | `pages/prestadores-freelancers/PrestadoresFreelancersPage.tsx`                   | ✅     |
| ⭐ Excelente | `pages/prestadores-freelancers/servicos-contratados/ServicosContratadosPage.tsx` | ✅     |
| — (barrel)   | `pages/prestadores-freelancers/index.ts`                                         | —      |

**Cobertura:** 3/3 funcionais (100%) ✅

---

## 16. 🏗️ Pages — Projetos

| Qualidade      | Arquivo                                                  | Testes |
| -------------- | -------------------------------------------------------- | ------ |
| ⭐ Excelente   | `pages/projetos/ProjetosPage.tsx`                        | ✅     |
| ⭐ Excelente   | `pages/projetos/detalhes/ProjetoDetalhesOverviewTab.tsx` | ✅     |
| ⭐ Excelente   | `pages/projetos/detalhes/ProjetoDetalhesPage.tsx`        | ✅     |
| ⭐ Excelente   | `pages/projetos/detalhes/ProjetoDetalhesPageContent.tsx` | ✅     |
| ⭐ Excelente   | `pages/projetos/detalhes/ProjetoDetalhesTabs.tsx`        | ✅     |
| ⭐ Excelente   | `pages/projetos/detalhes/useProjectLifecycleActions.ts`  | ✅     |
| — (barrel)     | `pages/projetos/index.ts`                                | —      |
| — (barrel)     | `pages/projetos/detalhes/index.ts`                       | —      |
| — (types only) | `pages/projetos/detalhes/types.ts`                       | —      |

**Cobertura:** 6/6 funcionais (100%) ✅

---

## 17. 📊 Pages — Relatórios

| Qualidade    | Arquivo                                        | Testes |
| ------------ | ---------------------------------------------- | ------ |
| ⭐ Excelente | `pages/relatorios/RelatorioAquisicaoPage.tsx`  | ✅     |
| ⭐ Excelente | `pages/relatorios/RelatorioFinanceiroPage.tsx` | ✅     |
| ⭐ Excelente | `pages/relatorios/RelatorioProjetosPage.tsx`   | ✅     |
| ⭐ Excelente | `pages/relatorios/RelatoriosLayout.tsx`        | ✅     |
| — (barrel)   | `pages/relatorios/index.ts`                    | —      |

**Cobertura:** 4/4 funcionais (100%) ✅

---

## 18. 🏪 Pages — Suprimentos

| Qualidade      | Arquivo                                                   | Testes |
| -------------- | --------------------------------------------------------- | ------ |
| ⭐ Excelente   | `pages/suprimentos/catalogo/CatalogoPage.tsx`             | ✅     |
| ⭐ Excelente   | `pages/suprimentos/comissoes/ComissoesPage.tsx`           | ✅     |
| ⭐ Excelente   | `pages/suprimentos/comissoes/CommissionFormModal.tsx`     | ✅     |
| ⭐ Excelente   | `pages/suprimentos/comissoes/CommissionsFilterBar.tsx`    | ✅     |
| ⭐ Excelente   | `pages/suprimentos/comissoes/CommissionsSummaryCards.tsx` | ✅     |
| ⭐ Excelente   | `pages/suprimentos/comissoes/CommissionsTable.tsx`        | ✅     |
| ⭐ Excelente   | `pages/suprimentos/comissoes/ConfirmPaymentModal.tsx`     | ✅     |
| ⭐ Excelente   | `pages/suprimentos/cotacoes/CotacaoDetalhesPage.tsx`      | ✅     |
| ⭐ Excelente   | `pages/suprimentos/cotacoes/CotacoesPage.tsx`             | ✅     |
| ⭐ Excelente   | `pages/suprimentos/fornecedores/FornecedoresPage.tsx`     | ✅     |
| — (barrel)     | `pages/suprimentos/comissoes/index.ts`                    | —      |
| — (barrel)     | `pages/suprimentos/cotacoes/index.ts`                     | —      |
| — (types only) | `pages/suprimentos/comissoes/types.ts`                    | —      |

**Cobertura:** 10/10 funcionais (100%) ✅

---

## 19. 🧱 Components — UI Primitivos

| Qualidade    | Arquivo                                     | Testes |
| ------------ | ------------------------------------------- | ------ |
| ⭐ Excelente | `components/ui/Badge.tsx`                   | ✅     |
| ⭐ Excelente | `components/ui/Button.tsx`                  | ✅     |
| ⭐ Excelente | `components/ui/CardShell.tsx`               | ✅     |
| ⭐ Excelente | `components/ui/DeleteConfirmationModal.tsx` | ✅     |
| ⭐ Excelente | `components/ui/DocumentIcons.tsx`           | ✅     |
| ⭐ Excelente | `components/ui/EmptyState.tsx`              | ✅     |
| ⭐ Excelente | `components/ui/FormField.tsx`               | ✅     |
| ⭐ Excelente | `components/ui/iconBase.tsx`                | ✅     |
| ⭐ Excelente | `components/ui/IconButton.tsx`              | ✅     |
| ⭐ Excelente | `components/ui/icons.tsx`                   | ✅     |
| ⭐ Excelente | `components/ui/icons-common.tsx`            | ✅     |
| ⭐ Excelente | `components/ui/icons-common-extra.tsx`      | ✅     |
| ⭐ Excelente | `components/ui/icons-navigation.tsx`        | ✅     |
| ⭐ Excelente | `components/ui/icons-social.tsx`            | ✅     |
| ⭐ Excelente | `components/ui/icons-submenu.tsx`           | ✅     |
| ⭐ Excelente | `components/ui/Input.tsx`                   | ✅     |
| ⭐ Excelente | `components/ui/LoadingFallback.tsx`         | ✅     |
| ⭐ Excelente | `components/ui/Modal.tsx`                   | ✅     |
| ⭐ Excelente | `components/ui/Select.tsx`                  | ✅     |
| ⭐ Excelente | `components/ui/Tabs.tsx`                    | ✅     |
| ⭐ Excelente | `components/ui/Textarea.tsx`                | ✅     |
| — (barrel)   | `components/ui/index.ts`                    | —      |

**Cobertura:** 21/21 funcionais (100%) ✅

---

## 20. 📐 Components — Layout

| Qualidade    | Arquivo                               | Testes |
| ------------ | ------------------------------------- | ------ |
| ⭐ Excelente | `components/layout/ErrorBoundary.tsx` | ✅     |
| ⭐ Excelente | `components/layout/Header.tsx`        | ✅     |
| ⭐ Excelente | `components/layout/PageHeader.tsx`    | ✅     |
| ⭐ Excelente | `components/layout/Sidebar.tsx`       | ✅     |
| — (barrel)   | `components/layout/index.ts`          | —      |

**Cobertura:** 4/4 funcionais (100%) ✅

---

## 21. 📅 Components — Agenda

| Qualidade    | Arquivo                                    | Testes |
| ------------ | ------------------------------------------ | ------ |
| ⭐ Excelente | `components/agenda/EventFormFields.tsx`    | ✅     |
| ⭐ Excelente | `components/agenda/EventFormModal.tsx`     | ✅     |
| ⭐ Excelente | `components/agenda/ReminderEmptyState.tsx` | ✅     |
| ⭐ Excelente | `components/agenda/ReminderFormModal.tsx`  | ✅     |
| ⭐ Excelente | `components/agenda/ReminderIcons.tsx`      | ✅     |
| ⭐ Excelente | `components/agenda/SubtaskDetailModal.tsx` | ✅     |
| ⭐ Excelente | `components/agenda/SubtaskList.tsx`        | ✅     |
| ⭐ Excelente | `components/agenda/agendaFormHelpers.ts`   | ✅     |
| ⭐ Excelente | `components/agenda/reminderPalette.ts`     | ✅     |
| — (barrel)   | `components/agenda/index.ts`               | —      |

**Cobertura:** 9/9 funcionais (100%) ✅

---

## 22. 👤 Components — Clientes

| Qualidade        | Arquivo                                                              | Testes |
| ---------------- | -------------------------------------------------------------------- | ------ |
| ⭐ Excelente     | `components/clientes/AvatarPicker.tsx`                               | ✅     |
| ⭐ Excelente     | `components/clientes/ClientFormModal.tsx`                            | ✅     |
| ⭐ Excelente     | `components/clientes/ClientProjectsTab.tsx`                          | ✅     |
| ⭐ Excelente     | `components/clientes/ClientSelectionModal.tsx`                       | ✅     |
| ⭐ Excelente     | `components/clientes/ClientTableRow.tsx`                             | ✅     |
| ⭐ Excelente     | `components/clientes/client-form/ClientFormAuditTab.tsx`             | ✅     |
| ⭐ Excelente     | `components/clientes/client-form/ClientFormFinanceTab.tsx`           | ✅     |
| ⭐ Excelente     | `components/clientes/client-form/ClientFormFooter.tsx`               | ✅     |
| ⭐ Excelente     | `components/clientes/client-form/ClientFormInfoAddressStatus.tsx`    | ✅     |
| ⭐ Excelente     | `components/clientes/client-form/ClientFormInfoIdentityContacts.tsx` | ✅     |
| ⭐ Excelente     | `components/clientes/client-form/ClientFormInfoTab.tsx`              | ✅     |
| ⭐ Excelente     | `components/clientes/client-form/ClientFormMeetingsTab.tsx`          | ✅     |
| ⭐ Excelente     | `components/clientes/client-form/ClientFormNotesTab.tsx`             | ✅     |
| — (barrel/types) | `components/clientes/index.ts`                                       | —      |
| — (barrel/types) | `components/clientes/client-form/index.ts`                           | —      |
| — (types only)   | `components/clientes/client-form/types.ts`                           | —      |

**Cobertura:** 13/13 funcionais (100%) ✅

---

## 23. 💹 Components — Finance

| Qualidade    | Arquivo                                          | Testes |
| ------------ | ------------------------------------------------ | ------ |
| ⭐ Excelente | `components/finance/CardShell.tsx`               | ✅     |
| ⭐ Excelente | `components/finance/CashBoxCreditFormModal.tsx`  | ✅     |
| ⭐ Excelente | `components/finance/CashBoxExpenseFields.tsx`    | ✅     |
| ⭐ Excelente | `components/finance/CashBoxExpenseFormModal.tsx` | ✅     |
| ⭐ Excelente | `components/finance/FinanceLineChart.tsx`        | ✅     |
| ⭐ Excelente | `components/finance/HealthBar.tsx`               | ✅     |
| ⭐ Excelente | `components/finance/KPICard.tsx`                 | ✅     |
| ⭐ Excelente | `components/finance/MarginBar.tsx`               | ✅     |
| ⭐ Excelente | `components/finance/SectionTitle.tsx`            | ✅     |
| ⭐ Excelente | `components/finance/chart/CustomTooltip.tsx`     | ✅     |
| ⭐ Excelente | `components/finance/chart/DonutTooltip.tsx`      | ✅     |
| — (barrel)   | `components/finance/index.ts`                    | —      |
| — (barrel)   | `components/finance/chart/index.ts`              | —      |

**Cobertura:** 11/11 funcionais (100%) ✅

---

## 24. 📣 Components — Marketing

| Qualidade    | Arquivo                                             | Testes |
| ------------ | --------------------------------------------------- | ------ |
| ⭐ Excelente | `components/marketing/ActivityFormFields.tsx`       | ✅     |
| ⭐ Excelente | `components/marketing/ActivityFormModal.tsx`        | ✅     |
| ⭐ Excelente | `components/marketing/IdeaFormModal.tsx`            | ✅     |
| ⭐ Excelente | `components/marketing/InstagramCredentialModal.tsx` | ✅     |
| ⭐ Excelente | `components/marketing/ProfessionalFormModal.tsx`    | ✅     |
| — (barrel)   | `components/marketing/index.ts`                     | —      |

**Cobertura:** 5/5 funcionais (100%) ✅

---

## 25. 🧭 Components — Nav

| Qualidade    | Arquivo                           | Testes |
| ------------ | --------------------------------- | ------ |
| ⭐ Excelente | `components/nav/SidebarLinks.tsx` | ✅     |
| — (barrel)   | `components/nav/index.ts`         | —      |

**Cobertura:** 1/1 funcional (100%) ✅

---

## 26. 📋 Components — Orçamentos

| Qualidade    | Arquivo                                            | Testes |
| ------------ | -------------------------------------------------- | ------ |
| ⭐ Excelente | `components/orcamentos/BudgetItemRow.tsx`          | ✅     |
| ⭐ Excelente | `components/orcamentos/BudgetSectionComponent.tsx` | ✅     |
| — (barrel)   | `components/orcamentos/index.ts`                   | —      |

**Cobertura:** 2/2 funcionais (100%) ✅

---

## 27. 🏗️ Components — Projetos

| Qualidade      | Arquivo                                                                          | Testes |
| -------------- | -------------------------------------------------------------------------------- | ------ |
| ⭐ Excelente   | `components/projetos/LinkQuotationModal.tsx`                                     | ✅     |
| ⭐ Excelente   | `components/projetos/ProjectActionModal.tsx`                                     | ✅     |
| ⭐ Excelente   | `components/projetos/ProjectComponents.tsx`                                      | ✅     |
| ⭐ Excelente   | `components/projetos/ProjetoDetalhesWidgets.tsx`                                 | ✅     |
| ⭐ Excelente   | `components/projetos/TaskDetailModal.tsx`                                        | ✅     |
| ⭐ Excelente   | `components/projetos/tabs/ChecklistTaskRow.tsx`                                  | ✅     |
| ⭐ Excelente   | `components/projetos/tabs/ProjectChecklistTab.tsx`                               | ✅     |
| ⭐ Excelente   | `components/projetos/tabs/ProjectFinanceTab.tsx`                                 | ✅     |
| ⭐ Excelente   | `components/projetos/tabs/ProjectGanttTab.tsx`                                   | ✅     |
| ⭐ Excelente   | `components/projetos/tabs/ProjectNotesTab.tsx`                                   | ✅     |
| ⭐ Excelente   | `components/projetos/tabs/ProjectQuotationsTab.tsx`                              | ✅     |
| ⭐ Excelente   | `components/projetos/tabs/project-finance/FinancialKPICard.tsx`                  | ✅     |
| ⭐ Excelente   | `components/projetos/tabs/project-finance/helpers.ts`                            | ✅     |
| ⭐ Excelente   | `components/projetos/tabs/project-finance/ProjectFinanceAddendumsSection.tsx`    | ✅     |
| ⭐ Excelente   | `components/projetos/tabs/project-finance/ProjectFinanceConfigSection.tsx`       | ✅     |
| ⭐ Excelente   | `components/projetos/tabs/project-finance/ProjectFinanceKPISection.tsx`          | ✅     |
| ⭐ Excelente   | `components/projetos/tabs/project-finance/ProjectFinanceTransactionsSection.tsx` | ✅     |
| ⭐ Excelente   | `components/projetos/tabs/project-gantt/GanttBarRenderer.tsx`                    | ✅     |
| ⭐ Excelente   | `components/projetos/tabs/project-gantt/GanttTimeline.tsx`                       | ✅     |
| ⭐ Excelente   | `components/projetos/tabs/project-gantt/helpers.ts`                              | ✅     |
| ⭐ Excelente   | `components/projetos/tabs/project-gantt/SummaryBar.tsx`                          | ✅     |
| ⭐ Excelente   | `components/projetos/tabs/project-gantt/Tooltip.tsx`                             | ✅     |
| — (barrel)     | `components/projetos/index.ts`                                                   | —      |
| — (barrel)     | `components/projetos/tabs/index.ts`                                              | —      |
| — (barrel)     | `components/projetos/tabs/project-finance/index.ts`                              | —      |
| — (barrel)     | `components/projetos/tabs/project-gantt/index.ts`                                | —      |
| — (types only) | `components/projetos/tabs/project-finance/types.ts`                              | —      |
| — (types only) | `components/projetos/tabs/project-gantt/types.ts`                                | —      |

**Cobertura:** 22/22 funcionais (100%) ✅

---

## 28. 📝 Components — Propostas

| Qualidade    | Arquivo                                           | Testes |
| ------------ | ------------------------------------------------- | ------ |
| ⭐ Excelente | `components/propostas/BudgetTableBlock.tsx`       | ✅     |
| ⭐ Excelente | `components/propostas/ConversionModal.tsx`        | ✅     |
| ⭐ Excelente | `components/propostas/ProposalComponents.tsx`     | ✅     |
| ⭐ Excelente | `components/propostas/ProposalDocumentEditor.tsx` | ✅     |
| ⭐ Excelente | `components/propostas/ValidationModal.tsx`        | ✅     |
| — (barrel)   | `components/propostas/index.ts`                   | —      |

**Cobertura:** 5/5 funcionais (100%) ✅

---

## 29. 📊 Components — Relatórios

| Qualidade    | Arquivo                                      | Testes |
| ------------ | -------------------------------------------- | ------ |
| ⭐ Excelente | `components/relatorios/ReportComponents.tsx` | ✅     |
| — (barrel)   | `components/relatorios/index.ts`             | —      |

**Cobertura:** 1/1 funcional (100%) ✅

---

## 30. 🔗 Components — Supply Chain

| Qualidade      | Arquivo                                                 | Testes |
| -------------- | ------------------------------------------------------- | ------ |
| ⭐ Excelente   | `components/supply-chain/LinkProductModal.tsx`          | ✅     |
| ⭐ Excelente   | `components/supply-chain/SupplierCommissionsTab.tsx`    | ✅     |
| ⭐ Excelente   | `components/supply-chain/SupplierContactDetailsTab.tsx` | ✅     |
| ⭐ Excelente   | `components/supply-chain/SupplierDetailsPanel.tsx`      | ✅     |
| ⭐ Excelente   | `components/supply-chain/SupplierFormBody.tsx`          | ✅     |
| ⭐ Excelente   | `components/supply-chain/SupplierFormModal.tsx`         | ✅     |
| ⭐ Excelente   | `components/supply-chain/SupplierKpiCard.tsx`           | ✅     |
| ⭐ Excelente   | `components/supply-chain/SupplierProductsTab.tsx`       | ✅     |
| ⭐ Excelente   | `components/supply-chain/SuppliersSidebar.tsx`          | ✅     |
| ⭐ Excelente   | `components/supply-chain/SuppliersView.tsx`             | ✅     |
| — (barrel)     | `components/supply-chain/index.ts`                      | —      |
| — (types only) | `components/supply-chain/supplierViewTypes.ts`          | —      |

**Cobertura:** 10/10 funcionais (100%) ✅

---

## 31. 🗂️ Components — Catálogo

| Qualidade    | Arquivo                                         | Testes |
| ------------ | ----------------------------------------------- | ------ |
| ⭐ Excelente | `components/catalogo/AddSupplierPriceModal.tsx` | ✅     |
| ⭐ Excelente | `components/catalogo/ProductFormModal.tsx`      | ✅     |
| — (barrel)   | `components/catalogo/index.ts`                  | —      |

**Cobertura:** 2/2 funcionais (100%) ✅

---

## 32. 🔧 Context

| Qualidade        | Arquivo                                | Testes |
| ---------------- | -------------------------------------- | ------ |
| ⭐ Excelente     | `context/CoreContext.ts`               | ✅     |
| ⭐ Excelente     | `context/DataContext.tsx`              | ✅     |
| ⭐ Excelente     | `context/DataHistoryContext.ts`        | ✅     |
| ⭐ Excelente     | `context/FinanceContext.ts`            | ✅     |
| ⭐ Excelente     | `context/FinancialSecurityContext.tsx` | ✅     |
| ⭐ Excelente     | `context/MarketingContext.ts`          | ✅     |
| ⭐ Excelente     | `context/SupplyChainContext.ts`        | ✅     |
| ⭐ Excelente     | `context/SystemContext.ts`             | ✅     |
| ⭐ Excelente     | `context/ThemeContext.tsx`             | ✅     |
| ⭐ Excelente     | `context/createDomainSetter.ts`        | ✅     |
| ⭐ Excelente     | `context/useDomain.ts`                 | ✅     |
| — (barrel/types) | `context/index.ts`                     | —      |
| — (types only)   | `context/types.ts`                     | —      |

**Cobertura:** 11/11 funcionais (100%) ✅

---

## 33. 📌 Constants

| Qualidade    | Arquivo               | Testes |
| ------------ | --------------------- | ------ |
| ⭐ Excelente | `constants/budget.ts` | ✅     |
| ⭐ Excelente | `constants/layout.ts` | ✅     |
| ⭐ Excelente | `constants/theme.ts`  | ✅     |
| ⭐ Excelente | `constants/ui.tsx`    | ✅     |
| — (barrel)   | `constants/index.ts`  | —      |

**Cobertura:** 4/4 funcionais (100%) ✅

---

## 34. 🗃️ Types

> Arquivos de tipos puros (interfaces, enums) — testabilidade via contrato, não via unit tests.

| Qualidade  | Arquivo                     | Testes |
| ---------- | --------------------------- | ------ |
| — (tipos)  | `types.ts`                  | —      |
| — (tipos)  | `types/agenda.ts`           | —      |
| — (tipos)  | `types/appData.ts`          | —      |
| — (tipos)  | `types/cashBox.ts`          | —      |
| — (tipos)  | `types/client.ts`           | —      |
| — (tipos)  | `types/common.ts`           | —      |
| — (tipos)  | `types/document.ts`         | —      |
| — (tipos)  | `types/finance.ts`          | —      |
| — (tipos)  | `types/financial-series.ts` | —      |
| — (tipos)  | `types/financial-views.ts`  | —      |
| — (tipos)  | `types/freelancer.ts`       | —      |
| — (tipos)  | `types/marketing.ts`        | —      |
| — (tipos)  | `types/project.ts`          | —      |
| — (tipos)  | `types/proposal.ts`         | —      |
| — (tipos)  | `types/supply-chain.ts`     | —      |
| — (barrel) | `types/index.ts`            | —      |

**Nota:** Tipos validados implicitamente via testes dos consumers (services, hooks, utils).

---

## 35. 🚀 Entry Points

| Qualidade    | Arquivo     | Testes |
| ------------ | ----------- | ------ |
| ⭐ Excelente | `App.tsx`   | ✅     |
| — (entry)    | `index.tsx` | —      |

**Cobertura:** 1/1 testável (100%) ✅

---

## 📈 Resumo Geral

| Camada                    | Funcionais | Com Teste | Cobertura   |
| ------------------------- | ---------- | --------- | ----------- |
| Utils                     | 10         | 10        | ✅ 100%     |
| Hooks                     | 15         | 15        | ✅ 100%     |
| Services (raiz)           | 10         | 10        | ✅ 100%     |
| Services (finance)        | 2          | 2         | ✅ 100%     |
| Services (infrastructure) | 13         | 13        | ✅ 100%     |
| Services (persistence)    | 8          | 8         | ✅ 100%     |
| Pages (agenda)            | 12         | 12        | ✅ 100%     |
| Pages (clientes)          | 7          | 7         | ✅ 100%     |
| Pages (comercial)         | 7          | 7         | ✅ 100%     |
| Pages (configuracoes)     | 7          | 7         | ✅ 100%     |
| Pages (documentos)        | 8          | 8         | ✅ 100%     |
| Pages (financeiro)        | 11         | 11        | ✅ 100%     |
| Pages (gestao-marketing)  | 17         | 17        | ✅ 100%     |
| Pages (home)              | 1          | 1         | ✅ 100%     |
| Pages (prestadores)       | 3          | 3         | ✅ 100%     |
| Pages (projetos)          | 6          | 6         | ✅ 100%     |
| Pages (relatorios)        | 4          | 4         | ✅ 100%     |
| Pages (suprimentos)       | 10         | 10        | ✅ 100%     |
| Components (UI)           | 21         | 21        | ✅ 100%     |
| Components (layout)       | 4          | 4         | ✅ 100%     |
| Components (agenda)       | 9          | 9         | ✅ 100%     |
| Components (clientes)     | 13         | 13        | ✅ 100%     |
| Components (finance)      | 11         | 11        | ✅ 100%     |
| Components (marketing)    | 5          | 5         | ✅ 100%     |
| Components (nav)          | 1          | 1         | ✅ 100%     |
| Components (orcamentos)   | 2          | 2         | ✅ 100%     |
| Components (projetos)     | 22         | 22        | ✅ 100%     |
| Components (propostas)    | 5          | 5         | ✅ 100%     |
| Components (relatorios)   | 1          | 1         | ✅ 100%     |
| Components (supply-chain) | 10         | 10        | ✅ 100%     |
| Components (catalogo)     | 2          | 2         | ✅ 100%     |
| Context                   | 11         | 11        | ✅ 100%     |
| Constants                 | 4          | 4         | ✅ 100%     |
| App.tsx                   | 1          | 1         | ✅ 100%     |
| **TOTAL**                 | **~263**   | **~263**  | **✅ 100%** |

> 🎉 **Cobertura de arquivos testáveis: 100%** — Todos os 263 arquivos funcionais possuem testes correspondentes.
