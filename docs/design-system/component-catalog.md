# Component Catalog

Catálogo de componentes UI do Nexus-Arqui. Todos em `src/frontend/components/`.

---

## Icons

### General Icons — [icons.tsx](file:///c:/Users/gustavo.geraldo/Documents/05.%20Nexus-Arqui%20%28Beta%29/src/frontend/components/ui/icons.tsx)

~90 ícones SVG (Heroicons-style, stroke-based). Todos aceitam `{ className?: string }`.

**Categorias**: Navigation (Home, Agenda, Projetos), UI (Plus, Edit, Trash, Search, Chevron, X), Status (CheckCircle, XCircle, Alert, Clock), Domain (Building, Cube, Briefcase, DollarSign, Gift, Tag).

**Uso**: import individual por nome ou via `ICON_MAP` para renderização dinâmica.

### Social/Brand Icons — [icons-social.tsx](file:///c:/Users/gustavo.geraldo/Documents/05.%20Nexus-Arqui%20%28Beta%29/src/frontend/components/ui/icons-social.tsx)

6 ícones de redes sociais com cores oficiais de marca: `InstagramIcon`, `FacebookIcon`, `LinkedInIcon`, `TikTokIcon`, `YouTubeIcon`, `GoogleIcon`.

### Document Icons — [DocumentIcons.tsx](file:///c:/Users/gustavo.geraldo/Documents/05.%20Nexus-Arqui%20%28Beta%29/src/frontend/components/ui/DocumentIcons.tsx)

Ícones por tipo de arquivo + actions de documentos. `DocumentIcons.GetIcon({ type, className })` resolve ícone por extensão/MIME.

---

## Layout

