import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { InstagramCredentialModal } from '@/components/marketing';
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
import { InstagramLatestSnapshotCard } from './InstagramLatestSnapshotCard';
import { InstagramNotesCard } from './InstagramNotesCard';
import { InstagramProfileInfoCard } from './InstagramProfileInfoCard';
import { InstagramSnapshotHistoryTable } from './InstagramSnapshotHistoryTable';
import { InstagramTopBar } from './InstagramTopBar';
import { NewSnapshotModal } from './NewSnapshotModal';

const InstagramDetailPage: () => React.ReactNode = () => {
  const navigate = useNavigate();
  const { networkId } = useParams<{ networkId: string }>();
  const { socialNetworks, setSocialNetworks, marketingActivities } = useMarketingData();

  const [isCredentialModalOpen, setCredentialModalOpen] = useState(false);
  const [isSnapshotModalOpen, setSnapshotModalOpen] = useState(false);
  const [isEditingNotes, setEditingNotes] = useState(false);
  const [notesValue, setNotesValue] = useState('');

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

  const investmentFromMarketingPages = useMemo(
    () =>
      marketingActivities
        .filter(
          (activity) =>
            activity.contentType.includes('(Instagram)') &&
            typeof activity.cost === 'number' &&
            activity.cost > 0,
        )
        .reduce((sum, activity) => sum + (activity.cost || 0), 0),
    [marketingActivities],
  );

  const totalInvested =
    investmentFromMarketingPages > 0
      ? investmentFromMarketingPages
      : networkData?.totalInvested || 0;

  const displayProfileUrl =
    networkData?.url || (networkId === 'Instagram' ? INSTAGRAM_DEFAULT_URL : '');
  const displayProfileHandle =
    networkData?.profileHandle || (networkId === 'Instagram' ? INSTAGRAM_DEFAULT_HANDLE : '');

  const handleStartEditNotes = () => {
    setNotesValue(networkData?.notes || '');
    setEditingNotes(true);
  };

  const handleSaveNotes = () => {
    updateNetworkData({ notes: notesValue });
    setEditingNotes(false);
  };

  if (!networkConfig) {
    return (
      <div className="animate-fade-in-up">
        <div className="flex items-center gap-3 mb-6">
          <button
            type="button"
            onClick={() => navigate('/gestao-marketing/redes-sociais')}
            className="p-2 rounded-lg hover:bg-border-color/30 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
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
        totalInvested={totalInvested}
        onOpenCredentials={() => setCredentialModalOpen(true)}
      />

      <InstagramProfileInfoCard
        profileUrl={displayProfileUrl}
        profileHandle={displayProfileHandle}
      />

      <InstagramLatestSnapshotCard latestSnapshot={latestSnapshot} />

      <InstagramSnapshotHistoryTable
        snapshots={snapshots}
        onNewSnapshot={() => setSnapshotModalOpen(true)}
        onDeleteSnapshot={handleDeleteSnapshot}
      />

      <InstagramNotesCard
        notes={networkData?.notes}
        isEditing={isEditingNotes}
        notesValue={notesValue}
        onStartEdit={handleStartEditNotes}
        onCancelEdit={() => setEditingNotes(false)}
        onSave={handleSaveNotes}
        onNotesChange={setNotesValue}
      />

      <InstagramCredentialModal
        isOpen={isCredentialModalOpen}
        onClose={() => setCredentialModalOpen(false)}
        credentials={networkData?.credentials}
        onSaveCredentials={handleSaveCredentials}
      />

      <NewSnapshotModal
        isOpen={isSnapshotModalOpen}
        onClose={() => setSnapshotModalOpen(false)}
        onSave={handleSaveSnapshot}
      />
    </div>
  );
};

export default InstagramDetailPage;
