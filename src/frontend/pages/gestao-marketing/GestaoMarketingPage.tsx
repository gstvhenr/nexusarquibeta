import { useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ActivityFormModal, ProfessionalFormModal } from '../../components/marketing';
import { PageHeader } from '../../components/layout';
import { DeleteConfirmationModal, PlusIcon, Button } from '../../components/ui';
import { NAV_LINKS } from '../../constants';
import { useCoreData, useMarketingData } from '../../context/DataContext';
import type { MarketingActivity, MarketingProfessional } from '../../types';
import { useDisclosure } from '../../hooks/useDisclosure';
import { MarketingContentListView } from './MarketingContentListView';
import { MarketingDashboardView } from './MarketingDashboardView';

type MarketingView = 'dashboard' | 'content';

type DeletableItemType = 'professional' | 'activity' | null;

function GestaoMarketingPage(): JSX.Element {
  const {
    marketingProfessionals: professionals,
    setMarketingProfessionals: setProfessionals,
    marketingActivities: activities,
    setMarketingActivities: setActivities,
  } = useMarketingData();
  const { projects, clients } = useCoreData();

  const location = useLocation();

  const activeView = useMemo<MarketingView>(() => {
    const path = location.pathname;
    if (path.endsWith('/conteudos')) return 'content';
    return 'dashboard';
  }, [location.pathname]);

  const professionalModal = useDisclosure();
  const activityModal = useDisclosure();

  const deleteModal = useDisclosure();

  const [itemToInteract, setItemToInteract] = useState<
    MarketingActivity | MarketingProfessional | null
  >(null);
  const [itemTypeToDelete, setItemTypeToDelete] = useState<DeletableItemType>(null);
  const [activityModalMode, setActivityModalMode] = useState<'view' | 'edit'>('edit');

  const handleSaveProfessional = (professional: MarketingProfessional) => {
    setProfessionals((previous) => {
      const exists = previous.some((item) => item.id === professional.id);
      if (exists) {
        return previous.map((item) => (item.id === professional.id ? professional : item));
      }
      return [...previous, professional];
    });
    professionalModal.close();
  };

  const handleDeleteProfessional = (id: string) => {
    setProfessionals((previous) => previous.filter((item) => item.id !== id));
  };

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

  const openProfessionalModal = (professional: MarketingProfessional | null) => {
    setItemToInteract(professional);
    professionalModal.open();
  };

  const openActivityModal = (
    activity: MarketingActivity | null,
    mode: 'view' | 'edit' = 'edit',
  ) => {
    setItemToInteract(activity);
    setActivityModalMode(mode);
    activityModal.open();
  };

  const handleDeleteRequest = (
    item: MarketingProfessional | MarketingActivity,
    type: Exclude<DeletableItemType, null>,
  ) => {
    setItemToInteract(item);
    setItemTypeToDelete(type);
    deleteModal.open();
  };

  const handleDeleteConfirm = () => {
    if (!itemToInteract || !itemTypeToDelete) return;

    if (itemTypeToDelete === 'professional') {
      handleDeleteProfessional(itemToInteract.id);
    }
    if (itemTypeToDelete === 'activity') {
      handleDeleteActivity(itemToInteract.id);
    }

    deleteModal.close();
    setItemToInteract(null);
    setItemTypeToDelete(null);
  };

  const getDeleteItemName = (item: MarketingProfessional | MarketingActivity | null): string => {
    if (!item) return '';
    if ('name' in item && item.name) return item.name;
    if ('title' in item && item.title) return item.title;
    return '';
  };

  const marketingIcon = NAV_LINKS.find((link) => link.label === 'Marketing')?.icon;

  const renderContent = () => {
    if (activeView === 'content') {
      return (
        <MarketingContentListView
          activities={activities}
          onToggleActivityStatus={handleToggleActivityStatus}
          onEditActivity={(activity) => openActivityModal(activity, 'edit')}
          onDeleteActivity={(activity) => handleDeleteRequest(activity, 'activity')}
        />
      );
    }

    return (
      <MarketingDashboardView
        professionals={professionals}
        activities={activities}
        clients={clients}
        onEditProfessional={openProfessionalModal}
      />
    );
  };

  return (
    <div className="animate-fade-in-up">
      <div className="flex h-full min-h-0 flex-col">
        <PageHeader title="Gestão de Marketing" icon={marketingIcon} contentGap="compact">
          {activeView === 'dashboard' && (
            <Button onClick={() => openProfessionalModal(null)}>
              <PlusIcon className="w-4 h-4" /> Adicionar Prestador
            </Button>
          )}

          {activeView === 'content' && (
            <Button onClick={() => openActivityModal(null, 'edit')}>
              <PlusIcon className="w-4 h-4" /> Novo Conteúdo
            </Button>
          )}
        </PageHeader>

        <div className="min-h-0 flex-1">{renderContent()}</div>
      </div>

      <ProfessionalFormModal
        isOpen={professionalModal.isOpen}
        onClose={professionalModal.close}
        onSave={handleSaveProfessional}
        onDelete={(id) => handleDeleteRequest({ id } as MarketingProfessional, 'professional')}
        initialProfessional={itemToInteract as MarketingProfessional | null}
      />

      <ActivityFormModal
        isOpen={activityModal.isOpen}
        onClose={activityModal.close}
        onSave={handleSaveActivity}
        onDelete={(id) => handleDeleteRequest({ id } as MarketingActivity, 'activity')}
        initialActivity={itemToInteract as MarketingActivity | null}
        professionals={professionals}
        projects={projects}
        readOnly={activityModalMode === 'view'}
      />

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.close}
        onConfirm={handleDeleteConfirm}
        itemName={getDeleteItemName(itemToInteract)}
        itemType={itemTypeToDelete || ''}
      />
    </div>
  );
}

export default GestaoMarketingPage;
