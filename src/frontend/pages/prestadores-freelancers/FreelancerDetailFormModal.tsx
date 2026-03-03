import React, { useState, useRef, useEffect } from 'react';
import { Modal, Input, Textarea, FormField, Button } from '../../components/ui';
import { TrashIcon, UserCircleIcon, ArchiveIcon, UnarchiveIcon } from '../../components/ui';
import { FREELANCER_SPECIALTIES } from '../../constants';
import { Freelancer } from '../../types';
import { formatPhone } from '../../utils/formatters';

const getInitialFreelancer = (): Freelancer => ({
  id: '',
  name: '',
  email: '',
  phone: '',
  specialties: [],
  projects: [],
  archived: false,
  photo: '',
  notes: '',
  portfolioLink: '',
});

export const FreelancerDetailFormModal: (props: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (f: Freelancer) => void;
  onDelete: (f: Freelancer) => void;
  onArchive: (id: string, archive: boolean) => void;
  initialFreelancer: Freelancer | null;
}) => React.ReactNode = ({ isOpen, onClose, onSave, onDelete, onArchive, initialFreelancer }) => {
  const [freelancer, setFreelancer] = useState<Freelancer>(
    initialFreelancer || getInitialFreelancer(),
  );
  const [mode, setMode] = useState<'view' | 'edit' | 'add'>('view');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      const data = initialFreelancer
        ? JSON.parse(JSON.stringify(initialFreelancer))
        : getInitialFreelancer();
      setFreelancer(data);
      setPhotoPreview(data.photo || null);
      setMode(initialFreelancer ? 'view' : 'add');
    }
  }, [initialFreelancer, isOpen]);

  const isReadOnly = mode === 'view';
  const handleChange = (field: keyof Freelancer, value: Freelancer[keyof Freelancer]) =>
    setFreelancer((f) => ({ ...f, [field]: value }));
  const handleSpecialtyChange = (specialty: string, checked: boolean) =>
    handleChange(
      'specialties',
      checked
        ? [...freelancer.specialties, specialty]
        : freelancer.specialties.filter((s) => s !== specialty),
    );
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPhotoPreview(result);
        handleChange('photo', result);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };
  const handleSave = () => {
    if (freelancer.name.trim()) onSave(freelancer);
  };

  if (!isOpen) return null;

  const inputOverride = 'p-2 rounded-md';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'add' ? 'Novo Freelancer' : freelancer.name}
      size="2xl"
    >
      <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-4 -mr-4 p-1 custom-scrollbar">
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-center gap-2 w-24">
            <div className="w-20 h-20 bg-surface rounded-full flex items-center justify-center overflow-hidden border-2 border-border-color text-text-secondary">
              {photoPreview ? (
                <img src={photoPreview} alt="Foto" className="w-full h-full object-cover" />
              ) : (
                <UserCircleIcon className="w-16 h-16 text-secondary/20" />
              )}
            </div>
            {!isReadOnly && (
              <>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  {photoPreview ? 'Alterar' : 'Adicionar Foto'}
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handlePhotoChange}
                  accept="image/*"
                  className="hidden"
                  aria-label="Selecionar foto do freelancer"
                />
              </>
            )}
          </div>
          <div className="flex-1">
            <FormField label="Nome">
              <Input
                id="field-nome"
                type="text"
                value={freelancer.name}
                onChange={(e) => handleChange('name', e.target.value)}
                disabled={isReadOnly}
                className={inputOverride}
                aria-label="Nome"
              />
            </FormField>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            type="email"
            placeholder="Email"
            value={freelancer.email}
            onChange={(e) => handleChange('email', e.target.value)}
            disabled={isReadOnly}
            className={inputOverride}
            aria-label="Email"
          />
          <Input
            type="tel"
            placeholder="Telefone"
            value={freelancer.phone}
            onChange={(e) => handleChange('phone', formatPhone(e.target.value))}
            disabled={isReadOnly}
            className={inputOverride}
            aria-label="Telefone"
          />
        </div>
        <Input
          type="url"
          placeholder="Link do Portfólio"
          value={freelancer.portfolioLink || ''}
          onChange={(e) => handleChange('portfolioLink', e.target.value)}
          disabled={isReadOnly}
          className={inputOverride}
          aria-label="Link do portfólio"
        />
        <div>
          <span className="block text-sm font-medium text-text-secondary mb-2">Especialidades</span>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 bg-background/30 p-2 rounded-lg border border-border-color/50">
            {FREELANCER_SPECIALTIES.map((s) => (
              <label key={s} className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={freelancer.specialties.includes(s)}
                  onChange={(e) => handleSpecialtyChange(s, e.target.checked)}
                  disabled={isReadOnly}
                  className="h-4 w-4 rounded accent-primary"
                />
                {s}
              </label>
            ))}
          </div>
        </div>
        <FormField label="Observações">
          <Textarea
            id="field-observacoes"
            value={freelancer.notes || ''}
            onChange={(e) => handleChange('notes', e.target.value)}
            disabled={isReadOnly}
            rows={3}
            className="p-2 rounded-md"
            aria-label="Observações"
          />
        </FormField>
      </div>
      <div className="flex justify-between items-center mt-6 pt-4 border-t border-border-color">
        <div>
          {mode !== 'add' && (
            <div className="flex gap-2">
              <Button
                variant="ghost"
                onClick={() => onArchive(freelancer.id, !freelancer.archived)}
              >
                {freelancer.archived ? (
                  <UnarchiveIcon className="w-4 h-4" />
                ) : (
                  <ArchiveIcon className="w-4 h-4" />
                )}{' '}
                {freelancer.archived ? 'Reativar' : 'Arquivar'}
              </Button>
              <Button variant="danger" onClick={() => onDelete(freelancer)}>
                <TrashIcon className="w-4 h-4" /> Excluir
              </Button>
            </div>
          )}
        </div>
        <div className="flex space-x-4">
          {mode === 'view' ? (
            <>
              <Button variant="secondary" onClick={onClose}>
                Fechar
              </Button>
              <Button variant="primary" onClick={() => setMode('edit')}>
                Editar
              </Button>
            </>
          ) : (
            <>
              <Button variant="secondary" onClick={onClose}>
                Cancelar
              </Button>
              <Button variant="primary" onClick={handleSave}>
                Salvar
              </Button>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
};
