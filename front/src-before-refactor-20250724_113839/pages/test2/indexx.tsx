// File: src/index.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import MapLibreMap from './MapLibreMap';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    {/* World map using MapLibre GL */}
    <div style={{ width: '500px', height: '400px' }}>
      <MapLibreMap center={[0, 0]} zoom={2} />
    </div>
  </React.StrictMode>
);
