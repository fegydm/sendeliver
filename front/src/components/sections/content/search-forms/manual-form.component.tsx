// File: src/components/sections/content/search-forms/manual-form.component.tsx
// Last change: Updated to use revised DateTimePicker with two inputs, removed unnecessary wrappers

import React, { useState, useRef, useCallback } from 'react';
import CountrySelect from './CountrySelect';
import PostalCitySelect from './PostalCitySelect';
import { DateTimeSelect } from './DateTimeSelect'; // Using updated DateTimePicker instead of DateTimeSelect
import { LocationFormData, LocationType, Location } from '@/types/location.types';
// import "@/styles/components/manual-form.css";

interface ManualSearchFormProps {
  onSubmit: (data: LocationFormData) => void;
  formData?: LocationFormData;
  type: 'sender' | 'hauler';
}

const DEFAULT_FORM_DATA: LocationFormData = {
  pickup: {
    cc: '',
    psc: '',
    city: '',
    flag: '',
    lat: 0,
    lng: 0,
    time: '',
    testTime: null, // Stores full Date from DateTimePicker
  },
  delivery: {
    cc: '',
    psc: '',
    city: '',
    flag: '',
    lat: 0,
    lng: 0,
    time: '',
    testTime: null, // Stores full Date from DateTimePicker
  },
  cargo: {
    pallets: 0,
    weight: 0,
  },
};

