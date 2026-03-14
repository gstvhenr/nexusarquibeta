import React from 'react';
import { Modal, Button } from '../ui';
import { AlertIcon } from '../ui';

/**
 * Modal displaying validation errors preventing proposal-to-project conversion.
 * input -> isOpen, onClose, errors array, onRedirect callback
 * output -> void (calls onRedirect or onClose)
 */
export const ValidationModal: (props: {
  isOpen: boolean;
  onClose: () => void;
  errors: string[];
  onRedirect: () => void;
}) => React.ReactNode = ({ isOpen, onClose, errors, onRedirect }) => {
  if (!isOpen) return null;
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Cadastro Incompleto">
      <div className="space-y-4">
        <div className="bg-warning/10 border-l-4 border-warning p-4 rounded-r-lg flex items-start gap-3">
          <AlertIcon className="w-6 h-6 text-warning flex-shrink-0" />
          <div>
            <h4 className="font-bold text-text-primary text-sm">Atenção!</h4>
            <p className="text-sm text-text-secondary mt-1">
              Para converter esta proposta em projeto, o cliente precisa ter o cadastro completo.
            </p>
          </div>
        </div>

        <div className="bg-background border border-border-color rounded-lg p-4">
          <p className="font-semibold text-sm mb-2 text-text-primary">Campos faltantes:</p>
          <ul className="list-disc list-inside text-sm text-error space-y-1">
            {errors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      </div>
      <div className="flex justify-end space-x-4 mt-6 pt-4 border-t border-border-color">
        <Button variant="secondary" onClick={onClose}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={onRedirect}>
          Corrigir Cadastro
        </Button>
      </div>
    </Modal>
  );
};
