import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { InstagramCredentialModal } from '@/components/marketing';
import { Button, FormField, IconButton, Input, Modal } from '@/components/ui';
import { ArrowLeftIcon } from '@/components/ui/icons';
import { SOCIAL_NETWORKS_SUPPORTED } from '@/constants';
import { useMarketingData } from '@/context/DataContext';
import type { InstagramSnapshot, SocialNetwork, SocialNetworkName } from '@/types';
import {
  INSTAGRAM_DEFAULT_HANDLE,
  INSTAGRAM_DEFAULT_URL,
  INSTAGRAM_INITIAL_SNAPSHOT,
} from './constants';
import { InstagramDetailHeader } from './InstagramDetailHeader';
import { FacebookLatestSnapshotCard } from './FacebookLatestSnapshotCard';
import { GoogleLatestSnapshotCard } from './GoogleLatestSnapshotCard';
import { InstagramLatestSnapshotCard } from './InstagramLatestSnapshotCard';

import { InstagramProfileInfoCard } from './InstagramProfileInfoCard';
import { InstagramSnapshotHistoryTable } from './InstagramSnapshotHistoryTable';
import { InstagramTopBar } from './InstagramTopBar';
import { NewSnapshotModal } from './NewSnapshotModal';

const SocialNetworkDetailPage: () => React.ReactNode = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const networkId = location.pathname.split('/').pop();
  const { socialNetworks, setSocialNetworks } = useMarketingData();

  const [isCredentialModalOpen, setCredentialModalOpen] = useState(false);
  const [isSnapshotModalOpen, setSnapshotModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [editUrl, setEditUrl] = useState('');
  const [editHandle, setEditHandle] = useState('');

  const networkData = useMemo(
    () => socialNetworks.find((network) => network.id === networkId),
    [socialNetworks, networkId],
  );

  const networkConfig = useMemo(
    () => SOCIAL_NETWORKS_SUPPORTED.find((network) => network.id === networkId),
    [networkId],
  );

  useEffect(() => {
    if (networkId !== 'Instagram') {
      return;
    }

    setSocialNetworks((previous) => {
      const alreadyExists = previous.some((network) => network.id === 'Instagram');
      if (alreadyExists) {
        return previous;
      }

      return [
        ...previous,
        {
          id: 'Instagram',
          url: INSTAGRAM_DEFAULT_URL,
          profileHandle: INSTAGRAM_DEFAULT_HANDLE,
          followers: INSTAGRAM_INITIAL_SNAPSHOT.followers,
          notes: '',
          instagramSnapshots: [INSTAGRAM_INITIAL_SNAPSHOT],
          lastUpdated: new Date().toISOString(),
        },
      ];
    });
  }, [networkId, setSocialNetworks]);

  const updateNetworkData = useCallback(
    (updates: Partial<SocialNetwork>) => {
      setSocialNetworks((previous) => {
        const existing = previous.find((network) => network.id === networkId);
        if (existing) {
          return previous.map((network) =>
            network.id === networkId
              ? { ...network, ...updates, lastUpdated: new Date().toISOString() }
              : network,
          );
        }

        return [
          ...previous,
          {
            id: networkId as SocialNetworkName,
            url: '',
            lastUpdated: new Date().toISOString(),
            ...updates,
          },
        ];
      });
    },
    [networkId, setSocialNetworks],
  );

  const handleSaveCredentials = useCallback(
    (credentials: { username: string; password: string }) => {
      updateNetworkData({ credentials });
    },
    [updateNetworkData],
  );

  const handleSaveSnapshot = useCallback(
    (snapshot: InstagramSnapshot) => {
      const existingSnapshots = networkData?.instagramSnapshots || [];
      updateNetworkData({
        instagramSnapshots: [...existingSnapshots, snapshot],
        followers: snapshot.followers,
      });
    },
    [networkData, updateNetworkData],
  );

  const handleDeleteSnapshot = useCallback(
    (snapshotId: string) => {
      const existingSnapshots = networkData?.instagramSnapshots || [];
      updateNetworkData({
        instagramSnapshots: existingSnapshots.filter((snapshot) => snapshot.id !== snapshotId),
      });
    },
    [networkData, updateNetworkData],
  );

  const snapshots = useMemo(
    () =>
      [...(networkData?.instagramSnapshots || [])].sort(
        (a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime(),
      ),
    [networkData?.instagramSnapshots],
  );

  const latestSnapshot = snapshots[0];

  const displayProfileUrl =
    networkData?.url || (networkId === 'Instagram' ? INSTAGRAM_DEFAULT_URL : '');
  const displayProfileHandle =
    networkData?.profileHandle || (networkId === 'Instagram' ? INSTAGRAM_DEFAULT_HANDLE : '');

  if (!networkConfig) {
    return (
      <div className="animate-fade-in-up">
        <div className="flex items-center gap-3 mb-6">
          <IconButton
            onClick={() => navigate('/gestao-marketing/redes-sociais')}
            aria-label="Voltar para Redes Sociais"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </IconButton>
          <h1 className="font-serif text-2xl font-bold text-secondary">Rede não encontrada</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up">
      <InstagramDetailHeader
        name={networkConfig.name}
        icon={networkConfig.icon}
        onBack={() => navigate('/gestao-marketing/redes-sociais')}
      />

      <InstagramTopBar
        onOpenCredentials={() => setCredentialModalOpen(true)}
        onEdit={() => {
          setEditUrl(networkData?.url || displayProfileUrl);
          setEditHandle(networkData?.profileHandle || displayProfileHandle);
          setEditModalOpen(true);
        }}
      />

      <InstagramProfileInfoCard
        profileUrl={displayProfileUrl}
        profileHandle={displayProfileHandle}
        networkName={networkConfig.name}
      />

      {networkId === 'Google' ? (
        <GoogleLatestSnapshotCard latestSnapshot={latestSnapshot} />
      ) : networkId === 'Facebook' || networkId === 'LinkedIn' ? (
        <FacebookLatestSnapshotCard
          latestSnapshot={latestSnapshot}
          lastPostDate={networkData?.lastPostDate}
          onLastPostDateChange={(date) => updateNetworkData({ lastPostDate: date })}
          networkId={networkConfig.id}
        />
      ) : (
        <InstagramLatestSnapshotCard latestSnapshot={latestSnapshot} />
      )}

      <InstagramSnapshotHistoryTable
        snapshots={snapshots}
        onNewSnapshot={() => setSnapshotModalOpen(true)}
        onDeleteSnapshot={handleDeleteSnapshot}
        networkId={networkConfig.id}
      />

      <InstagramCredentialModal
        isOpen={isCredentialModalOpen}
        onClose={() => setCredentialModalOpen(false)}
        credentials={networkData?.credentials}
        onSaveCredentials={handleSaveCredentials}
        networkName={networkConfig.name}
      />

      <NewSnapshotModal
        isOpen={isSnapshotModalOpen}
        onClose={() => setSnapshotModalOpen(false)}
        onSave={handleSaveSnapshot}
        networkName={networkConfig.name}
        networkId={networkConfig.id}
        onSaveLastPostDate={(date) => updateNetworkData({ lastPostDate: date })}
      />

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setEditModalOpen(false)}
        title={`Editar ${networkConfig.name}`}
      >
        <div className="space-y-4">
          <FormField label="URL do Perfil">
            <Input
              type="url"
              value={editUrl}
              onChange={(e) => setEditUrl(e.target.value)}
              placeholder=""
            />
          </FormField>
          <FormField label="@ do Perfil">
            <Input
              value={editHandle}
              onChange={(e) => setEditHandle(e.target.value)}
              placeholder=""
            />
          </FormField>
        </div>
        <div className="flex justify-end space-x-4 mt-6 pt-4 border-t border-border-color">
          <Button variant="secondary" onClick={() => setEditModalOpen(false)}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              updateNetworkData({ url: editUrl, profileHandle: editHandle });
              setEditModalOpen(false);
            }}
          >
            Salvar
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default SocialNetworkDetailPage;
