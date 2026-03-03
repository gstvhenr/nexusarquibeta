import { useState } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { Tab, TabList, TabPanel, Tabs } from './Tabs';

afterEach(() => {
  cleanup();
});

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

describe('Tabs', () => {
  it('switches active panel when user clicks another tab', () => {
    // Given
    render(<TabsHarness />);

    // Then
    expect(screen.getByText('Painel de visão geral')).toBeInTheDocument();
    expect(screen.queryByText('Painel financeiro')).not.toBeInTheDocument();

    // When
    fireEvent.click(screen.getByRole('tab', { name: 'Financeiro' }));

    // Then
    expect(screen.queryByText('Painel de visão geral')).not.toBeInTheDocument();
    expect(screen.getByText('Painel financeiro')).toBeInTheDocument();
  });

  it('supports keyboard navigation with ArrowRight', () => {
    // Given
    render(<TabsHarness />);
    const overviewTab = screen.getByRole('tab', { name: 'Visão Geral' });
    overviewTab.focus();

    // When
    fireEvent.keyDown(overviewTab, { key: 'ArrowRight' });

    // Then
    const financeTab = screen.getByRole('tab', { name: 'Financeiro' });
    expect(financeTab).toHaveFocus();
    expect(financeTab).toHaveAttribute('aria-selected', 'true');
  });
});
