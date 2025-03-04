// File: src/components/sections/content/search-forms/manual-form.component.tsx
// Last change: Updated BEM class names to align with datetime-select and minimize 3-part classNames

import React, { useState, useRef, useCallback } from 'react';
import CountrySelect from './CountrySelect';
import PostalCitySelect from './PostalCitySelect';
import { DateTimeSelect } from './DateTimeSelect';
import { TransportFormData, LocationType, LocationSuggestion } from '@/types/transport-forms.types';
import loadIcon from '@/assets/load-icon.svg';
import deliverIcon from '@/assets/deliver-icon.svg';

interface ManualFormProps {
  onSubmit: (data: TransportFormData) => void;
  formData?: TransportFormData;
  type: 'sender' | 'hauler';
  className?: string;
}

const DEFAULT_FORM_DATA: TransportFormData = {
  pickup: { country: { cc: '', flag: '' }, psc: '', city: '', time: '', lat: 0, lng: 0 },
  delivery: { country: { cc: '', flag: '' }, psc: '', city: '', time: '', lat: 0, lng: 0 },
  cargo: { pallets: 0, weight: 0 },
};

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
  const [isDeliveryValid, setIsDeliveryValid] = useState(false);
  const [postalFormats, setPostalFormats] = useState<
    Record<string, { format: string; regex: string }>
  >({});

  const fetchPostalFormat = useCallback(async (cc: string) => {
    try {
      const response = await fetch(`/api/geo/country_formats?cc=${cc}`);
      if (!response.ok) {
        if (response.status === 404) {
          console.warn(`No postal format found for ${cc}`);
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

  const handleCountrySelect = useCallback(
    (locationType: LocationType, cc: string, flag: string) => {
      setLocalFormData((prev) => ({
        ...prev,
        [locationType]: { ...prev[locationType], country: { cc, flag }, psc: '', city: '' },
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
      setLocalFormData((prev) => ({
        ...prev,
        [locationType]: {
          ...prev[locationType],
          country: { cc: location.cc, flag: location.flag },
          psc: location.psc,
          city: location.city,
          lat: location.lat || 0,
          lng: location.lng || 0,
        },
      }));
      if (location.psc && location.city) {
        locationType === LocationType.PICKUP ? setIsPickupValid(true) : setIsDeliveryValid(true);
      }
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
      <section
        className={`manual-form__pickup ${
          isPickupValid ? 'manual-form__pickup--valid' : ''
        }`}
      >
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
      <section
        className={`manual-form__delivery ${
          isDeliveryValid ? 'manual-form__delivery--valid' : ''
        }`}
      >
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
        className={`manual-form__submit ${
          !isPickupValid || !isDeliveryValid ? 'manual-form__submit--disabled' : ''
        }`}
        disabled={!isPickupValid || !isDeliveryValid}
      >
        Submit Transport Request
      </button>
    </form>
  );
}

export default ManualForm;