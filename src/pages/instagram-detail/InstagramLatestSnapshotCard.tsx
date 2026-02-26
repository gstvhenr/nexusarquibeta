import React from 'react';
import type { InstagramSnapshot } from '../../types';
import { formatDateWithTime } from '../../utils/formatters';

type InstagramLatestSnapshotCardProps = {
  latestSnapshot?: InstagramSnapshot;
};

export const InstagramLatestSnapshotCard: (
  props: InstagramLatestSnapshotCardProps,
) => React.ReactNode = ({ latestSnapshot }) => {
  return (
    <div className="bg-surface rounded-xl shadow-soft p-5 mb-6">
      <h2 className="font-serif text-lg font-bold text-secondary mb-4">Último cadastro manual</h2>
      {latestSnapshot ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="rounded-lg border border-border-color bg-background/50 p-3">
            <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
              Posts
            </p>
            <p className="text-lg font-bold text-secondary mt-1">
              {latestSnapshot.posts.toLocaleString('pt-BR')} posts
            </p>
          </div>
          <div className="rounded-lg border border-border-color bg-background/50 p-3">
            <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
              Seguidores
            </p>
            <p className="text-lg font-bold text-secondary mt-1">
              {latestSnapshot.followers.toLocaleString('pt-BR')} seguidores
            </p>
          </div>
          <div className="rounded-lg border border-border-color bg-background/50 p-3">
            <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
              Seguindo
            </p>
            <p className="text-lg font-bold text-secondary mt-1">
              {latestSnapshot.following.toLocaleString('pt-BR')} seguindo
            </p>
          </div>
          <div className="rounded-lg border border-border-color bg-background/50 p-3">
            <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
              Data
            </p>
            <p className="text-sm font-bold text-secondary mt-1">
              {formatDateWithTime(latestSnapshot.recordedAt)}
            </p>
            <p className="text-[11px] text-text-secondary mt-1">
              Registro imutável do momento do cadastro.
            </p>
          </div>
        </div>
      ) : (
        <p className="text-sm text-text-secondary">Nenhum cadastro disponível.</p>
      )}
    </div>
  );
};
