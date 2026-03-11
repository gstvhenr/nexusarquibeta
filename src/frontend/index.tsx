import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { HashRouter } from 'react-router-dom';
import { ErrorBoundary } from './components/layout';
import { DataProvider } from './context/DataContext';
import { ThemeProvider } from './context/ThemeContext';
import { FinancialSecurityProvider } from './context/FinancialSecurityContext';
import { initializeDataStore } from './services/infrastructure/loadData';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Could not find root element to mount to');
}

const root = ReactDOM.createRoot(rootElement);

void initializeDataStore().finally(() => {
  root.render(
    <React.StrictMode>
      <HashRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
        <ErrorBoundary>
          <ThemeProvider>
            <DataProvider>
              <FinancialSecurityProvider>
                <App />
              </FinancialSecurityProvider>
            </DataProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </HashRouter>
    </React.StrictMode>,
  );
});
