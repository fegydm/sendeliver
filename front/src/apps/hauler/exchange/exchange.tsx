// File: src/apps/hauler/exchange/exchange.tsx
// Last change: Migrated from exchange.component.tsx with updated imports

import React, { useState, useEffect, useMemo } from 'react';
import { mockExchangeOffers, ExchangeOffer } from '@/data/mockExchangeData';
import { Vehicle, mockVehicles } from '@/data/mockFleet';
import './exchange.css';

const ExchangeComponent: React.FC = () => {
  const [offers, setOffers] = useState<ExchangeOffer[]>([]);
  const [selectedOffer, setSelectedOffer] = useState<ExchangeOffer | null>(null);
  const [userVehicles] = useState<Vehicle[]>(mockVehicles);
  const [selectedVehicleForFilter, setSelectedVehicleForFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(true);

  useEffect(() => {
    // TODO: Replace mock data with real API call to GET /api/exchange/requests
    setOffers(mockExchangeOffers);
    setSelectedOffer(mockExchangeOffers[0] || null);
  }, []);

  const filteredOffers = useMemo(() => {
    if (selectedVehicleForFilter === 'all') {
      return offers;
    }
    const selectedVehicle = userVehicles.find(v => v.id === selectedVehicleForFilter);
    if (!selectedVehicle) {
      return offers;
    }
    return offers.filter(offer => offer.vehicleType.includes(selectedVehicle.type));
  }, [offers, selectedVehicleForFilter, userVehicles]);

  const handleSelectOffer = (offer: ExchangeOffer) => {
    setSelectedOffer(offer);
  };

  const handleAcceptOffer = (offerId: string) => {
    alert(`TODO: Akceptovať ponuku ${offerId} a presunúť do Plánovača`);
  };

  return (
    <div className="exchange">
      <header className="exchange__toolbar">
        <h1 className="exchange__main-title">Burza Prepráv</h1>
        <button 
          type="button"
          className="button" 
          onClick={() => setShowFilters(!showFilters)}
        >
          {showFilters ? 'Skryť filtre' : 'Zobraziť filtre'}
        </button>
      </header>

      <div className="exchange__content">
        <aside className={`exchange__sidebar ${!showFilters ? 'exchange__sidebar--hidden' : ''}`}>
          <div className="filter-block">
            <h3 className="filter-block__title">Filtrovať Pre Konkrétne Vozidlo</h3>
            <p className="filter-block__description">
              Zobrazte iba ponuky, ktoré zodpovedajú špecifikáciám vybraného vozidla.
            </p>
            <select
              className="filter-block__select"
              value={selectedVehicleForFilter}
              onChange={(e) => setSelectedVehicleForFilter(e.target.value)}
            >
              <option value="all">Všetky moje vozidlá</option>
              {userVehicles.map(vehicle => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.name} ({vehicle.plateNumber})
                </option>
              ))}
            </select>
          </div>
          
          <div className="filter-block">
            <h3 className="filter-block__title">Alert na Perfektnú Prepravu</h3>
            <p className="filter-block__description">
              Upozorni ma, keď príde ponuka, ktorá presne sedí na moje voľné vozidlo, lokalitu a čas.
            </p>
            <button 
              type="button"
              className="button button--primary" 
              disabled
            >
              Aktivovať Alert (čoskoro)
            </button>
          </div>
        </aside>

        <main className="exchange__main">
          <div className="offer-list">
            {filteredOffers.map(offer => (
              <div
                key={offer.id}
                className={`offer-card ${selectedOffer?.id === offer.id ? 'offer-card--selected' : ''}`}
                onClick={() => handleSelectOffer(offer)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleSelectOffer(offer);
                  }
                }}
              >
                <div className="offer-card__header">
                  <div className="offer-card__route">
                    {offer.pickupLocation.city} → {offer.deliveryLocation.city}
                  </div>
                  <div className="offer-card__price">
                    {offer.price?.amount} {offer.price?.currency}
                  </div>
                </div>
                <div className="offer-card__details">
                  <span className="offer-card__detail-item">{offer.cargo.type}</span>
                  <span className="offer-card__detail-item">{offer.cargo.weight} kg</span>
                  <span className="offer-card__detail-item">{offer.vehicleType.join(', ')}</span>
                </div>
                <div className="offer-card__footer">
                  <span className="offer-card__company">{offer.company.name}</span>
                  <span className="offer-card__time">pred 5 minútami</span>
                </div>
              </div>
            ))}
          </div>
        </main>

        <aside className="exchange__detail">
          {selectedOffer ? (
            <div className="offer-detail">
              <div className="offer-detail__header">
                <h2 className="offer-detail__title">
                  {selectedOffer.pickupLocation.city} → {selectedOffer.deliveryLocation.city}
                </h2>
                <span className="offer-detail__company">od: {selectedOffer.company.name}</span>
              </div>
              
              <div className="offer-detail__price-section">
                <span className="offer-detail__price">
                  {selectedOffer.price?.amount} {selectedOffer.price?.currency}
                </span>
              </div>
              
              <div className="offer-detail__actions">
                <button 
                  type="button"
                  className="button button--primary button--full-width" 
                  onClick={() => handleAcceptOffer(selectedOffer.id)}
                >
                  Mám záujem & Zobraziť Kontakt
                </button>
              </div>
              
              <div className="offer-detail__section">
                <h4 className="offer-detail__section-title">Detaily Nákladu</h4>
                <p><strong>Typ:</strong> {selectedOffer.cargo.type}</p>
                <p><strong>Hmotnosť:</strong> {selectedOffer.cargo.weight} kg</p>
                {selectedOffer.cargo.pallets && (
                  <p><strong>Počet paliet:</strong> {selectedOffer.cargo.pallets}</p>
                )}
              </div>
              
              <div className="offer-detail__section">
                <h4 className="offer-detail__section-title">Požiadavky na Vozidlo</h4>
                <p>{selectedOffer.vehicleType.join(', ')}</p>
              </div>
              
              <div className="offer-detail__section">
                <h4 className="offer-detail__section-title">Časový Harmonogram</h4>
                <p>
                  <strong>Nakládka:</strong> {new Date(selectedOffer.pickupTime.date).toLocaleDateString('sk-SK')}
                </p>
                <p>
                  <strong>Vykládka:</strong> {new Date(selectedOffer.deliveryTime.date).toLocaleDateString('sk-SK')}
                </p>
              </div>
            </div>
          ) : (
            <div className="exchange__no-selection">Vyberte ponuku zo zoznamu.</div>
          )}
        </aside>
      </div>
    </div>
  );
};

export { ExchangeComponent };
export default ExchangeComponent;