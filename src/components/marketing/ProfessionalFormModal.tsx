import React, { useEffect, useRef, useState } from 'react';
import { Modal, UserCircleIcon } from '../ui';
import type { MarketingBillingFormat, MarketingProfessional } from '../../types';
import { marketingBillingFormats } from '../../types';

interface ProfessionalFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (professional: MarketingProfessional) => void;
  onDelete: (id: string) => void;
  initialProfessional: MarketingProfessional | null;
}

const ProfessionalFormModal: (props: ProfessionalFormModalProps) => React.ReactNode = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialProfessional,
}) => {
  const [professional, setProfessional] = useState<Partial<MarketingProfessional>>({});
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setProfessional(initialProfessional || {});
      setPhotoPreview(initialProfessional?.photo || null);
    }
  }, [isOpen, initialProfessional]);

  const handleChange = (field: keyof Omit<MarketingProfessional, 'id'>, value: string | number) => {
    setProfessional((p) => ({ ...p, [field]: value }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageDataUrl = reader.result as string;
        setPhotoPreview(imageDataUrl);
        setProfessional((p) => ({ ...p, photo: imageDataUrl }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (!professional.name) return;
    const id = professional.id || `prof_${Date.now()}`;
    onSave({
      ...professional,
      id,
      name: professional.name,
      email: professional.email || '',
      phone: professional.phone || '',
    });
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialProfessional ? 'Editar Prestador' : 'Adicionar Prestador'}
      size="2xl"
    >
      <div className="space-y-4">
        <div className="flex items-start gap-6 p-4 bg-background/50 rounded-lg">
          <div className="flex flex-col items-center gap-2 w-32">
            <div className="w-24 h-24 bg-surface rounded-full flex items-center justify-center overflow-hidden border-2 border-border-color text-text-secondary">
              {photoPreview ? (
                <img src={photoPreview} alt="Foto" className="w-full h-full object-cover" />
              ) : (
                <UserCircleIcon className="w-20 h-20 text-secondary/20" />
              )}
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-sm font-semibold text-primary hover:underline"
            >
              {photoPreview ? 'Alterar' : 'Adicionar Foto'}
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handlePhotoChange}
              accept="image/*"
              className="hidden"
              aria-label="Selecionar foto do profissional"
            />
          </div>
          <div className="flex-1 space-y-4">
            <div>
              <label htmlFor="field-nome" className="block text-sm font-medium text-gray-600 mb-1">
                Nome
              </label>
              <input
                id="field-nome"
                type="text"
                value={professional.name || ''}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full bg-background p-2 rounded-md border border-border-color"
                aria-label="Nome do profissional"
              />
            </div>
            <div>
              <label htmlFor="field-valor" className="block text-sm font-medium text-gray-600 mb-1">
                Valor
              </label>
              <input
                id="field-valor"
                type="number"
                value={professional.cost || ''}
                onChange={(e) => handleChange('cost', parseFloat(e.target.value) || 0)}
                className="w-full bg-background p-2 rounded-md border border-border-color"
                placeholder="0.00"
                aria-label="Valor do profissional"
              />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="field-email"
              className="block text-sm font-medium text-text-secondary mb-1"
            >
              Email
            </label>
            <input
              id="field-email"
              type="email"
              value={professional.email || ''}
              onChange={(e) => handleChange('email', e.target.value)}
              className="w-full bg-background p-2 rounded-md border border-border-color"
              aria-label="Email"
            />
          </div>
          <div>
            <label
              htmlFor="field-telefone"
              className="block text-sm font-medium text-text-secondary mb-1"
            >
              Telefone
            </label>
            <input
              id="field-telefone"
              type="tel"
              value={professional.phone || ''}
              onChange={(e) => handleChange('phone', e.target.value)}
              className="w-full bg-background p-2 rounded-md border border-border-color"
              aria-label="Telefone"
            />
          </div>
        </div>
        <div>
          <label
            htmlFor="professional-billing-format"
            className="block text-sm font-medium text-text-secondary mb-1"
          >
            Formato de Cobrança
          </label>
          <select
            id="professional-billing-format"
            value={professional.billingFormat || ''}
            onChange={(e) =>
              setProfessional((p) => ({
                ...p,
                billingFormat: e.target.value as MarketingBillingFormat,
              }))
            }
            className="w-full bg-background p-2 rounded-md border border-border-color"
            aria-label="Formato de cobrança"
            title="Formato de cobrança"
          >
            <option value="">Selecione...</option>
            {marketingBillingFormats.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            htmlFor="professional-notes"
            className="block text-sm font-medium text-text-secondary mb-1"
          >
            Notas
          </label>
          <textarea
            id="professional-notes"
            value={professional.notes || ''}
            onChange={(e) => handleChange('notes', e.target.value)}
            rows={3}
            className="w-full bg-background p-2 rounded-md border border-border-color"
            aria-label="Notas do profissional"
            title="Notas do profissional"
          ></textarea>
        </div>
      </div>
      <div className="flex justify-between items-center mt-6 pt-4 border-t border-border-color">
        <div>
          {initialProfessional && (
            <button
              type="button"
              onClick={() => onDelete(initialProfessional.id)}
              className="px-4 py-2 rounded-lg font-semibold text-error hover:bg-error/10 transition-colors"
            >
              Excluir
            </button>
          )}
        </div>
        <div className="flex space-x-4">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 rounded-lg font-semibold text-text-primary bg-border-color/50 hover:bg-border-color"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2 rounded-lg font-semibold text-primary-content bg-primary hover:bg-primary-focus"
          >
            Salvar
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ProfessionalFormModal;
