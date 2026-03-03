import React, { useEffect, useRef, useState } from 'react';
import { Button, FormField, Input, Modal, Textarea, UserCircleIcon } from '../ui';
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
            <FormField label="Nome">
              <Input
                type="text"
                value={professional.name || ''}
                onChange={(e) => handleChange('name', e.target.value)}
                aria-label="Nome do profissional"
              />
            </FormField>
            <FormField label="Valor">
              <Input
                type="number"
                value={professional.cost || ''}
                onChange={(e) => handleChange('cost', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                aria-label="Valor do profissional"
              />
            </FormField>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Email">
            <Input
              type="email"
              value={professional.email || ''}
              onChange={(e) => handleChange('email', e.target.value)}
              aria-label="Email"
            />
          </FormField>
          <FormField label="Telefone">
            <Input
              type="tel"
              value={professional.phone || ''}
              onChange={(e) => handleChange('phone', e.target.value)}
              aria-label="Telefone"
            />
          </FormField>
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
        <FormField label="Notas">
          <Textarea
            value={professional.notes || ''}
            onChange={(e) => handleChange('notes', e.target.value)}
            rows={3}
            aria-label="Notas do profissional"
          />
        </FormField>
      </div>
      <div className="flex justify-between items-center mt-6 pt-4 border-t border-border-color">
        <div>
          {initialProfessional && (
            <Button
              variant="secondary"
              onClick={() => onDelete(initialProfessional.id)}
              className="text-error hover:bg-error/10"
            >
              Excluir
            </Button>
          )}
        </div>
        <div className="flex space-x-4">
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Salvar
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ProfessionalFormModal;