export function ManualForm({
  onSubmit,
  formData = DEFAULT_FORM_DATA,
  type = 'sender',
}: ManualSearchFormProps) {
  const pickupPscRef = useRef<HTMLInputElement>(null);
  const deliveryPscRef = useRef<HTMLInputElement>(null);

  const [localFormData, setLocalFormData] = useState<LocationFormData>(formData);
  const [isPickupValid, setIsPickupValid] = useState(false);
  const [isDeliveryValid, setIsDeliveryValid] = useState(false);
  const [postalFormats, setPostalFormats] = useState<
    Record<string, { format: string; regex: string }>
  >({});

  const fetchPostalFormat = useCallback(async (code: string) => {
    try {
      const response = await fetch(`/api/geo/country_formats?cc=${code}`);
      if (!response.ok) {
        if (response.status === 404) {
          console.warn(`No postal format found for ${code}`);
          return;
        }
        throw new Error(`HTTP error: ${response.status}`);
      }
      const data = await response.json();
      setPostalFormats((prev) => ({
        ...prev,
        [code]: { format: data.postal_code_format, regex: data.postal_code_regex },
      }));
    } catch (error) {
      console.error(`Error fetching postal format for ${code}:`, error);
    }
  }, []);

  const handleCountrySelect = useCallback(
    (locationType: LocationType, cc: string, flag: string) => {
      setLocalFormData((prev) => ({
        ...prev,
        [locationType]: {
          ...prev[locationType],
          cc,
          flag,
          psc: '',
          city: '',
        },
      }));

      if (cc.length === 2) {
        fetchPostalFormat(cc);
      }
    },
    [fetchPostalFormat]
  );

  const focusPostalCode = useCallback((locationType: LocationType) => {
    if (locationType === LocationType.PICKUP) {
      pickupPscRef.current?.focus();
    } else {
      deliveryPscRef.current?.focus();
    }
  }, []);

  const handleLocationSelect = useCallback(
    (locationType: LocationType, location: Omit<Location, 'priority'>) => {
      setLocalFormData((prev) => ({
        ...prev,
        [locationType]: {
          ...prev[locationType],
          cc: location.cc,
          flag: location.flag,
          psc: location.psc,
          city: location.city,
          lat: location.lat || 0,
          lng: location.lng || 0,
        },
      }));

      if (location.psc && location.city) {
        if (locationType === LocationType.PICKUP) {
          setIsPickupValid(true);
        } else {
          setIsDeliveryValid(true);
        }
      }
    },
    []
  );

  const handleDateTimeChange = useCallback(
    (locationType: LocationType, date: Date) => {
      setLocalFormData((prev) => ({
        ...prev,
        [locationType]: {
          ...prev[locationType],
          testTime: date,
        },
      }));
    },
    []
  );

  const handleCargoChange = useCallback((field: 'pallets' | 'weight', value: number) => {
    setLocalFormData((prev) => ({
      ...prev,
      cargo: {
        ...prev.cargo,
        [field]: value,
      },
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
    <form className={`manual-form manual-form--${type}`} onSubmit={handleSubmit}>
      {/* Pickup section */}
      <div
        className={`manual-form__pickup ${
          isPickupValid ? 'manual-form__pickup--valid' : 'manual-form__pickup--invalid'
        }`}
      >
        <h3 className="manual-form__title">Pickup Details</h3>
        <div className="manual-form__grid">
          {/* Country */}
          <div className="manual-form__country">
            <label className="manual-form__label">Country</label>
            <CountrySelect
              onCountrySelect={(cc, flag) =>
                handleCountrySelect(LocationType.PICKUP, cc, flag)
              }
              onNextFieldFocus={() => focusPostalCode(LocationType.PICKUP)}
              initialValue={localFormData.pickup.cc}
              locationType={LocationType.PICKUP}
            />
          </div>

          {/* Location */}
          <div className="manual-form__location">
            <label className="manual-form__label">Location</label>
            <PostalCitySelect
              pscRef={pickupPscRef}
              onValidSelection={() => {}}
              onSelectionChange={(location) =>
                handleLocationSelect(LocationType.PICKUP, location)
              }
              locationType={LocationType.PICKUP}
              cc={localFormData.pickup.cc}
              dbPostalCodeMask={postalFormats[localFormData.pickup.cc]?.format || ''}
              postalCodeRegex={postalFormats[localFormData.pickup.cc]?.regex}
            />
          </div>

          {/* DateTime */}
          <div className="manual-form__datetime">
            <label className="manual-form__label">Loading Date/Time</label>
            <DateTimeSelect
              value={localFormData.pickup.testTime}
              onChange={(date: Date) => handleDateTimeChange(LocationType.PICKUP, date)}
              min={new Date()}
            />
          </div>
        </div>
      </div>

      {/* Delivery section */}
      <div
        className={`manual-form__delivery ${
          isDeliveryValid ? 'manual-form__delivery--valid' : 'manual-form__delivery--invalid'
        }`}
      >
        <h3 className="manual-form__title">Delivery Details</h3>
        <div className="manual-form__grid">
          {/* Country */}
          <div className="manual-form__country">
            <label className="manual-form__label">Country</label>
            <CountrySelect
              onCountrySelect={(cc, flag) =>
                handleCountrySelect(LocationType.DELIVERY, cc, flag)
              }
              onNextFieldFocus={() => focusPostalCode(LocationType.DELIVERY)}
              initialValue={localFormData.delivery.cc}
              locationType={LocationType.DELIVERY}
            />
          </div>

          {/* Location */}
          <div className="manual-form__location">
            <label className="manual-form__label">Location</label>
            <PostalCitySelect
              pscRef={deliveryPscRef}
              onValidSelection={() => {}}
              onSelectionChange={(location) =>
                handleLocationSelect(LocationType.DELIVERY, location)
              }
              locationType={LocationType.DELIVERY}
              cc={localFormData.delivery.cc}
              dbPostalCodeMask={postalFormats[localFormData.delivery.cc]?.format || ''}
              postalCodeRegex={postalFormats[localFormData.delivery.cc]?.regex}
            />
          </div>

          {/* DateTime */}
          <div className="manual-form__datetime">
            <label className="manual-form__label">Delivery Date/Time</label>
            <DateTimeSelect
              value={localFormData.delivery.testTime}
              onChange={(date: Date) => handleDateTimeChange(LocationType.DELIVERY, date)}
              min={new Date()}
            />
          </div>
        </div>
      </div>

      {/* Cargo section */}
      <div className="manual-form__cargo">
        <h3 className="manual-form__title">Cargo Details</h3>
        <div className="manual-form__cargo-inputs">
          <div className="manual-form__field">
            <label className="manual-form__label">Number of Pallets</label>
            <input
              type="number"
              value={localFormData.cargo.pallets}
              onChange={(e) => handleCargoChange('pallets', Number(e.target.value))}
              min="0"
              className="manual-form__input manual-form__input--number"
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
              className="manual-form__input manual-form__input--number"
            />
          </div>
        </div>
      </div>

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