# Project Inventory

Generated at: 2026-03-01T13:19:55.037Z

Auto-generated manifest for anti-duplication checks in agent workflows.

## Hooks (src/hooks)
- `src/hooks/index.ts`: `useNavigation`
- `src/hooks/useAutoReset.ts`: `useAutoReset`
- `src/hooks/useClienteDetalhesForm.ts`: `useClienteDetalhesForm`
- `src/hooks/useClienteLinks.ts`: `useClienteLinks`
- `src/hooks/useClienteMeetings.ts`: `useClienteMeetings`
- `src/hooks/useClientFormHandlers.ts`: `useClientFormHandlers`
- `src/hooks/useFinanceSeriesPage.ts`: `useFinanceSeriesPage`
- `src/hooks/useNavigation.ts`: `useNavigation`
- `src/hooks/useProjectChecklist.ts`: `useProjectChecklist`
- `src/hooks/useProjectFinancials.ts`: `PaymentTarget`, `useProjectFinancials`
- `src/hooks/useReportData.ts`: `useReportData`
- `src/hooks/useUnifiedEvents.ts`: `useUnifiedEvents`

## Services (src/services)
- `src/services/agendaService.ts`: `agendaService`, `EventIndex`, `UnifiedEventsInput`
- `src/services/cashBoxService.ts`: `buildMonthEntries`, `confirmCredit`, `confirmExpense`, `CreateExpenseInput`, `generateExpenses`, `getCategoriesForOrigin`, `getCreditCategoriesForOrigin`, `getCreditItemsForCategory`, `getItemsForCategory`, `validateExpenseInput`
- `src/services/clientExportService.ts`: `exportClients`
- `src/services/clientFinancialSummaryService.ts`: `calculateProjectFinancialSummary`
- `src/services/clientService.ts`: `getPaymentStatusByClientId`, `saveClientAndUpdateState`, `validateClientForProject`
- `src/services/dashboardFocusItems.ts`: `determineFocusItems`
- `src/services/dashboardService.ts`: `calculateProjectProgress`, `getActiveProjects`, `getDashboardKPIs`, `getFinancialOverview`, `getPendingMarketingTasks`, `getUpcomingEvents`
- `src/services/finance/financeShared.ts`: `applySeriesFilters`, `buildFilterOptions`, `buildSeriesFromRecords`, `calculateChange`, `getMonthlyTotals`, `getReceivableCategory`, `isInMonth`, `mapDebitsToSeriesRecords`, `mapReceivablesToSeriesRecords`, `SeriesRecord`, `toMonthKey`
- `src/services/finance/financeUnifiedEntries.ts`: `buildUnifiedFinancialEntries`, `UnifiedFinancialEntries`
- `src/services/financeService.ts`: `getCashFlowForecastSeries`, `getExpensesFilterOptions`, `getExpensesSeries`, `getFinancialPageData`, `getReceivablesFilterOptions`, `getReceivablesSeries`
- `src/services/infrastructure/api.ts`: `api`
- `src/services/infrastructure/autoBackupService.ts`: `autoBackupService`
- `src/services/infrastructure/importExport.ts`: `canAcceptImportedValue`, `exportData`, `importClients`, `importData`
- `src/services/infrastructure/indexedDbService.ts`: `AutomaticBackupMetadata`, `AutomaticBackupRecord`, `indexedDbService`
- `src/services/infrastructure/loadData.ts`: `flushPersistence`, `initializeDataStore`, `invalidateCacheAndNotify`, `KEYS`, `loadData`, `replaceData`, `reserveGlobalIdentifierCounter`, `resetPersistentDataAndNotify`, `storageKeyMap`, `updateData`
- `src/services/infrastructure/migrations.ts`: `createSeedClient`, `LegacyClientRecord`, `migrateClients`, `runStorageSchemaMigrations`, `SeedClientData`
- `src/services/infrastructure/persistence/createPersistenceAdapter.ts`: `createPersistenceAdapter`, `resetPersistenceAdapter`, `setPersistenceAdapter`
- `src/services/infrastructure/persistence/index.ts`: `createPersistenceAdapter`, `IndexedDbPersistenceAdapter`, `resetPersistenceAdapter`, `setPersistenceAdapter`, `SqlitePersistenceAdapter`
- `src/services/infrastructure/persistence/IndexedDbPersistenceAdapter.ts`: `IndexedDbPersistenceAdapter`
- `src/services/infrastructure/persistence/PersistencePort.ts`: `BackupMetadata`, `BackupRecord`, `CounterReservationResult`, `PersistencePort`, `WriteBackupOptions`
- `src/services/infrastructure/persistence/sqlite/sqliteMigrations.ts`: `runMigrations`
- `src/services/infrastructure/persistence/sqlite/sqliteRpc.ts`: `createSqliteRpc`, `SqliteRpcClient`, `SqliteRpcRequest`, `SqliteRpcResponse`
- `src/services/infrastructure/persistence/sqlite/sqliteSchema.ts`: `ARRAY_ENTITY_KEYS`, `ENTITY_TABLE_MAP`, `getDurabilityPragmas`, `getSchemaStatements`, `SCALAR_KEYS`, `SCHEMA_VERSION`
- `src/services/infrastructure/persistence/SqlitePersistenceAdapter.ts`: `SqlitePersistenceAdapter`
- `src/services/infrastructure/seedAgendaEvents.ts`: `applySeedAgendaEvents`
- `src/services/infrastructure/seedData.ts`: `applySeedClients`
- `src/services/infrastructure/seedProspects.ts`: `applySeedProspects`
- `src/services/infrastructure/seedReminders.ts`: `applySeedReminders`
- `src/services/infrastructure/storageQuotaService.ts`: `storageQuotaService`, `StorageUsageInfo`
- `src/services/infrastructure/storageService.ts`: `storageService`
- `src/services/infrastructure/uiPreferenceService.ts`: `uiPreferenceService`
- `src/services/proposalService.ts`: `proposalService`
- `src/services/reportService.ts`: `generateReport`, `ReportDataInput`, `ReportFilter`