| Componente      | Arquivo                                                                                                                                         | Props Principais               |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ |
| `Sidebar`       | [Sidebar.tsx](file:///c:/Users/gustavo.geraldo/Documents/05.%20Nexus-Arqui%20%28Beta%29/src/frontend/components/layout/Sidebar.tsx)             | `collapsed`, `onToggle`        |
| `Header`        | [Header.tsx](file:///c:/Users/gustavo.geraldo/Documents/05.%20Nexus-Arqui%20%28Beta%29/src/frontend/components/layout/Header.tsx)               | título, breadcrumbs            |
| `PageHeader`    | [PageHeader.tsx](file:///c:/Users/gustavo.geraldo/Documents/05.%20Nexus-Arqui%20%28Beta%29/src/frontend/components/layout/PageHeader.tsx)       | `title`, `subtitle`, `actions` |
| `ErrorBoundary` | [ErrorBoundary.tsx](file:///c:/Users/gustavo.geraldo/Documents/05.%20Nexus-Arqui%20%28Beta%29/src/frontend/components/layout/ErrorBoundary.tsx) | `children`, fallback UI        |

---

## Navigation

| Componente     | Arquivo                                                                                                                                    | Props Principais          |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------- |
| `SidebarLinks` | [SidebarLinks.tsx](file:///c:/Users/gustavo.geraldo/Documents/05.%20Nexus-Arqui%20%28Beta%29/src/frontend/components/nav/SidebarLinks.tsx) | `items[]`, usa `ICON_MAP` |

---

## Feedback

| Componente                | Arquivo                                                                                                                                                         | Props Principais                              |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| `Modal`                   | [Modal.tsx](file:///c:/Users/gustavo.geraldo/Documents/05.%20Nexus-Arqui%20%28Beta%29/src/frontend/components/ui/Modal.tsx)                                     | `isOpen`, `onClose`, `title`, `children`      |
| `DeleteConfirmationModal` | [DeleteConfirmationModal.tsx](file:///c:/Users/gustavo.geraldo/Documents/05.%20Nexus-Arqui%20%28Beta%29/src/frontend/components/ui/DeleteConfirmationModal.tsx) | `isOpen`, `onConfirm`, `onCancel`, `itemName` |

---

## Finance / Data Display

| Componente         | Arquivo                                                                                                                                                                      | Props Principais                  |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- |
| `KPICard`          | [KPICard.tsx](file:///c:/Users/gustavo.geraldo/Documents/05.%20Nexus-Arqui%20%28Beta%29/src/frontend/components/finance/KPICard.tsx)                                         | `title`, `value`, `icon`, `trend` |
| `CardShell`        | [CardShell.tsx](file:///c:/Users/gustavo.geraldo/Documents/05.%20Nexus-Arqui%20%28Beta%29/src/frontend/components/finance/CardShell.tsx)                                     | `children`, card wrapper          |
| `HealthBar`        | [HealthBar.tsx](file:///c:/Users/gustavo.geraldo/Documents/05.%20Nexus-Arqui%20%28Beta%29/src/frontend/components/finance/HealthBar.tsx)                                     | `value`, `max`, visual health bar |
| `MarginBar`        | [MarginBar.tsx](file:///c:/Users/gustavo.geraldo/Documents/05.%20Nexus-Arqui%20%28Beta%29/src/frontend/components/finance/MarginBar.tsx)                                     | `margin`, percentage bar          |
| `SectionTitle`     | [SectionTitle.tsx](file:///c:/Users/gustavo.geraldo/Documents/05.%20Nexus-Arqui%20%28Beta%29/src/frontend/components/finance/SectionTitle.tsx)                               | `title`, section header           |
| `FinanceLineChart` | [FinanceLineChart.tsx](file:///c:/Users/gustavo.geraldo/Documents/05.%20Nexus-Arqui%20%28Beta%29/src/frontend/components/finance/FinanceLineChart.tsx)                       | `data`, Recharts wrapper          |
| `CustomTooltip`    | [CustomTooltip.tsx](file:///c:/Users/gustavo.geraldo/Documents/05.%20Nexus-Arqui%20%28Beta%29/src/frontend/components/finance/chart/CustomTooltip.tsx)                       | Recharts custom tooltip           |
| `DonutTooltip`     | [DonutTooltip.tsx](file:///c:/Users/gustavo.geraldo/Documents/05.%20Nexus-Arqui%20%28Beta%29/src/frontend/components/finance/chart/DonutTooltip.tsx)                         | PieChart tooltip                  |
| `FinancialKPICard` | [FinancialKPICard.tsx](file:///c:/Users/gustavo.geraldo/Documents/05.%20Nexus-Arqui%20%28Beta%29/src/frontend/components/projetos/tabs/project-finance/FinancialKPICard.tsx) | project finance KPI               |

---

## Domain Modals (Forms)

| Domínio       | Componente                 | Arquivo                                                                                                                                                                  |
| ------------- | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Agenda**    | `EventFormModal`           | [EventFormModal.tsx](file:///c:/Users/gustavo.geraldo/Documents/05.%20Nexus-Arqui%20%28Beta%29/src/frontend/components/agenda/EventFormModal.tsx)                        |
| **Agenda**    | `ReminderFormModal`        | [ReminderFormModal.tsx](file:///c:/Users/gustavo.geraldo/Documents/05.%20Nexus-Arqui%20%28Beta%29/src/frontend/components/agenda/ReminderFormModal.tsx)                  |
| **Agenda**    | `SubtaskDetailModal`       | [SubtaskDetailModal.tsx](file:///c:/Users/gustavo.geraldo/Documents/05.%20Nexus-Arqui%20%28Beta%29/src/frontend/components/agenda/SubtaskDetailModal.tsx)                |
| **Catálogo**  | `ProductFormModal`         | [ProductFormModal.tsx](file:///c:/Users/gustavo.geraldo/Documents/05.%20Nexus-Arqui%20%28Beta%29/src/frontend/components/catalogo/ProductFormModal.tsx)                  |
| **Catálogo**  | `AddSupplierPriceModal`    | [AddSupplierPriceModal.tsx](file:///c:/Users/gustavo.geraldo/Documents/05.%20Nexus-Arqui%20%28Beta%29/src/frontend/components/catalogo/AddSupplierPriceModal.tsx)        |
| **Clientes**  | `ClientFormModal`          | [ClientFormModal.tsx](file:///c:/Users/gustavo.geraldo/Documents/05.%20Nexus-Arqui%20%28Beta%29/src/frontend/components/clientes/ClientFormModal.tsx)                    |
| **Clientes**  | `ClientSelectionModal`     | [ClientSelectionModal.tsx](file:///c:/Users/gustavo.geraldo/Documents/05.%20Nexus-Arqui%20%28Beta%29/src/frontend/components/clientes/ClientSelectionModal.tsx)          |
| **Finance**   | `CashBoxCreditFormModal`   | [CashBoxCreditFormModal.tsx](file:///c:/Users/gustavo.geraldo/Documents/05.%20Nexus-Arqui%20%28Beta%29/src/frontend/components/finance/CashBoxCreditFormModal.tsx)       |
| **Finance**   | `CashBoxExpenseFormModal`  | [CashBoxExpenseFormModal.tsx](file:///c:/Users/gustavo.geraldo/Documents/05.%20Nexus-Arqui%20%28Beta%29/src/frontend/components/finance/CashBoxExpenseFormModal.tsx)     |
| **Marketing** | `ActivityFormModal`        | [ActivityFormModal.tsx](file:///c:/Users/gustavo.geraldo/Documents/05.%20Nexus-Arqui%20%28Beta%29/src/frontend/components/marketing/ActivityFormModal.tsx)               |
| **Marketing** | `IdeaFormModal`            | [IdeaFormModal.tsx](file:///c:/Users/gustavo.geraldo/Documents/05.%20Nexus-Arqui%20%28Beta%29/src/frontend/components/marketing/IdeaFormModal.tsx)                       |
| **Marketing** | `InstagramCredentialModal` | [InstagramCredentialModal.tsx](file:///c:/Users/gustavo.geraldo/Documents/05.%20Nexus-Arqui%20%28Beta%29/src/frontend/components/marketing/InstagramCredentialModal.tsx) |
| **Marketing** | `ProfessionalFormModal`    | [ProfessionalFormModal.tsx](file:///c:/Users/gustavo.geraldo/Documents/05.%20Nexus-Arqui%20%28Beta%29/src/frontend/components/marketing/ProfessionalFormModal.tsx)       |
| **Projetos**  | `TaskDetailModal`          | [TaskDetailModal.tsx](file:///c:/Users/gustavo.geraldo/Documents/05.%20Nexus-Arqui%20%28Beta%29/src/frontend/components/projetos/TaskDetailModal.tsx)                    |

---

## Domain Components

| Domínio        | Componente               | Arquivo                                                                                                                                                               |
| -------------- | ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Agenda**     | `ReminderEmptyState`     | [ReminderEmptyState.tsx](file:///c:/Users/gustavo.geraldo/Documents/05.%20Nexus-Arqui%20%28Beta%29/src/frontend/components/agenda/ReminderEmptyState.tsx)             |
| **Agenda**     | `ReminderIcons`          | [ReminderIcons.tsx](file:///c:/Users/gustavo.geraldo/Documents/05.%20Nexus-Arqui%20%28Beta%29/src/frontend/components/agenda/ReminderIcons.tsx)                       |
| **Clientes**   | `ClientProjectsTab`      | [ClientProjectsTab.tsx](file:///c:/Users/gustavo.geraldo/Documents/05.%20Nexus-Arqui%20%28Beta%29/src/frontend/components/clientes/ClientProjectsTab.tsx)             |
| **Clientes**   | `ClientTableRow`         | [ClientTableRow.tsx](file:///c:/Users/gustavo.geraldo/Documents/05.%20Nexus-Arqui%20%28Beta%29/src/frontend/components/clientes/ClientTableRow.tsx)                   |
| **Orçamentos** | `BudgetSectionComponent` | [BudgetSectionComponent.tsx](file:///c:/Users/gustavo.geraldo/Documents/05.%20Nexus-Arqui%20%28Beta%29/src/frontend/components/orcamentos/BudgetSectionComponent.tsx) |
| **Projetos**   | `ProjectComponents`      | [ProjectComponents.tsx](file:///c:/Users/gustavo.geraldo/Documents/05.%20Nexus-Arqui%20%28Beta%29/src/frontend/components/projetos/ProjectComponents.tsx)             |
| **Projetos**   | `ProjetoDetalhesWidgets` | [ProjetoDetalhesWidgets.tsx](file:///c:/Users/gustavo.geraldo/Documents/05.%20Nexus-Arqui%20%28Beta%29/src/frontend/components/projetos/ProjetoDetalhesWidgets.tsx)   |

---

## Barrel Export

Componentes UI reutilizáveis são exportados via [index.ts](file:///c:/Users/gustavo.geraldo/Documents/05.%20Nexus-Arqui%20%28Beta%29/src/frontend/components/ui/index.ts):

```tsx
import { Modal, DocumentIcons, InstagramIcon } from '@/components/ui';
```
