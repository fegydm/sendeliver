// File: src/components/sections/content/search-forms/manual-form.component.tsx
// Last change: Pridaná automatická vyhľadávacia akcia po vyplnení údajov nakladky

import React, { useState, useRef, useCallback, useEffect } from 'react';
import CountrySelect from './CountrySelect';
import PostalCitySelect from './PostalCitySelect';
import { DateTimeSelect } from './DateTimeSelect';
import { TransportFormData, LocationType, LocationSuggestion } from '@/types/transport-forms.types';
import { useCountries } from '@/hooks/useCountries';
import loadIcon from '@/assets/load-icon.svg';
import deliverIcon from '@/assets/deliver-icon.svg';

interface ManualFormProps {
  onSubmit: (data: TransportFormData) => void;
  formData?: TransportFormData;
  type: 'sender' | 'hauler';
  className?: string;
}

// Definícia typu pre formáty poštových smerových čísel
interface PostalFormat {
  format: string;
  regex: string;
}

const DEFAULT_FORM_DATA: TransportFormData = {
  pickup: { country: { cc: '', flag: '' }, psc: '', city: '', time: '', lat: 0, lng: 0 },
  delivery: { country: { cc: '', flag: '' }, psc: '', city: '', time: '', lat: 0, lng: 0 },
  cargo: { pallets: 0, weight: 0 },
};

// Show reminders only when NODE_ENV is set to 'development'
const isDevMode = process.env.NODE_ENV === 'development';

