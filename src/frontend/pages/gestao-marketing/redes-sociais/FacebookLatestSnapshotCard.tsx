import React from 'react';
import { Input } from '@/components/ui';
import type { InstagramSnapshot, SocialNetworkName } from '@/types';

type FacebookLatestSnapshotCardProps = {
  latestSnapshot?: InstagramSnapshot;
  lastPostDate?: string;
  onLastPostDateChange: (date: string) => void;
  networkId?: SocialNetworkName;
};

export const FacebookLatestSnapshotCard: (
  props: FacebookLatestSnapshotCardProps,
) => React.ReactNode = ({ latestSnapshot, lastPostDate, onLastPostDateChange, networkId }) => {
  const isLinkedIn = networkId === 'LinkedIn';
  return (
    <div className="bg-surface rounded-xl shadow-soft p-5 mb-6">
      <h2 className="font-serif text-lg font-bold text-secondary mb-4">Último cadastro manual</h2>
      {latestSnapshot ? (
        <div
          className={`grid grid-cols-1 ${isLinkedIn ? 'sm:grid-cols-2' : 'sm:grid-cols-3'} gap-3`}
        >
          <div className="rounded-lg border border-border-color bg-background/50 p-3">
            <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
              Data do último post
            </p>
            <Input
              type="date"
              value={lastPostDate || ''}
              onChange={(e) => onLastPostDateChange(e.target.value)}
              className="mt-1"
            />
          </div>
          <div className="rounded-lg border border-border-color bg-background/50 p-3">
            <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
              {isLinkedIn ? 'Conexões' : 'Seguidores'}
            </p>
            <p className="text-lg font-bold text-secondary mt-1">
              {latestSnapshot.followers.toLocaleString('pt-BR')}{' '}
              {isLinkedIn ? 'conexões' : 'seguidores'}
            </p>
          </div>
          {!isLinkedIn && (
            <div className="rounded-lg border border-border-color bg-background/50 p-3">
              <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Conexões
              </p>
              <p className="text-lg font-bold text-secondary mt-1">
                {latestSnapshot.following.toLocaleString('pt-BR')} conexões
              </p>
            </div>
          )}
        </div>
      ) : (
        <p className="text-sm text-text-secondary">Nenhum cadastro disponível.</p>
      )}
    </div>
  );
};
