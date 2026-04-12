# Project Inventory

Generated at: 2026-04-11T12:37:56.940Z

Auto-generated manifest for anti-duplication checks in agent workflows.

## Hooks (src/frontend/hooks)

- `src/frontend/hooks/index.ts`: `useDisclosure`, `useNavigation`
- `src/frontend/hooks/useAutoReset.ts`: `useAutoReset`
- `src/frontend/hooks/useClienteDetalhesForm.ts`: `useClienteDetalhesForm`
- `src/frontend/hooks/useClienteLinks.ts`: `useClienteLinks`
- `src/frontend/hooks/useClienteMeetings.ts`: `useClienteMeetings`
- `src/frontend/hooks/useClientFormHandlers.ts`: `useClientFormHandlers`
- `src/frontend/hooks/useDisclosure.ts`: `useDisclosure`
- `src/frontend/hooks/useDomain.ts`: `useDomain`
- `src/frontend/hooks/useDriveSync.ts`: `useDriveSync`
- `src/frontend/hooks/useLegacyCleanup.ts`: `useLegacyCleanup`
- `src/frontend/hooks/useNavigation.ts`: `useNavigation`
- `src/frontend/hooks/useProjectChecklist.ts`: `useProjectChecklist`
- `src/frontend/hooks/useProjectFinancials.ts`: `PaymentTarget`, `useProjectFinancials`
- `src/frontend/hooks/useProjectLifecycleActions.ts`: `useProjectLifecycleActions`
- `src/frontend/hooks/useReportData.ts`: `useReportData`
- `src/frontend/hooks/useUndoRedo.ts`: `useUndoRedo`
- `src/frontend/hooks/useUnifiedEvents.ts`: `useUnifiedEvents`

## Services (src/frontend/services)

