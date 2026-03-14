import { Input, Modal } from '../../components/ui';

type ClearDataModalProps = {
  isOpen: boolean;
  onClose: () => void;
  clearConfirmationText: string;
  onChangeConfirmationText: (value: string) => void;
  onConfirmClear: () => void;
};

export function ClearDataModal({
  isOpen,
  onClose,
  clearConfirmationText,
  onChangeConfirmationText,
  onConfirmClear,
}: ClearDataModalProps): JSX.Element {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Confirmar Exclusão de Dados">
      <div className="space-y-4">
        <p className="text-text-primary">
          Esta é uma ação irreversível. Todos os seus projetos, clientes, propostas e configurações
          (exceto o tema) serão <strong className="text-error">permanentemente excluídos</strong>.
        </p>
        <p className="text-text-primary">
          Para confirmar, digite <strong className="text-error font-mono">EXCLUIR</strong> no campo
          abaixo.
        </p>
        <div>
          <Input
            type="text"
            value={clearConfirmationText}
            onChange={(event) => onChangeConfirmationText(event.target.value)}
            className="text-center font-mono"
            aria-label="Digite EXCLUIR para confirmar"
          />
        </div>
        <div className="flex justify-end pt-4">
          <button
            type="button"
            onClick={onConfirmClear}
            disabled={clearConfirmationText !== 'EXCLUIR'}
            className="w-full px-6 py-2 rounded-lg font-semibold text-white bg-error hover:opacity-90 disabled:bg-text-secondary/50 disabled:cursor-not-allowed"
          >
            Eu entendo as consequências, excluir tudo
          </button>
        </div>
      </div>
    </Modal>
  );
}
