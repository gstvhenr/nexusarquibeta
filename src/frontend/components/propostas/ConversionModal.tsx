import React, { useState, useEffect } from 'react';
import { Button, Input, Modal } from '../ui';
import type { ProjectAddress } from '../../types';
import { formatCEP } from '../../utils/formatters';

/**
 * Modal for converting a proposal into a project with address selection.
 * input -> isOpen, onClose, onConfirm callback, clientAddress
 * output -> void (calls onConfirm with address decision)
 */
export const ConversionModal: (props: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (useDifferentAddress: boolean, address?: ProjectAddress) => void;
  clientAddress: ProjectAddress;
}) => React.ReactNode = ({ isOpen, onClose, onConfirm, clientAddress }) => {
  const [isStep2, setIsStep2] = useState(false);
  const [newAddress, setNewAddress] = useState<ProjectAddress>({
    street: '',
    number: '',
    neighborhood: '',
    city: '',
    state: 'SP',
    zip: '',
    complement: '',
  });

  useEffect(() => {
    if (isOpen) {
      setIsStep2(false);
      setNewAddress({
        street: '',
        number: '',
        neighborhood: '',
        city: '',
        state: 'SP',
        zip: '',
        complement: '',
      });
    }
  }, [isOpen]);

  const handleAddressChange = (field: keyof ProjectAddress, value: string) => {
    setNewAddress((prev) => ({ ...prev, [field]: value }));
  };

  const handleConfirmStep1 = () => {
    onConfirm(false);
  };

  const handleConfirmStep2 = () => {
    onConfirm(true, newAddress);
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Converter para Projeto">
      <div className="space-y-6">
        {!isStep2 ? (
          <div className="animate-fade-in-up">
            <p className="font-semibold text-text-primary mb-2">Endereço da Obra/Serviço</p>
            <p className="text-sm text-text-secondary mb-4">
              O local do serviço é o mesmo do endereço cadastrado do cliente?
            </p>
            <div className="p-3 bg-surface border border-border-color rounded-lg mb-6 text-sm text-text-secondary">
              {clientAddress.street}, {clientAddress.number} - {clientAddress.neighborhood},{' '}
              {clientAddress.city}/{clientAddress.state}
            </div>

            <div className="grid grid-cols-1 gap-3">
              <button
                onClick={handleConfirmStep1}
                className="flex items-center p-3 border border-border-color rounded-lg hover:border-primary hover:bg-primary/5 transition-all text-left group"
              >
                <div className="flex-1">
                  <span className="block font-semibold text-text-primary group-hover:text-primary">
                    Sim, é o mesmo endereço
                  </span>
                  <span className="text-xs text-text-secondary">
                    O projeto será vinculado ao endereço do cliente acima.
                  </span>
                </div>
                <div className="w-4 h-4 rounded-full border border-border-color group-hover:border-primary"></div>
              </button>

              <button
                onClick={() => setIsStep2(true)}
                className="flex items-center p-3 border border-border-color rounded-lg hover:border-primary hover:bg-primary/5 transition-all text-left group"
              >
                <div className="flex-1">
                  <span className="block font-semibold text-text-primary group-hover:text-primary">
                    Não, é outro local
                  </span>
                  <span className="text-xs text-text-secondary">
                    Cadastrar um endereço específico para a obra.
                  </span>
                </div>
                <div className="w-4 h-4 rounded-full border border-border-color group-hover:border-primary"></div>
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-background/50 p-4 rounded-lg border border-border-color animate-fade-in-up">
            <h4 className="font-semibold text-sm text-text-primary mb-3">Novo Endereço da Obra</h4>
            <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
              <div className="md:col-span-2">
                <Input
                  type="text"
                  placeholder="CEP"
                  value={newAddress.zip}
                  onChange={(e) => handleAddressChange('zip', formatCEP(e.target.value))}
                />
              </div>
              <div className="md:col-span-4">
                <Input
                  type="text"
                  placeholder="Rua"
                  value={newAddress.street}
                  onChange={(e) => handleAddressChange('street', e.target.value)}
                />
              </div>
              <div className="md:col-span-2">
                <Input
                  type="text"
                  placeholder="Número"
                  value={newAddress.number}
                  onChange={(e) => handleAddressChange('number', e.target.value)}
                />
              </div>
              <div className="md:col-span-4">
                <Input
                  type="text"
                  placeholder="Bairro"
                  value={newAddress.neighborhood}
                  onChange={(e) => handleAddressChange('neighborhood', e.target.value)}
                />
              </div>
              <div className="md:col-span-4">
                <Input
                  type="text"
                  placeholder="Cidade"
                  value={newAddress.city}
                  onChange={(e) => handleAddressChange('city', e.target.value)}
                />
              </div>
              <div className="md:col-span-2">
                <Input
                  type="text"
                  placeholder="UF"
                  value={newAddress.state}
                  disabled
                  className="opacity-60 cursor-not-allowed"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-4 mt-6 pt-4 border-t border-border-color">
        {isStep2 ? (
          <>
            <Button variant="secondary" onClick={() => setIsStep2(false)}>
              Voltar
            </Button>
            <Button variant="primary" onClick={handleConfirmStep2}>
              Confirmar Conversão
            </Button>
          </>
        ) : (
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
        )}
      </div>
    </Modal>
  );
};
