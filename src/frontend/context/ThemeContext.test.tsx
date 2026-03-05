import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { uiPreferenceService } from '../services/infrastructure/uiPreferenceService';
import { ThemeProvider, useTheme } from './ThemeContext';

const ThemeConsumer = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div>
      <span data-testid="theme-value">{theme}</span>
      <button type="button" onClick={toggleTheme}>
        toggle
      </button>
    </div>
  );
};

describe('ThemeContext', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    document.documentElement.className = '';

    vi.spyOn(uiPreferenceService, 'getItem').mockImplementation(async (_key, initialValue) => {
      return initialValue;
    });
    vi.spyOn(uiPreferenceService, 'setItem').mockResolvedValue();
  });

  it('throws when useTheme is used outside provider', () => {
    expect(() => render(<ThemeConsumer />)).toThrow('useTheme must be used within a ThemeProvider');
  });

  it('applies hydrated theme class to document root and exposes current theme', async () => {
    vi.spyOn(uiPreferenceService, 'getItem').mockImplementation(async (key, initialValue) => {
      if (key === 'theme') return 'light';
      return initialValue;
    });

    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('theme-value')).toHaveTextContent('light');
    });
    expect(document.documentElement.classList.contains('light')).toBe(true);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('injects theme css variables and animations through ThemeStyle', () => {
    render(
      <ThemeProvider>
        <div>content</div>
      </ThemeProvider>,
    );

    const styleTag = document.querySelector('style');
    expect(styleTag?.textContent).toContain('--color-background');
    expect(styleTag?.textContent).toContain('@keyframes fade-in-up');
  });

  it('toggles theme and persists the new value', async () => {
    const setItemSpy = vi.spyOn(uiPreferenceService, 'setItem').mockResolvedValue();

    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('theme-value')).toHaveTextContent('dark');
    });

    fireEvent.click(screen.getByRole('button', { name: 'toggle' }));

    await waitFor(() => {
      expect(screen.getByTestId('theme-value')).toHaveTextContent('light');
    });
    expect(setItemSpy).toHaveBeenLastCalledWith('theme', 'light');
  });
});
