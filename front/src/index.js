import React from 'react';
import ReactDOM from 'react-dom';
import App from './routes/App';  // Odkaz na App.js vo /routes
import './index.css'; // Ak máš nejaké globálne štýly

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
