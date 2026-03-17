import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/layout';
import { useMarketingData } from '@/context/DataContext';
import type { SocialNetwork } from '@/types';
import { NAV_LINKS, SOCIAL_NETWORKS_SUPPORTED } from '@/constants';
import { formatDateWithTime } from '@/utils/formatters';

const SocialNetworkCard: (props: {
  networkConfig: (typeof SOCIAL_NETWORKS_SUPPORTED)[0];
  networkData?: SocialNetwork;
  onClick: () => void;
}) => React.ReactNode = ({ networkConfig, networkData, onClick }) => {
  const { id, name, icon, color: _color } = networkConfig;
  return (
    <div
      onClick={onClick}
      className="bg-surface rounded-xl shadow-soft p-6 flex flex-col min-h-64 transition-all duration-300 hover:shadow-lifted hover:-translate-y-1 cursor-pointer group"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onClick();
      }}
    >
      <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-surface border border-border-color">
        {React.cloneElement(icon, { className: 'w-8 h-8' })}
      </div>
      <h3 className="font-serif text-2xl font-bold text-secondary mt-4">{name}</h3>

      {networkData ? (
        <div className="space-y-3 mt-4 flex-grow min-h-0 overflow-hidden">
          <div>
            <p className="text-xs font-semibold text-text-secondary">URL</p>
            {id === 'Google' ? (
              <span
                role="button"
                tabIndex={0}
                className="text-sm text-primary hover:underline cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(networkData.url, '_blank', 'noopener,noreferrer');
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.stopPropagation();
                    window.open(networkData.url, '_blank', 'noopener,noreferrer');
                  }
                }}
              >
                Google
              </span>
            ) : (
              <p className="text-sm text-primary truncate">{networkData.url}</p>
            )}
          </div>
          <div>
            <p className="text-xs font-semibold text-text-secondary">
              {id === 'Google' ? 'Avaliações' : id === 'LinkedIn' ? 'Conexões' : 'Seguidores'}
              {': '}
              {(() => {
                const latestSnap = networkData.instagramSnapshots
                  ?.slice()
                  .sort(
                    (a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime(),
                  )[0];
                if (id === 'Google' && latestSnap) {
                  return latestSnap.posts.toLocaleString('pt-BR', {
                    minimumFractionDigits: 1,
                    maximumFractionDigits: 1,
                  });
                }
                const count = networkData.followers ?? latestSnap?.followers;
                return count != null ? count.toLocaleString('pt-BR') : '-';
              })()}
            </p>
          </div>
          {networkData.notes && (
            <div>
              <p className="text-xs font-semibold text-text-secondary">Anotações</p>
              <p className="text-sm text-text-primary line-clamp-2">{networkData.notes}</p>
            </div>
          )}
        </div>
      ) : (
        <div className="flex-grow flex items-center justify-center text-center text-text-secondary text-sm p-4">
          Informações não cadastradas.
        </div>
      )}
      <div className="mt-4 pt-3 border-t border-border-color text-xs text-text-secondary/80 flex items-center justify-between">
        <span>
          {networkData
            ? `Atualizado em: ${formatDateWithTime(networkData.lastUpdated)}`
            : 'Ainda não configurado'}
        </span>
        <span className="text-primary opacity-0 group-hover:opacity-100 transition-opacity text-xs font-semibold">
          Ver detalhes →
        </span>
      </div>
    </div>
  );
};

const RedesSociaisPage: () => React.ReactNode = () => {
  const { socialNetworks } = useMarketingData();
  const navigate = useNavigate();

  const marketingIcon = NAV_LINKS.find((link) => link.label === 'Marketing')?.icon;

  return (
    <div className="animate-fade-in-up">
      <PageHeader title="Redes Sociais" icon={marketingIcon} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {SOCIAL_NETWORKS_SUPPORTED.map((config) => (
          <SocialNetworkCard
            key={config.id}
            networkConfig={config}
            networkData={socialNetworks.find((n) => n.id === config.id)}
            onClick={() => navigate(`/gestao-marketing/redes-sociais/${config.id}`)}
          />
        ))}
      </div>
    </div>
  );
};

export default RedesSociaisPage;
