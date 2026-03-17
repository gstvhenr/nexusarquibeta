import { useState } from 'react';
import { ActivityFormModal } from '../../components/marketing';
import { PageHeader } from '../../components/layout';
import { DeleteConfirmationModal, PlusIcon, Button } from '../../components/ui';
import { NAV_LINKS } from '../../constants';
import { useCoreData, useMarketingData } from '../../context/DataContext';
import type { MarketingActivity } from '../../types';
import { useDisclosure } from '../../hooks/useDisclosure';
import { MarketingContentListView } from './MarketingContentListView';

function GestaoMarketingPage(): JSX.Element {
  const {
    marketingProfessionals: professionals,
    marketingActivities: activities,
    setMarketingActivities: setActivities,
  } = useMarketingData();
  const { projects } = useCoreData();

  const activityModal = useDisclosure();
  const deleteModal = useDisclosure();

  const [itemToInteract, setItemToInteract] = useState<MarketingActivity | null>(null);
  const [activityModalMode, setActivityModalMode] = useState<'view' | 'edit'>('edit');

  const handleSaveActivity = (activity: MarketingActivity) => {
    setActivities((previous) => {
      const exists = previous.some((item) => item.id === activity.id);
      if (exists) {
        return previous.map((item) => (item.id === activity.id ? activity : item));
      }
      return [...previous, activity];
    });
    activityModal.close();
  };

  const handleDeleteActivity = (id: string) => {
    setActivities((previous) => previous.filter((item) => item.id !== id));
  };

  const handleToggleActivityStatus = (id: string) => {
    setActivities((previous) =>
      previous.map((item) =>
        item.id === id
          ? {
              ...item,
              status: item.status === 'Concluído' ? 'Pendente' : 'Concluído',
              completionDate: item.status === 'Pendente' ? new Date().toISOString() : undefined,
            }
          : item,
      ),
    );
  };

  const openActivityModal = (
    activity: MarketingActivity | null,
    mode: 'view' | 'edit' = 'edit',
  ) => {
    setItemToInteract(activity);
    setActivityModalMode(mode);
    activityModal.open();
  };

  const handleDeleteRequest = (activity: MarketingActivity) => {
    setItemToInteract(activity);
    deleteModal.open();
  };

  const handleDeleteConfirm = () => {
    if (!itemToInteract) return;
    handleDeleteActivity(itemToInteract.id);
    deleteModal.close();
    setItemToInteract(null);
  };

  const marketingIcon = NAV_LINKS.find((link) => link.label === 'Marketing')?.icon;

  return (
    <div className="animate-fade-in-up">
      <div className="flex h-full min-h-0 flex-col">
        <PageHeader title="Gestão de Marketing" icon={marketingIcon} contentGap="compact">
          <Button onClick={() => openActivityModal(null, 'edit')}>
            <PlusIcon className="w-4 h-4" /> Novo Conteúdo
          </Button>
        </PageHeader>

        <div className="min-h-0 flex-1">
          <MarketingContentListView
            activities={activities}
            onToggleActivityStatus={handleToggleActivityStatus}
            onEditActivity={(activity) => openActivityModal(activity, 'edit')}
            onDeleteActivity={(activity) => handleDeleteRequest(activity)}
          />
        </div>
      </div>

      <ActivityFormModal
        isOpen={activityModal.isOpen}
        onClose={activityModal.close}
        onSave={handleSaveActivity}
        onDelete={(id) => handleDeleteRequest({ id } as MarketingActivity)}
        initialActivity={itemToInteract}
        professionals={professionals}
        projects={projects}
        readOnly={activityModalMode === 'view'}
      />

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.close}
        onConfirm={handleDeleteConfirm}
        itemName={itemToInteract?.title ?? ''}
        itemType="activity"
      />
    </div>
  );
}

export default GestaoMarketingPage;
