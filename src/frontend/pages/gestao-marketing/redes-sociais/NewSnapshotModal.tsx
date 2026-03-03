import React, { useEffect, useState } from 'react';
import { Button, FormField, Input, Modal } from '@/components/ui';
import type { InstagramSnapshot } from '@/types';

type NewSnapshotModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (snapshot: InstagramSnapshot) => void;
};

export const NewSnapshotModal: (props: NewSnapshotModalProps) => React.ReactNode = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [posts, setPosts] = useState<number>(0);
  const [followers, setFollowers] = useState<number>(0);
  const [following, setFollowing] = useState<number>(0);

  useEffect(() => {
    if (isOpen) {
      setPosts(0);
      setFollowers(0);
      setFollowing(0);
    }
  }, [isOpen]);

  const handleSave = () => {
    onSave({
      id: `snap_${Date.now()}`,
      posts,
      followers,
      following,
      recordedAt: new Date().toISOString(),
    });
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Novo Registro — Instagram">
      <div className="space-y-4">
        <div className="bg-background/50 p-3 rounded-lg border border-border-color">
          <p className="text-xs font-semibold text-text-secondary">Data e horário do registro</p>
          <p className="text-sm font-semibold mt-1">
            {new Date().toLocaleString('pt-BR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
        <FormField label="Quantidade de posts">
          <Input
            type="number"
            min={0}
            value={posts || ''}
            onChange={(event) => setPosts(Number.parseInt(event.target.value, 10) || 0)}
            placeholder="Ex: 118"
          />
        </FormField>
        <FormField label="Seguidores">
          <Input
            type="number"
            min={0}
            value={followers || ''}
            onChange={(event) => setFollowers(Number.parseInt(event.target.value, 10) || 0)}
            placeholder="Ex: 6859"
          />
        </FormField>
        <FormField label="Seguindo">
          <Input
            type="number"
            min={0}
            value={following || ''}
            onChange={(event) => setFollowing(Number.parseInt(event.target.value, 10) || 0)}
            placeholder="Ex: 946"
          />
        </FormField>
      </div>
      <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-border-color">
        <Button variant="secondary" onClick={onClose}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={handleSave}>
          Salvar registro
        </Button>
      </div>
    </Modal>
  );
};
