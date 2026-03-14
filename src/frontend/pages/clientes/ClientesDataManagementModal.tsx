import type React from 'react';
import { ClientSelectionModal } from '../../components/clientes';
import {
  Button,
  CheckCircleIcon,
  DownloadIcon,
  FileJsonIcon,
  FileTextIcon,
  Modal,
  Tab,
  TabList,
  TabPanel,
  Tabs,
  UploadCloudIcon,
  UsersIcon,
} from '../../components/ui';
import type { Client } from '../../types';
import type { DataModalTab, ExportMode, ExportStatusFilter } from './types';

interface ClientesDataManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeModalTab: DataModalTab;
  onActiveModalTabChange: (tab: DataModalTab) => void;
  exportMode: ExportMode;
  onExportModeChange: (mode: ExportMode) => void;
  exportStatusFilter: ExportStatusFilter;
  onExportStatusFilterChange: (filter: ExportStatusFilter) => void;
  manualSelectionIds: Set<string>;
  onOpenSelectionModal: () => void;
  isSelectionModalOpen: boolean;
  onCloseSelectionModal: () => void;
  manualSearch: string;
  onManualSearchChange: (value: string) => void;
  clientsForExportList: Client[];
  onToggleSelectAllManual: () => void;
  onToggleManualSelection: (id: string) => void;
  onClearManualSelection: () => void;
  onExport: (format: 'PDF' | 'DOCX' | 'JSON') => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  importFile: File | null;
  onFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onImportConfirm: () => void;
}

function isDataModalTab(value: string): value is DataModalTab {
  return value === 'export' || value === 'import';
}

function tabClassName({ active }: { active: boolean }) {
  return `px-6 py-3 font-semibold text-sm transition-colors border-b-2 ${
    active
      ? 'border-primary text-primary'
      : 'border-transparent text-text-secondary hover:text-text-primary'
  }`;
}

function segmentedButtonClass(active: boolean) {
  return active
    ? 'bg-primary/10 border-primary text-primary ring-1 ring-primary'
    : 'bg-background border-border-color hover:bg-surface text-text-primary';
}

function filterButtonClass(active: boolean) {
  return active
    ? 'bg-white dark:bg-zinc-700 shadow-sm text-primary'
    : 'text-text-secondary hover:text-text-primary';
}