## UI Components (src/components/ui)
- `src/components/ui/Button.tsx`: `Button`
- `src/components/ui/CardShell.tsx`: `CardShell`
- `src/components/ui/DeleteConfirmationModal.tsx`: `DeleteConfirmationModal`
- `src/components/ui/DocumentIcons.tsx`: `DocumentIcons`
- `src/components/ui/EmptyState.tsx`: `EmptyState`
- `src/components/ui/iconBase.tsx`: `Icon`
- `src/components/ui/icons-common-extra.tsx`: `ArrowDownCircleIcon`, `ArrowLeftIcon`, `ArrowUpCircleIcon`, `DownloadIcon`, `EyeIcon`, `EyeOffIcon`, `FileJsonIcon`, `FileTextIcon`, `KeyIcon`, `LinkIcon`, `LockIcon`, `PencilIcon`, `RadarIcon`, `UploadCloudIcon`
- `src/components/ui/icons-common.tsx`: `AlertIcon`, `ArchiveIcon`, `ArrowDownCircleIcon`, `ArrowLeftIcon`, `ArrowUpCircleIcon`, `BellAlertIcon`, `BullhornIcon`, `CalendarPlusIcon`, `CameraIcon`, `CanceledIcon`, `CheckCircleIcon`, `ChevronDownIcon`, `ClockIcon`, `CollectionIcon`, `DownloadIcon`, `EditIcon`, `EyeIcon`, `EyeOffIcon`, `FileJsonIcon`, `FileTextIcon`, `FolderIcon`, `GlobeIcon`, `KeyIcon`, `LinkIcon`, `ListViewIcon`, `LockIcon`, `MailIcon`, `MapPinIcon`, `MenuIcon`, `NotStartedIcon`, `PausedIcon`, `PencilIcon`, `PhoneIcon`, `PlusIcon`, `RadarIcon`, `SearchIcon`, `SirenIcon`, `StarIcon`, `TagIcon`, `TrashIcon`, `UnarchiveIcon`, `UploadCloudIcon`, `UserCircleIcon`, `UsersIconV3`, `XCircleIcon`, `XIcon`
- `src/components/ui/icons-navigation.tsx`: `AgendaIcon`, `BriefcaseIcon`, `DocumentosIcon`, `FinanceiroIcon`, `HomeIcon`, `MarketingIconNew`, `ProjetosIcon`, `RelatoriosIcon`, `SettingsIcon`, `SubcontratacaoIcon`, `SuprimentosIcon`, `UsersIcon`
- `src/components/ui/icons-social.tsx`: `FacebookIcon`, `GoogleIcon`, `InstagramIcon`, `LinkedInIcon`, `TikTokIcon`, `YouTubeIcon`
- `src/components/ui/icons-submenu.tsx`: `BadgeIcon`, `BancoDeIdeiasIcon`, `BuildingIcon`, `CashBoxIcon`, `CashIcon`, `ChartBarIcon`, `ClipboardDocumentListIcon`, `ConteudosIcon`, `CreditCardIcon`, `CubeIcon`, `DocumentosProjetosIcon`, `DollarSignIcon`, `GiftIcon`, `MeusDocumentosIcon`, `OrcamentosIcon`, `PainelIcon`, `ProposalIcon`, `RedesSociaisIcon`, `StackedCoinsIcon`, `UserPlusIcon`
- `src/components/ui/icons.tsx`: `AgendaIcon`, `AlertIcon`, `ArchiveIcon`, `ArrowDownCircleIcon`, `ArrowLeftIcon`, `ArrowUpCircleIcon`, `BadgeIcon`, `BancoDeIdeiasIcon`, `BellAlertIcon`, `BriefcaseIcon`, `BuildingIcon`, `BullhornIcon`, `CalendarPlusIcon`, `CanceledIcon`, `CashBoxIcon`, `CashIcon`, `ChartBarIcon`, `CheckCircleIcon`, `ChevronDownIcon`, `ClipboardDocumentListIcon`, `ClockIcon`, `CollectionIcon`, `ConteudosIcon`, `CreditCardIcon`, `CubeIcon`, `DocumentosIcon`, `DocumentosProjetosIcon`, `DollarSignIcon`, `DownloadIcon`, `EditIcon`, `EyeIcon`, `EyeOffIcon`, `FacebookIcon`, `FileJsonIcon`, `FileTextIcon`, `FinanceiroIcon`, `GiftIcon`, `GlobeIcon`, `GoogleIcon`, `HomeIcon`, `ICON_MAP`, `InstagramIcon`, `KeyIcon`, `LinkedInIcon`, `LinkIcon`, `ListViewIcon`, `LogoIcon`, `MailIcon`, `MapPinIcon`, `MarketingIconNew`, `MenuIcon`, `MeusDocumentosIcon`, `NotStartedIcon`, `OrcamentosIcon`, `PainelIcon`, `PausedIcon`, `PencilIcon`, `PhoneIcon`, `PlusIcon`, `ProjetosIcon`, `ProposalIcon`, `RadarIcon`, `RedesSociaisIcon`, `RelatoriosIcon`, `SearchIcon`, `SettingsIcon`, `SirenIcon`, `StackedCoinsIcon`, `StarIcon`, `SubcontratacaoIcon`, `SuprimentosIcon`, `TagIcon`, `TikTokIcon`, `TrashIcon`, `UnarchiveIcon`, `UploadCloudIcon`, `UserCircleIcon`, `UserPlusIcon`, `UsersIcon`, `XCircleIcon`, `XIcon`, `YouTubeIcon`
- `src/components/ui/index.ts`: `AgendaIcon`, `AlertIcon`, `ArchiveIcon`, `ArrowDownCircleIcon`, `ArrowLeftIcon`, `ArrowUpCircleIcon`, `BuildingIcon`, `BullhornIcon`, `Button`, `CalendarPlusIcon`, `CashIcon`, `ChartBarIcon`, `CheckCircleIcon`, `ChevronDownIcon`, `ClipboardDocumentListIcon`, `ClockIcon`, `CollectionIcon`, `CubeIcon`, `DeleteConfirmationModal`, `DocumentIcons`, `DollarSignIcon`, `DownloadIcon`, `EditIcon`, `EmptyState`, `EyeIcon`, `FacebookIcon`, `FileJsonIcon`, `FileTextIcon`, `GiftIcon`, `GlobeIcon`, `InstagramIcon`, `KeyIcon`, `LinkIcon`, `ListViewIcon`, `MailIcon`, `MapPinIcon`, `Modal`, `PencilIcon`, `PhoneIcon`, `PlusIcon`, `ProjetosIcon`, `ProposalIcon`, `RadarIcon`, `SearchIcon`, `Select`, `StarIcon`, `TagIcon`, `TikTokIcon`, `TrashIcon`, `UnarchiveIcon`, `UploadCloudIcon`, `UserCircleIcon`, `UsersIcon`, `XCircleIcon`, `XIcon`
- `src/components/ui/Select.tsx`: `Select`

