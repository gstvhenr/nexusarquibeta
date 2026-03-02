import React from 'react';
import { PlusIcon, TrashIcon } from '../../../components/ui/icons';
import type { InstagramSnapshot } from '../../../types';
import { formatDateWithTime } from '../../../utils/formatters';

type InstagramSnapshotHistoryTableProps = {
  snapshots: InstagramSnapshot[];
  onNewSnapshot: () => void;
  onDeleteSnapshot: (snapshotId: string) => void;
};

export const InstagramSnapshotHistoryTable: (
  props: InstagramSnapshotHistoryTableProps,
) => React.ReactNode = ({ snapshots, onNewSnapshot, onDeleteSnapshot }) => {
  return (
    <div className="bg-surface rounded-xl shadow-soft p-5 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-serif text-lg font-bold text-secondary">Histórico de Métricas</h2>
        <button
          type="button"
          onClick={onNewSnapshot}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg font-semibold text-sm text-primary-content bg-primary hover:bg-primary-focus transition-colors"
        >
          <PlusIcon className="w-4 h-4" />
          Novo Registro
        </button>
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
                <th className="text-right pb-3 px-4 font-semibold text-text-secondary text-xs uppercase tracking-wider">
                  Posts
                </th>
                <th className="text-right pb-3 px-4 font-semibold text-text-secondary text-xs uppercase tracking-wider">
                  Seguidores
                </th>
                <th className="text-right pb-3 px-4 font-semibold text-text-secondary text-xs uppercase tracking-wider">
                  Seguindo
                </th>
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
                  <td className="py-3 px-4 text-right font-semibold">
                    {snapshot.posts.toLocaleString('pt-BR')}
                  </td>
                  <td className="py-3 px-4 text-right font-semibold">
                    {snapshot.followers.toLocaleString('pt-BR')}
                  </td>
                  <td className="py-3 px-4 text-right font-semibold">
                    {snapshot.following.toLocaleString('pt-BR')}
                  </td>
                  <td className="py-3 pl-4 text-center">
                    <button
                      type="button"
                      onClick={() => onDeleteSnapshot(snapshot.id)}
                      className="p-1.5 text-text-secondary hover:text-error rounded-md hover:bg-error/10 transition-colors"
                      title="Excluir registro"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
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
