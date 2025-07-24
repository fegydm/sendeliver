// File: src/domains/vehicles/components/fleet.comp.tsx
// Účel: Hlavný komponent pre správu vozového parku (pod-karta v "Zdroje").

import React, { useState, useEffect, useCallback } from "react";
import { Vehicle, mockVehicles } from "@/data/mockFleet";
// Predpokladáme, že tieto pod-komponenty sú v rovnakom priečinku alebo v /elements, /sections
// import { FleetToolbar } from "./elements/FleetToolbar"; 
// import FleetSideFilter from "./sections/FleetSideFilter";
// ... atď.

// Nasledujúci kód je zjednodušený pre demonštráciu, použi svoje existujúce pod-komponenty
const FleetComponent: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selected, setSelected] = useState<Vehicle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    // TODO: Nahradiť reálnym API volaním
    setIsLoading(true);
    setTimeout(() => {
      setVehicles(mockVehicles);
      setSelected(mockVehicles[0] ?? null);
      setIsLoading(false);
    }, 500);
  }, []);

  const handleAddVehicle = () => { /* ... logika na pridanie vozidla ... */ };
  const handleDeleteVehicle = () => { /* ... logika na zmazanie vozidla ... */ };
  const handleVehicleChange = (field: keyof Vehicle, value: any) => { /* ... logika na zmenu ... */ };

  const filteredVehicles = searchTerm
    ? vehicles.filter(v => v.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : vehicles;

  if (isLoading) {
    return <div className="fleet__loader">Načítavam vozidlá...</div>;
  }

  return (
    <div className="fleet">
      <div className="fleet__toolbar">
        {/* Tu bude tvoj <FleetToolbar /> */}
        <input 
            type="text" 
            placeholder="Hľadať vozidlo..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button onClick={handleAddVehicle}>+ Pridať vozidlo</button>
      </div>
      <div className="fleet__content">
        <div className="fleet__sidebar">
          {/* Tu bude tvoj <FleetSideFilter /> */}
          {filteredVehicles.map(v => (
            <div key={v.id} onClick={() => setSelected(v)} className={selected?.id === v.id ? 'active' : ''}>
              {v.name}
            </div>
          ))}
        </div>
        <div className="fleet__details">
          {/* Tu budú tvoje <DetailForm />, <BottomSections /> atď. */}
          {selected ? (
            <div>
              <h2>{selected.name}</h2>
              <p>ŠPZ: {selected.plateNumber}</p>
            </div>
          ) : (
            <div>Vyberte vozidlo</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FleetComponent;