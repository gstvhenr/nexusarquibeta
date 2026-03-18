import React, { useState, useCallback, useEffect } from 'react';
import { useAutoReset } from '@/hooks/useAutoReset';
import { PageHeader } from '@/components/layout';
import { NAV_LINKS } from '@/constants';
import {
  Button,
  IconButton,
  PlusIcon,
  TrashIcon,
  CheckCircleIcon,
  XIcon,
  EditIcon,
} from '@/components/ui';
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
const TABLIST_LABEL = 'Abas do bloco de notas';

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
  const editingTab = tabs.find((tab) => tab.id === editingTitleId) ?? null;

  const getTabId = useCallback((tabId: string) => `note-tab-${tabId}`, []);
  const getPanelId = useCallback((tabId: string) => `note-panel-${tabId}`, []);

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
    (c) => c.label === 'Anotações',
  )?.icon;

  const handleAddTab = useCallback(() => {
    const newTab = createEmptyTab();
    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(newTab.id);
  }, [setTabs]);

  const handleStartEditingTitle = useCallback((tabId: string) => {
    setActiveTabId(tabId);
    setEditingTitleId(tabId);
  }, []);

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

  const handleTabListKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key) || tabs.length === 0) {
        return;
      }

      const currentIndex = tabs.findIndex((tab) => tab.id === activeTabId);
      if (currentIndex < 0) {
        return;
      }

      event.preventDefault();

      if (event.key === 'Home') {
        setActiveTabId(tabs[0].id);
        return;
      }

      if (event.key === 'End') {
        setActiveTabId(tabs[tabs.length - 1].id);
        return;
      }

      const step = event.key === 'ArrowRight' ? 1 : -1;
      const nextIndex = (currentIndex + step + tabs.length) % tabs.length;
      setActiveTabId(tabs[nextIndex].id);
    },
    [activeTabId, tabs],
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

  const handleTitleInputSubmit = useCallback(
    (newTitle: string) => {
      if (!editingTitleId) {
        return;
      }

      handleTitleChange(editingTitleId, newTitle);
      setEditingTitleId(null);
    },
    [editingTitleId, handleTitleChange],
  );

  return (
    <div className="animate-fade-in-up h-full flex flex-col px-2 pt-2 md:px-4 md:pt-4 lg:px-6 lg:pt-6 overflow-hidden">
      <PageHeader title="Anotações" icon={pageIcon}>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            onClick={handleSave}
            className={`px-3 py-1.5 text-xs font-semibold border transition-all duration-200 gap-1.5 ${
              saveFlash
                ? 'bg-success/20 text-success border-success/50'
                : 'bg-success/10 text-success dark:text-success border-success/30 hover:bg-success/20 hover:border-success/50'
            }`}
          >
            <CheckCircleIcon className="w-3.5 h-3.5" />
            {saveFlash ? 'Salvo!' : 'Salvar'}
          </Button>
          <Button
            variant="ghost"
            onClick={handleClear}
            className="px-3 py-1.5 text-xs font-semibold border bg-error/10 text-error dark:text-error border-error/30 hover:bg-error/20 hover:border-error/50 gap-1.5"
          >
            <TrashIcon className="w-3.5 h-3.5" />
            Limpar
          </Button>
        </div>
      </PageHeader>

      {/* Main content area — no page scroll */}
      <div className="flex-1 min-h-0 flex flex-col bg-surface rounded-2xl shadow-soft border border-border-color/50 overflow-hidden focus-within:border-border-color/50">
        {/* Tab bar */}
        <div className="shrink-0 border-b border-border-color/50 bg-background/40">
          <div className="flex items-start gap-2 px-2 pt-2">
            <div
              role="tablist"
              aria-label={TABLIST_LABEL}
              tabIndex={0}
              className="flex min-w-0 flex-1 items-center gap-1 overflow-hidden"
              onKeyDown={handleTabListKeyDown}
            >
              {tabs.map((tab) => {
                const active = tab.id === activeTabId;

                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    id={getTabId(tab.id)}
                    aria-controls={getPanelId(tab.id)}
                    aria-selected={active}
                    tabIndex={active ? 0 : -1}
                    className={`flex min-w-0 items-center gap-1.5 rounded-t-lg border border-b-0 px-3 py-2 text-xs font-medium transition-all ${
                      active
                        ? 'bg-surface text-text-primary border-border-color/50 shadow-sm -mb-px z-10'
                        : 'bg-transparent text-text-secondary border-transparent hover:bg-surface/60 hover:text-text-primary'
                    }`}
                    onClick={() => setActiveTabId(tab.id)}
                    onDoubleClick={() => handleStartEditingTitle(tab.id)}
                  >
                    <span
                      className="truncate max-w-[120px]"
                      title={`${tab.title} (duplo clique para renomear)`}
                    >
                      {tab.title}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex shrink-0 items-center gap-1 pb-2">
              {activeTab && (
                <IconButton
                  variant="default"
                  size="sm"
                  onClick={() => handleStartEditingTitle(activeTab.id)}
                  className="p-0.5 text-text-secondary/40 hover:text-primary"
                  aria-label={`Renomear aba ${activeTab.title}`}
                  title="Renomear"
                >
                  <EditIcon className="w-3 h-3" />
                </IconButton>
              )}
              {tabs.length > 1 && activeTab && (
                <IconButton
                  variant="default"
                  size="sm"
                  onClick={() => handleCloseTab(activeTab.id)}
                  className="p-0.5 text-text-secondary/40 hover:text-error hover:bg-error/10"
                  aria-label={`Fechar aba ${activeTab.title}`}
                >
                  <XIcon className="w-3 h-3" />
                </IconButton>
              )}
              <IconButton
                variant="default"
                size="sm"
                onClick={handleAddTab}
                className="p-1.5 text-text-secondary/50 hover:text-primary hover:bg-primary/10"
                aria-label="Nova aba"
                title="Nova aba"
              >
                <PlusIcon className="w-4 h-4" />
              </IconButton>
            </div>
          </div>

          {editingTab && (
            <div className="border-t border-border-color/30 bg-surface/60 px-3 py-2">
              {/* eslint-disable jsx-a11y/no-autofocus -- Intentional: user-initiated rename action */}
              <input
                type="text"
                defaultValue={editingTab.title}
                autoFocus
                maxLength={MAX_TITLE_LENGTH}
                className="w-full rounded-md border border-border-color/50 bg-background/70 px-3 py-2 text-xs text-text-primary outline-none transition-colors focus:border-primary/50"
                aria-label={`Renomear aba ${editingTab.title}`}
                onBlur={(e) => handleTitleInputSubmit(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleTitleInputSubmit((e.target as HTMLInputElement).value);
                  }
                  if (e.key === 'Escape') {
                    setEditingTitleId(null);
                  }
                }}
              />
              {/* eslint-enable jsx-a11y/no-autofocus */}
            </div>
          )}
        </div>

        {/* Notepad textarea — scrollable */}
        <div
          role="tabpanel"
          id={activeTab ? getPanelId(activeTab.id) : undefined}
          aria-labelledby={activeTab ? getTabId(activeTab.id) : undefined}
          className="flex-1 min-h-0 p-1"
        >
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