- `src/frontend/services/agendaService.ts`: `agendaService`, `EventIndex`, `UnifiedEventsInput`
- `src/frontend/services/cashBoxService.ts`: `buildMonthEntries`, `confirmCredit`, `confirmExpense`, `CreateExpenseInput`, `generateExpenses`, `getCategoriesForOrigin`, `getCreditCategoriesForOrigin`, `getCreditItemsForCategory`, `getItemsForCategory`, `validateExpenseInput`
- `src/frontend/services/clientFinancialSummaryService.ts`: `calculateProjectFinancialSummary`
- `src/frontend/services/clientService.ts`: `getPaymentStatusByClientId`, `saveClientAndUpdateState`, `validateClientForProject`
- `src/frontend/services/dashboardFocusItems.ts`: `determineFocusItems`
- `src/frontend/services/dashboardService.ts`: `calculateProjectProgress`, `getActiveProjects`, `getDashboardKPIs`, `getFinancialOverview`, `getPendingMarketingTasks`, `getUpcomingEvents`
- `src/frontend/services/finance/emergencyFund.ts`: `EMERGENCY_FUND_TARGET_MONTHS`, `EmergencyFundInsight`, `getEmergencyFund`, `getEmergencyFundInsight`, `updateEmergencyFund`
- `src/frontend/services/finance/financeShared.ts`: `applySeriesFilters`, `buildFilterOptions`, `buildSeriesFromRecords`, `calculateChange`, `getMonthlyTotals`, `getReceivableCategory`, `isInMonth`, `mapDebitsToSeriesRecords`, `mapReceivablesToSeriesRecords`, `SeriesRecord`, `toMonthKey`
- `src/frontend/services/finance/financeUnifiedEntries.ts`: `buildUnifiedFinancialEntries`, `UnifiedFinancialEntries`
- `src/frontend/services/financeService.ts`: `EMERGENCY_FUND_TARGET_MONTHS`, `FinancialHistoryMode`, `getCashFlowForecastSeries`, `getEmergencyFund`, `getEmergencyFundInsight`, `getExpensesFilterOptions`, `getExpensesSeries`, `getFinancialPageData`, `getHistoryFilterOptions`, `getHistorySeries`, `getReceivablesFilterOptions`, `getReceivablesSeries`, `type EmergencyFundInsight`, `updateEmergencyFund`
- `src/frontend/services/hiredServiceService.ts`: `bindTasksToHiredService`, `cancelHiredService`, `clearTasksFromHiredService`, `completeHiredService`, `completeTasksFromHiredService`
- `src/frontend/services/infrastructure/api.ts`: `api`
- `src/frontend/services/infrastructure/autoBackupService.ts`: `autoBackupService`
- `src/frontend/services/infrastructure/driveDataAdapter.ts`: `driveDataAdapter`
- `src/frontend/services/infrastructure/driveFileService.ts`: `driveFileService`
- `src/frontend/services/infrastructure/driveMigrationService.ts`: `driveMigrationService`
- `src/frontend/services/infrastructure/driveSyncEngine.ts`: `driveSyncEngine`
- `src/frontend/services/infrastructure/driveSyncTypes.ts`: `ARRAY_DOMAIN_KEYS`, `BACKUPS_FOLDER_NAME`, `CONFIG_FILE_NAME`, `DATA_FOLDER_NAME`, `DOMAIN_FILE_MAP`, `DomainSyncMeta`, `DriveAccessMode`, `FILES_FOLDER_NAME`, `META_FILE_NAME`, `SCALAR_CONFIG_KEYS`, `StorageQuota`, `SyncDirection`, `SyncEngineListener`, `SyncEngineState`, `SyncMetaFile`, `SyncStatus`
- `src/frontend/services/infrastructure/googleDriveService.ts`: `googleDriveService`
- `src/frontend/services/infrastructure/googleDriveTypes.ts`: `DriveConnectionStatus`, `DriveFileMetadata`, `DriveState`, `GisTokenClient`, `GisTokenResponse`
- `src/frontend/services/infrastructure/importExport.ts`: `canAcceptImportedValue`, `exportData`, `importClients`, `importData`
- `src/frontend/services/infrastructure/indexedDbService.ts`: `AutomaticBackupRecord`, `indexedDbService`
- `src/frontend/services/infrastructure/loadData.ts`: `flushPersistence`, `initializeDataStore`, `invalidateCacheAndNotify`, `loadData`, `replaceData`, `reserveGlobalIdentifierCounter`, `resetForTest`, `resetPersistentDataAndNotify`, `updateData`
- `src/frontend/services/infrastructure/localDriveService.ts`: `localDriveService`
- `src/frontend/services/infrastructure/migrations.ts`: `createSeedClient`, `LegacyClientRecord`, `migrateClients`, `runStorageSchemaMigrations`, `SeedClientData`
- `src/frontend/services/infrastructure/persistence/createPersistenceAdapter.ts`: `createPersistenceAdapter`, `resetPersistenceAdapter`, `setPersistenceAdapter`
- `src/frontend/services/infrastructure/persistence/index.ts`: `createPersistenceAdapter`, `IndexedDbPersistenceAdapter`, `resetPersistenceAdapter`, `setPersistenceAdapter`, `SqlitePersistenceAdapter`
- `src/frontend/services/infrastructure/persistence/IndexedDbPersistenceAdapter.ts`: `IndexedDbPersistenceAdapter`
- `src/frontend/services/infrastructure/persistence/PersistencePort.ts`: `BackupMetadata`, `BackupRecord`, `CounterReservationResult`, `PersistencePort`, `WriteBackupOptions`
- `src/frontend/services/infrastructure/persistence/sqlite/sqliteMigrations.ts`: `runMigrations`
- `src/frontend/services/infrastructure/persistence/sqlite/sqliteRpc.ts`: `createSqliteRpc`, `SqliteRpcClient`, `SqliteRpcRequest`, `SqliteRpcResponse`
- `src/frontend/services/infrastructure/persistence/sqlite/sqliteSchema.ts`: `ARRAY_ENTITY_KEYS`, `ENTITY_TABLE_MAP`, `getDurabilityPragmas`, `getSchemaStatements`, `SCALAR_KEYS`
- `src/frontend/services/infrastructure/persistence/SqlitePersistenceAdapter.ts`: `SqlitePersistenceAdapter`
- `src/frontend/services/infrastructure/seedAgendaEvents.ts`: `applySeedAgendaEvents`
- `src/frontend/services/infrastructure/seedData.ts`: `applySeedClients`
- `src/frontend/services/infrastructure/seedProspects.ts`: `applySeedProspects`
- `src/frontend/services/infrastructure/seedReminders.ts`: `applySeedReminders`
- `src/frontend/services/infrastructure/storageQuotaService.ts`: `storageQuotaService`
- `src/frontend/services/infrastructure/storageService.ts`: `storageService`
- `src/frontend/services/infrastructure/uiPreferenceService.ts`: `uiPreferenceService`
- `src/frontend/services/proposalService.ts`: `proposalService`
- `src/frontend/services/quotationCommissionService.ts`: `deriveQuotationForecasts`
- `src/frontend/services/reportService.ts`: `generateReport`, `ReportDataInput`, `ReportFilter`
- `src/frontend/services/uiInteractionLockService.ts`: `uiInteractionLockService`

