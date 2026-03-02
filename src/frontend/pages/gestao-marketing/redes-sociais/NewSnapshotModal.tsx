import React, { useEffect, useState } from 'react';
import { Modal } from '../../../components/ui';
import type { InstagramSnapshot } from '../../../types';

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

  const inputClass =
    'w-full bg-background p-2.5 rounded-md border border-border-color focus:border-accent focus:outline-none transition-colors';

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
        <div>
          <label
            htmlFor="field-quantidade-de-posts"
            className="block text-sm font-medium text-text-secondary mb-1"
          >
            Quantidade de posts
          </label>
          <input
            id="field-quantidade-de-posts"
            type="number"
            min={0}
            value={posts || ''}
            onChange={(event) => setPosts(Number.parseInt(event.target.value, 10) || 0)}
            placeholder="Ex: 118"
            className={inputClass}
          />
        </div>
        <div>
          <label
            htmlFor="field-seguidores"
            className="block text-sm font-medium text-text-secondary mb-1"
          >
            Seguidores
          </label>
          <input
            id="field-seguidores"
            type="number"
            min={0}
            value={followers || ''}
            onChange={(event) => setFollowers(Number.parseInt(event.target.value, 10) || 0)}
            placeholder="Ex: 6859"
            className={inputClass}
          />
        </div>
        <div>
          <label
            htmlFor="field-seguindo"
            className="block text-sm font-medium text-text-secondary mb-1"
          >
            Seguindo
          </label>
          <input
            id="field-seguindo"
            type="number"
            min={0}
            value={following || ''}
            onChange={(event) => setFollowing(Number.parseInt(event.target.value, 10) || 0)}
            placeholder="Ex: 946"
            className={inputClass}
          />
        </div>
      </div>
      <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-border-color">
        <button
          type="button"
          onClick={onClose}
          className="px-5 py-2 rounded-lg font-semibold text-text-primary bg-border-color/50 hover:bg-border-color transition-colors"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="px-5 py-2 rounded-lg font-semibold text-primary-content bg-primary hover:bg-primary-focus transition-colors"
        >
          Salvar registro
        </button>
      </div>
    </Modal>
  );
};
