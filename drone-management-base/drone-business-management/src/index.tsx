import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { initErrorLogging } from './utils/errorLogging';
import ErrorBoundary from './components/ErrorBoundary';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import glassmorphismTheme from './theme/glassmorphismTheme';

// Initialize Sentry with a development DSN (replace with your actual DSN in production)
// For local development, this is a placeholder that won't send actual errors
initErrorLogging('https://examplePublicKey@o0.ingest.sentry.io/0');

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <ThemeProvider theme={glassmorphismTheme}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </ErrorBoundary>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals(); 