// File: ./front/src/components/hauler/content/HaulerLogbook.tsx
// Last change: Updated implementation to work with existing data structure

import React, { useState, useEffect } from "react";
import { Vehicle, Trip, mockVehicles } from "../../../data/mockFleet";
import { Person, mockPeople, mockTrips } from "../../../data/mockPeople";
import "./hauler.cards.css";
import "./logbook.css";

// Typy pre knihu jázd
interface Location {
  id: string;
  name: string;
  address: string;
  city: string;
  zipCode?: string;
  country: string;
  type: "pickup" | "delivery" | "depot" | "rest";
}

interface TripStop {
  id: string;
  locationId: string;
  arrivalTime: string;
  departureTime: string | null;
  type: "pickup" | "delivery" | "rest";
  status: "pending" | "completed";
  notes: string;
}

interface LogbookEntry {
  id: string;
  vehicleId: string;
  personId: string;
  startDate: string;
  endDate: string | null;
  status: "active" | "completed" | "planned";
  stops: TripStop[];
  notes: string;
}

// Mock lokality
const mockLocations: Location[] = [
  {
    id: "location1",
    name: "Hlavný sklad Bratislava",
    address: "Skladová 123",
    city: "Bratislava",
    zipCode: "82105",
    country: "Slovensko",
    type: "pickup"
  },
  {
    id: "location2",
    name: "Distribučné centrum Trnava",
    address: "Priemyselná 45",
    city: "Trnava",
    zipCode: "91701",
    country: "Slovensko",
    type: "delivery"
  },
  {
    id: "location3",
    name: "Obchodné centrum Košice",
    address: "Obchodná 78",
    city: "Košice",
    zipCode: "04001",
    country: "Slovensko",
    type: "delivery"
  },
  {
    id: "location4",
    name: "Výrobný závod Žilina",
    address: "Továrenská 15",
    city: "Žilina",
    zipCode: "01001",
    country: "Slovensko",
    type: "pickup"
  },
  {
    id: "location5",
    name: "Centrálny sklad Wien",
    address: "Lagerstraße 56",
    city: "Wien",
    zipCode: "1020",
    country: "Rakúsko",
    type: "delivery"
  },
  {
    id: "location6",
    name: "Showroom Praha",
    address: "Showroomová 89",
    city: "Praha",
    zipCode: "12000",
    country: "Česká republika",
    type: "delivery"
  }
];

// Mock dáta pre knihu jázd vytvorené z existujúcich mockTrips a pridaných zastávok
const createMockLogbookEntries = (): LogbookEntry[] => {
  // Vyberieme len prvých pár jázd pre jednoduchosť
  const selectedTrips = mockTrips.slice(0, 5);
  
  return selectedTrips.map(trip => {
    // Vytvoriť základnú jazdu
    const entry: LogbookEntry = {
      id: `logbook-${trip.id}`,
      vehicleId: `vehicle-${trip.id}`, // Prepojenie na mockVehicles by vyžadovalo ďalšie prispôsobenie
      personId: trip.personId,
      startDate: trip.date,
      endDate: trip.status === "Ukončená" ? trip.date : null,
      status: trip.status === "Ukončená" ? "completed" : "active",
      stops: [],
      notes: `Jazda do ${trip.destination}`
    };
    
    // Vytvoriť zastávky pre jazdu
    const pickupLocationId = `location${(parseInt(trip.id) % 3) + 1}`;
    const deliveryLocationId = `location${((parseInt(trip.id) + 3) % 6) + 1}`;
    
    entry.stops = [
      {
        id: `stop-${trip.id}-1`,
        locationId: pickupLocationId,
        arrivalTime: trip.date,
        departureTime: trip.status === "Ukončená" ? trip.date : null,
        type: "pickup",
        status: trip.status === "Ukončená" ? "completed" : "pending",
        notes: "Nakládka tovaru"
      },
      {
        id: `stop-${trip.id}-2`,
        locationId: deliveryLocationId,
        arrivalTime: trip.date, // V reálnej aplikácii by to bol neskorší čas
        departureTime: trip.status === "Ukončená" ? trip.date : null,
        type: "delivery",
        status: trip.status === "Ukončená" ? "completed" : "pending",
        notes: "Vykládka tovaru"
      }
    ];
    
    // Pre niektoré jazdy pridať aj zastávku na odpočinok
    if (parseInt(trip.id) % 2 === 0) {
      entry.stops.push({
        id: `stop-${trip.id}-3`,
        locationId: "location3",
        arrivalTime: trip.date,
        departureTime: trip.status === "Ukončená" ? trip.date : null,
        type: "rest",
        status: trip.status === "Ukončená" ? "completed" : "pending",
        notes: "Povinná prestávka vodiča"
      });
    }
    
    return entry;
  });
};

