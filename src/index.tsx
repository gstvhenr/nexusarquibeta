import React from 'react';
import ReactDOM from 'react-dom/client';
import 'gantt-task-react/dist/index.css';
import './index.css';
import App from './App';
import { HashRouter } from 'react-router-dom';
import ErrorBoundary from './components/layout/ErrorBoundary';
import { DataProvider } from './context/DataContext';
import { ThemeProvider } from './context/ThemeContext';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Could not find root element to mount to');
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <HashRouter>
      <ErrorBoundary>
        <ThemeProvider>
          <DataProvider>
            <App />
          </DataProvider>
        </ThemeProvider>
      </ErrorBoundary>
    </HashRouter>
  </React.StrictMode>,
);
