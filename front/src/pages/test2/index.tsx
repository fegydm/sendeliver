// File: src/pages/test2/index.tsx
import React from 'react';
import MapLibreMap from './MapLibreMap';
import './index.css';

// Test2Page component renders a MapLibre map
export default function Test2Page() {
  return (
    <div style={{ width: '500px', height: '400px' }}>
      <MapLibreMap center={[0, 0]} zoom={2} />
    </div>
  );
}