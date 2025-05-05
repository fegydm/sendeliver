// File: ./front/src/components/hauler/content/HaulerLocations.tsx
// Last change: Created locations management component with location list and details view

import React, { useState, useEffect } from "react";
import "./hauler.cards.css"; // Common hauler card styles
// Note: removed import of non-existent locations.cards.css; styling is covered by hauler.cards.css

// Location type definition
type Location = {
  id: string;
  fullAddress: string;
  latitude: number;
  longitude: number;
};

// Mock data: five sample locations
const mockLocations: Location[] = [
  { id: 'loc-1', fullAddress: 'Kamenné námestie 1, 040 01 Košice, Slovensko', latitude: 48.716385, longitude: 21.261074 },
  { id: 'loc-2', fullAddress: 'Námestie SNP 10, 811 01 Bratislava, Slovensko', latitude: 48.148598, longitude: 17.107748 },
  { id: 'loc-3', fullAddress: 'Námestie sv. Egídia 5, 949 74 Hlohovec, Slovensko', latitude: 48.409408, longitude: 17.776791 },
  { id: 'loc-4', fullAddress: 'Námestie Slobody 14, 900 01 Modra, Slovensko', latitude: 48.329682, longitude: 17.227588 },
  { id: 'loc-5', fullAddress: 'Hlavná 68, 058 01 Poprad, Slovensko', latitude: 49.059037, longitude: 20.297572 }
];

const HaulerLocations: React.FC = () => {
  // State: list of locations and selected location
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load mock data on mount
  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      setLocations(mockLocations);
      setSelectedLocation(mockLocations[0]);
      setIsLoading(false);
    }, 300);
  }, []);

  // Handle selecting a location
  const handleSelectLocation = (loc: Location) => {
    setSelectedLocation(loc);
  };

  // Handle input changes for selected location
  const handleInputChange = (field: keyof Location, value: string) => {
    if (!selectedLocation) return;
    const updated = { ...selectedLocation };
    if (field === 'latitude' || field === 'longitude') {
      // convert to number for coordinates
      (updated[field] as number) = parseFloat(value) || 0;
    } else {
      (updated[field] as string) = value;
    }
    setSelectedLocation(updated);
    setLocations(locations.map(loc => loc.id === updated.id ? updated : loc));
  };

  return (
    <div className="locations-container">
      {/* Sidebar with list of locations */}
      <div className="locations-sidebar">
        {isLoading ? (
          <div className="loading-message">Načítavam lokality...</div>
        ) : (
          locations.map(loc => (
            <div
              key={loc.id}
              className={`location-item ${selectedLocation?.id === loc.id ? 'selected' : ''}`}
              onClick={() => handleSelectLocation(loc)}
            >
              {loc.fullAddress}
            </div>
          ))
        )}
      </div>

      {/* Detail form for selected location */}
      <div className="location-details">
        {selectedLocation ? (
          <div className="details-card">
            <h3>Detail lokality</h3>
            <div className="form-group">
              <label>Adresa</label>
              <input
                type="text"
                value={selectedLocation.fullAddress}
                onChange={(e) => handleInputChange('fullAddress', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Zemepisná šírka (latitude)</label>
              <input
                type="number"
                step="0.000001"
                value={selectedLocation.latitude}
                onChange={(e) => handleInputChange('latitude', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Zemepisná dĺžka (longitude)</label>
              <input
                type="number"
                step="0.000001"
                value={selectedLocation.longitude}
                onChange={(e) => handleInputChange('longitude', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Mapa (neinteraktívna)</label>
              <div className="map-placeholder">
                {/* Placeholder for map image or static map */}
                <img src="/maps/placeholder-map.png" alt="Static map placeholder" />
              </div>
            </div>
          </div>
        ) : (
          <div className="no-selection-message">Vyber lokáciu zo zoznamu</div>
        )}
      </div>
    </div>
  );
};

export default HaulerLocations;
