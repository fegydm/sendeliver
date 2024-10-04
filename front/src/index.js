import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'; // Importovanie App komponenty
import './index.css'; // Importovanie CSS štýlov

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
