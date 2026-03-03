import React, { useState, useCallback, useEffect } from 'react';
import { useAutoReset } from '@/hooks/useAutoReset';
import { PageHeader } from '@/components/layout';
import { NAV_LINKS } from '@/constants';
import { PlusIcon, TrashIcon, CheckCircleIcon, XIcon, EditIcon } from '@/components/ui';
import useLocalStorage from '@/hooks/useLocalStorage';

// ─── TYPES ───────────────────────────────────────────────────
interface NoteTab {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

// ─── CONSTANTS ───────────────────────────────────────────────
const STORAGE_KEY = 'nexus-bloco-de-notas';
const MAX_TITLE_LENGTH = 30;

const generateId = (): string => `note-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const createEmptyTab = (): NoteTab => ({
  id: generateId(),
  title: 'Sem título',
  content: '',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

// ─── MAIN PAGE ───────────────────────────────────────────────
const BlocoDeNotasPage: () => React.ReactNode = () => {
  const [tabs, setTabs] = useLocalStorage<NoteTab[]>(STORAGE_KEY, [createEmptyTab()]);
  const [activeTabId, setActiveTabId] = useState<string>(() => tabs[0]?.id ?? '');
  const [editingTitleId, setEditingTitleId] = useState<string | null>(null);
  const [saveFlash, setSaveFlash] = useAutoReset(false, 1200);

  const activeTab = tabs.find((t) => t.id === activeTabId) ?? tabs[0];

  useEffect(() => {
    if (tabs.length > 0) return;
    setTabs([createEmptyTab()]);
  }, [setTabs, tabs]);

  useEffect(() => {
    if (tabs.length === 0) return;
    if (tabs.some((tab) => tab.id === activeTabId)) return;
    setActiveTabId(tabs[0].id);
  }, [activeTabId, tabs]);

  const pageIcon = NAV_LINKS.find((l) => l.label === 'Agenda')?.children?.find(
    (c) => c.label === 'Bloco de Notas',
  )?.icon;

  const handleAddTab = useCallback(() => {
    const newTab = createEmptyTab();
    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(newTab.id);
  }, [setTabs]);

  const handleCloseTab = useCallback(
    (tabId: string) => {
      setTabs((prev) => {
        const filtered = prev.filter((t) => t.id !== tabId);
        if (filtered.length === 0) {
          const fallback = createEmptyTab();
          setActiveTabId(fallback.id);
          return [fallback];
        }
        if (activeTabId === tabId) {
          const closedIndex = prev.findIndex((t) => t.id === tabId);
          const nextTab = filtered[Math.min(closedIndex, filtered.length - 1)];
          setActiveTabId(nextTab.id);
        }
        return filtered;
      });
    },
    [activeTabId, setTabs],
  );

  const handleContentChange = useCallback(
    (newContent: string) => {
      setTabs((prev) =>
        prev.map((t) =>
          t.id === activeTabId
            ? { ...t, content: newContent, updatedAt: new Date().toISOString() }
            : t,
        ),
      );
    },
    [activeTabId, setTabs],
  );

  const handleTitleChange = useCallback(
    (tabId: string, newTitle: string) => {
      const trimmed = newTitle.slice(0, MAX_TITLE_LENGTH) || 'Sem título';
      setTabs((prev) =>
        prev.map((t) =>
          t.id === tabId ? { ...t, title: trimmed, updatedAt: new Date().toISOString() } : t,
        ),
      );
    },
    [setTabs],
  );

  const handleSave = useCallback(() => {
    setSaveFlash(true);
  }, [setSaveFlash]);

  const handleClear = useCallback(() => {
    setTabs((prev) =>
      prev.map((t) =>
        t.id === activeTabId ? { ...t, content: '', updatedAt: new Date().toISOString() } : t,
      ),
    );
  }, [activeTabId, setTabs]);

  return (
    <div className="animate-fade-in-up h-full flex flex-col px-2 pt-2 md:px-4 md:pt-4 lg:px-6 lg:pt-6 overflow-hidden">
      <PageHeader title="Bloco de Notas" icon={pageIcon}>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-200 flex items-center gap-1.5 ${
              saveFlash
                ? 'bg-emerald-500/20 text-emerald-500 border-emerald-400/50'
                : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-400/30 hover:bg-emerald-500/20 hover:border-emerald-400/50'
            }`}
          >
            <CheckCircleIcon className="w-3.5 h-3.5" />
            {saveFlash ? 'Salvo!' : 'Salvar'}
          </button>
          <button
            onClick={handleClear}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold border bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-400/30 hover:bg-rose-500/20 hover:border-rose-400/50 transition-colors flex items-center gap-1.5"
          >
            <TrashIcon className="w-3.5 h-3.5" />
            Limpar
          </button>
        </div>
      </PageHeader>

      {/* Main content area — no page scroll */}
      <div className="flex-1 min-h-0 flex flex-col bg-surface rounded-2xl shadow-soft border border-border-color/50 overflow-hidden focus-within:border-border-color/50">
        {/* Tab bar */}
        <div className="flex items-center shrink-0 border-b border-border-color/50 bg-background/40 px-2 pt-2 gap-1 overflow-hidden">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              className={`group flex items-center gap-1.5 px-3 py-2 rounded-t-lg text-xs font-medium cursor-pointer transition-all border border-b-0 min-w-0 ${
                tab.id === activeTabId
                  ? 'bg-surface text-text-primary border-border-color/50 shadow-sm -mb-px z-10'
                  : 'bg-transparent text-text-secondary border-transparent hover:bg-surface/60 hover:text-text-primary'
              }`}
              onClick={() => setActiveTabId(tab.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setActiveTabId(tab.id);
                }
              }}
              role="tab"
              tabIndex={0}
              aria-selected={tab.id === activeTabId}
            >
              {editingTitleId === tab.id ? (
                <input
                  type="text"
                  defaultValue={tab.title}
                  ref={(el) => el?.focus()}
                  maxLength={MAX_TITLE_LENGTH}
                  className="bg-transparent border-b border-primary/50 outline-none text-xs w-24 text-text-primary"
                  onBlur={(e) => {
                    handleTitleChange(tab.id, e.target.value);
                    setEditingTitleId(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleTitleChange(tab.id, (e.target as HTMLInputElement).value);
                      setEditingTitleId(null);
                    }
                    if (e.key === 'Escape') setEditingTitleId(null);
                    e.stopPropagation();
                  }}
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <>
                  <span
                    className="truncate max-w-[120px]"
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      setEditingTitleId(tab.id);
                    }}
                    title={`${tab.title} (duplo clique para renomear)`}
                  >
                    {tab.title}
                  </span>
                  {tab.id === activeTabId && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingTitleId(tab.id);
                      }}
                      className="p-0.5 rounded text-text-secondary/40 hover:text-primary transition-colors"
                      aria-label={`Renomear aba ${tab.title}`}
                      title="Renomear"
                    >
                      <EditIcon className="w-3 h-3" />
                    </button>
                  )}
                </>
              )}

              {/* Close tab button */}
              {tabs.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCloseTab(tab.id);
                  }}
                  className="p-0.5 rounded text-text-secondary/40 hover:text-error hover:bg-error/10 transition-colors opacity-0 group-hover:opacity-100"
                  aria-label={`Fechar aba ${tab.title}`}
                >
                  <XIcon className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}

          {/* Add tab button */}
          <button
            onClick={handleAddTab}
            className="shrink-0 p-1.5 rounded-lg text-text-secondary/50 hover:text-primary hover:bg-primary/10 transition-colors ml-1"
            aria-label="Nova aba"
            title="Nova aba"
          >
            <PlusIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Notepad textarea — scrollable */}
        <div className="flex-1 min-h-0 p-1">
          <textarea
            value={activeTab?.content ?? ''}
            onChange={(e) => handleContentChange(e.target.value)}
            placeholder="Comece a escrever aqui..."
            className="w-full h-full resize-none bg-transparent text-text-primary text-sm leading-relaxed p-5 outline-none focus:outline-none focus:ring-0 custom-scrollbar placeholder:text-text-secondary/40 font-mono"
            spellCheck
          />
        </div>

        {/* Footer info */}
        <div className="shrink-0 px-5 py-2 border-t border-border-color/30 flex items-center justify-between text-[10px] text-text-secondary/50 select-none">
          <span>
            {activeTab?.content.length ?? 0} caracteres
            {' · '}
            {activeTab?.content.split(/\n/).length ?? 0} linhas
          </span>
          <span>
            Atualizado:{' '}
            {activeTab
              ? new Date(activeTab.updatedAt).toLocaleString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : '—'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default BlocoDeNotasPage;