export function ClientesDataManagementModal({
  isOpen,
  onClose,
  activeModalTab,
  onActiveModalTabChange,
  exportMode,
  onExportModeChange,
  exportStatusFilter,
  onExportStatusFilterChange,
  manualSelectionIds,
  onOpenSelectionModal,
  isSelectionModalOpen,
  onCloseSelectionModal,
  manualSearch,
  onManualSearchChange,
  clientsForExportList,
  onToggleSelectAllManual,
  onToggleManualSelection,
  onClearManualSelection,
  onExport,
  fileInputRef,
  importFile,
  onFileSelect,
  onImportConfirm,
}: ClientesDataManagementModalProps) {
  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Gerenciamento de Dados" size="2xl">
        <Tabs
          value={activeModalTab}
          onValueChange={(value) => {
            if (isDataModalTab(value)) {
              onActiveModalTabChange(value);
            }
          }}
        >
          <div className="flex flex-col">
            <div className="border-b border-border-color mb-6">
              <TabList className="flex">
                <Tab value="export" className={tabClassName}>
                  <span className="flex items-center gap-2">
                    <DownloadIcon className="w-4 h-4" /> Exportar Dados
                  </span>
                </Tab>
                <Tab value="import" className={tabClassName}>
                  <span className="flex items-center gap-2">
                    <UploadCloudIcon className="w-4 h-4" /> Importar Backup
                  </span>
                </Tab>
              </TabList>
            </div>

            <div className="flex flex-col">
              <TabPanel value="export">
                <div className="space-y-6 animate-fade-in-up flex-1 flex flex-col">
                  <div>
                    <h4 className="text-sm font-bold text-text-secondary uppercase mb-3">
                      1. O que deseja exportar?
                    </h4>
                    <div className="flex gap-4">
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => onExportModeChange('selected')}
                        className={`flex-1 h-auto text-center ${segmentedButtonClass(exportMode === 'selected')}`}
                      >
                        <span className="block font-bold text-sm">Selecionar Manualmente</span>
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => onExportModeChange('all')}
                        className={`flex-1 h-auto text-center ${segmentedButtonClass(exportMode === 'all')}`}
                      >
                        <span className="block font-bold text-sm">Lista Completa</span>
                      </Button>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-text-secondary uppercase mb-3">
                      2. Qual tipo de cliente?
                    </h4>
                    <div className="flex bg-background rounded-lg p-1 border border-border-color">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => onExportStatusFilterChange('active')}
                        className={`flex-1 ${filterButtonClass(exportStatusFilter === 'active')}`}
                      >
                        Apenas Ativos
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => onExportStatusFilterChange('archived')}
                        className={`flex-1 ${filterButtonClass(exportStatusFilter === 'archived')}`}
                      >
                        Apenas Arquivados
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => onExportStatusFilterChange('both')}
                        className={`flex-1 ${filterButtonClass(exportStatusFilter === 'both')}`}
                      >
                        Ambos
                      </Button>
                    </div>
                  </div>

                  {exportMode === 'selected' && (
                    <div className="mt-2 animate-fade-in-up">
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={onOpenSelectionModal}
                        className="w-full h-auto py-4 border-2 border-dashed border-primary/40 hover:border-primary rounded-xl flex-col text-primary hover:bg-primary/5 gap-2 group"
                      >
                        <div className="p-2 bg-primary/10 rounded-full group-hover:scale-110 transition-transform">
                          <UsersIcon className="w-6 h-6" />
                        </div>
                        <div className="text-center">
                          <span className="block font-bold text-sm">
                            {manualSelectionIds.size > 0
                              ? `${manualSelectionIds.size} Clientes Selecionados`
                              : 'Escolher Clientes da Lista'}
                          </span>
                          <span className="text-xs text-text-secondary">
                            Clique para abrir a seleção
                          </span>
                        </div>
                      </Button>
                    </div>
                  )}

                  <div className="pt-4 border-t border-border-color">
                    <div className="flex gap-4">
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => onExport('PDF')}
                        className="flex-1 h-auto p-3 bg-surface border-border-color rounded-xl hover:shadow-md hover:-translate-y-1 transition-all flex-col text-center hover:border-error hover:bg-error/5"
                      >
                        <FileTextIcon className="w-6 h-6 mx-auto mb-2 text-error group-hover:scale-110 transition-transform" />
                        <span className="font-bold text-sm text-text-primary block">Ficha PDF</span>
                        <span className="text-[10px] text-text-secondary">Completo</span>
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => onExport('DOCX')}
                        className="flex-1 h-auto p-3 bg-surface border-border-color rounded-xl hover:shadow-md hover:-translate-y-1 transition-all flex-col text-center hover:border-primary hover:bg-primary/5"
                      >
                        <FileTextIcon className="w-6 h-6 mx-auto mb-2 text-primary group-hover:scale-110 transition-transform" />
                        <span className="font-bold text-sm text-text-primary block">DOCX</span>
                        <span className="text-[10px] text-text-secondary">Editável</span>
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => onExport('JSON')}
                        className="flex-1 h-auto p-3 bg-surface border-border-color rounded-xl hover:shadow-md hover:-translate-y-1 transition-all flex-col text-center hover:border-warning hover:bg-warning/5"
                      >
                        <FileJsonIcon className="w-6 h-6 mx-auto mb-2 text-warning group-hover:scale-110 transition-transform" />
                        <span className="font-bold text-sm text-text-primary block">JSON</span>
                        <span className="text-[10px] text-text-secondary">Backup</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </TabPanel>

              <TabPanel value="import">
                <div className="space-y-6 animate-fade-in-up">
                  <div
                    className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-colors group h-64 ${
                      importFile
                        ? 'border-success bg-success/5'
                        : 'border-border-color hover:bg-background'
                    }`}
                    onClick={() => fileInputRef.current?.click()}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        fileInputRef.current?.click();
                      }
                    }}
                    role="button"
                    tabIndex={0}
                  >
                    <div
                      className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${
                        importFile ? 'bg-success/10 text-success' : 'bg-primary/10 text-primary'
                      }`}
                    >
                      {importFile ? (
                        <CheckCircleIcon className="w-8 h-8" />
                      ) : (
                        <UploadCloudIcon className="w-8 h-8" />
                      )}
                    </div>
                    <h4 className="font-bold text-lg text-text-primary">
                      {importFile ? importFile.name : 'Clique para selecionar o arquivo'}
                    </h4>
                    <p className="text-text-secondary text-sm mt-1">
                      {importFile
                        ? 'Arquivo pronto para importação'
                        : 'Suporta apenas arquivos .JSON de backup'}
                    </p>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={onFileSelect}
                      accept=".json"
                      className="hidden"
                    />
                  </div>

                  {importFile ? (
                    <Button
                      type="button"
                      variant="primary"
                      onClick={onImportConfirm}
                      className="w-full bg-success hover:bg-success/90 text-white"
                    >
                      <UploadCloudIcon className="w-5 h-5" /> Confirmar Importação
                    </Button>
                  ) : (
                    <div className="bg-warning/10 border-l-4 border-warning p-4 rounded-r-lg">
                      <div className="flex items-start gap-3">
                        <div className="text-warning mt-0.5">
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                            />
                          </svg>
                        </div>
                        <div>
                          <h5 className="font-bold text-warning text-sm">Atenção ao importar</h5>
                          <p className="text-xs text-text-primary mt-1">
                            A importação irá adicionar novos clientes ou atualizar os existentes com
                            o mesmo ID. Recomenda-se fazer um backup (Exportar JSON) antes de
                            prosseguir.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </TabPanel>
            </div>
          </div>
        </Tabs>

        <div className="flex justify-end mt-6 pt-4 border-t border-border-color">
          <Button type="button" variant="secondary" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </Modal>

      <ClientSelectionModal
        isOpen={isSelectionModalOpen}
        onClose={onCloseSelectionModal}
        manualSearch={manualSearch}
        onManualSearchChange={onManualSearchChange}
        clients={clientsForExportList}
        selectedIds={manualSelectionIds}
        onToggleSelectAll={onToggleSelectAllManual}
        onToggleClient={onToggleManualSelection}
        onClearSelection={onClearManualSelection}
      />
    </>
  );
}
