import React, { useEffect, useState } from 'react';
import { Button, FormField, Input, Modal } from '@/components/ui';
import type { InstagramSnapshot, SocialNetworkName } from '@/types';

type NewSnapshotModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (snapshot: InstagramSnapshot) => void;
  networkName: string;
  networkId?: SocialNetworkName;
  onSaveLastPostDate?: (date: string) => void;
};

export const NewSnapshotModal: (props: NewSnapshotModalProps) => React.ReactNode = ({
  isOpen,
  onClose,
  onSave,
  networkName,
  networkId,
  onSaveLastPostDate,
}) => {
  const isFacebookOrLinkedIn = networkId === 'Facebook' || networkId === 'LinkedIn';
  const isLinkedIn = networkId === 'LinkedIn';
  const isGoogle = networkId === 'Google';
  const [posts, setPosts] = useState<number>(0);
  const [followers, setFollowers] = useState<number>(0);
  const [following, setFollowing] = useState<number>(0);
  const [lastPostDate, setLastPostDate] = useState('');
  const [ratingQuality, setRatingQuality] = useState<number>(0);
  const [ratingQuantity, setRatingQuantity] = useState<number>(0);

  useEffect(() => {
    if (isOpen) {
      setPosts(0);
      setFollowers(0);
      setFollowing(0);
      setLastPostDate('');
      setRatingQuality(0);
      setRatingQuantity(0);
    }
  }, [isOpen]);

  const handleSave = () => {
    if (isFacebookOrLinkedIn && onSaveLastPostDate && lastPostDate) {
      onSaveLastPostDate(lastPostDate);
    }
    if (isGoogle) {
      onSave({
        id: `snap_${Date.now()}`,
        posts: ratingQuality,
        followers: ratingQuantity,
        following: 0,
        recordedAt: new Date().toISOString(),
      });
    } else {
      onSave({
        id: `snap_${Date.now()}`,
        posts,
        followers,
        following,
        recordedAt: new Date().toISOString(),
      });
    }
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Novo Registro — ${networkName}`}>
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
        {isGoogle ? (
          <>
            <FormField label="Qualidade (1 a 5)">
              <Input
                type="number"
                min={1}
                max={5}
                step={0.1}
                value={ratingQuality || ''}
                onChange={(event) => {
                  const val = Number.parseFloat(event.target.value);
                  setRatingQuality(val > 5 ? 5 : val < 0 ? 0 : val);
                }}
                placeholder=""
              />
            </FormField>
            <FormField label="Quantidade de avaliações">
              <Input
                type="number"
                min={0}
                value={ratingQuantity || ''}
                onChange={(event) =>
                  setRatingQuantity(Number.parseInt(event.target.value, 10) || 0)
                }
                placeholder=""
              />
            </FormField>
          </>
        ) : (
          <>
            {isFacebookOrLinkedIn ? (
              <FormField label="Data do último post">
                <Input
                  type="date"
                  value={lastPostDate}
                  onChange={(event) => setLastPostDate(event.target.value)}
                />
              </FormField>
            ) : (
              <FormField label="Quantidade de posts">
                <Input
                  type="number"
                  min={0}
                  value={posts || ''}
                  onChange={(event) => setPosts(Number.parseInt(event.target.value, 10) || 0)}
                  placeholder=""
                />
              </FormField>
            )}
            <FormField label={networkId === 'LinkedIn' ? 'Conexões' : 'Seguidores'}>
              <Input
                type="number"
                min={0}
                value={followers || ''}
                onChange={(event) => setFollowers(Number.parseInt(event.target.value, 10) || 0)}
                placeholder=""
              />
            </FormField>
            {!isLinkedIn && (
              <FormField label={isFacebookOrLinkedIn ? 'Conexões' : 'Seguindo'}>
                <Input
                  type="number"
                  min={0}
                  value={following || ''}
                  onChange={(event) => setFollowing(Number.parseInt(event.target.value, 10) || 0)}
                  placeholder=""
                />
              </FormField>
            )}
          </>
        )}
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
