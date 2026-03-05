import { useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Tab, TabList, TabPanel, Tabs } from './Tabs';

function TabsHarness() {
  const [tab, setTab] = useState('overview');

  return (
    <Tabs value={tab} onValueChange={setTab}>
      <TabList>
        <Tab value="overview">Visão Geral</Tab>
        <Tab value="finance">Financeiro</Tab>
      </TabList>
      <TabPanel value="overview">
        <p>Painel de visão geral</p>
      </TabPanel>
      <TabPanel value="finance">
        <p>Painel financeiro</p>
      </TabPanel>
    </Tabs>
  );
}

function DisabledTabsHarness() {
  const [tab, setTab] = useState('overview');

  return (
    <Tabs value={tab} onValueChange={setTab}>
      <TabList>
        <Tab value="overview">Visão Geral</Tab>
        <Tab value="blocked" disabled>
          Bloqueada
        </Tab>
        <Tab value="finance">Financeiro</Tab>
      </TabList>
      <TabPanel value="overview">
        <p>Painel de visão geral</p>
      </TabPanel>
      <TabPanel value="finance">
        <p>Painel financeiro</p>
      </TabPanel>
    </Tabs>
  );
}

describe('Tabs', () => {
  it('switches active panel when user clicks another tab', () => {
    render(<TabsHarness />);

    expect(screen.getByText('Painel de visão geral')).toBeInTheDocument();
    expect(screen.queryByText('Painel financeiro')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: 'Financeiro' }));

    expect(screen.queryByText('Painel de visão geral')).not.toBeInTheDocument();
    expect(screen.getByText('Painel financeiro')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Financeiro' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
  });

  it('supports keyboard navigation with ArrowRight and ArrowLeft', () => {
    render(<TabsHarness />);
    const overviewTab = screen.getByRole('tab', { name: 'Visão Geral' });
    overviewTab.focus();

    fireEvent.keyDown(overviewTab, { key: 'ArrowRight' });

    const financeTab = screen.getByRole('tab', { name: 'Financeiro' });
    expect(financeTab).toHaveFocus();
    expect(financeTab).toHaveAttribute('aria-selected', 'true');

    fireEvent.keyDown(financeTab, { key: 'ArrowLeft' });
    expect(overviewTab).toHaveFocus();
    expect(overviewTab).toHaveAttribute('aria-selected', 'true');
  });

  it('supports Home and End keyboard navigation', () => {
    render(<TabsHarness />);
    const tabList = screen.getByRole('tablist');
    const overviewTab = screen.getByRole('tab', { name: 'Visão Geral' });
    const financeTab = screen.getByRole('tab', { name: 'Financeiro' });

    overviewTab.focus();
    fireEvent.keyDown(tabList, { key: 'End' });
    expect(financeTab).toHaveFocus();
    expect(financeTab).toHaveAttribute('aria-selected', 'true');

    fireEvent.keyDown(tabList, { key: 'Home' });
    expect(overviewTab).toHaveFocus();
    expect(overviewTab).toHaveAttribute('aria-selected', 'true');
  });

  it('skips disabled tabs during keyboard navigation', () => {
    render(<DisabledTabsHarness />);
    const overviewTab = screen.getByRole('tab', { name: 'Visão Geral' });
    overviewTab.focus();

    fireEvent.keyDown(screen.getByRole('tablist'), { key: 'ArrowRight' });
    const financeTab = screen.getByRole('tab', { name: 'Financeiro' });

    expect(financeTab).toHaveFocus();
    expect(financeTab).toHaveAttribute('aria-selected', 'true');
  });

  it('keeps tab value unchanged when click handler prevents default', () => {
    function PreventDefaultHarness() {
      const [tab, setTab] = useState('overview');

      return (
        <Tabs value={tab} onValueChange={setTab}>
          <TabList>
            <Tab value="overview">Visão Geral</Tab>
            <Tab
              value="finance"
              onClick={(event) => {
                event.preventDefault();
              }}
            >
              Financeiro
            </Tab>
          </TabList>
          <TabPanel value="overview">
            <p>Painel de visão geral</p>
          </TabPanel>
          <TabPanel value="finance">
            <p>Painel financeiro</p>
          </TabPanel>
        </Tabs>
      );
    }

    render(<PreventDefaultHarness />);
    fireEvent.click(screen.getByRole('tab', { name: 'Financeiro' }));

    expect(screen.getByText('Painel de visão geral')).toBeInTheDocument();
    expect(screen.queryByText('Painel financeiro')).not.toBeInTheDocument();
  });

  it('keeps inactive panel mounted when unmountOnExit is false', () => {
    render(
      <Tabs value="overview" onValueChange={() => undefined}>
        <TabList>
          <Tab value="overview">Visão Geral</Tab>
          <Tab value="finance">Financeiro</Tab>
        </TabList>
        <TabPanel value="overview">
          <p>Painel de visão geral</p>
        </TabPanel>
        <TabPanel value="finance" unmountOnExit={false}>
          <p>Painel financeiro</p>
        </TabPanel>
      </Tabs>,
    );

    const tabPanels = screen.getAllByRole('tabpanel', { hidden: true });
    expect(tabPanels).toHaveLength(2);
    expect(tabPanels[1]).toHaveAttribute('hidden');
    expect(screen.getByText('Painel financeiro')).toBeInTheDocument();
  });

  it('throws when Tab is used outside Tabs context', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    expect(() => render(<Tab value="orphan">Órfã</Tab>)).toThrow('Tab must be used inside <Tabs>.');

    consoleErrorSpy.mockRestore();
  });

  it('supports className as function for active state', () => {
    render(
      <Tabs value="overview" onValueChange={() => undefined}>
        <TabList>
          <Tab
            value="overview"
            className={({ active }) => (active ? 'active-class' : 'inactive-class')}
          >
            Visão Geral
          </Tab>
          <Tab
            value="finance"
            className={({ active }) => (active ? 'active-class' : 'inactive-class')}
          >
            Financeiro
          </Tab>
        </TabList>
        <TabPanel value="overview">Overview</TabPanel>
        <TabPanel value="finance">Finance</TabPanel>
      </Tabs>,
    );

    expect(screen.getByRole('tab', { name: 'Visão Geral' })).toHaveClass('active-class');
    expect(screen.getByRole('tab', { name: 'Financeiro' })).toHaveClass('inactive-class');
  });
});
