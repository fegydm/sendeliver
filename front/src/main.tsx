import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Pridáme manifest len v produkcii
if (import.meta.env.PROD) {
  const link = document.createElement('link');
  link.rel = 'manifest';
  link.href = '/manifest.json';
  document.head.appendChild(link);
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);