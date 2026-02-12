import React, { createContext, useContext, useEffect, useMemo } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { tokens } from '../theme';

type Theme = 'light' | 'dark';
interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const ThemeStyle = () => {
  const cssVariables = useMemo(() => {
    const lightColors = Object.entries(tokens.colors.light)
      .map(([key, value]) => `--color-${key}: ${value};`)
      .join('\n');

    const darkColors = Object.entries(tokens.colors.dark)
      .map(([key, value]) => `--color-${key}: ${value};`)
      .join('\n');

    const otherTokens = `
            --font-sans: ${tokens.typography.fontFamily.sans};
            --font-serif: ${tokens.typography.fontFamily.serif};
            --shadow-soft: ${tokens.shadows.soft};
            --shadow-lifted: ${tokens.shadows.lifted};
            --shadow-interactive: ${tokens.shadows.interactive};
            --shadow-inner-soft: ${tokens.shadows['inner-soft']};
            --border-radius-xl: ${tokens.borderRadius.xl};
        `;

    return `
            :root {
                ${lightColors}
                ${otherTokens}
            }
            html.dark {
                ${darkColors}
            }
            
            /* Global Animation Keyframes */
            @keyframes fade-in-up {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
            }
            .animate-fade-in-up { animation: fade-in-up 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) both; }
            
            @keyframes fade-out-down {
                from { opacity: 1; transform: translateY(0); }
                to { opacity: 0; transform: translateY(20px); }
            }
            .animate-fade-out-down { animation: fade-out-down 0.3s cubic-bezier(0.55, 0.085, 0.68, 0.53) both; }

            /* Custom Scrollbar */
            ::-webkit-scrollbar { width: 8px; height: 8px; }
            ::-webkit-scrollbar-track { background: hsl(var(--color-background)); }
            ::-webkit-scrollbar-thumb { background-color: hsl(var(--color-border-color)); border-radius: 10px; }
            ::-webkit-scrollbar-thumb:hover { background-color: hsl(var(--color-text-secondary)); }
            
            .no-scrollbar::-webkit-scrollbar { display: none; }
            .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

            /* Custom form focus ring */
            input:focus, select:focus, textarea:focus {
                outline: 2px solid transparent;
                outline-offset: 2px;
                box-shadow: var(--shadow-interactive);
                border-color: hsl(var(--color-primary) / 0.5);
            }
        `;
  }, []);

  return <style>{cssVariables}</style>;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useLocalStorage<Theme>('theme', 'light');

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const value = { theme, toggleTheme };

  return (
    <ThemeContext.Provider value={value}>
      <ThemeStyle />
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
