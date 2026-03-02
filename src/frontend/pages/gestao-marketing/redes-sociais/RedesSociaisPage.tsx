import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../../components/layout';
import { Modal } from '../../../components/ui';
import { useMarketingData } from '../../../context/DataContext';
import type { SocialNetwork, SocialNetworkName } from '../../../types';
import { NAV_LINKS, SOCIAL_NETWORKS_SUPPORTED } from '../../../constants';
import { formatDateWithTime } from '../../../utils/formatters';

const SocialNetworkFormModal: (props: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (network: SocialNetwork) => void;
  networkConfig?: (typeof SOCIAL_NETWORKS_SUPPORTED)[0];
  networkData?: SocialNetwork;
}) => React.ReactNode = ({ isOpen, onClose, onSave, networkConfig, networkData }) => {
  const [url, setUrl] = useState('');
  const [followers, setFollowers] = useState<number | undefined>(undefined);
  const [notes, setNotes] = useState('');

  React.useEffect(() => {
    if (isOpen) {
      setUrl(networkData?.url || '');
      setFollowers(networkData?.followers);
      setNotes(networkData?.notes || '');
    }
  }, [isOpen, networkData]);

  const handleSave = () => {
    if (!networkConfig) return;
    onSave({
      id: networkConfig.id,
      url: url,
      followers: followers,
      notes: notes,
      lastUpdated: new Date().toISOString(),
    });
    onClose();
  };

  if (!isOpen || !networkConfig) return null;

  const inputClass =
    'w-full bg-background p-2 rounded-md border border-border-color focus:border-accent';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Editar ${networkConfig.name}`}>
      <div className="space-y-4">
        <div>
          <label
            htmlFor="field-url-do-perfil"
            className="block text-sm font-medium text-text-secondary mb-1"
          >
            URL do Perfil
          </label>
          <input
            id="field-url-do-perfil"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder={networkConfig.placeholder}
            className={inputClass}
          />
        </div>
        <div>
          <label
            htmlFor="field-numero-de-seguidores"
            className="block text-sm font-medium text-text-secondary mb-1"
          >
            Número de Seguidores
          </label>
          <input
            id="field-numero-de-seguidores"
            type="number"
            value={followers || ''}
            onChange={(e) => setFollowers(parseInt(e.target.value) || undefined)}
            placeholder="Ex: 1500"
            className={inputClass}
          />
        </div>
        <div>
          <label
            htmlFor="field-anotacoes"
            className="block text-sm font-medium text-text-secondary mb-1"
          >
            Anotações
          </label>
          <textarea
            id="field-anotacoes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            placeholder="Estratégias de conteúdo, público-alvo, etc."
            className={inputClass}
          ></textarea>
        </div>
      </div>
      <div className="flex justify-end space-x-4 mt-6 pt-4 border-t border-border-color">
        <button
          type="button"
          onClick={onClose}
          className="px-6 py-2 rounded-lg font-semibold text-text-primary bg-border-color/50 hover:bg-border-color"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="px-6 py-2 rounded-lg font-semibold text-primary-content bg-primary hover:bg-primary-focus"
        >
          Salvar
        </button>
      </div>
    </Modal>
  );
};

const SocialNetworkCard: (props: {
  networkConfig: (typeof SOCIAL_NETWORKS_SUPPORTED)[0];
  networkData?: SocialNetwork;
  onEdit: () => void;
  onClick: () => void;
}) => React.ReactNode = ({ networkConfig, networkData, onEdit, onClick }) => {
  const { id: _id, name, icon, color: _color } = networkConfig;
  return (
    <div
      onClick={onClick}
      className="bg-surface rounded-xl shadow-soft p-6 flex flex-col transition-all duration-300 hover:shadow-lifted hover:-translate-y-1 cursor-pointer group"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onClick();
      }}
    >
      <div className="flex justify-between items-start gap-4">
        <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-white border border-border-color">
          {React.cloneElement(icon, { className: 'w-8 h-8' })}
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          className="text-sm font-semibold text-primary hover:underline"
        >
          {networkData ? 'Editar' : 'Adicionar'}
        </button>
      </div>
      <h3 className="font-serif text-2xl font-bold text-secondary mt-4">{name}</h3>

      {networkData ? (
        <div className="space-y-3 mt-4 flex-grow">
          <div>
            <p className="text-xs font-semibold text-text-secondary">URL</p>
            <p className="text-sm text-primary break-all">{networkData.url}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-text-secondary">Seguidores</p>
            <p className="text-lg font-bold">
              {networkData.followers?.toLocaleString('pt-BR') || '-'}
            </p>
          </div>
          {networkData.notes && (
            <div>
              <p className="text-xs font-semibold text-text-secondary">Anotações</p>
              <p className="text-sm text-text-primary whitespace-pre-wrap">{networkData.notes}</p>
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
  const { socialNetworks, setSocialNetworks } = useMarketingData();
  const navigate = useNavigate();
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedNetworkId, setSelectedNetworkId] = useState<SocialNetworkName | null>(null);

  const openModalFor = (id: SocialNetworkName) => {
    setSelectedNetworkId(id);
    setModalOpen(true);
  };

  const handleSave = (network: SocialNetwork) => {
    setSocialNetworks((prev) => {
      const existing = prev.find((n) => n.id === network.id);
      if (existing) {
        return prev.map((n) => (n.id === network.id ? network : n));
      }
      return [...prev, network];
    });
  };

  const selectedNetworkConfig = useMemo(
    () => SOCIAL_NETWORKS_SUPPORTED.find((c) => c.id === selectedNetworkId),
    [selectedNetworkId],
  );
  const selectedNetworkData = useMemo(
    () => socialNetworks.find((n) => n.id === selectedNetworkId),
    [selectedNetworkId, socialNetworks],
  );

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
            onEdit={() => openModalFor(config.id)}
            onClick={() => navigate(`/gestao-marketing/redes-sociais/${config.id}`)}
          />
        ))}
      </div>

      <SocialNetworkFormModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        networkConfig={selectedNetworkConfig}
        networkData={selectedNetworkData}
      />
    </div>
  );
};

export default RedesSociaisPage;
