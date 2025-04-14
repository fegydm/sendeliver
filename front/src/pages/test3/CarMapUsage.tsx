// File: src/components/examples/CarMapUsage.tsx
// Last change: Added layer switching support for CarMap

import React, { useState, useEffect } from 'react';
import CarMap from './CarMap';
import './CarMapUsage.css';

import lorryImage from '@/assets/lorry.webp';
import truckImage from '@/assets/truck.webp';
import vanImage from '@/assets/van.webp';

type Vehicle = {
  id: string;
  lat: number;
  lng: number;
  image: string;
  location: string;
};

const CarMapUsage: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([
    { id: 'lorry1', lat: 50.0755, lng: 14.4378, image: lorryImage, location: 'Prague' },
    { id: 'truck1', lat: 51.5136, lng: 7.4653, image: truckImage, location: 'Dortmund' },
    { id: 'van1', lat: 48.5734, lng: 7.7521, image: vanImage, location: 'Strasbourg' },
  ]);
  const [layer, setLayer] = useState<'simple' | 'osm' | 'satellite'>('osm'); // Default OSM layer

  useEffect(() => {
    console.log('[CarMapUsage] Vehicles:', vehicles.length);
    vehicles.forEach(v => {
      console.log(`[CarMapUsage] Vehicle ${v.id}: lat=${v.lat}, lng=${v.lng}, image=${v.image}`);
    });
    console.log('[CarMapUsage] Current layer:', layer); // Log active layer
  }, [vehicles, layer]);

  const addVehicle = () => {
    const randomLat = 48 + Math.random() * 4 - 2;
    const randomLng = 10 + Math.random() * 6 - 3;
    const randomVehicleType = Math.floor(Math.random() * 3);
    const vehicleImages = [lorryImage, truckImage, vanImage];
    const vehicleTypes = ['lorry', 'truck', 'van'];
    const locations = ['Random Prague', 'Random Dortmund', 'Random Strasbourg'];

    const newVehicle: Vehicle = {
      id: `${vehicleTypes[randomVehicleType]}-${Date.now()}`,
      lat: randomLat,
      lng: randomLng,
      image: vehicleImages[randomVehicleType],
      location: locations[randomVehicleType],
    };

    console.log('[CarMapUsage] Add:', newVehicle);
    setVehicles(prev => [...prev, newVehicle]);
  };

  const clearVehicles = () => {
    console.log('[CarMapUsage] Clear');
    setVehicles([]);
  };

  const handleLayerChange = (newLayer: 'simple' | 'osm' | 'satellite') => {
    console.log('[CarMapUsage] Switching layer to:', newLayer);
    setLayer(newLayer);
  };

  console.log('[CarMapUsage] Render, vehicles:', vehicles.length, 'layer:', layer);
  return (
    <div className="car-map-usage">
      <h2>Mapa vozidiel</h2>
      <div className="car-map-controls">
        <button onClick={addVehicle}>Pridať</button>
        <button onClick={clearVehicles}>Vyčistiť</button>
        <div>Počet: {vehicles.length}</div>
        <div className="layer-controls">
          <button
            onClick={() => handleLayerChange('simple')}
            disabled={layer === 'simple'} // Disabled until implemented
            style={{ opacity: layer === 'simple' ? 1 : 0.5 }}
          >
            Jednoduchá
          </button>
          <button
            onClick={() => handleLayerChange('osm')}
            disabled={layer === 'osm'}
            style={{ opacity: layer === 'osm' ? 1 : 0.5 }}
          >
            OSM
          </button>
          <button
            onClick={() => handleLayerChange('satellite')}
            disabled={layer === 'satellite'} // Disabled until implemented
            style={{ opacity: layer === 'satellite' ? 1 : 0.5 }}
          >
            Satelitná
          </button>
        </div>
      </div>
      <div className="car-map-wrapper">
        <CarMap
          vehicles={vehicles}
          width={1000}
          height={600}
          initialZoom={5}
          initialCenter={[50.0, 11.0]}
          layer={layer} // Pass layer prop to CarMap
        />
      </div>
    </div>
  );
};

export default CarMapUsage;