## UI Components (src/frontend/components/ui)

- `src/frontend/components/ui/Badge.tsx`: `Badge`
- `src/frontend/components/ui/Button.tsx`: `Button`
- `src/frontend/components/ui/CardShell.tsx`: `CardShell`
- `src/frontend/components/ui/DeleteConfirmationModal.tsx`: `DeleteConfirmationModal`
- `src/frontend/components/ui/DocumentIcons.tsx`: `DocumentIcons`
- `src/frontend/components/ui/EmptyState.tsx`: `EmptyState`
- `src/frontend/components/ui/FilterBar.tsx`: `FilterBar`
- `src/frontend/components/ui/FormField.tsx`: `FormField`
- `src/frontend/components/ui/iconBase.tsx`: `Icon`
- `src/frontend/components/ui/IconButton.tsx`: `IconButton`
- `src/frontend/components/ui/icons-common-extra.tsx`: `ArrowDownCircleIcon`, `ArrowLeftIcon`, `ArrowUpCircleIcon`, `DownloadIcon`, `EyeIcon`, `EyeOffIcon`, `FileJsonIcon`, `FileTextIcon`, `KeyIcon`, `LinkIcon`, `LockIcon`, `PencilIcon`, `RadarIcon`, `UploadCloudIcon`
- `src/frontend/components/ui/icons-common.tsx`: `AlertIcon`, `ArchiveIcon`, `ArrowDownCircleIcon`, `ArrowLeftIcon`, `ArrowUpCircleIcon`, `BellAlertIcon`, `BullhornIcon`, `CalendarPlusIcon`, `CameraIcon`, `CanceledIcon`, `CheckCircleIcon`, `ChevronDownIcon`, `ChevronLeftIcon`, `ChevronRightIcon`, `ClockIcon`, `CollectionIcon`, `DownloadIcon`, `EditIcon`, `EyeIcon`, `EyeOffIcon`, `FileJsonIcon`, `FileTextIcon`, `FolderIcon`, `GlobeIcon`, `KeyIcon`, `LinkIcon`, `ListViewIcon`, `LockIcon`, `MailIcon`, `MapPinIcon`, `MenuIcon`, `MinusIcon`, `NotStartedIcon`, `PausedIcon`, `PencilIcon`, `PhoneIcon`, `PlusIcon`, `RadarIcon`, `SearchIcon`, `SirenIcon`, `StarIcon`, `TagIcon`, `TrashIcon`, `UnarchiveIcon`, `UploadCloudIcon`, `UserCircleIcon`, `UsersIconV3`, `XCircleIcon`, `XIcon`
- `src/frontend/components/ui/icons-navigation.tsx`: `AgendaIcon`, `BriefcaseIcon`, `DocumentosIcon`, `FinanceiroIcon`, `HomeIcon`, `MarketingIconNew`, `ProjetosIcon`, `RelatoriosIcon`, `SettingsIcon`, `SubcontratacaoIcon`, `SuprimentosIcon`, `UsersIcon`
- `src/frontend/components/ui/icons-social.tsx`: `FacebookIcon`, `GoogleIcon`, `InstagramIcon`, `LinkedInIcon`, `TikTokIcon`, `YouTubeIcon`
- `src/frontend/components/ui/icons-submenu.tsx`: `BadgeIcon`, `BuildingIcon`, `CashBoxIcon`, `CashIcon`, `ChartBarIcon`, `ClipboardDocumentListIcon`, `ConteudosIcon`, `CreditCardIcon`, `CubeIcon`, `DocumentosProjetosIcon`, `DollarSignIcon`, `GiftIcon`, `MeusDocumentosIcon`, `OrcamentosIcon`, `PainelIcon`, `ProposalIcon`, `RedesSociaisIcon`, `StackedCoinsIcon`, `UserPlusIcon`
- `src/frontend/components/ui/icons.tsx`: `AgendaIcon`, `AlertIcon`, `ArchiveIcon`, `ArrowDownCircleIcon`, `ArrowLeftIcon`, `ArrowUpCircleIcon`, `BadgeIcon`, `BellAlertIcon`, `BriefcaseIcon`, `BuildingIcon`, `BullhornIcon`, `CalendarPlusIcon`, `CanceledIcon`, `CashBoxIcon`, `CashIcon`, `ChartBarIcon`, `CheckCircleIcon`, `ChevronDownIcon`, `ChevronLeftIcon`, `ChevronRightIcon`, `ClipboardDocumentListIcon`, `ClockIcon`, `CollectionIcon`, `ConteudosIcon`, `CreditCardIcon`, `CubeIcon`, `DocumentosIcon`, `DocumentosProjetosIcon`, `DollarSignIcon`, `DownloadIcon`, `EditIcon`, `EyeIcon`, `EyeOffIcon`, `FacebookIcon`, `FileJsonIcon`, `FileTextIcon`, `FinanceiroIcon`, `GiftIcon`, `GlobeIcon`, `GoogleIcon`, `HomeIcon`, `ICON_MAP`, `InstagramIcon`, `KeyIcon`, `LinkedInIcon`, `LinkIcon`, `ListViewIcon`, `LockIcon`, `LogoIcon`, `MailIcon`, `MapPinIcon`, `MarketingIconNew`, `MenuIcon`, `MeusDocumentosIcon`, `MinusIcon`, `NotStartedIcon`, `OrcamentosIcon`, `PainelIcon`, `PausedIcon`, `PencilIcon`, `PhoneIcon`, `PlusIcon`, `ProjetosIcon`, `ProposalIcon`, `RadarIcon`, `RedesSociaisIcon`, `RelatoriosIcon`, `SearchIcon`, `SettingsIcon`, `SirenIcon`, `StackedCoinsIcon`, `StarIcon`, `SubcontratacaoIcon`, `SuprimentosIcon`, `TagIcon`, `TikTokIcon`, `TrashIcon`, `UnarchiveIcon`, `UploadCloudIcon`, `UserCircleIcon`, `UserPlusIcon`, `UsersIcon`, `XCircleIcon`, `XIcon`, `YouTubeIcon`
- `src/frontend/components/ui/index.ts`: `AgendaIcon`, `AlertIcon`, `ArchiveIcon`, `ArrowDownCircleIcon`, `ArrowLeftIcon`, `ArrowUpCircleIcon`, `Badge`, `BuildingIcon`, `BullhornIcon`, `Button`, `CalendarPlusIcon`, `CashIcon`, `ChartBarIcon`, `CheckCircleIcon`, `ChevronDownIcon`, `ChevronLeftIcon`, `ChevronRightIcon`, `ClipboardDocumentListIcon`, `ClockIcon`, `CollectionIcon`, `CubeIcon`, `DeleteConfirmationModal`, `DocumentIcons`, `DollarSignIcon`, `DownloadIcon`, `EditIcon`, `EmptyState`, `EyeIcon`, `FacebookIcon`, `FileJsonIcon`, `FileTextIcon`, `FilterBar`, `FormField`, `GiftIcon`, `GlobeIcon`, `IconButton`, `Input`, `InstagramIcon`, `KeyIcon`, `LinkIcon`, `ListViewIcon`, `LockIcon`, `MailIcon`, `MapPinIcon`, `MinusIcon`, `Modal`, `MonthNavigator`, `PasswordInput`, `PencilIcon`, `PhoneIcon`, `PlusIcon`, `ProjetosIcon`, `ProposalIcon`, `RadarIcon`, `renderRecurrenceBadge`, `SearchIcon`, `Section`, `Select`, `StarIcon`, `StatusBadge`, `Tab`, `TableShell`, `TabList`, `TabPanel`, `Tabs`, `TagIcon`, `Textarea`, `TikTokIcon`, `Toggle`, `Toolbar`, `TrashIcon`, `UnarchiveIcon`, `UploadCloudIcon`, `UserCircleIcon`, `UsersIcon`, `XCircleIcon`, `XIcon`
- `src/frontend/components/ui/Input.tsx`: `Input`
- `src/frontend/components/ui/MonthNavigator.tsx`: `MonthNavigator`
- `src/frontend/components/ui/PasswordInput.tsx`: `PasswordInput`
- `src/frontend/components/ui/Section.tsx`: `Section`
- `src/frontend/components/ui/Select.tsx`: `Select`
- `src/frontend/components/ui/StatusBadge.tsx`: `renderRecurrenceBadge`, `StatusBadge`
- `src/frontend/components/ui/TableShell.tsx`: `TableShell`
- `src/frontend/components/ui/Tabs.tsx`: `Tab`, `TabList`, `TabPanel`, `Tabs`
- `src/frontend/components/ui/Textarea.tsx`: `Textarea`
- `src/frontend/components/ui/Toggle.tsx`: `Toggle`
- `src/frontend/components/ui/Toolbar.tsx`: `Toolbar`

