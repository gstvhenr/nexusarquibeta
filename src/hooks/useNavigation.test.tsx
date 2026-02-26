import { act, renderHook } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { useNavigation } from './useNavigation';

const buildWrapper =
  (initialPath: string) =>
  ({ children }: { children: React.ReactNode }) => (
    <MemoryRouter initialEntries={[initialPath]}>{children}</MemoryRouter>
  );

describe('useNavigation', () => {
  it('opens parent section based on current route and toggles it', () => {
    const { result } = renderHook(() => useNavigation(), {
      wrapper: buildWrapper('/financeiro/visao-geral'),
    });

    expect(result.current.openParent).toBe('Financeiro');

    act(() => {
      result.current.toggleParent('Financeiro');
    });
    expect(result.current.openParent).toBe(null);

    act(() => {
      result.current.toggleParent('Financeiro');
    });
    expect(result.current.openParent).toBe('Financeiro');
  });
});
