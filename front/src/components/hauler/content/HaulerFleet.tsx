// File: ./front/src/components/hauler/content/HaulerFleet.tsx
// Last change: Updated implementation to match dark theme design with responsive layout

import React, { useState } from "react";
import "./fleet.cards.css";

interface Vehicle {
  id: string;
  name: string;
  type: string;
  status: string;
  image: string;
  brand?: string;
  notes?: string;
}

interface Trip {
  id: string;
  date: string;
  driver: string;
  destination: string;
  status: string;
}

interface Service {
  id: string;
  date: string;
  type: string;
  status: string;
}

const HaulerFleet: React.FC = () => {
  // Sample data - would come from API in real app
  const [vehicles, setVehicles] = useState<Vehicle[]>([
    { id: "1", name: "Dodávka plachta titrol", type: "Dodávka", status: "Pripravená", image: "/images/vehicles/van1.jpg", brand: "Mercedes" },
    { id: "2", name: "Dodávka skriňa biela", type: "Dodávka", status: "Na trase", image: "/images/vehicles/van2.jpg", brand: "Peugeot" },
    { id: "3", name: "Ťahač biely", type: "Ťahač", status: "Servis", image: "/images/vehicles/truck1.jpg", brand: "Volvo" },
    { id: "4", name: "Sklápač modrý", type: "Sklápač", status: "Pripravená", image: "/images/vehicles/dumper1.jpg", brand: "MAN" },
    { id: "5", name: "Dodávka korba", type: "Dodávka", status: "Parkovisko", image: "/images/vehicles/van3.jpg", brand: "Fiat" },
    { id: "6", name: "Auto plachta", type: "Nákladné", status: "Na trase", image: "/images/vehicles/truck2.jpg", brand: "Scania" }
  ]);

  const [trips, setTrips] = useState<Trip[]>([
    { id: "1", date: "21-04-2023", driver: "Karol Veľký", destination: "Praha", status: "Ukončená" },
    { id: "2", date: "15-04-2023", driver: "Ján Novák", destination: "Praha", status: "Ukončená" },
    { id: "3", date: "10-04-2023", driver: "Peter Malý", destination: "Viedeň", status: "Ukončená" },
    { id: "4", date: "01-04-2023", driver: "Tomáš Horký", destination: "Budapešť", status: "Ukončená" },
  ]);

  const [services, setServices] = useState<Service[]>([
    { id: "1", date: "25-03-2023", type: "Pravidelný servis", status: "Hotový" },
    { id: "2", date: "10-01-2023", type: "Technická kontrola", status: "Hotový" },
  ]);

  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("Všetky");
  const [expanded, setExpanded] = useState(true);

  // Vrátenie bane ku filter options
  const filterOptions = ["Všetky", "Pripravená", "Na trase", "Servis", "Parkovisko"];

  const filteredVehicles = vehicles.filter(v => {
    const matchesSearch = v.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "Všetky" || v.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Vehicle selection handler
  const handleSelectVehicle = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
  };

  return (
    <div className="fleet-container">
      <div className="fleet-sidebar">
        <div className="fleet-search-container">
          <input 
            type="text" 
            placeholder="Vyhľadávanie..." 
            className="fleet-search" 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <button className="search-button">🔍</button>
        </div>
        
        <div className="filter-controls">
          <select 
            className="filter-select" 
            value={statusFilter} 
            onChange={e => setStatusFilter(e.target.value)}
          >
            {filterOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
        
        <div className="vehicle-list">
          {filteredVehicles.map(vehicle => (
            <div 
              key={vehicle.id} 
              className={`vehicle-item ${selectedVehicle?.id === vehicle.id ? 'selected' : ''}`}
              onClick={() => handleSelectVehicle(vehicle)}
            >
              <img src={vehicle.image} alt={vehicle.name} className="vehicle-thumbnail" />
              <div className="vehicle-info">
                <div className="vehicle-name">{vehicle.name}</div>
                <div className="vehicle-type">{vehicle.type} • 
                  <span 
                    className={`status-chip ${
                      vehicle.status === "Pripravená" ? "ready" : 
                      vehicle.status === "Na trase" ? "route" : 
                      vehicle.status === "Servis" ? "service" : ""
                    }`}
                  >
                    {vehicle.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="fleet-details">
        {selectedVehicle ? (
          <>
            <div className="vehicle-image-container">
              <img src={selectedVehicle.image} alt={selectedVehicle.name} className="vehicle-image" />
            </div>
            
            <div className="vehicle-details-grid">
              <div className="details-section">
                <div className="details-row">
                  <div className="details-label">Typ</div>
                  <div className="details-value">
                    <select className="details-input">
                      <option value="Dodávka" selected={selectedVehicle.type === "Dodávka"}>Dodávka</option>
                      <option value="Ťahač" selected={selectedVehicle.type === "Ťahač"}>Ťahač</option>
                      <option value="Sklápač" selected={selectedVehicle.type === "Sklápač"}>Sklápač</option>
                      <option value="Nákladné" selected={selectedVehicle.type === "Nákladné"}>Nákladné</option>
                    </select>
                  </div>
                </div>
                
                <div className="details-row">
                  <div className="details-label">Značka</div>
                  <div className="details-value">
                    <input type="text" defaultValue={selectedVehicle.brand || ""} className="details-input" />
                  </div>
                </div>
                
                <div className="details-row">
                  <div className="details-label">Názov</div>
                  <div className="details-value">
                    <input type="text" defaultValue={selectedVehicle.name} className="details-input" />
                  </div>
                </div>
                
                <div className="details-row">
                  <div className="details-label">Poznámky</div>
                  <div className="details-value">
                    <textarea className="details-textarea" defaultValue={selectedVehicle.notes || ""}></textarea>
                  </div>
                </div>
              </div>
              
              <div className="trips-section">
                <h3>
                  Jazdy
                  <button className="expand-button">+</button>
                </h3>
                <div className="trips-list">
                  <div className="trip-row header">
                    <div className="trip-date">Dátum</div>
                    <div className="trip-driver">Vodič</div>
                    <div className="trip-destination">Cieľ</div>
                    <div className="trip-status">Stav</div>
                  </div>
                  
                  {trips.map(trip => (
                    <div className="trip-row" key={trip.id}>
                      <div className="trip-date">{trip.date}</div>
                      <div className="trip-driver">{trip.driver}</div>
                      <div className="trip-destination">{trip.destination}</div>
                      <div className="trip-status">{trip.status}</div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="service-section">
                <h3>
                  Servisy
                  <button className="expand-button">+</button>
                </h3>
                <div className="service-list">
                  <div className="service-row header">
                    <div className="service-date">Dátum</div>
                    <div className="service-type">Typ</div>
                    <div className="service-status">Stav</div>
                  </div>
                  
                  {services.map(service => (
                    <div className="service-row" key={service.id}>
                      <div className="service-date">{service.date}</div>
                      <div className="service-type">{service.type}</div>
                      <div className="service-status">{service.status}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="no-selection-message">Vyberte vozidlo zo zoznamu</div>
        )}
      </div>
    </div>
  );
};

export default HaulerFleet;