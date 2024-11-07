// /front/src/index.tsx
import React from 'react'; // necessary
import ReactDOM from 'react-dom';
import App from './app.front';
import './index.css';

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
