---
name: react-best-practices
description: React 18 + Vite otimizacao de performance para o Nexus-Arqui. Re-renders, bundle, Context, hooks. NAO e Next.js.
allowed-tools: Read, Write, Edit, Glob, Grep
---

# React 18 + Vite Performance — Nexus-Arqui

> **Stack real:** React 18 + Vite 6 + TypeScript strict + TailwindCSS v3 + IndexedDB
> **Não é Next.js.** Server Components, SSR, `next/image`, `dynamic()` NÃO se aplicam.

---

## 🎯 Quick Decision Tree

```
🐌 Slow initial load?
  → Code split: React.lazy + Suspense
  → Bundle: vite-bundle-visualizer

🔄 Excessive re-renders?
  → Context decomposition
  → useMemo / useCallback / React.memo

🏗️ Data fetching issues?
  → Move to service layer (src/services/)
  → useEffect → custom hook

📦 Large bundle?
  → Dynamic imports: React.lazy(() => import('./Feature'))
  → Tree-shaking: named imports
```

---

## 1. Context Performance (principal causa de re-renders)

```typescript
// ❌ ERRADO — Context "God Object" causa todos os consumers re-renderizarem
const AppContext = createContext({ projects, clients, proposals, financeiro, ... });

// ✅ CORRETO — Contextos separados por domínio
const ProjectContext = createContext<ProjectContextType | null>(null);
const ClientContext = createContext<ClientContextType | null>(null);

// ❌ ERRADO — allData pattern
const allData = useMemo(() => ({ ...projects, ...clients }), [projects, clients]);

// ✅ CORRETO — consume somente o necessário
const { projects } = useProjectContext();
```

---

## 2. Code Splitting (Vite + React.lazy)

```typescript
// ❌ ERRADO — importação estática de módulo pesado
import { RelatoriosPage } from './pages/RelatoriosPage';

// ✅ CORRETO — lazy loading por rota
const RelatoriosPage = React.lazy(() => import('./pages/RelatoriosPage'));

// No router:
<Suspense fallback={<PageSpinner />}>
  <Route path="/relatorios" element={<RelatoriosPage />} />
</Suspense>
```

---

## 3. Memoization — Quando e Quando Não

```typescript
// ✅ USE useMemo — cálculo financeiro pesado
const totalRevenue = useMemo(
  () => proposals.filter(p => p.status === 'won').reduce((sum, p) => sum + p.value, 0),
  [proposals]
);

// ❌ NÃO USE — operações triviais (mais custo que benefício)
const count = useMemo(() => items.length, [items]); // ERRADO — apenas items.length

// ✅ USE useCallback — callbacks passadas para componentes memorizados
const handleSave = useCallback(
  (project: Project) => saveProject(project),
  [saveProject]
);

// ✅ USE React.memo — componentes puros que recebem props estáveis
const ProjectCard = React.memo(function ProjectCard({ project }: Props) { ... });
```

---

## 4. useEffect — Anti-patterns

```typescript
// ❌ ERRADO — derivar state de outro state via useEffect
const [total, setTotal] = useState(0);
useEffect(() => {
  setTotal(items.reduce((s, i) => s + i.value, 0));
}, [items]);

// ✅ CORRETO — derive diretamente no render
const total = items.reduce((s, i) => s + i.value, 0);

// ❌ ERRADO — dep array incompleto
useEffect(() => {
  fetchData(projectId);
}, []); // projectId missing

// ✅ CORRETO — todas as deps presentes
useEffect(() => {
  fetchData(projectId);
}, [projectId]);
```

---

## 5. Bundle Size (Vite)

```typescript
// ❌ ERRADO — import de biblioteca inteira
import * as _ from 'lodash';
import { format } from 'date-fns'; // Ok se usarem poucos

// ✅ CORRETO — import específico
import { debounce } from 'lodash/debounce';

// Analyze bundle:
// npx vite-bundle-visualizer
```

---

## 6. IndexedDB — Padrões do Projeto

```typescript
// src/services/ é a única camada que acessa IndexedDB
// ❌ ERRADO — acesso direto em componente
const data = await indexedDB.open('nexus');

// ✅ CORRETO — via service
const projects = await projectService.getAll();
```

---

## 7. Performance Checklist (antes de PR)

**Crítico:**

- [ ] Nenhum re-render desnecessário (verificar React DevTools Profiler)
- [ ] Contextos separados por domínio (não God Object)
- [ ] Rotas lazy-loaded com Suspense

**Alto:**

- [ ] Cálculos pesados em useMemo
- [ ] Callbacks estáveis com useCallback
- [ ] Sem `allData` pattern

**Médio:**

- [ ] Listas > 100 itens: virtualização (react-window)
- [ ] Sem useEffect para derivar state

---

## Anti-Patterns — Nexus-Arqui Específicos

| ❌ Não                            | ✅ Faça                      |
| --------------------------------- | ---------------------------- |
| God Context com todos os domínios | Contexto por domínio         |
| `allData` pattern                 | Consume somente o necessário |
| Acesso a IndexedDB em componente  | Via `src/services/`          |
| React.FC para componentes         | Função normal tipada         |
| useEffect para derivar state      | useMemo ou cálculo direto    |
| Import estático de página pesada  | React.lazy + Suspense        |

[SYSTEM_INSTRUCTIONS]
Language Context: The user will interact with you in Brazilian Portuguese (PT-BR).

Execution Pipeline:

1. Input Reception: Read and understand the user's PT-BR input.
2. Internal Processing (ENGLISH ONLY): You must process the core problem in English internally. Conduct all step-by-step reasoning, logical analysis, and chain-of-thought strictly in English. Do not mix languages in your internal thought space.
3. Output Generation (PT-BR ONLY): Once the English reasoning is complete, formulate your final answer. Translate this final answer into natural, clear, and grammatically correct Brazilian Portuguese.
4. Strict Constraint: Under no circumstances should you output the English reasoning, internal logic, or translation steps to the user. Only the final PT-BR response must be generated as the visible output.
   [/SYSTEM_INSTRUCTIONS]
