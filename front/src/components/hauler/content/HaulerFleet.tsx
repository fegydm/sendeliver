// File: ./front/src/components/hauler/content/HaulerFleet.tsx
// Last change: Updated to use fixed image position with scrollable details

import React, { useState, useEffect } from "react";
import { Vehicle, Trip, Service, mockVehicles, mockTrips, mockServices, getTripsForVehicle, getServicesForVehicle } from "../../../data/mockFleet";
import "./hauler.cards.css"; // Common hauler card styles
import "./fleet.cards.css"; // Fleet specific styles

const HaulerFleet: React.FC = () => {
  // State management
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [vehicleTrips, setVehicleTrips] = useState<Trip[]>([]);
  const [vehicleServices, setVehicleServices] = useState<Service[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("Všetky");
  const [statusFilter, setStatusFilter] = useState("Všetky");
  const [isTableView, setIsTableView] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Načítanie mock dát pri prvom renderovaní
  useEffect(() => {
    // Simulácia načítania dát z API
    const loadData = () => {
      setIsLoading(true);
      setTimeout(() => {
        setVehicles(mockVehicles);
        if (mockVehicles.length > 0) {
          const firstVehicle = mockVehicles[0];
          setSelectedVehicle(firstVehicle);
          setVehicleTrips(getTripsForVehicle(firstVehicle.id));
          setVehicleServices(getServicesForVehicle(firstVehicle.id));
        }
        setIsLoading(false);
      }, 500);
    };

    // Vytvorenie placeholder obrázku pre prípad chýbajúcich fotiek
    const createPlaceholder = () => {
      const placeholder = new Image();
      placeholder.src = "/vehicles/placeholder.jpg";
    };

    createPlaceholder();
    loadData();
  }, []);

  // Dostupné typy vozidiel pre filter
  const vehicleTypes = ["Všetky", ...Array.from(new Set(vehicles.map(v => v.type)))];
  
  // Dostupné stavy pre filter
  const vehicleStatuses = ["Všetky", "Pripravená", "Na trase", "Servis", "Parkovisko"];

  // Filtrovanie vozidiel
  const filteredVehicles = vehicles.filter(v => {
    const matchesSearch = v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         v.plateNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "Všetky" || v.type === typeFilter;
    const matchesStatus = statusFilter === "Všetky" || v.status === statusFilter;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  // Výber vozidla a načítanie súvisiacich údajov
  const handleSelectVehicle = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setVehicleTrips(getTripsForVehicle(vehicle.id));
    setVehicleServices(getServicesForVehicle(vehicle.id));
  };

  // Reset filtrov
  const handleResetFilters = () => {
    setSearchTerm("");
    setTypeFilter("Všetky");
    setStatusFilter("Všetky");
  };

  // Zmena pohľadu (detail/tabuľka)
  const toggleViewMode = () => {
    setIsTableView(!isTableView);
  };

  // Formátovanie pre stavový indikátor
  const getStatusClass = (status: string) => {
    switch(status) {
      case "Pripravená": return "ready";
      case "Na trase": return "route";
      case "Servis": return "service";
      case "Parkovisko": return "parking";
      default: return "";
    }
  };

  // Aktualizácia vozidla
  const handleInputChange = (field: keyof Vehicle, value: string | number) => {
    if (selectedVehicle) {
      const updatedVehicle = { ...selectedVehicle, [field]: value };
      setSelectedVehicle(updatedVehicle);
      
      // Aktualizácia v zozname vozidiel
      setVehicles(vehicles.map(v => 
        v.id === updatedVehicle.id ? updatedVehicle : v
      ));
    }
  };

  // Pridanie nového vozidla
  const handleAddVehicle = () => {
    const newId = `new-${Date.now()}`;
    const newVehicle: Vehicle = {
      id: newId,
      name: "Nové vozidlo",
      type: "Dodávka",
      status: "Pripravená",
      image: "/vehicles/placeholder.jpg",
      brand: "",
      plateNumber: "",
      manufactureYear: new Date().getFullYear(),
      capacity: "",
      notes: "",
      // Pridané chýbajúce povinné vlastnosti
      odometerKm: 0,
      capacityFree: "",
      availability: "available"
    };
    
    setVehicles([newVehicle, ...vehicles]);
    setSelectedVehicle(newVehicle);
    setVehicleTrips([]);
    setVehicleServices([]);
  };

  // Odstránenie vozidla
  const handleDeleteVehicle = () => {
    if (!selectedVehicle) return;
    
    if (window.confirm(`Naozaj chcete odstrániť vozidlo "${selectedVehicle.name}"?`)) {
      const updatedVehicles = vehicles.filter(v => v.id !== selectedVehicle.id);
      setVehicles(updatedVehicles);
      
      if (updatedVehicles.length > 0) {
        handleSelectVehicle(updatedVehicles[0]);
      } else {
        setSelectedVehicle(null);
        setVehicleTrips([]);
        setVehicleServices([]);
      }
    }
  };

  return (
    <div className="fleet-container">
      {/* Horný toolbar */}
      <div className="fleet-toolbar">
        <div className="fleet-toolbar-left">
          <span className="fleet-count">{filteredVehicles.length} vozidiel</span>
          
          <button onClick={handleResetFilters} className="fleet-toolbar-button" title="Resetovať filtre">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M6 12h12M10 18h4"></path>
            </svg>
          </button>
          
          <div className="fleet-toolbar-separator"></div>
          
          <button onClick={toggleViewMode} className="fleet-toolbar-button" title={isTableView ? "Detailný pohľad" : "Tabuľkový pohľad"}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d={isTableView 
                ? "M21 3H3v18h18V3zm-10 4h4v2h-4V7zm0 4h4v2h-4v-2zm0 4h4v2h-4v-2zm-6-8h4v2H5V7zm0 4h4v2H5v-2zm0 4h4v2H5v-2z" 
                : "M4 6h16M4 12h16M4 18h16"}></path>
            </svg>
          </button>
          
          <span className="fleet-toolbar-button">Expand</span>
        </div>
        
        <div className="fleet-toolbar-right">
          <button onClick={handleDeleteVehicle} className="fleet-toolbar-button" title="Odstrániť vozidlo" disabled={!selectedVehicle}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6"></path>
            </svg>
          </button>
          
          <button onClick={handleAddVehicle} className="fleet-toolbar-button" title="Pridať vozidlo">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14"></path>
            </svg>
          </button>
          
          <button className="fleet-toolbar-button" title="Vyhľadávanie">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="M21 21l-4.35-4.35"></path>
            </svg>
          </button>
        </div>
      </div>

      {/* Hlavný obsah */}
      <div className="fleet-content">
        {/* Bočný panel so zoznamom vozidiel */}
        <div className="fleet-sidebar">
          <div className="fleet-search-container">
            <input 
              type="text" 
              className="fleet-search" 
              placeholder="Vyhľadať vozidlo..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="filter-controls">
            <select 
              className="filter-select" 
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              {vehicleTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            
            <select 
              className="filter-select" 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              {vehicleStatuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
          
          <div className="vehicle-list">
            {isLoading ? (
              <div className="loading-message">Načítavam vozidlá...</div>
            ) : filteredVehicles.length === 0 ? (
              <div className="empty-message">Nenašli sa žiadne vozidlá</div>
            ) : (
              filteredVehicles.map(vehicle => (
                <div 
                  key={vehicle.id} 
                  className={`vehicle-item ${selectedVehicle?.id === vehicle.id ? 'selected' : ''}`}
                  onClick={() => handleSelectVehicle(vehicle)}
                >
                  <div className="vehicle-thumbnail-container">
                    <img 
                      src={vehicle.image} 
                      alt={vehicle.name} 
                      className="vehicle-thumbnail" 
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/vehicles/placeholder.jpg";
                        target.classList.add("fallback-image");
                      }}
                      loading="lazy"
                    />
                  </div>
                  <div className="vehicle-info">
                    <div className="vehicle-name">{vehicle.name}</div>
                    <div className="vehicle-meta">
                      <span>{vehicle.type}</span>
                      <span>•</span>
                      <span className={`status-chip ${getStatusClass(vehicle.status)}`}>
                        {vehicle.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        
        {/* Detail vozidla alebo tabuľkový pohľad */}
        {isTableView ? (
          <div className="fleet-table-view">
            {/* Implementácia tabuľkového pohľadu (budúca funkcionalita) */}
            <div className="empty-message">Tabuľkový pohľad - bude implementovaný</div>
          </div>
        ) : (
          <div className="fleet-details">
            {selectedVehicle ? (
              <>
                <div className="vehicle-image-container">
                  <div className="vehicle-image-wrapper">
                    <img 
                      src={selectedVehicle.image} 
                      alt={selectedVehicle.name} 
                      className="vehicle-image" 
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/vehicles/placeholder.jpg";
                        target.classList.add("fallback-image");
                      }}
                      loading="lazy"
                    />
                  </div>
                </div>
                
                <div className="vehicle-details-scroll-container">
                  <div className="vehicle-details-grid">
                    {/* Základné informácie */}
                    <div className="details-panel card-item">
                      <div className="details-row">
                        <div className="details-label">Typ</div>
                        <div className="details-value">
                          <select 
                            className="details-select"
                            value={selectedVehicle.type}
                            onChange={(e) => handleInputChange('type', e.target.value)}
                          >
                            <option value="Dodávka">Dodávka</option>
                            <option value="Ťahač">Ťahač</option>
                            <option value="Sklápač">Sklápač</option>
                            <option value="Nákladné">Nákladné</option>
                          </select>
                        </div>
                      </div>
                      
                      <div className="details-row">
                        <div className="details-label">Značka</div>
                        <div className="details-value">
                          <input 
                            type="text" 
                            className="details-input"
                            value={selectedVehicle.brand}
                            onChange={(e) => handleInputChange('brand', e.target.value)}
                          />
                        </div>
                      </div>
                      
                      <div className="details-row">
                        <div className="details-label">Názov</div>
                        <div className="details-value">
                          <input 
                            type="text" 
                            className="details-input"
                            value={selectedVehicle.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                          />
                        </div>
                      </div>
                      
                      <div className="details-row">
                        <div className="details-label">EČV</div>
                        <div className="details-value">
                          <input 
                            type="text" 
                            className="details-input"
                            value={selectedVehicle.plateNumber}
                            onChange={(e) => handleInputChange('plateNumber', e.target.value)}
                          />
                        </div>
                      </div>
                      
                      <div className="details-row">
                        <div className="details-label">Kapacita</div>
                        <div className="details-value">
                          <input 
                            type="text" 
                            className="details-input"
                            value={selectedVehicle.capacity}
                            onChange={(e) => handleInputChange('capacity', e.target.value)}
                          />
                        </div>
                      </div>
                      
                      <div className="details-row">
                        <div className="details-label">Rok výroby</div>
                        <div className="details-value">
                          <input 
                            type="number" 
                            className="details-input"
                            value={selectedVehicle.manufactureYear}
                            onChange={(e) => handleInputChange('manufactureYear', parseInt(e.target.value))}
                          />
                        </div>
                      </div>
                      
                      <div className="details-row">
                        <div className="details-label">Status</div>
                        <div className="details-value">
                          <select 
                            className="details-select"
                            value={selectedVehicle.status}
                            onChange={(e) => handleInputChange('status', e.target.value)}
                          >
                            <option value="Pripravená">Pripravená</option>
                            <option value="Na trase">Na trase</option>
                            <option value="Servis">Servis</option>
                            <option value="Parkovisko">Parkovisko</option>
                          </select>
                        </div>
                      </div>
                      
                      <div className="details-row">
                        <div className="details-label">Poznámky</div>
                        <div className="details-value">
                          <textarea 
                            className="details-textarea"
                            value={selectedVehicle.notes || ""}
                            onChange={(e) => handleInputChange('notes', e.target.value)}
                          ></textarea>
                        </div>
                      </div>
                    </div>
                    
                    {/* Jazdy */}
                    <div className="section-panel card-item">
                      <div className="section-header">
                        <h3 className="section-title">Jazdy</h3>
                        <div className="section-controls">
                          <button className="section-button" title="Pridať jazdu">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M12 5v14M5 12h14"></path>
                            </svg>
                          </button>
                        </div>
                      </div>
                      
                      <div className="trips-list">
                        <div className="table-header">
                          <div>Dátum</div>
                          <div>Vodič</div>
                          <div>Destinácia</div>
                          <div>Stav</div>
                        </div>
                        
                        {vehicleTrips.length === 0 ? (
                          <div className="empty-message">Nenašli sa žiadne jazdy</div>
                        ) : (
                          vehicleTrips.map(trip => (
                            <div key={trip.id} className="table-row">
                              <div>{trip.date}</div>
                              <div>{trip.driver}</div>
                              <div>{trip.destination}</div>
                              <div>{trip.status}</div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                    
                    {/* Servisy */}
                    <div className="section-panel card-item">
                      <div className="section-header">
                        <h3 className="section-title">Servisy</h3>
                        <div className="section-controls">
                          <button className="section-button" title="Pridať servis">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M12 5v14M5 12h14"></path>
                            </svg>
                          </button>
                        </div>
                      </div>
                      
                      <div className="service-list">
                        <div className="table-header">
                          <div>Dátum</div>
                          <div>Typ</div>
                          <div>Stav</div>
                        </div>
                        
                        {vehicleServices.length === 0 ? (
                          <div className="empty-message">Nenašli sa žiadne servisné záznamy</div>
                        ) : (
                          vehicleServices.map(service => (
                            <div key={service.id} className="table-row">
                              <div>{service.date}</div>
                              <div>{service.type}</div>
                              <div>{service.status}</div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="no-selection-message">Vyberte vozidlo zo zoznamu</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default HaulerFleet;