import React from 'react';
import { PlusIcon, TrashIcon } from '@/components/ui/icons';
import { Button, IconButton } from '@/components/ui';
import type { InstagramSnapshot, SocialNetworkName } from '@/types';
import { formatDateWithTime } from '@/utils/formatters';

type InstagramSnapshotHistoryTableProps = {
  snapshots: InstagramSnapshot[];
  onNewSnapshot: () => void;
  onDeleteSnapshot: (snapshotId: string) => void;
  networkId?: SocialNetworkName;
};

export const InstagramSnapshotHistoryTable: (
  props: InstagramSnapshotHistoryTableProps,
) => React.ReactNode = ({ snapshots, onNewSnapshot, onDeleteSnapshot, networkId }) => {
  const isFacebookOrLinkedIn = networkId === 'Facebook' || networkId === 'LinkedIn';
  const isLinkedIn = networkId === 'LinkedIn';
  const isGoogle = networkId === 'Google';
  return (
    <div className="bg-surface rounded-xl shadow-soft p-5 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-serif text-lg font-bold text-secondary">Histórico de Métricas</h2>
        <Button onClick={onNewSnapshot}>
          <PlusIcon className="w-4 h-4" />
          Novo Registro
        </Button>
      </div>

      {snapshots.length === 0 ? (
        <div className="text-center py-8 text-text-secondary text-sm">
          Nenhum registro cadastrado. Clique em "Novo Registro" para adicionar.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-color">
                <th className="text-left pb-3 pr-4 font-semibold text-text-secondary text-xs uppercase tracking-wider">
                  Data/Hora
                </th>
                {!isFacebookOrLinkedIn && !isGoogle && (
                  <th className="text-right pb-3 px-4 font-semibold text-text-secondary text-xs uppercase tracking-wider">
                    Posts
                  </th>
                )}
                <th className="text-right pb-3 px-4 font-semibold text-text-secondary text-xs uppercase tracking-wider">
                  {isGoogle ? 'Qualidade' : networkId === 'LinkedIn' ? 'Conexões' : 'Seguidores'}
                </th>
                {!isLinkedIn && !isGoogle && (
                  <th className="text-right pb-3 px-4 font-semibold text-text-secondary text-xs uppercase tracking-wider">
                    {isFacebookOrLinkedIn ? 'Conexões' : 'Seguindo'}
                  </th>
                )}
                {isGoogle && (
                  <th className="text-right pb-3 px-4 font-semibold text-text-secondary text-xs uppercase tracking-wider">
                    Qtd. Avaliações
                  </th>
                )}
                <th className="text-center pb-3 pl-4 font-semibold text-text-secondary text-xs uppercase tracking-wider w-16">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {snapshots.map((snapshot) => (
                <tr
                  key={snapshot.id}
                  className="border-b border-border-color/50 hover:bg-background/50 transition-colors"
                >
                  <td className="py-3 pr-4 text-text-primary font-medium">
                    {formatDateWithTime(snapshot.recordedAt)}
                  </td>
                  {!isFacebookOrLinkedIn && !isGoogle && (
                    <td className="py-3 px-4 text-right font-semibold">
                      {snapshot.posts.toLocaleString('pt-BR')}
                    </td>
                  )}
                  <td className="py-3 px-4 text-right font-semibold">
                    {isGoogle ? snapshot.posts : snapshot.followers.toLocaleString('pt-BR')}
                  </td>
                  {!isLinkedIn && !isGoogle && (
                    <td className="py-3 px-4 text-right font-semibold">
                      {snapshot.following.toLocaleString('pt-BR')}
                    </td>
                  )}
                  {isGoogle && (
                    <td className="py-3 px-4 text-right font-semibold">
                      {snapshot.followers.toLocaleString('pt-BR')}
                    </td>
                  )}
                  <td className="py-3 pl-4 text-center">
                    <IconButton
                      variant="danger"
                      size="sm"
                      onClick={() => onDeleteSnapshot(snapshot.id)}
                      aria-label="Excluir registro"
                      title="Excluir registro"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </IconButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
