// File: ./front/src/components/hauler/content/HaulerPeople.tsx
// Last change: Created people management component with person list and details view

import React, { useState, useEffect } from "react";
import { Person, Document, Trip, mockPeople, mockDocuments, mockTrips, getTripsForPerson, getDocumentsForPerson } from "../../../data/mockPeople";
import "./hauler.cards.css"; // Common hauler card styles
import "./people.cards.css"; // People specific styles

const HaulerPeople: React.FC = () => {
  // State management
  const [people, setPeople] = useState<Person[]>([]);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [personTrips, setPersonTrips] = useState<Trip[]>([]);
  const [personDocuments, setPersonDocuments] = useState<Document[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [positionFilter, setPositionFilter] = useState("Všetky");
  const [statusFilter, setStatusFilter] = useState("Všetky");
  const [isTableView, setIsTableView] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Načítanie mock dát pri prvom renderovaní
  useEffect(() => {
    // Simulácia načítania dát z API
    const loadData = () => {
      setIsLoading(true);
      setTimeout(() => {
        setPeople(mockPeople);
        if (mockPeople.length > 0) {
          const firstPerson = mockPeople[0];
          setSelectedPerson(firstPerson);
          setPersonTrips(getTripsForPerson(firstPerson.id));
          setPersonDocuments(getDocumentsForPerson(firstPerson.id));
        }
        setIsLoading(false);
      }, 500);
    };

    // Vytvorenie placeholder obrázku pre prípad chýbajúcich fotiek
    const createPlaceholder = () => {
      const placeholder = new Image();
      placeholder.src = "/people/placeholder.jpg";
    };

    createPlaceholder();
    loadData();
  }, []);

  // Dostupné pozície pre filter
  const positions = ["Všetky", ...Array.from(new Set(people.map(p => p.position)))];
  
  // Dostupné stavy pre filter
  const statuses = ["Všetky", ...Array.from(new Set(people.map(p => p.status)))];

  // Filtrovanie ľudí
  const filteredPeople = people.filter(p => {
    const matchesSearch = `${p.firstName} ${p.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         p.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPosition = positionFilter === "Všetky" || p.position === positionFilter;
    const matchesStatus = statusFilter === "Všetky" || p.status === statusFilter;
    
    return matchesSearch && matchesPosition && matchesStatus;
  });

  // Výber osoby a načítanie súvisiacich údajov
  const handleSelectPerson = (person: Person) => {
    setSelectedPerson(person);
    setPersonTrips(getTripsForPerson(person.id));
    setPersonDocuments(getDocumentsForPerson(person.id));
  };

  // Reset filtrov
  const handleResetFilters = () => {
    setSearchTerm("");
    setPositionFilter("Všetky");
    setStatusFilter("Všetky");
  };

  // Zmena pohľadu (detail/tabuľka)
  const toggleViewMode = () => {
    setIsTableView(!isTableView);
  };

  // Formátovanie pre stavový indikátor
  const getStatusClass = (status: string) => {
    switch(status) {
      case "Aktívny": return "active";
      case "Dovolenka": return "vacation";
      case "PN": return "sick";
      case "Neaktívny": return "leave";
      default: return "";
    }
  };

  // Aktualizácia osoby
  const handleInputChange = (field: keyof Person, value: string) => {
    if (selectedPerson) {
      const updatedPerson = { ...selectedPerson, [field]: value };
      setSelectedPerson(updatedPerson);
      
      // Aktualizácia v zozname osôb
      setPeople(people.map(p => 
        p.id === updatedPerson.id ? updatedPerson : p
      ));
    }
  };

  // Pridanie novej osoby
  const handleAddPerson = () => {
    const newId = `new-${Date.now()}`;
    const newPerson: Person = {
      id: newId,
      firstName: "Nový",
      lastName: "Zamestnanec",
      position: "Vodič",
      status: "Aktívny",
      image: "/people/placeholder.jpg",
      email: "novy.zamestnanec@sendeliver.com",
      phone: "",
      birthDate: "",
      address: "",
      city: "",
      zipCode: "",
      country: "Slovensko",
      joinDate: new Date().toISOString().split('T')[0],
      notes: ""
    };
    
    setPeople([newPerson, ...people]);
    setSelectedPerson(newPerson);
    setPersonTrips([]);
    setPersonDocuments([]);
  };

  // Odstránenie osoby
  const handleDeletePerson = () => {
    if (!selectedPerson) return;
    
    if (window.confirm(`Naozaj chcete odstrániť osobu "${selectedPerson.firstName} ${selectedPerson.lastName}"?`)) {
      const updatedPeople = people.filter(p => p.id !== selectedPerson.id);
      setPeople(updatedPeople);
      
      if (updatedPeople.length > 0) {
        handleSelectPerson(updatedPeople[0]);
      } else {
        setSelectedPerson(null);
        setPersonTrips([]);
        setPersonDocuments([]);
      }
    }
  };

  // Kontrola expirácie dokumentu
  const checkDocumentExpiry = (validUntil: string) => {
    const today = new Date();
    const expiryDate = new Date(validUntil);
    const monthsDiff = (expiryDate.getFullYear() - today.getFullYear()) * 12 + 
                       expiryDate.getMonth() - today.getMonth();
    
    if (expiryDate < today) {
      return { status: 'expired', text: 'Dokument expirovaný!' };
    } else if (monthsDiff <= 3) {
      return { status: 'expiring', text: 'Dokument expiruje do 3 mesiacov' };
    } else {
      return { status: 'valid', text: 'Platný' };
    }
  };

  return (
    <div className="people-container">
      {/* Horný toolbar */}
      <div className="people-toolbar">
        <div className="people-toolbar-left">
          <span className="people-count">{filteredPeople.length} ľudí</span>
          
          <button onClick={handleResetFilters} className="people-toolbar-button" title="Resetovať filtre">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M6 12h12M10 18h4"></path>
            </svg>
          </button>
          
          <div className="people-toolbar-separator"></div>
          
          <button onClick={toggleViewMode} className="people-toolbar-button" title={isTableView ? "Detailný pohľad" : "Tabuľkový pohľad"}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d={isTableView 
                ? "M21 3H3v18h18V3zm-10 4h4v2h-4V7zm0 4h4v2h-4v-2zm0 4h4v2h-4v-2zm-6-8h4v2H5V7zm0 4h4v2H5v-2zm0 4h4v2H5v-2z" 
                : "M4 6h16M4 12h16M4 18h16"}></path>
            </svg>
          </button>
          
          <span className="people-toolbar-button">Expand</span>
        </div>
        
        <div className="people-toolbar-right">
          <button onClick={handleDeletePerson} className="people-toolbar-button" title="Odstrániť osobu" disabled={!selectedPerson}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6"></path>
            </svg>
          </button>
          
          <button onClick={handleAddPerson} className="people-toolbar-button" title="Pridať osobu">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14"></path>
            </svg>
          </button>
          
          <button className="people-toolbar-button" title="Vyhľadávanie">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="M21 21l-4.35-4.35"></path>
            </svg>
          </button>
        </div>
      </div>

      {/* Hlavný obsah */}
      <div className="people-content">
        {/* Bočný panel so zoznamom osôb */}
        <div className="people-sidebar">
          <div className="people-search-container">
            <input 
              type="text" 
              className="people-search" 
              placeholder="Vyhľadať osobu..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="filter-controls">
            <select 
              className="filter-select" 
              value={positionFilter}
              onChange={(e) => setPositionFilter(e.target.value)}
            >
              {positions.map(position => (
                <option key={position} value={position}>{position}</option>
              ))}
            </select>
            
            <select 
              className="filter-select" 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              {statuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
          
          <div className="person-list">
            {isLoading ? (
              <div className="loading-message">Načítavam ľudí...</div>
            ) : filteredPeople.length === 0 ? (
              <div className="empty-message">Nenašli sa žiadne osoby</div>
            ) : (
              filteredPeople.map(person => (
                <div 
                  key={person.id} 
                  className={`person-item ${selectedPerson?.id === person.id ? 'selected' : ''}`}
                  onClick={() => handleSelectPerson(person)}
                >
                  <div className="person-photo-container">
                    <img 
                      src={person.image} 
                      alt={`${person.firstName} ${person.lastName}`} 
                      className="person-photo" 
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/people/placeholder.jpg";
                        target.classList.add("fallback-image");
                      }}
                      loading="lazy"
                    />
                  </div>
                  <div className="person-info">
                    <div className="person-name">{person.firstName} {person.lastName}</div>
                    <div className="person-meta">
                      <span>{person.position}</span>
                      <span>•</span>
                      <span className={`status-chip ${getStatusClass(person.status)}`}>
                        {person.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        
        {/* Detail osoby alebo tabuľkový pohľad */}
        {isTableView ? (
          <div className="people-table-view">
            {/* Implementácia tabuľkového pohľadu (budúca funkcionalita) */}
            <div className="empty-message">Tabuľkový pohľad - bude implementovaný</div>
          </div>
        ) : (
          <div className="person-details">
            {selectedPerson ? (
              <>
                <div className="person-photo-large-container">
                  <div className="person-photo-wrapper">
                    <img 
                      src={selectedPerson.image} 
                      alt={`${selectedPerson.firstName} ${selectedPerson.lastName}`} 
                      className="person-photo-large" 
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/people/placeholder.jpg";
                        target.classList.add("fallback-image");
                      }}
                      loading="lazy"
                    />
                  </div>
                </div>
                
                <div className="person-details-scroll-container">
                  <div className="person-details-grid">
                    {/* Základné informácie */}
                    <div className="details-panel card-item">
                      <div className="person-form-2col">
                        <div className="person-details-row">
                          <div className="person-details-label">Meno</div>
                          <div className="person-details-value">
                            <input 
                              type="text" 
                              className="person-details-input"
                              value={selectedPerson.firstName}
                              onChange={(e) => handleInputChange('firstName', e.target.value)}
                            />
                          </div>
                        </div>
                        
                        <div className="person-details-row">
                          <div className="person-details-label">Priezvisko</div>
                          <div className="person-details-value">
                            <input 
                              type="text" 
                              className="person-details-input"
                              value={selectedPerson.lastName}
                              onChange={(e) => handleInputChange('lastName', e.target.value)}
                            />
                          </div>
                        </div>
                        
                        <div className="person-details-row">
                          <div className="person-details-label">Pozícia</div>
                          <div className="person-details-value">
                            <select 
                              className="person-details-select"
                              value={selectedPerson.position}
                              onChange={(e) => handleInputChange('position', e.target.value)}
                            >
                              <option value="Vodič">Vodič</option>
                              <option value="Dispečer">Dispečer</option>
                              <option value="Manažér">Manažér</option>
                              <option value="Administratíva">Administratíva</option>
                            </select>
                          </div>
                        </div>
                        
                        <div className="person-details-row">
                          <div className="person-details-label">Status</div>
                          <div className="person-details-value">
                            <select 
                              className="person-details-select"
                              value={selectedPerson.status}
                              onChange={(e) => handleInputChange('status', e.target.value)}
                            >
                              <option value="Aktívny">Aktívny</option>
                              <option value="Dovolenka">Dovolenka</option>
                              <option value="PN">PN</option>
                              <option value="Neaktívny">Neaktívny</option>
                            </select>
                          </div>
                        </div>
                        
                        <div className="person-details-row">
                          <div className="person-details-label">Dátum narodenia</div>
                          <div className="person-details-value">
                            <input 
                              type="date" 
                              className="person-details-input"
                              value={selectedPerson.birthDate}
                              onChange={(e) => handleInputChange('birthDate', e.target.value)}
                            />
                          </div>
                        </div>
                        
                        <div className="person-details-row">
                          <div className="person-details-label">Nástup</div>
                          <div className="person-details-value">
                            <input 
                              type="date" 
                              className="person-details-input"
                              value={selectedPerson.joinDate}
                              onChange={(e) => handleInputChange('joinDate', e.target.value)}
                            />
                          </div>
                        </div>
                        
                        <div className="person-details-row">
                          <div className="person-details-label">E-mail</div>
                          <div className="person-details-value">
                            <input 
                              type="email" 
                              className="person-details-input"
                              value={selectedPerson.email}
                              onChange={(e) => handleInputChange('email', e.target.value)}
                            />
                          </div>
                        </div>
                        
                        <div className="person-details-row">
                          <div className="person-details-label">Telefón</div>
                          <div className="person-details-value">
                            <input 
                              type="tel" 
                              className="person-details-input"
                              value={selectedPerson.phone}
                              onChange={(e) => handleInputChange('phone', e.target.value)}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="person-details-row full-width">
                        <div className="person-details-label">Adresa</div>
                        <div className="person-details-value">
                          <input 
                            type="text" 
                            className="person-details-input"
                            value={selectedPerson.address || ""}
                            onChange={(e) => handleInputChange('address', e.target.value)}
                            placeholder="Ulica a číslo"
                          />
                        </div>
                      </div>

                      <div className="person-form-2col">
                        <div className="person-details-row">
                          <div className="person-details-label">Mesto</div>
                          <div className="person-details-value">
                            <input 
                              type="text" 
                              className="person-details-input"
                              value={selectedPerson.city || ""}
                              onChange={(e) => handleInputChange('city', e.target.value)}
                            />
                          </div>
                        </div>
                        
                        <div className="person-details-row">
                          <div className="person-details-label">PSČ</div>
                          <div className="person-details-value">
                            <input 
                              type="text" 
                              className="person-details-input"
                              value={selectedPerson.zipCode || ""}
                              onChange={(e) => handleInputChange('zipCode', e.target.value)}
                            />
                          </div>
                        </div>

                        <div className="person-details-row">
                          <div className="person-details-label">Krajina</div>
                          <div className="person-details-value">
                            <input 
                              type="text" 
                              className="person-details-input"
                              value={selectedPerson.country || ""}
                              onChange={(e) => handleInputChange('country', e.target.value)}
                            />
                          </div>
                        </div>

                        <div className="person-details-row">
                          <div className="person-details-label">Vozidlo</div>
                          <div className="person-details-value">
                            <input 
                              type="text" 
                              className="person-details-input"
                              value={selectedPerson.vehicle || ""}
                              onChange={(e) => handleInputChange('vehicle', e.target.value)}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Pre vodičov - špecifické polia */}
                      {selectedPerson.position === "Vodič" && (
                        <div className="person-form-2col">
                          <div className="person-details-row">
                            <div className="person-details-label">Číslo VP</div>
                            <div className="person-details-value">
                              <input 
                                type="text" 
                                className="person-details-input"
                                value={selectedPerson.licenseNumber || ""}
                                onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
                              />
                            </div>
                          </div>
                          
                          <div className="person-details-row">
                            <div className="person-details-label">Platnosť VP</div>
                            <div className="person-details-value">
                              <input 
                                type="date" 
                                className="person-details-input"
                                value={selectedPerson.licenseExpiry || ""}
                                onChange={(e) => handleInputChange('licenseExpiry', e.target.value)}
                              />
                            </div>
                          </div>

                          <div className="person-details-row">
                            <div className="person-details-label">Kategória VP</div>
                            <div className="person-details-value">
                              <select 
                                className="person-details-select"
                                value={selectedPerson.licenseType || "B"}
                                onChange={(e) => handleInputChange('licenseType', e.target.value)}
                              >
                                <option value="B">B</option>
                                <option value="C">C</option>
                                <option value="C+E">C+E</option>
                                <option value="D">D</option>
                                <option value="D+E">D+E</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="person-details-row full-width">
                        <div className="person-details-label">Poznámky</div>
                        <div className="person-details-value">
                          <textarea 
                            className="person-details-textarea"
                            value={selectedPerson.notes || ""}
                            onChange={(e) => handleInputChange('notes', e.target.value)}
                          ></textarea>
                        </div>
                      </div>
                    </div>
                    
                    {/* Dokumenty */}
                    <div className="section-panel card-item">
                      <div className="section-header">
                        <h3 className="section-title">Dokumenty</h3>
                        <div className="section-controls">
                          <button className="section-button" title="Pridať dokument">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M12 5v14M5 12h14"></path>
                            </svg>
                          </button>
                        </div>
                      </div>
                      
                      <div className="documents-list">
                        <div className="table-header">
                          <div>Dátum</div>
                          <div>Typ</div>
                          <div>Číslo</div>
                          <div>Platnosť</div>
                        </div>
                        
                        {personDocuments.length === 0 ? (
                          <div className="empty-message">Nenašli sa žiadne dokumenty</div>
                        ) : (
                          personDocuments.map(doc => {
                            const expiry = checkDocumentExpiry(doc.validUntil);
                            return (
                              <div key={doc.id} className="table-row">
                                <div>{doc.date}</div>
                                <div>{doc.type}</div>
                                <div>{doc.number}</div>
                                <div>
                                  {doc.validUntil}
                                  <div className={`date-${expiry.status}`}>{expiry.text}</div>
                                </div>
                              </div>
                            );
                          })
                        )}
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
                          <div>Vozidlo</div>
                          <div>Destinácia</div>
                          <div>Stav</div>
                        </div>
                        
                        {personTrips.length === 0 ? (
                          <div className="empty-message">Nenašli sa žiadne jazdy</div>
                        ) : (
                          personTrips.map(trip => (
                            <div key={trip.id} className="table-row">
                              <div>{trip.date}</div>
                              <div>{trip.vehicle}</div>
                              <div>{trip.destination}</div>
                              <div>{trip.status}</div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="no-selection-message">Vyberte osobu zo zoznamu</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default HaulerPeople;