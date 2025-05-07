// File: ./front/src/components/hauler/content/HaulerExchange.tsx
// Last change: Fixed TypeScript error with ExchangeOffer status type

import React, { useState, useEffect, useRef } from "react";
import { ExchangeOffer, mockExchangeOffers, generateRandomOffer } from "../../../data/mockExchangeData";
import "./hauler.cards.css";
import "./exchange.css";

// Definujeme typ pre status ponuky pre jednoduchšie použitie
type OfferStatus = 'new' | 'viewed' | 'accepted' | 'rejected' | 'expired';

// Typy filtrov
interface FilterState {
  search: string;
  countries: string[];
  cargoTypes: string[];
  vehicleTypes: string[];
  minWeight: number | null;
  maxWeight: number | null;
  fromDate: Date | null;
  status: OfferStatus[]; // Opravený typ
}

// Pomocná funkcia pre formátovanie dátumu
const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('sk-SK', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(new Date(date));
};

// Pomocná funkcia pre formátovanie času
const formatTime = (date: Date): string => {
  return new Intl.DateTimeFormat('sk-SK', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date));
};

// Pomocná funkcia pre výpočet, koľko času uplynulo od vytvorenia ponuky
const getTimeAgo = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffDays > 0) {
    return `${diffDays} ${diffDays === 1 ? 'deň' : diffDays < 5 ? 'dni' : 'dní'} dozadu`;
  } else if (diffHours > 0) {
    return `${diffHours} ${diffHours === 1 ? 'hodina' : diffHours < 5 ? 'hodiny' : 'hodín'} dozadu`;
  } else if (diffMins > 0) {
    return `${diffMins} ${diffMins === 1 ? 'minúta' : diffMins < 5 ? 'minúty' : 'minút'} dozadu`;
  } else {
    return 'práve teraz';
  }
};

// Flagy pre krajiny
const getCountryFlag = (countryCode: string): string => {
  return `/flags/4x3/${countryCode.toLowerCase()}.svg`;
};

// Formátovanie hmotnosti
const formatWeight = (weight: number): string => {
  if (weight < 1000) {
    return `${weight} kg`;
  } else {
    return `${(weight / 1000).toFixed(1)} t`;
  }
};

