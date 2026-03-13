# Canonical Example: Extração de Lógica para Hook

## Objetivo

Mostrar como extrair lógica de componente para hook customizado mantendo UI focada em composição.

## Arquivos de referência

- Hook: `src/frontend/hooks/useProjectChecklist.ts`
- Componente consumidor: `src/frontend/components/projetos/tabs/ProjectChecklistTab.tsx`
- Página orquestradora: `src/frontend/pages/projetos/detalhes/ProjetoDetalhesPageContent.tsx`

## Contexto

A aba de checklist de projeto combinava renderização de UI com mutações de estado de seções, tarefas e dependências. O padrão recomendado é: regra e mutação em hook, componente visual consumindo handlers.

## Antes (trecho representativo)

```tsx
const ProjectChecklistTab = ({ localProject, setLocalProject }) => {
  const handleAddTask = (sectionId: string) => {
    setLocalProject((p) =>
      p
        ? {
            ...p,
            sections: p.sections.map((s) =>
              s.id === sectionId
                ? {
                    ...s,
                    tasks: [
                      ...s.tasks,
                      { id: uuidv4(), name: '', completed: false, hours: 0, status: 'todo' },
                    ],
                  }
                : s,
            ),
          }
        : null,
    );
  };

  const handleRemoveTask = (sectionId: string, taskId: string) => {
    setLocalProject((p) =>
      p
        ? {
            ...p,
            sections: p.sections.map((s) =>
              s.id === sectionId ? { ...s, tasks: s.tasks.filter((t) => t.id !== taskId) } : s,
            ),
          }
        : null,
    );
  };

  return <ChecklistUI onAddTask={handleAddTask} onRemoveTask={handleRemoveTask} />;
};
```

## Depois (extração para hook)

```tsx
// src/frontend/hooks/useProjectChecklist.ts
export function useProjectChecklist(setLocalProject: ProjectSetter) {
  const handleAddTask = (sectionId: string) =>
    setLocalProject((p) =>
      p
        ? {
            ...p,
            sections: p.sections.map((s) =>
              s.id === sectionId
                ? {
                    ...s,
                    tasks: [
                      ...s.tasks,
                      { id: uuidv4(), name: '', completed: false, hours: 0, status: 'todo' },
                    ],
                  }
                : s,
            ),
          }
        : null,
    );

  const handleRemoveTask = (sectionId: string, taskId: string) =>
    setLocalProject((p) =>
      p
        ? {
            ...p,
            sections: p.sections.map((s) =>
              s.id === sectionId ? { ...s, tasks: s.tasks.filter((t) => t.id !== taskId) } : s,
            ),
          }
        : null,
    );

  return { handleAddTask, handleRemoveTask };
}

// consumidor (UI): usa handlers sem carregar regra de mutação
const { handleAddTask, handleRemoveTask } = useProjectChecklist(setLocalProject);
```

## Anti-pattern (NÃO fazer)

```tsx
// ERRADO: hook que renderiza JSX (mistura responsabilidade)
export function useChecklist() {
  return <div>UI dentro do hook</div>;
}

// ERRADO: hook que muta estado externo sem setter controlado
export function useChecklistBad(project: Project) {
  project.sections.push({ id: 'x', name: 'Nova', tasks: [] });
}
```

## Regra de manutenção

- Mudou contrato de handlers (`onAddTask`, `onRemoveTask`, etc.): atualizar hook e consumidores no mesmo diff.
- Mudou boundary entre UI e regra: atualizar este exemplo e registrar em `DECISIONS-active.md`/ADR se for estrutural.
