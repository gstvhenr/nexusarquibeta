import { Modal } from '../../components/ui';

type ImportDataModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onImportData: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

export function ImportDataModal({
  isOpen,
  onClose,
  onImportData,
}: ImportDataModalProps): JSX.Element {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Importar Dados">
      <div className="text-center">
        <p className="text-text-primary mb-4">
          Selecione um arquivo de backup (.json) para importar.{' '}
          <strong className="text-error">
            Atenção: Isso substituirá todos os dados existentes.
          </strong>
        </p>
        <input
          id="import-data-file"
          type="file"
          accept=".json"
          onChange={onImportData}
          className="mx-auto text-sm text-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
          aria-label="Selecionar arquivo de backup para importação"
        />
      </div>
    </Modal>
  );
}