const HaulerExchange: React.FC = () => {
  // State pre ponuky
  const [offers, setOffers] = useState<ExchangeOffer[]>([]);
  const [selectedOffer, setSelectedOffer] = useState<ExchangeOffer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showContactInfo, setShowContactInfo] = useState(false);
  
  // State pre filtrovanie
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    countries: [],
    cargoTypes: [],
    vehicleTypes: [],
    minWeight: null,
    maxWeight: null,
    fromDate: null,
    status: ['new', 'viewed']
  });
  
  // State pre triedenie
  const [sortBy, setSortBy] = useState<keyof ExchangeOffer>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Refs
  const timerRef = useRef<number | null>(null);
  const offersEndRef = useRef<HTMLDivElement>(null);
  
  // Načítanie ponúk pri prvom rendere
  useEffect(() => {
    setIsLoading(true);
    
    // Simulácia načítania dát z API
    setTimeout(() => {
      setOffers(mockExchangeOffers);
      if (mockExchangeOffers.length > 0) {
        setSelectedOffer(mockExchangeOffers[0]);
      }
      setIsLoading(false);
    }, 800);
    
    // Vytvorenie náhodnej novej ponuky každých 15 sekúnd
    timerRef.current = window.setInterval(() => {
      const newOffer = generateRandomOffer();
      setOffers(prevOffers => [newOffer, ...prevOffers]);
      
      // Automatické scrollovanie na najnovšiu ponuku, ak sa používateľ pozerá na začiatok
      if (offersEndRef.current && (window.scrollY < 100 || window.innerHeight + window.scrollY >= document.body.offsetHeight - 200)) {
        offersEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }, 15000); // 15 sekúnd
    
    return () => {
      if (timerRef.current !== null) {
        clearInterval(timerRef.current);
      }
    };
  }, []);
  
  // Filtrovanie a triedenie ponúk
  const filteredOffers = offers.filter(offer => {
    // Fulltextové vyhľadávanie
    if (filters.search && !offerMatchesSearch(offer, filters.search)) {
      return false;
    }
    
    // Filtrovanie podľa krajín
    if (filters.countries.length > 0 && 
        !filters.countries.includes(offer.pickupLocation.country) && 
        !filters.countries.includes(offer.deliveryLocation.country)) {
      return false;
    }
    
    // Filtrovanie podľa typu nákladu
    if (filters.cargoTypes.length > 0 && !filters.cargoTypes.includes(offer.cargo.type)) {
      return false;
    }
    
    // Filtrovanie podľa typu vozidla
    if (filters.vehicleTypes.length > 0 && 
        !offer.vehicleType.some(type => filters.vehicleTypes.includes(type))) {
      return false;
    }
    
    // Filtrovanie podľa hmotnosti
    if (filters.minWeight !== null && offer.cargo.weight < filters.minWeight) {
      return false;
    }
    if (filters.maxWeight !== null && offer.cargo.weight > filters.maxWeight) {
      return false;
    }
    
    // Filtrovanie podľa dátumu
    if (filters.fromDate !== null && offer.pickupTime.date < filters.fromDate) {
      return false;
    }
    
    // Filtrovanie podľa stavu
    if (filters.status.length > 0 && !filters.status.includes(offer.status)) {
      return false;
    }
    
    return true;
  }).sort((a, b) => {
    // Triedenie
    const aValue = a[sortBy];
    const bValue = b[sortBy];
    
    if (aValue instanceof Date && bValue instanceof Date) {
      return sortDirection === 'asc' 
        ? aValue.getTime() - bValue.getTime() 
        : bValue.getTime() - aValue.getTime();
    }
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    // Fallback pre ostatné typy
    return 0;
  });
  
  // Kontrola, či ponuka obsahuje hľadaný text
  const offerMatchesSearch = (offer: ExchangeOffer, searchText: string): boolean => {
    const searchLower = searchText.toLowerCase();
    
    // Kontrola základných údajov
    if (
      offer.pickupLocation.city.toLowerCase().includes(searchLower) ||
      offer.deliveryLocation.city.toLowerCase().includes(searchLower) ||
      offer.cargo.type.toLowerCase().includes(searchLower) ||
      offer.company.name.toLowerCase().includes(searchLower)
    ) {
      return true;
    }
    
    // Kontrola typov vozidiel
    for (const vehicleType of offer.vehicleType) {
      if (vehicleType.toLowerCase().includes(searchLower)) {
        return true;
      }
    }
    
    // Kontrola špecifických požiadaviek
    if (offer.specificRequirements) {
      for (const req of offer.specificRequirements) {
        if (req.toLowerCase().includes(searchLower)) {
          return true;
        }
      }
    }
    
    return false;
  };
  
  // Aktualizácia filtra
  const handleFilterChange = (filterName: keyof FilterState, value: any) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      [filterName]: value
    }));
  };
  
  // Zmena triedenia
  const handleSortChange = (key: keyof ExchangeOffer) => {
    if (sortBy === key) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(key);
      setSortDirection('desc');
    }
  };
  
  // Výber ponuky
  const handleSelectOffer = (offer: ExchangeOffer) => {
    setSelectedOffer(offer);
    setShowContactInfo(false);
    
    // Aktualizácia stavu ponuky na "viewed"
    if (offer.status === 'new') {
      const updatedOffers = offers.map(o => {
        if (o.id === offer.id) {
          return { ...o, status: 'viewed' as OfferStatus, updatedAt: new Date() };
        }
        return o;
      });
      setOffers(updatedOffers);
    }
  };
  
  // Resetovanie filtrov
  const handleResetFilters = () => {
    setFilters({
      search: '',
      countries: [],
      cargoTypes: [],
      vehicleTypes: [],
      minWeight: null,
      maxWeight: null,
      fromDate: null,
      status: ['new', 'viewed']
    });
  };
  
  // Akceptovanie ponuky
  const handleAcceptOffer = (offerId: string) => {
    const updatedOffers = offers.map(o => {
      if (o.id === offerId) {
        return { ...o, status: 'accepted' as OfferStatus, updatedAt: new Date() };
      }
      return o;
    });
    setOffers(updatedOffers);
    
    // Update aj v selectedOffer, ak je to potrebné
    if (selectedOffer && selectedOffer.id === offerId) {
      setSelectedOffer({
        ...selectedOffer,
        status: 'accepted' as OfferStatus,
        updatedAt: new Date()
      });
    }
    
    setShowContactInfo(true);
  };
  
  // Odmietnutie ponuky
  const handleRejectOffer = (offerId: string) => {
    const updatedOffers = offers.map(o => {
      if (o.id === offerId) {
        return { ...o, status: 'rejected' as OfferStatus, updatedAt: new Date() };
      }
      return o;
    });
    setOffers(updatedOffers);
    
    // Update aj v selectedOffer, ak je to potrebné
    if (selectedOffer && selectedOffer.id === offerId) {
      setSelectedOffer({
        ...selectedOffer,
        status: 'rejected' as OfferStatus,
        updatedAt: new Date()
      });
    }
  };
  
  // Získanie CSS triedy pre stav ponuky
  const getStatusClass = (status: OfferStatus): string => {
    switch (status) {
      case 'new': return 'status-new';
      case 'viewed': return 'status-viewed';
      case 'accepted': return 'status-accepted';
      case 'rejected': return 'status-rejected';
      case 'expired': return 'status-expired';
      default: return '';
    }
  };
  
  // Preklad stavu ponuky
  const translateStatus = (status: OfferStatus): string => {
    switch (status) {
      case 'new': return 'Nová';
      case 'viewed': return 'Zobrazená';
      case 'accepted': return 'Akceptovaná';
      case 'rejected': return 'Odmietnutá';
      case 'expired': return 'Expirovaná';
      default: return status;
    }
  };

  return (
    <div className="exchange-container">
      {/* Horný toolbar */}
      <div className="exchange-toolbar">
        <div className="exchange-toolbar-left">
          <span className="exchange-count">{filteredOffers.length} ponúk</span>
          
          <button onClick={handleResetFilters} className="exchange-toolbar-button" title="Resetovať filtre">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M6 12h12M10 18h4"></path>
            </svg>
          </button>
          
          <div className="toolbar-separator"></div>
          
          <div className="exchange-search">
            <input
              type="text"
              placeholder="Vyhľadať ponuku..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </div>
        </div>
        
        <div className="exchange-toolbar-right">
          <div className="status-filter">
            <label className={`status-filter-label ${filters.status.includes('new') ? 'active' : ''}`}>
              <input
                type="checkbox"
                checked={filters.status.includes('new')}
                onChange={(e) => {
                  const newStatus = e.target.checked
                    ? [...filters.status, 'new']
                    : filters.status.filter(s => s !== 'new');
                  handleFilterChange('status', newStatus);
                }}
              />
              Nové
            </label>
            
            <label className={`status-filter-label ${filters.status.includes('viewed') ? 'active' : ''}`}>
              <input
                type="checkbox"
                checked={filters.status.includes('viewed')}
                onChange={(e) => {
                  const newStatus = e.target.checked
                    ? [...filters.status, 'viewed']
                    : filters.status.filter(s => s !== 'viewed');
                  handleFilterChange('status', newStatus);
                }}
              />
              Zobrazené
            </label>
            
            <label className={`status-filter-label ${filters.status.includes('accepted') ? 'active' : ''}`}>
              <input
                type="checkbox"
                checked={filters.status.includes('accepted')}
                onChange={(e) => {
                  const newStatus = e.target.checked
                    ? [...filters.status, 'accepted']
                    : filters.status.filter(s => s !== 'accepted');
                  handleFilterChange('status', newStatus);
                }}
              />
              Akceptované
            </label>
          </div>
        </div>
      </div>

      {/* Hlavný obsah */}
      <div className="exchange-content">
        {/* Bočný panel so zoznamom ponúk */}
        <div className="exchange-sidebar">
          <div className="exchange-filters">
            <select
              className="filter-select"
              value={sortBy as string}
              onChange={(e) => handleSortChange(e.target.value as keyof ExchangeOffer)}
            >
              <option value="createdAt">Zoradiť podľa: Dátum pridania</option>
              <option value="pickupTime.date">Zoradiť podľa: Dátum nakládky</option>
              <option value="deliveryTime.date">Zoradiť podľa: Dátum vykládky</option>
              <option value="cargo.weight">Zoradiť podľa: Hmotnosť</option>
            </select>
            
            <select
              className="filter-select"
              value={sortDirection}
              onChange={(e) => setSortDirection(e.target.value as 'asc' | 'desc')}
            >
              <option value="desc">Zostupne</option>
              <option value="asc">Vzostupne</option>
            </select>
          </div>
          
          <div className="exchange-offer-list">
            {isLoading ? (
              <div className="loading-message">Načítavam ponuky...</div>
            ) : filteredOffers.length === 0 ? (
              <div className="empty-message">Nenašli sa žiadne ponuky vyhovujúce kritériám</div>
            ) : (
              <>
                <div ref={offersEndRef} className="new-offers-indicator">
                  Nové ponuky sa automaticky pridávajú každých 15 sekúnd
                </div>
                {filteredOffers.map((offer) => (
                  <div
                    key={offer.id}
                    className={`exchange-offer-item ${selectedOffer?.id === offer.id ? 'selected' : ''} ${offer.status}`}
                    onClick={() => handleSelectOffer(offer)}
                  >
                    <div className="offer-header">
                      <div className="offer-route">
                        <img src={getCountryFlag(offer.pickupLocation.country)} alt={offer.pickupLocation.country} className="country-flag" />
                        <span className="city">{offer.pickupLocation.city}</span>
                        <span className="arrow">→</span>
                        <img src={getCountryFlag(offer.deliveryLocation.country)} alt={offer.deliveryLocation.country} className="country-flag" />
                        <span className="city">{offer.deliveryLocation.city}</span>
                      </div>
                      <span className={`offer-status ${getStatusClass(offer.status)}`}>{translateStatus(offer.status)}</span>
                    </div>
                    
                    <div className="offer-dates">
                      <div className="pickup">
                        <span className="date">{formatDate(offer.pickupTime.date)}</span>
                        {offer.pickupTime.timeWindow && (
                          <span className="time">{offer.pickupTime.timeWindow.from} - {offer.pickupTime.timeWindow.to}</span>
                        )}
                      </div>
                      <div className="delivery">
                        <span className="date">{formatDate(offer.deliveryTime.date)}</span>
                        {offer.deliveryTime.timeWindow && (
                          <span className="time">{offer.deliveryTime.timeWindow.from} - {offer.deliveryTime.timeWindow.to}</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="offer-cargo">
                      <span className="cargo-type">{offer.cargo.type}</span>
                      <span className="cargo-weight">{formatWeight(offer.cargo.weight)}</span>
                      {offer.cargo.pallets && <span className="cargo-pallets">{offer.cargo.pallets} paliet</span>}
                    </div>
                    
                    <div className="offer-footer">
                      <span className="company-name">{offer.company.name}</span>
                      <span className="time-ago">{getTimeAgo(offer.createdAt)}</span>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
        
        {/* Detail ponuky */}
        <div className="exchange-details">
          {selectedOffer ? (
            <div className="offer-details-content">
              <div className="offer-details-header">
                <div className="offer-details-route">
                  <div className="pickup-location">
                    <img src={getCountryFlag(selectedOffer.pickupLocation.country)} alt={selectedOffer.pickupLocation.country} className="country-flag-large" />
                    <div className="location-details">
                      <span className="location-label">Nakládka</span>
                      <span className="location-city">{selectedOffer.pickupLocation.city}</span>
                      <span className="location-country">{selectedOffer.pickupLocation.country}</span>
                      {selectedOffer.pickupLocation.postalCode && (
                        <span className="location-postal">{selectedOffer.pickupLocation.postalCode}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="route-arrow">
                    <svg width="40" height="24" viewBox="0 0 40 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M39.0607 13.0607C39.6464 12.4749 39.6464 11.5251 39.0607 10.9393L29.5147 1.3934C28.9289 0.807611 27.9792 0.807611 27.3934 1.3934C26.8076 1.97919 26.8076 2.92893 27.3934 3.51472L35.8787 12L27.3934 20.4853C26.8076 21.0711 26.8076 22.0208 27.3934 22.6066C27.9792 23.1924 28.9289 23.1924 29.5147 22.6066L39.0607 13.0607ZM0 13.5H38V10.5H0V13.5Z" fill="#888"/>
                    </svg>
                  </div>
                  
                  <div className="delivery-location">
                    <img src={getCountryFlag(selectedOffer.deliveryLocation.country)} alt={selectedOffer.deliveryLocation.country} className="country-flag-large" />
                    <div className="location-details">
                      <span className="location-label">Vykládka</span>
                      <span className="location-city">{selectedOffer.deliveryLocation.city}</span>
                      <span className="location-country">{selectedOffer.deliveryLocation.country}</span>
                      {selectedOffer.deliveryLocation.postalCode && (
                        <span className="location-postal">{selectedOffer.deliveryLocation.postalCode}</span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="offer-status-actions">
                  <div className={`offer-status-large ${getStatusClass(selectedOffer.status)}`}>
                    {translateStatus(selectedOffer.status)}
                  </div>
                  
                  {(selectedOffer.status === 'new' || selectedOffer.status === 'viewed') && (
                    <div className="offer-actions">
                      <button 
                        className="offer-action-button accept" 
                        onClick={() => handleAcceptOffer(selectedOffer.id)}
                      >
                        Akceptovať ponuku
                      </button>
                      <button 
                        className="offer-action-button reject" 
                        onClick={() => handleRejectOffer(selectedOffer.id)}
                      >
                        Odmietnuť
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="offer-details-grid">
                <div className="details-section dates-section">
                  <h3>Časy prepravy</h3>
                  
                  <div className="detail-row">
                    <div className="detail-label">Dátum nakládky</div>
                    <div className="detail-value">{formatDate(selectedOffer.pickupTime.date)}</div>
                  </div>
                  
                  {selectedOffer.pickupTime.timeWindow && (
                    <div className="detail-row">
                      <div className="detail-label">Čas nakládky</div>
                      <div className="detail-value">{selectedOffer.pickupTime.timeWindow.from} - {selectedOffer.pickupTime.timeWindow.to}</div>
                    </div>
                  )}
                  
                  <div className="detail-row">
                    <div className="detail-label">Dátum vykládky</div>
                    <div className="detail-value">{formatDate(selectedOffer.deliveryTime.date)}</div>
                  </div>
                  
                  {selectedOffer.deliveryTime.timeWindow && (
                    <div className="detail-row">
                      <div className="detail-label">Čas vykládky</div>
                      <div className="detail-value">{selectedOffer.deliveryTime.timeWindow.from} - {selectedOffer.deliveryTime.timeWindow.to}</div>
                    </div>
                  )}
                </div>
                
                <div className="details-section cargo-section">
                  <h3>Informácie o náklade</h3>
                  
                  <div className="detail-row">
                    <div className="detail-label">Typ nákladu</div>
                    <div className="detail-value">{selectedOffer.cargo.type}</div>
                  </div>
                  
                  <div className="detail-row">
                    <div className="detail-label">Hmotnosť</div>
                    <div className="detail-value">{formatWeight(selectedOffer.cargo.weight)}</div>
                  </div>
                  
                  {selectedOffer.cargo.volume !== undefined && (
                    <div className="detail-row">
                      <div className="detail-label">Objem</div>
                      <div className="detail-value">{selectedOffer.cargo.volume} m³</div>
                    </div>
                  )}
                  
                  {selectedOffer.cargo.pallets !== undefined && (
                    <div className="detail-row">
                      <div className="detail-label">Počet paliet</div>
                      <div className="detail-value">{selectedOffer.cargo.pallets}</div>
                    </div>
                  )}
                  
                  {selectedOffer.cargo.dimensions && (
                    <div className="detail-row">
                      <div className="detail-label">Rozmery</div>
                      <div className="detail-value">
                        {selectedOffer.cargo.dimensions.length} × {selectedOffer.cargo.dimensions.width} × {selectedOffer.cargo.dimensions.height} cm
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="details-section vehicle-requirements">
                  <h3>Požiadavky na vozidlo</h3>
                  
                  <div className="vehicle-types">
                    {selectedOffer.vehicleType.map(type => (
                      <div key={type} className="vehicle-type-tag">{type}</div>
                    ))}
                  </div>
                  
                  {selectedOffer.specificRequirements && selectedOffer.specificRequirements.length > 0 && (
                    <div className="requirements-list">
                      <div className="detail-label">Špecifické požiadavky:</div>
                      <ul>
                        {selectedOffer.specificRequirements.map((req, index) => (
                          <li key={index}>{req}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                
                <div className="details-section company-section">
                  <h3>Informácie o spoločnosti</h3>
                  
                  <div className="detail-row">
                    <div className="detail-label">Spoločnosť</div>
                    <div className="detail-value">{selectedOffer.company.name}</div>
                  </div>
                  
                  {(selectedOffer.status === 'accepted' || showContactInfo) ? (
                    <>
                      <div className="detail-row">
                        <div className="detail-label">Kontaktná osoba</div>
                        <div className="detail-value">{selectedOffer.company.contactPerson}</div>
                      </div>
                      
                      <div className="detail-row">
                        <div className="detail-label">Telefón</div>
                        <div className="detail-value">{selectedOffer.company.phone}</div>
                      </div>
                      
                      <div className="detail-row">
                        <div className="detail-label">Email</div>
                        <div className="detail-value">
                          <a href={`mailto:${selectedOffer.company.email}`}>{selectedOffer.company.email}</a>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="contact-info-locked">
                      <p>Kontaktné údaje budú dostupné po akceptovaní ponuky</p>
                      <button 
                        className="show-contact-button" 
                        onClick={() => setShowContactInfo(true)}
                      >
                        Zobraziť kontaktné údaje
                      </button>
                    </div>
                  )}
                </div>
                
                {selectedOffer.price && (
                  <div className="details-section price-section">
                    <h3>Cenová ponuka</h3>
                    
                    <div className="price-value">
                      {selectedOffer.price.amount} {selectedOffer.price.currency}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="no-selection-message">
              <p>Vyberte ponuku zo zoznamu pre zobrazenie detailov</p>
              {filteredOffers.length === 0 && filters.search && (
                <p>Neboli nájdené žiadne ponuky vyhovujúce vyhľadávaniu. Skúste zmeniť filter.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HaulerExchange;