// File: src/components/sections/content/search-forms/manual-form.component.tsx
// Last change: Updated to use location types and improved focus handling

import React, { useState, useRef, useCallback } from 'react';
import CountrySelect from './CountrySelect';
import PostalCitySelect from './PostalCitySelect';
import { LocationFormData, LocationType, LocationSuggestion } from '@/types/location.types';
import "@/styles/sections/manual-form.component.css";

interface ManualSearchFormProps {
  onSubmit: (data: LocationFormData) => void;
  formData?: LocationFormData;
}

const DEFAULT_FORM_DATA: LocationFormData = {
  pickup: {
    cc: '',
    psc: '',
    city: '',
    flag: '',
    lat: 0,
    lng: 0,
    time: ''
  },
  delivery: {
    cc: '',
    psc: '',
    city: '',
    flag: '',
    lat: 0,
    lng: 0,
    time: ''
  },
  cargo: {
    pallets: 0,
    weight: 0
  }
};

export function ManualForm({
  onSubmit,
  formData = DEFAULT_FORM_DATA
}: ManualSearchFormProps) {
  // Refs for postal code inputs
  const pickupPscRef = useRef<HTMLInputElement>(null);
  const deliveryPscRef = useRef<HTMLInputElement>(null);

  // Form data state
  const [localFormData, setLocalFormData] = useState<LocationFormData>(formData);
  const [isPickupValid, setIsPickupValid] = useState(false);
  const [isDeliveryValid, setIsDeliveryValid] = useState(false);
  const [postalFormats, setPostalFormats] = useState<Record<string, { format: string; regex: string }>>({});

  // Fetch postal code format from the API
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
      setPostalFormats(prev => ({
        ...prev,
        [code]: { format: data.postal_code_format, regex: data.postal_code_regex }
      }));
    } catch (error) {
      console.error(`Error fetching postal format for ${code}:`, error);
    }
  }, []);

  // Handle country selection
  const handleCountrySelect = useCallback((locationType: LocationType, cc: string, flag: string) => {
    console.log('Country selected:', { locationType, cc, flag });
    
    // Update form data
    setLocalFormData(prev => {
      const locationData = locationType === LocationType.PICKUP ? prev.pickup : prev.delivery;
      
      // Only reset validation if we have PSC or city
      if (locationData.psc.trim() !== '' || locationData.city.trim() !== '') {
        if (locationType === LocationType.PICKUP) {
          setIsPickupValid(false);
        } else {
          setIsDeliveryValid(false);
        }
      }

      return {
        ...prev,
        [locationType]: {
          ...prev[locationType],
          cc,
          flag
        }
      };
    });

    // If we have a complete country code, fetch its postal format
    if (cc.length === 2) {
      fetchPostalFormat(cc);
    }
  }, [fetchPostalFormat]);

  // Focus handlers
  const focusPostalCode = useCallback((locationType: LocationType) => {
    console.log(`[DEBUG] Focusing PSC field for ${locationType}`, {
      pickupRef: pickupPscRef.current,
      deliveryRef: deliveryPscRef.current
    });
    
    if (locationType === LocationType.PICKUP) {
      if (pickupPscRef.current) {
        pickupPscRef.current.focus();
      } else {
        console.warn('Pickup PSC ref is null');
      }
    } else {
      if (deliveryPscRef.current) {
        deliveryPscRef.current.focus();
      } else {
        console.warn('Delivery PSC ref is null');
      }
    }
  }, []);

  // Handle location selection from PostalCitySelect
  const handleLocationSelect = useCallback((
    locationType: LocationType,
    location: Omit<LocationSuggestion, "priority">
  ) => {
    console.log('Location selected:', { locationType, location });
    
    setLocalFormData(prev => ({
      ...prev,
      [locationType]: {
        ...prev[locationType],
        psc: location.psc,
        city: location.city,
        lat: location.lat || 0,
        lng: location.lng || 0
      }
    }));

    // Update validation state
    if (location.psc && location.city) {
      if (locationType === LocationType.PICKUP) {
        setIsPickupValid(true);
      } else {
        setIsDeliveryValid(true);
      }
    }
  }, []);

  // Handle time change
  const handleTimeChange = useCallback((
    locationType: LocationType,
    time: string
  ) => {
    setLocalFormData(prev => ({
      ...prev,
      [locationType]: {
        ...prev[locationType],
        time
      }
    }));
  }, []);

  // Handle cargo changes
  const handleCargoChange = useCallback((field: 'pallets' | 'weight', value: number) => {
    setLocalFormData(prev => ({
      ...prev,
      cargo: {
        ...prev.cargo,
        [field]: value
      }
    }));
  }, []);

  // Form submission
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitting form data:', localFormData);
    onSubmit(localFormData);
  }, [localFormData, onSubmit]);

  return (
    <form className="manual-form" onSubmit={handleSubmit}>
      {/* Pickup section */}
      <div className={`form-section ${isPickupValid ? 'valid' : 'invalid'}`}>
        <h3 className="section-title">Pickup Details</h3>
        <div className="location-fields">
          <div className="flag-placeholder">
            {localFormData.pickup.flag && (
              <img
                src={localFormData.pickup.flag}
                alt="Pickup Country Flag"
                className="pickup-flag"
              />
            )}
          </div>

          <div className="field-group">
            <label className="field-label">Country</label>
            <CountrySelect
              onCountrySelect={(cc, flag) => handleCountrySelect(LocationType.PICKUP, cc, flag)}
              onNextFieldFocus={() => focusPostalCode(LocationType.PICKUP)}
              initialValue={localFormData.pickup.cc}
              locationType={LocationType.PICKUP}
            />
          </div>

          <PostalCitySelect
            pscRef={pickupPscRef}
            onValidSelection={() => {}}
            onSelectionChange={(location) => 
              handleLocationSelect(LocationType.PICKUP, location)}
            locationType={LocationType.PICKUP}
            cc={localFormData.pickup.cc}
            dbPostalCodeMask={postalFormats[localFormData.pickup.cc]?.format || ''}
            postalCodeRegex={postalFormats[localFormData.pickup.cc]?.regex}
          />
        </div>

        <div className="datetime-field">
          <label className="field-label">Loading Time</label>
          <input
            type="datetime-local"
            value={localFormData.pickup.time}
            onChange={(e) => handleTimeChange(LocationType.PICKUP, e.target.value)}
            className="datetime-input"
          />
        </div>
      </div>

      {/* Delivery section */}
      <div className={`form-section ${isDeliveryValid ? 'valid' : 'invalid'}`}>
        <h3 className="section-title">Delivery Details</h3>
        <div className="location-fields">
          <div className="flag-placeholder">
            {localFormData.delivery.flag && (
              <img
                src={localFormData.delivery.flag}
                alt="Delivery Country Flag"
                className="delivery-flag"
              />
            )}
          </div>

          <div className="field-group">
            <label className="field-label">Country</label>
            <CountrySelect
              onCountrySelect={(cc, flag) => handleCountrySelect(LocationType.DELIVERY, cc, flag)}
              onNextFieldFocus={() => focusPostalCode(LocationType.DELIVERY)}
              initialValue={localFormData.delivery.cc}
              locationType={LocationType.DELIVERY}
            />
          </div>

          <PostalCitySelect
            pscRef={deliveryPscRef}
            onValidSelection={() => {}}
            onSelectionChange={(location) => 
              handleLocationSelect(LocationType.DELIVERY, location)}
            locationType={LocationType.DELIVERY}
            cc={localFormData.delivery.cc}
            dbPostalCodeMask={postalFormats[localFormData.delivery.cc]?.format || ''}
            postalCodeRegex={postalFormats[localFormData.delivery.cc]?.regex}
          />
        </div>

        <div className="datetime-field">
          <label className="field-label">Delivery Time</label>
          <input
            type="datetime-local"
            value={localFormData.delivery.time}
            onChange={(e) => handleTimeChange(LocationType.DELIVERY, e.target.value)}
            className="datetime-input"
          />
        </div>
      </div>

      {/* Cargo section */}
      <div className="form-section">
        <h3 className="section-title">Cargo Details</h3>
        <div className="cargo-container">
          <div className="field-group">
            <label className="field-label">Number of Pallets</label>
            <input
              type="number"
              value={localFormData.cargo.pallets}
              onChange={(e) => handleCargoChange('pallets', Number(e.target.value))}
              min="0"
              className="form-input"
            />
          </div>
          <div className="field-group">
            <label className="field-label">Total Weight (kg)</label>
            <input
              type="number"
              value={localFormData.cargo.weight}
              onChange={(e) => handleCargoChange('weight', Number(e.target.value))}
              min="0"
              step="0.1"
              className="form-input"
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        className="submit-button"
        disabled={!isPickupValid || !isDeliveryValid}
      >
        Submit Transport Request
      </button>
    </form>
  );
}

export default ManualForm;