const HaulerLogbook: React.FC = () => {
  // State management
  const [entries, setEntries] = useState<LogbookEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<LogbookEntry | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Person[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [isNewEntryModalOpen, setIsNewEntryModalOpen] = useState(false);
  const [isAddStopModalOpen, setIsAddStopModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filtre
  const [searchTerm, setSearchTerm] = useState("");
  const [driverFilter, setDriverFilter] = useState("all");
  const [vehicleFilter, setVehicleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");

  // Načítanie údajov
  useEffect(() => {
    const loadData = () => {
      setIsLoading(true);
      // Simulácia načítania dát z API
      setTimeout(() => {
        const mockLogbookEntries = createMockLogbookEntries();
        setEntries(mockLogbookEntries);
        setVehicles(mockVehicles);
        setDrivers(mockPeople.filter(person => person.position === "Vodič"));
        setLocations(mockLocations);
        
        if (mockLogbookEntries.length > 0) {
          setSelectedEntry(mockLogbookEntries[0]);
        }
        
        setIsLoading(false);
      }, 500);
    };
    
    loadData();
  }, []);

  // Aplikácia filtrov
  const filteredEntries = entries.filter(entry => {
    // Fulltextové vyhľadávanie
    const vehicleName = vehicles.find(v => v.id === entry.vehicleId)?.name || "";
    const driver = drivers.find(d => d.id === entry.personId);
    const driverName = driver ? `${driver.firstName} ${driver.lastName}` : "";
    const stopNames = entry.stops.map(stop => 
      locations.find(l => l.id === stop.locationId)?.name || ""
    ).join(" ");
    
    const searchText = `${vehicleName} ${driverName} ${stopNames}`.toLowerCase();
    const matchesSearch = searchTerm === "" || searchText.includes(searchTerm.toLowerCase());
    
    // Filtrovanie podľa vodiča
    const matchesDriver = driverFilter === "all" || entry.personId === driverFilter;
    
    // Filtrovanie podľa vozidla
    const matchesVehicle = vehicleFilter === "all" || entry.vehicleId === vehicleFilter;
    
    // Filtrovanie podľa stavu
    const matchesStatus = statusFilter === "all" || entry.status === statusFilter;
    
    // Filtrovanie podľa dátumu
    let matchesDate = true;
    if (dateFilter === "today") {
      const today = new Date().toISOString().split("T")[0];
      const entryDate = entry.startDate.split("T")[0] || entry.startDate;
      matchesDate = today === entryDate;
    } else if (dateFilter === "week") {
      const today = new Date();
      const weekAgo = new Date();
      weekAgo.setDate(today.getDate() - 7);
      const entryDate = new Date(entry.startDate);
      matchesDate = entryDate >= weekAgo && entryDate <= today;
    }
    
    return matchesSearch && matchesDriver && matchesVehicle && matchesStatus && matchesDate;
  });

  // Výber záznamu
  const handleSelectEntry = (entry: LogbookEntry) => {
    setSelectedEntry(entry);
  };

  // Formátovanie dátumu/času
  const formatDateTime = (dateTimeString: string | null) => {
    if (!dateTimeString) return "—";
    
    // Kontrola či je v ISO formáte
    let date;
    if (dateTimeString.includes("T")) {
      date = new Date(dateTimeString);
    } else {
      // Ak je len dátum bez času, pridáme čas
      date = new Date(`${dateTimeString}T00:00:00`);
    }
    
    return new Intl.DateTimeFormat('sk-SK', { 
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  // Zjednodušené formátovanie dátumu
  const formatDate = (dateTimeString: string | null) => {
    if (!dateTimeString) return "—";
    
    // Kontrola či je v ISO formáte
    let date;
    if (dateTimeString.includes("T")) {
      date = new Date(dateTimeString);
    } else {
      // Ak je len dátum bez času, pridáme čas
      date = new Date(`${dateTimeString}T00:00:00`);
    }
    
    return new Intl.DateTimeFormat('sk-SK', { 
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };
  
  // Získanie názvu lokality
  const getLocationName = (locationId: string) => {
    return locations.find(l => l.id === locationId)?.name || "Neznáma lokalita";
  };
  
  // Získanie názvu vodiča
  const getDriverName = (personId: string) => {
    const driver = drivers.find(d => d.id === personId);
    return driver ? `${driver.firstName} ${driver.lastName}` : "Neznámy vodič";
  };
  
  // Získanie názvu vozidla
  const getVehicleName = (vehicleId: string) => {
    return vehicles.find(v => v.id === vehicleId)?.name || "Neznáme vozidlo";
  };

  // Pridanie novej jazdy
  const handleAddEntry = () => {
    setIsNewEntryModalOpen(true);
  };
  
  // Vytvorenie novej jazdy
  const createNewEntry = (formData: any) => {
    const newEntry: LogbookEntry = {
      id: `trip${Date.now()}`,
      vehicleId: formData.vehicleId,
      personId: formData.personId,
      startDate: formData.startDate,
      endDate: null,
      status: "planned",
      stops: [
        {
          id: `stop${Date.now()}`,
          locationId: formData.pickupLocationId,
          arrivalTime: formData.pickupTime,
          departureTime: null,
          type: "pickup",
          status: "pending",
          notes: formData.pickupNotes || "",
        },
        {
          id: `stop${Date.now() + 1}`,
          locationId: formData.deliveryLocationId,
          arrivalTime: formData.deliveryTime,
          departureTime: null,
          type: "delivery",
          status: "pending",
          notes: formData.deliveryNotes || "",
        },
      ],
      notes: formData.notes || "",
    };
    
    setEntries([newEntry, ...entries]);
    setSelectedEntry(newEntry);
    setIsNewEntryModalOpen(false);
  };
  
  // Pridanie zastávky k existujúcej jazde
  const handleAddStop = () => {
    if (!selectedEntry) return;
    setIsAddStopModalOpen(true);
  };
  
  // Vytvorenie novej zastávky
  const addStopToEntry = (formData: any) => {
    if (!selectedEntry) return;
    
    const newStop: TripStop = {
      id: `stop${Date.now()}`,
      locationId: formData.locationId,
      arrivalTime: formData.arrivalTime,
      departureTime: null,
      type: formData.type,
      status: "pending",
      notes: formData.notes || "",
    };
    
    const updatedEntry = {
      ...selectedEntry,
      stops: [...selectedEntry.stops, newStop],
    };
    
    setEntries(entries.map(e => e.id === updatedEntry.id ? updatedEntry : e));
    setSelectedEntry(updatedEntry);
    setIsAddStopModalOpen(false);
  };

  // Získanie farby pre status
  const getStatusColor = (status: string) => {
    switch(status) {
      case "active": return "status-chip active";
      case "completed": return "status-chip completed";
      case "planned": return "status-chip planned";
      case "pending": return "status-chip pending";
      default: return "status-chip";
    }
  };
  
  // Formátovanie pre zobrazenie statusu
  const formatStatus = (status: string) => {
    switch(status) {
      case "active": return "Aktívna";
      case "completed": return "Ukončená";
      case "planned": return "Plánovaná";
      case "pending": return "Čaká";
      case "pickup": return "Vyzdvihnutie";
      case "delivery": return "Doručenie";
      case "rest": return "Prestávka";
      default: return status;
    }
  };

  // Resetovanie filtrov
  const handleResetFilters = () => {
    setSearchTerm("");
    setDriverFilter("all");
    setVehicleFilter("all");
    setStatusFilter("all");
    setDateFilter("all");
  };

  return (
    <div className="logbook-container">
      {/* Horný toolbar */}
      <div className="logbook-toolbar">
        <div className="logbook-toolbar-left">
          <span className="logbook-count">{filteredEntries.length} jázd</span>
          
          <button onClick={handleResetFilters} className="logbook-toolbar-button" title="Resetovať filtre">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M6 12h12M10 18h4"></path>
            </svg>
          </button>
          
          <div className="toolbar-separator"></div>
          
          <span className="logbook-toolbar-button">Expand</span>
        </div>
        
        <div className="logbook-toolbar-right">
          <button onClick={handleAddEntry} className="logbook-toolbar-button primary" title="Pridať jazdu">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14"></path>
            </svg>
            <span>Nová jazda</span>
          </button>
        </div>
      </div>

      {/* Hlavný obsah */}
      <div className="logbook-content">
        {/* Bočný panel so zoznamom jázd */}
        <div className="logbook-sidebar">
          <div className="logbook-search-container">
            <input 
              type="text" 
              className="logbook-search" 
              placeholder="Vyhľadať jazdu..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="logbook-quick-filters">
            <select 
              className="filter-select" 
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            >
              <option value="all">Všetky dátumy</option>
              <option value="today">Dnes</option>
              <option value="week">Tento týždeň</option>
            </select>
            
            <select 
              className="filter-select" 
              value={driverFilter}
              onChange={(e) => setDriverFilter(e.target.value)}
            >
              <option value="all">Všetci vodiči</option>
              {drivers.map(driver => (
                <option key={driver.id} value={driver.id}>{driver.firstName} {driver.lastName}</option>
              ))}
            </select>
            
            <select 
              className="filter-select" 
              value={vehicleFilter}
              onChange={(e) => setVehicleFilter(e.target.value)}
            >
              <option value="all">Všetky vozidlá</option>
              {vehicles.map(vehicle => (
                <option key={vehicle.id} value={vehicle.id}>{vehicle.name}</option>
              ))}
            </select>
            
            <select 
              className="filter-select" 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Všetky stavy</option>
              <option value="active">Aktívne</option>
              <option value="completed">Ukončené</option>
              <option value="planned">Plánované</option>
            </select>
          </div>
          
          <div className="logbook-entries-list">
            {isLoading ? (
              <div className="loading-message">Načítavam jazdy...</div>
            ) : filteredEntries.length === 0 ? (
              <div className="empty-message">Nenašli sa žiadne jazdy</div>
            ) : (
              filteredEntries.map(entry => {
                const firstStop = entry.stops[0];
                const lastStop = entry.stops[entry.stops.length - 1];
                return (
                  <div 
                    key={entry.id} 
                    className={`logbook-entry-item ${selectedEntry?.id === entry.id ? 'selected' : ''}`}
                    onClick={() => handleSelectEntry(entry)}
                  >
                    <div className="entry-date">{formatDate(entry.startDate)}</div>
                    <div className="entry-info">
                      <div className="entry-driver">{getDriverName(entry.personId)}</div>
                      <div className="entry-vehicle">{getVehicleName(entry.vehicleId)}</div>
                      <div className="entry-stops">
                        {firstStop && (
                          <span>{getLocationName(firstStop.locationId)}</span>
                        )}
                        {lastStop && firstStop !== lastStop && (
                          <span> → {getLocationName(lastStop.locationId)}</span>
                        )}
                      </div>
                    </div>
                    <div className={`entry-status ${getStatusColor(entry.status)}`}>
                      {formatStatus(entry.status)}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
        
        {/* Detailný pohľad */}
        <div className="logbook-details">
          {selectedEntry ? (
            <div className="entry-details-content">
              <div className="entry-details-header">
                <div className="entry-details-title">
                  <h2>Jazda: {getDriverName(selectedEntry.personId)} - {formatDate(selectedEntry.startDate)}</h2>
                  <span className={`entry-status-large ${getStatusColor(selectedEntry.status)}`}>
                    {formatStatus(selectedEntry.status)}
                  </span>
                </div>
                
                <div className="entry-details-actions">
                  {selectedEntry.status !== "completed" && (
                    <button onClick={handleAddStop} className="entry-action-button add-stop">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 5v14M5 12h14"></path>
                      </svg>
                      Pridať zastávku
                    </button>
                  )}
                  
                  {selectedEntry.status === "active" && (
                    <button className="entry-action-button complete-trip">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M5 12l5 5L20 7"></path>
                      </svg>
                      Ukončiť jazdu
                    </button>
                  )}
                </div>
              </div>
              
              <div className="entry-details-grid">
                <div className="details-panel card-item">
                  <h3>Základné informácie</h3>
                  
                  <div className="details-row">
                    <div className="details-label">Vodič</div>
                    <div className="details-value">{getDriverName(selectedEntry.personId)}</div>
                  </div>
                  
                  <div className="details-row">
                    <div className="details-label">Vozidlo</div>
                    <div className="details-value">{getVehicleName(selectedEntry.vehicleId)}</div>
                  </div>
                  
                  <div className="details-row">
                    <div className="details-label">Začiatok</div>
                    <div className="details-value">{formatDateTime(selectedEntry.startDate)}</div>
                  </div>
                  
                  <div className="details-row">
                    <div className="details-label">Koniec</div>
                    <div className="details-value">{formatDateTime(selectedEntry.endDate)}</div>
                  </div>
                  
                  <div className="details-row">
                    <div className="details-label">Poznámky</div>
                    <div className="details-value">{selectedEntry.notes || "—"}</div>
                  </div>
                </div>
                
                <div className="stops-panel card-item">
                  <h3>Zastávky</h3>
                  
                  <div className="stops-timeline">
                    {selectedEntry.stops.map((stop, index) => (
                      <div key={stop.id} className="timeline-stop">
                        <div className={`timeline-marker ${stop.type}`}></div>
                        
                        <div className="timeline-content">
                          <div className="timeline-header">
                            <span className="stop-location">{getLocationName(stop.locationId)}</span>
                            <span className={`stop-status ${getStatusColor(stop.status)}`}>
                              {formatStatus(stop.status)}
                            </span>
                          </div>
                          
                          <div className="timeline-type">{formatStatus(stop.type)}</div>
                          
                          <div className="timeline-time">
                            <div>
                              <span className="time-label">Príchod:</span>
                              <span className="time-value">{formatDateTime(stop.arrivalTime)}</span>
                            </div>
                            {stop.departureTime && (
                              <div>
                                <span className="time-label">Odchod:</span>
                                <span className="time-value">{formatDateTime(stop.departureTime)}</span>
                              </div>
                            )}
                          </div>
                          
                          {stop.notes && <div className="timeline-notes">{stop.notes}</div>}
                          
                          {stop.status === "pending" && (
                            <div className="timeline-actions">
                              <button className="timeline-action-button">
                                Označiť ako dokončené
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="no-selection-message">Vyberte jazdu zo zoznamu alebo vytvorte novú</div>
          )}
        </div>
      </div>
      
      {/* Modal pre novú jazdu - len ako príklad, v reálnej aplikácii by bol kompletný formulár */}
      {isNewEntryModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Nová jazda</h2>
              <button onClick={() => setIsNewEntryModalOpen(false)} className="modal-close">
                &times;
              </button>
            </div>
            
            <div className="modal-body">
              <form onSubmit={(e) => {
                e.preventDefault();
                // Tu by bol kód na spracovanie formulára
                const formData = {
                  vehicleId: vehicles[0].id,
                  personId: drivers[0].id,
                  startDate: new Date().toISOString(),
                  pickupLocationId: "location1",
                  pickupTime: new Date().toISOString(),
                  deliveryLocationId: "location2",
                  deliveryTime: new Date(Date.now() + 3600000).toISOString(),
                  notes: "Nová jazda",
                };
                createNewEntry(formData);
              }}>
                {/* Formulárové polia by tu boli implementované */}
                <div className="form-footer">
                  <button type="button" onClick={() => setIsNewEntryModalOpen(false)} className="button secondary">
                    Zrušiť
                  </button>
                  <button type="submit" className="button primary">
                    Vytvoriť
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal pre pridanie zastávky - len ako príklad, v reálnej aplikácii by bol kompletný formulár */}
      {isAddStopModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Pridať zastávku</h2>
              <button onClick={() => setIsAddStopModalOpen(false)} className="modal-close">
                &times;
              </button>
            </div>
            
            <div className="modal-body">
              <form onSubmit={(e) => {
                e.preventDefault();
                // Tu by bol kód na spracovanie formulára
                const formData = {
                  locationId: "location3",
                  arrivalTime: new Date(Date.now() + 7200000).toISOString(),
                  type: "delivery",
                  notes: "Nová zastávka",
                };
                addStopToEntry(formData);
              }}>
                {/* Formulárové polia by tu boli implementované */}
                <div className="form-footer">
                  <button type="button" onClick={() => setIsAddStopModalOpen(false)} className="button secondary">
                    Zrušiť
                  </button>
                  <button type="submit" className="button primary">
                    Pridať
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HaulerLogbook;