## Utils (src/frontend/utils)

- `src/frontend/utils/addendumUtils.ts`: `appendAddendumAuditEntry`, `recalculateProjectTotals`
- `src/frontend/utils/addendumWorkflow.ts`: `canTransitionAddendumStatus`, `getAllowedAddendumStatusTransitions`, `getStatusSelectionOptions`
- `src/frontend/utils/budgetHelpers.ts`: `calculateBudgetTotals`, `initializeSections`
- `src/frontend/utils/documents.ts`: `fileToB64`, `openDocument`
- `src/frontend/utils/formatters.ts`: `formatBytes`, `formatCEP`, `formatCpfCnpj`, `formatCurrency`, `formatDate`, `formatDateDayMonth`, `formatDateLong`, `formatDateWithTime`, `formatPhone`, `formatYAxisTick`, `getDeadlineInfo`, `getTodayDateOnly`, `parseDateString`, `toDateOnlyString`
- `src/frontend/utils/projectFinancials.ts`: `getApprovedAddendumTotal`, `getProjectBaseContractValue`, `getProjectLumpSumValue`, `getProjectTotalContractValue`
- `src/frontend/utils/prospectUtils.ts`: `getDaysRemaining`, `sortProspectsForRadar`
- `src/frontend/utils/reminderUtils.ts`: `archiveReminder`, `isArchivedReminder`, `reactivateReminder`
- `src/frontend/utils/supplierHelpers.ts`: `getInitials`, `getInitialSupplier`, `getLatestPriceFromHistory`
- `src/frontend/utils/taskUtils.ts`: `allSubtasksDone`, `archiveCompletedTask`, `isArchivedTask`, `KANBAN_COLUMNS`, `priorityConfig`, `reactivateArchivedTask`
- `src/frontend/utils/tree.ts`: `addItemToTree`, `deleteRecursive`, `traverseAndCollect`, `traverseAndModify`