## Utils (src/utils)
- `src/utils/addendumWorkflow.ts`: `canTransitionAddendumStatus`, `getAllowedAddendumStatusTransitions`, `getStatusSelectionOptions`
- `src/utils/documents.ts`: `fileToB64`, `openDocument`
- `src/utils/formatters.ts`: `formatBytes`, `formatCEP`, `formatCpfCnpj`, `formatCurrency`, `formatDate`, `formatDateDayMonth`, `formatDateWithTime`, `formatPhone`, `formatYAxisTick`, `getDeadlineInfo`, `parseDateString`
- `src/utils/projectFinancials.ts`: `getApprovedAddendumTotal`, `getProjectBaseContractValue`, `getProjectLumpSumValue`, `getProjectTotalContractValue`
- `src/utils/supplierHelpers.ts`: `getInitials`, `getInitialSupplier`, `getLatestPriceFromHistory`
- `src/utils/tree.ts`: `addItemToTree`, `deleteRecursive`, `traverseAndCollect`, `traverseAndModify`

## Types (src/types)
- `src/types/agenda.ts`: `AgendaEvent`, `AgendaEventRecurrence`, `AgendaEventType`, `agendaEventTypes`, `ContractDeadlinesSettings`, `KanbanStatus`, `Reminder`
- `src/types/appData.ts`: `AppData`
- `src/types/cashBox.ts`: `CashBoxCategory`, `CashBoxCredit`, `CashBoxCreditCategory`, `cashBoxCreditPersonalCategories`, `CashBoxCreditPersonalCategory`, `cashBoxCreditPersonalItems`, `cashBoxCreditProfessionalCategories`, `CashBoxCreditProfessionalCategory`, `cashBoxCreditProfessionalItems`, `CashBoxExpense`, `CashBoxOrigin`, `cashBoxPersonalCategories`, `CashBoxPersonalCategory`, `cashBoxPersonalItems`, `cashBoxProfessionalCategories`, `CashBoxProfessionalCategory`, `cashBoxProfessionalItems`, `CashBoxRecurrence`, `cashBoxRecurrences`, `UnifiedEntry`
- `src/types/client.ts`: `Client`, `ClientContact`, `ClientLink`, `ClientStatus`, `clientStatuses`, `PaymentStatus`, `paymentStatuses`, `ProjectMeeting`, `Prospect`, `ProspectPriority`, `ProspectStatus`
- `src/types/common.ts`: `NavIconName`, `NavLinkItem`
- `src/types/document.ts`: `DocumentFile`, `DocumentFolder`, `DocumentItem`, `DocumentSource`, `DocumentStatus`, `DocumentStorage`
- `src/types/finance.ts`: `Commission`, `CommissionStatus`, `commissionStatuses`, `ManualIncome`, `PaymentMethod`, `paymentMethods`, `ProfessionalExpense`, `ProfessionalExpenseCategory`, `ProfessionalExpenseStatus`
- `src/types/financial-series.ts`: `Filters`, `FinanceLineChartFilters`, `FinancialSeriesSource`, `PeriodMode`, `PeriodSelection`, `SeriesFilterOptions`, `SeriesPoint`
- `src/types/financial-views.ts`: `FinancialDebit`, `FinancialReceivable`
- `src/types/freelancer.ts`: `Freelancer`, `FreelancerProject`, `HiredService`, `HiredServiceStatus`
- `src/types/marketing.ts`: `InstagramSnapshot`, `MarketingActivity`, `MarketingActivityStatus`, `marketingActivityStatuses`, `MarketingBillingFormat`, `marketingBillingFormats`, `MarketingContentType`, `marketingContentTypes`, `MarketingIdea`, `MarketingProfessional`, `SocialNetwork`, `SocialNetworkName`
- `src/types/project.ts`: `AddendumAuditEntry`, `AdditionalDeadline`, `ContractAddendum`, `ContractAddendumStatus`, `Installment`, `Project`, `ProjectAddress`, `ProjectFinancials`, `ProjectSection`, `ProjectStatus`, `projectStatuses`, `ProjectTask`, `Purchase`, `Subtask`, `TaskPriority`, `TaskStatus`
- `src/types/proposal.ts`: `BillingInfo`, `BillingMethod`, `BudgetItem`, `BudgetSection`, `BudgetTemplateItem`, `BudgetTemplateSection`, `BudgetUnit`, `Proposal`, `ProposalBlock`, `ProposalBlockType`, `ProposalStatus`, `SavedItem`, `SavedSection`
- `src/types/supply-chain.ts`: `PriceEntry`, `Product`, `ProductUnit`, `Quotation`, `QuotationItem`, `Supplier`, `SupplierContact`, `SupplierProductPrice`
