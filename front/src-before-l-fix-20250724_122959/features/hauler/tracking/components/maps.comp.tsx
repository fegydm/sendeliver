// File: src/features/hauler/tracking/components/maps.comp.tsx
// Posledná akcia: Zmena zobrazenia pre neprihlásených používateľov na informačnú lištu namiesto error stránky.

import React, { useState, useMemo, useEffect } from "react";
import { io, Socket } from "socket.io-client";
import { Vehicle, mockVehicles } from "@/data/mockFleet";
import { filterVehicles } from "./utils/map-utils";
import { FilterCategory } from "./utils/map-constants";
import mapview from "./mapview";
import filterpanel from "./filterpanel";
import controlpanel from "./controlpanel";
import { useAuth } from '@shared/contexts/auth.context';

import "@/components/hauler/content/dashboard.css";
import "./maps.comp.css";

const MapsComponent: React.FC = () => {
  const { isAuthenticated, token } = useAuth();
  const [vehicles, setVehicles] = useState<vehicle[]>([]);
  const [selectedVehicleForPanel, setSelectedVehicleForPanel] = useState<vehicle | null>(null);
  const [filters, setFilters] = useState<filterCategory[]>([]);
  const [selectedMapVehicles, setSelectedMapVehicles] = useState<set<string>>(new Set());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setNotification(null);

      if (!isAuthenticated) {
        setVehicles(mockVehicles);
        setNotification("Zobrazujú sa demo dáta. Pre prístup k vašim reálnym dátam sa prihláste alebo zaregistrujte.");
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch("http://localhost:10000/api/vehicles", {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error("Nepodarilo sa načítať reálne dáta.");
        const data: Vehicle[] = await response.json();
        setVehicles(data);
      } catch (err: any) {
        setNotification(err.message + " Zobrazujú sa demo dáta.");
        setVehicles(mockVehicles);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [isAuthenticated, token]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const socket: Socket = io("http://localhost:10000", { query: { token } });
    socket.on("connect", () => console.log("FE-SD: Pripojený k WebSocket serveru"));
    socket.on("vehicle_moved", (data) => {
      setVehicles(current => current.map(v => 
        v.id === data.vehicleId ? { ...v, gpsLocation: { latitude: data.lat, longitude: data.lon }, speed: data.speed } : v
      ));
    });
    return () => { socket.disconnect(); };
  }, [isAuthenticated, token]);

  const filteredVehicles = useMemo<vehicle[]>(() => 
    filterVehicles(vehicles, filters, new Set()), [vehicles, filters]);
  
  const visibleVehiclesOnMap = useMemo<vehicle[]>(() => 
    filterVehicles(vehicles, filters, selectedMapVehicles), [vehicles, filters, selectedMapVehicles]);

  const isAllSelected = useMemo<boolean>(() =>
    filteredVehicles.length > 0 &&
    filteredVehicles.every(vehicle => selectedMapVehicles.has(vehicle.id)),
    [filteredVehicles, selectedMapVehicles]);

  const handleOpenControlPanel = (vehicle: Vehicle) => setSelectedVehicleForPanel(vehicle);
  const handleCloseControlPanel = () => setSelectedVehicleForPanel(null);

  return (
    <div className="dashboard">
      {notification && (
        <div className="notification-bar">
          <p className="notification-bar__text">
            {notification}
            {/* TODO: Pridať reálne linky na prihlásenie a registráciu */}
            <a href="#" className="notification-bar__link">Prihlásiť sa</a>
          </p>
          <button className="notification-bar__close" onClick={() => setNotification(null)}>✖</button>
        </div>
      )}
      <div className="dashboard__toolbar">
        <h1 className="dashboard__title">Prehľad Flotily na Mape</h1>
      </div>
      
      {isLoading ? (
        <div className="page-loader">Načítavam...</div>
      ) : (
        <div className="dashboard__content">
          <FilterPanel
            vehicles={vehicles}
            filteredVehicles={filteredVehicles}
            selectedVehicles={selectedMapVehicles}
            filters={filters}
            isAllSelected={isAllSelected}
            onSelectAll={() => setSelectedMapVehicles(isAllSelected ? new Set() : new Set(filteredVehicles.map(v => v.id)))}
            onSelectVehicle={(id) => setSelectedMapVehicles(prev => {
              const next = new Set(prev);
              next.has(id) ? next.delete(id) : next.add(id);
              return next;
            })}
            onToggleFilter={(filter) => setFilters(prev => prev.includes(filter) ? prev.filter(f => f !== filter) : [...prev, filter])}
          />
          <MapView
            visibleVehicles={visibleVehiclesOnMap}
            onVehicleSelect={handleOpenControlPanel}
          />
        </div>
      )}

      {selectedVehicleForPanel && (
        <ControlPanel 
          vehicle={selectedVehicleForPanel} 
          onClose={handleCloseControlPanel} 
        />
      )}
    </div>
  );
};
export default MapsComponent;