## Types (src/frontend/types)

- `src/frontend/types/agenda.ts`: `AgendaEvent`, `AgendaEventRecurrence`, `AgendaEventType`, `agendaEventTypes`, `ContractDeadlinesSettings`, `KanbanStatus`, `Reminder`
- `src/frontend/types/appData.ts`: `AppData`
- `src/frontend/types/cashBox.ts`: `CashBoxCategory`, `CashBoxCredit`, `CashBoxCreditCategory`, `cashBoxCreditPersonalCategories`, `CashBoxCreditPersonalCategory`, `cashBoxCreditPersonalItems`, `cashBoxCreditProfessionalCategories`, `CashBoxCreditProfessionalCategory`, `cashBoxCreditProfessionalItems`, `CashBoxExpense`, `CashBoxOrigin`, `cashBoxPersonalCategories`, `CashBoxPersonalCategory`, `cashBoxPersonalItems`, `cashBoxProfessionalCategories`, `CashBoxProfessionalCategory`, `cashBoxProfessionalItems`, `CashBoxRecurrence`, `cashBoxRecurrences`, `UnifiedEntry`
- `src/frontend/types/client.ts`: `Client`, `ClientContact`, `ClientLink`, `ClientStatus`, `clientStatuses`, `PaymentStatus`, `paymentStatuses`, `ProjectMeeting`, `Prospect`, `ProspectPriority`, `ProspectStatus`
- `src/frontend/types/common.ts`: `NavIconName`, `NavLinkItem`
- `src/frontend/types/document.ts`: `DocumentFile`, `DocumentFolder`, `DocumentItem`, `DocumentSource`, `DocumentStatus`, `DocumentStorage`
- `src/frontend/types/finance.ts`: `Commission`, `CommissionStatus`, `commissionStatuses`, `EmergencyFund`, `ManualIncome`, `PaymentMethod`, `paymentMethods`, `ProfessionalExpense`, `ProfessionalExpenseCategory`, `ProfessionalExpenseStatus`
- `src/frontend/types/financial-series.ts`: `Filters`, `FinanceLineChartFilters`, `FinancialSeriesSource`, `PeriodMode`, `PeriodSelection`, `SeriesFilterOptions`, `SeriesPoint`
- `src/frontend/types/financial-views.ts`: `FinancialDebit`, `FinancialReceivable`
- `src/frontend/types/freelancer.ts`: `Freelancer`, `FreelancerProject`, `HiredService`, `HiredServiceStatus`
- `src/frontend/types/marketing.ts`: `InstagramSnapshot`, `MarketingActivity`, `MarketingActivityStatus`, `marketingActivityStatuses`, `MarketingBillingFormat`, `marketingBillingFormats`, `MarketingContentType`, `marketingContentTypes`, `MarketingProfessional`, `SocialNetwork`, `SocialNetworkName`
- `src/frontend/types/project.ts`: `AddendumAuditEntry`, `AdditionalDeadline`, `ContractAddendum`, `ContractAddendumStatus`, `Installment`, `Project`, `ProjectAddress`, `ProjectFinancials`, `ProjectSection`, `ProjectStatus`, `projectStatuses`, `ProjectTask`, `Purchase`, `Subtask`, `TaskPriority`, `TaskStatus`
- `src/frontend/types/proposal.ts`: `BillingInfo`, `BillingMethod`, `BudgetItem`, `BudgetSection`, `BudgetTemplateItem`, `BudgetTemplateSection`, `BudgetUnit`, `Proposal`, `ProposalBlock`, `ProposalBlockType`, `ProposalStatus`, `SavedItem`, `SavedSection`
- `src/frontend/types/supply-chain.ts`: `PriceEntry`, `Product`, `ProductUnit`, `Quotation`, `QuotationItem`, `Supplier`, `SupplierContact`, `SupplierProductPrice`
