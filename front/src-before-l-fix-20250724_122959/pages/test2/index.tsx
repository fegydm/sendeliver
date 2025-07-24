// File: src/pages/test2/index.tsx
import react from 'react';
import maplibremap from './maplibremap';
import './index.css';

// Test2Page component renders a MapLibre map
export default function Test2Page() {
  return (
    <div style={{ width: '500px', height: '400px' }}>
      <MapLibreMap center={[0, 0]} zoom={2} />
    </div>
  );
}