import React from 'react';
import { describe, expect, it } from 'vitest';
import { projectStatuses } from '../types';
import {
  EXPENSE_CATEGORY_COLORS,
  NAV_LINKS,
  PROJECT_STATUS_COLORS,
  RECEIVABLE_SOURCE_COLORS,
  SETTINGS_LINK,
  SOCIAL_NETWORKS_SUPPORTED,
} from './ui';

describe('constants/ui', () => {
  it('defines a valid navigation tree with stable menu shape', () => {
    const expectedChildrenCountByLabel: Record<string, number> = {
      Agenda: 4,
      Comercial: 3,
      Financeiro: 5,
      Documentos: 2,
      Suprimentos: 4,
      Marketing: 4,
      Subcontratação: 2,
    };

    expect(NAV_LINKS).toHaveLength(11);

    const assertNavNode = (
      node: (typeof NAV_LINKS)[number],
      { requiresPath }: { requiresPath: boolean },
    ): void => {
      expect(node.label).toBeTruthy();
      expect(node.iconName).toMatch(/Icon(New)?$/);
      expect(React.isValidElement(node.icon)).toBe(true);

      if (requiresPath) {
        expect(node.path).toMatch(/^\/.*/);
      }

      if (node.children) {
        expect(node.children.length).toBeGreaterThan(0);
        node.children.forEach((child) => assertNavNode(child, { requiresPath: true }));
      } else {
        expect(typeof node.path === 'string' && node.path.length > 0).toBe(true);
      }
    };

    NAV_LINKS.forEach((link) => {
      const expectedChildren = expectedChildrenCountByLabel[link.label];
      if (typeof expectedChildren === 'number') {
        expect(link.children).toHaveLength(expectedChildren);
      }
      assertNavNode(link, { requiresPath: false });
    });
  });

  it('keeps settings shortcut contract stable', () => {
    expect(SETTINGS_LINK.path).toBe('/configuracoes');
    expect(SETTINGS_LINK.label).toBe('Configurações');
    expect(SETTINGS_LINK.iconName).toBe('SettingsIcon');
    expect(React.isValidElement(SETTINGS_LINK.icon)).toBe(true);
  });

  it('keeps project status presentation mapped for every status', () => {
    expect(Object.keys(PROJECT_STATUS_COLORS)).toEqual(projectStatuses);

    projectStatuses.forEach((status) => {
      const presentation = PROJECT_STATUS_COLORS[status];
      expect(presentation.bg).toMatch(/^bg-/);
      expect(presentation.text).toMatch(/^text-/);
      expect(presentation.border).toMatch(/^border-/);
      expect(React.isValidElement(presentation.icon)).toBe(true);
    });
  });

  it('keeps supported social networks complete and with valid placeholders', () => {
    const expectedNetworkIds = ['Instagram', 'Facebook', 'LinkedIn', 'TikTok', 'YouTube', 'Google'];

    expect(SOCIAL_NETWORKS_SUPPORTED.map((network) => network.id)).toEqual(expectedNetworkIds);
    expect(new Set(SOCIAL_NETWORKS_SUPPORTED.map((network) => network.id)).size).toBe(
      SOCIAL_NETWORKS_SUPPORTED.length,
    );

    SOCIAL_NETWORKS_SUPPORTED.forEach((network) => {
      expect(network.name).toBeTruthy();
      expect(network.color).toMatch(/^bg-/);
      expect(network.placeholder).toMatch(/^https:\/\//);
      expect(React.isValidElement(network.icon)).toBe(true);
    });
  });

  it('keeps expense color mapping populated with valid HSL values', () => {
    const requiredCategories = [
      'Software e Assinaturas',
      'Impostos (DAS, INSS)',
      'Outros',
      'Escritório',
      'Alimentação',
      'Pets e Animais',
    ];

    requiredCategories.forEach((category) => {
      expect(EXPENSE_CATEGORY_COLORS[category]).toMatch(/^hsl\(.+\)$/);
    });
  });

  it('keeps receivable source colors complete with valid HSL tokens', () => {
    const expectedSources = [
      'Projeto',
      'Comissão',
      'Consultoria',
      'Reembolso',
      'Rendimento',
      'Outros',
    ];

    expect(Object.keys(RECEIVABLE_SOURCE_COLORS)).toEqual(expectedSources);
    expectedSources.forEach((source) => {
      expect(RECEIVABLE_SOURCE_COLORS[source]).toMatch(/^hsl\(.+\)$/);
    });
  });
});