export function ManualForm({
  onSubmit,
  formData = DEFAULT_FORM_DATA,
  type = 'sender',
  className = '',
}: ManualFormProps) {
  const pickupPscRef = useRef<HTMLInputElement>(null);
  const deliveryPscRef = useRef<HTMLInputElement>(null);

  const [localFormData, setLocalFormData] = useState<TransportFormData>(formData);
  const [isPickupValid, setIsPickupValid] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [postalFormats, setPostalFormats] = useState<Record<string, PostalFormat>>({});
  const { items: allCountries } = useCountries();
  
  // Predchádzajúci stav súradníc - pre detekciu zmien
  const prevCoordsRef = useRef<{lat: number, lng: number}>({lat: 0, lng: 0});

  const fetchPostalFormat = useCallback(async (cc: string) => {
    try {
      const response = await fetch(`/api/geo/country_formats?cc=${cc}`);
      if (!response.ok) {
        if (response.status === 404) {
          // Log reminder only in development mode
          if (isDevMode) {
            console.warn(`[ManualForm] Missing format for ${cc}, using fallback. TODO: Add mask to country_formats table.`);
          }
          setPostalFormats((prev) => ({
            ...prev,
            [cc]: { format: "#####", regex: "^[0-9]{5}$" }, // Fallback to DE format
          }));
          return;
        }
        throw new Error(`HTTP error: ${response.status}`);
      }
      const data = await response.json();
      setPostalFormats((prev) => ({
        ...prev,
        [cc]: { format: data.postal_code_format, regex: data.postal_code_regex },
      }));
    } catch (error) {
      console.error(`Error fetching postal format for ${cc}:`, error);
    }
  }, []);

  // Check format count vs country count, log reminder only in development mode
  useEffect(() => {
    if (!isDevMode) return; // Skip if not in development
    const countryCount = allCountries.length;
    const formatCount = Object.keys(postalFormats).length;
    if (formatCount > 0 && formatCount < countryCount) {
      console.warn(
        `[ManualForm] Format mismatch: ${formatCount} postal formats vs. ${countryCount} countries. ` +
        `TODO: Ensure all countries have postal code formats in country_formats table.`
      );
    }
  }, [allCountries, postalFormats]);

  // Validácia nakladky - kontrola či máme cc, psc a city
  const validatePickup = useCallback(() => {
    const pickup = localFormData.pickup;
    const isValid = 
      pickup.country.cc !== '' && 
      pickup.psc !== '' && 
      pickup.city !== '';
    
    setIsPickupValid(isValid);
    return isValid;
  }, [localFormData.pickup]);

  // Funkcia na vyhľadávanie áut podľa súradníc nakladky
  const searchAvailableVehicles = useCallback(async () => {
    try {
      const { lat, lng } = localFormData.pickup;
      
      // Kontrola, či máme platné súradnice
      if (!lat || !lng) {
        console.error('[ManualForm] Súradnice nakladky chýbajú');
        return;
      }
      
      // Kontrola, či sa súradnice zmenili
      if (lat === prevCoordsRef.current.lat && lng === prevCoordsRef.current.lng) {
        console.log('[ManualForm] Súradnice sa nezmenili, preskakujem vyhľadávanie');
        return;
      }
      
      // Aktualizácia referencie na súradnice
      prevCoordsRef.current = { lat, lng };
      
      console.log(`[ManualForm] Spúšťam vyhľadávanie áut v blízkosti: LAT=${lat}, LNG=${lng}`);
      setIsSearching(true);
      
      // Simulovaná implementácia vyhľadávania - nahradiť reálnou
      const response = await fetch('/api/vehicles/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pickupLat: lat,
          pickupLng: lng,
          radius: 100, // km
          cargo: localFormData.cargo,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Chyba pri vyhľadávaní: ${response.status}`);
      }
      
      const results = await response.json();
      console.log(`[ManualForm] Nájdené vozidlá:`, results);
      
      // Tu by sa spracovali výsledky a zobrazili sa v UI
      
    } catch (error) {
      console.error('Chyba pri vyhľadávaní vozidiel:', error);
    } finally {
      setIsSearching(false);
    }
  }, [localFormData.pickup, localFormData.cargo]);

  // Vyvolať validáciu pri každej zmene pickup údajov
  useEffect(() => {
    const isValid = validatePickup();
    
    // Ak máme platné údaje pre nakladku, spustíme vyhľadávanie
    if (isValid && 
        localFormData.pickup.lat && 
        localFormData.pickup.lng) {
      searchAvailableVehicles();
    }
  }, [localFormData.pickup, validatePickup, searchAvailableVehicles]);

  const handleCountrySelect = useCallback(
    (locationType: LocationType, cc: string, flag: string) => {
      console.log(`[ManualForm] Country selected for ${locationType}:`, cc, flag);
      setLocalFormData((prev) => ({
        ...prev,
        [locationType]: { 
          ...prev[locationType], 
          country: { cc, flag }, 
          psc: '', 
          city: '' 
        },
      }));
      if (cc.length === 2) fetchPostalFormat(cc);
    },
    [fetchPostalFormat]
  );

  const focusPostalCode = useCallback((locationType: LocationType) => {
    (locationType === LocationType.PICKUP ? pickupPscRef : deliveryPscRef).current?.focus();
  }, []);

  const handleLocationSelect = useCallback(
    (locationType: LocationType, location: Omit<LocationSuggestion, 'priority'>) => {
      console.log(`[ManualForm] Location selected for ${locationType}:`, location);
      
      // Vytvoríme aktualizované dáta
      const updatedData = { ...localFormData };
      
      // Aktualizujeme country, ak je k dispozícii
      if (location.cc) {
        const flagUrl = location.cc ? `/flags/4x3/optimized/${location.cc.toLowerCase()}.svg` : '';
        updatedData[locationType].country = { cc: location.cc, flag: flagUrl };
      }
      
      // Aktualizujeme ostatné údaje
      updatedData[locationType].psc = location.psc || '';
      updatedData[locationType].city = location.city || '';
      updatedData[locationType].lat = location.lat ?? 0;
      updatedData[locationType].lng = location.lng ?? 0;
      
      // Aktualizujeme stav
      setLocalFormData(updatedData);
    },
    []
  );

  const handleDateTimeChange = useCallback((locationType: LocationType, date: Date) => {
    setLocalFormData((prev) => ({
      ...prev,
      [locationType]: { ...prev[locationType], time: date.toISOString() },
    }));
  }, []);

  const handleCargoChange = useCallback((field: 'pallets' | 'weight', value: number) => {
    setLocalFormData((prev) => ({
      ...prev,
      cargo: { ...prev.cargo, [field]: value },
    }));
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      console.log('Submitting form data:', localFormData);
      onSubmit(localFormData);
    },
    [localFormData, onSubmit]
  );

  return (
    <form className={`manual-form manual-form--${type} ${className}`} onSubmit={handleSubmit}>
      {/* Pickup Section */}
      <section className={`manual-form__pickup ${isPickupValid ? 'manual-form__pickup--valid' : ''}`}>
        <h3 className="manual-form__title">Pickup Details</h3>
        <div className="manual-form__grid">
          <div className="manual-form__country">
            <label className="manual-form__label">Country</label>
            <CountrySelect
              onCountrySelect={(cc, flag) => handleCountrySelect(LocationType.PICKUP, cc, flag)}
              onNextFieldFocus={() => focusPostalCode(LocationType.PICKUP)}
              initialValue={localFormData.pickup.country.cc}
              locationType={LocationType.PICKUP}
            />
          </div>
          <div className="manual-form__location">
            <label className="manual-form__label">Location</label>
            <PostalCitySelect
              pscRef={pickupPscRef}
              onValidSelection={() => {}}
              onSelectionChange={(location) => handleLocationSelect(LocationType.PICKUP, location)}
              locationType={LocationType.PICKUP}
              cc={localFormData.pickup.country.cc}
              dbPostalCodeMask={postalFormats[localFormData.pickup.country.cc]?.format || ''}
              postalCodeRegex={postalFormats[localFormData.pickup.country.cc]?.regex}
            />
          </div>
          <div className="manual-form__load-img">
            <img src={loadIcon} alt="Loading icon" />
          </div>
          <div className="manual-form__datetime">
            <label className="manual-form__label">Loading Date/Time</label>
            <DateTimeSelect
              value={localFormData.pickup.time ? new Date(localFormData.pickup.time) : null}
              onChange={(date: Date) => handleDateTimeChange(LocationType.PICKUP, date)}
              min={new Date()}
              locationType="pickup"
            />
          </div>
        </div>
      </section>

      {/* Delivery Section */}
      <section className="manual-form__delivery">
        <h3 className="manual-form__title">Delivery Details</h3>
        <div className="manual-form__grid">
          <div className="manual-form__country">
            <label className="manual-form__label">Country</label>
            <CountrySelect
              onCountrySelect={(cc, flag) => handleCountrySelect(LocationType.DELIVERY, cc, flag)}
              onNextFieldFocus={() => focusPostalCode(LocationType.DELIVERY)}
              initialValue={localFormData.delivery.country.cc}
              locationType={LocationType.DELIVERY}
            />
          </div>
          <div className="manual-form__location">
            <label className="manual-form__label">Location</label>
            <PostalCitySelect
              pscRef={deliveryPscRef}
              onValidSelection={() => {}}
              onSelectionChange={(location) => handleLocationSelect(LocationType.DELIVERY, location)}
              locationType={LocationType.DELIVERY}
              cc={localFormData.delivery.country.cc}
              dbPostalCodeMask={postalFormats[localFormData.delivery.country.cc]?.format || ''}
              postalCodeRegex={postalFormats[localFormData.delivery.country.cc]?.regex}
            />
          </div>
          <div className="manual-form__deliver-img">
            <img src={deliverIcon} alt="Delivery icon" />
          </div>
          <div className="manual-form__datetime">
            <label className="manual-form__label">Delivery Date/Time</label>
            <DateTimeSelect
              value={localFormData.delivery.time ? new Date(localFormData.delivery.time) : null}
              onChange={(date: Date) => handleDateTimeChange(LocationType.DELIVERY, date)}
              min={new Date()}
              locationType="delivery"
            />
          </div>
        </div>
      </section>

      {/* Cargo Section */}
      <section className="manual-form__cargo">
        <h3 className="manual-form__title">Cargo Details</h3>
        <div className="manual-form__cargo-inputs">
          <div className="manual-form__field">
            <label className="manual-form__label">Number of Pallets</label>
            <input
              type="number"
              value={localFormData.cargo.pallets}
              onChange={(e) => handleCargoChange('pallets', Number(e.target.value))}
              min="0"
              className="manual-form__input-number"
            />
          </div>
          <div className="manual-form__field">
            <label className="manual-form__label">Total Weight (kg)</label>
            <input
              type="number"
              value={localFormData.cargo.weight}
              onChange={(e) => handleCargoChange('weight', Number(e.target.value))}
              min="0"
              step="0.1"
              className="manual-form__input-number"
            />
          </div>
        </div>
      </section>

      <button
        type="submit"
        className={`manual-form__submit ${!isPickupValid ? 'manual-form__submit--disabled' : ''}`}
        disabled={!isPickupValid || isSearching}
      >
        {isSearching ? 'Vyhľadávam vozidlá...' : 'Potvrdiť prepravnú požiadavku'}
      </button>
    </form>
  );
}

export default ManualForm;