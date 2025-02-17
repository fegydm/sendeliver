// File: src/components/sections/content/search-forms/manual-form-component.tsx
// Last change: Simplified ManualSearchForm by moving postal/city logic to PostalCitySelect and using controlled values

import React, { useState, useRef, useCallback } from 'react';
import CountrySelect from './CountrySelect';
import PostalCitySelect from './PostalCitySelect';
import { FormData } from '@/types/form-manual.types';
import "@/styles/sections/manual-form.component.css";

interface ManualSearchFormProps {
  onSubmit: (data: FormData) => void;
  formData?: FormData;
}

const DEFAULT_FORM_DATA: FormData = {
  pickup: {
    country: { code: '', flag: '' },
    psc: '',
    city: '',
    time: ''
  },
  delivery: {
    country: { code: '', flag: '' },
    psc: '',
    city: '',
    time: ''
  },
  cargo: {
    pallets: 0,
    weight: 0
  }
};

const ManualSearchForm: React.FC<ManualSearchFormProps> = ({
  onSubmit,
  formData = DEFAULT_FORM_DATA
}) => {
  // Refs for postal code inputs
  const pickupPscRef = useRef<HTMLInputElement>(null);
  const deliveryPscRef = useRef<HTMLInputElement>(null);

  // State for the entire form data
  const [localFormData, setLocalFormData] = useState<FormData>(formData);
  // State for storing postal code formats fetched from the API
  const [postalFormats, setPostalFormats] = useState<Record<string, { format: string; regex: string }>>({});

  // Form validity is determined by whether both postal code and city are filled
  const isPickupValid = localFormData.pickup.psc.trim() !== '' && localFormData.pickup.city.trim() !== '';
  const isDeliveryValid = localFormData.delivery.psc.trim() !== '' && localFormData.delivery.city.trim() !== '';

  // Fetch postal code format from the API
  const fetchPostalFormat = useCallback(async (code: string) => {
    try {
      const response = await fetch(`/api/geo/country_formats?cc=${code}`);
      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
      const data = await response.json();
      setPostalFormats(prev => ({
        ...prev,
        [code]: { format: data.postal_code_format, regex: data.postal_code_regex }
      }));
    } catch (error) {
      console.error(`Error fetching postal format for ${code}:`, error);
    }
  }, []);

  // Handle country selection – update only the country and reset postal code and city
  const handleCountrySelect = useCallback((locationType: 'pickup' | 'delivery', code: string, flag: string) => {
    setLocalFormData(prev => ({
      ...prev,
      [locationType]: {
        ...prev[locationType],
        country: { code, flag },
        psc: '',
        city: '',
      }
    }));
    if (code && !postalFormats[code]) {
      fetchPostalFormat(code);
    }
  }, [fetchPostalFormat, postalFormats]);

  // Callback to receive result from PostalCitySelect – always update psc, city, and country
  const handlePostalCityChange = useCallback(
    (
      locationType: 'pickup' | 'delivery', 
      newPsc: string, 
      newCity: string, 
      record?: { code: string; flag: string }
    ) => {
      setLocalFormData(prev => ({
        ...prev,
        [locationType]: {
          ...prev[locationType],
          psc: newPsc,
          city: newCity,
          country: record ? { code: record.code, flag: record.flag } : prev[locationType].country,
        }
      }));
    },
    []
  );

  // Handle time change for pickup/delivery
  const handleTimeChange = (locationType: 'pickup' | 'delivery', time: string) => {
    setLocalFormData(prev => ({
      ...prev,
      [locationType]: {
        ...prev[locationType],
        time,
      }
    }));
  };

  // Handle changes in the cargo section
  const handleCargoChange = (field: 'pallets' | 'weight', value: number) => {
    setLocalFormData(prev => ({
      ...prev,
      cargo: {
        ...prev.cargo,
        [field]: value,
      }
    }));
  };

  // Form submission handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitting form data:', localFormData);
    onSubmit(localFormData);
  };

  return (
    <form className="manual-form" onSubmit={handleSubmit}>
      {/* Pickup Section */}
      <div className={`form-section ${isPickupValid ? 'valid' : 'invalid'}`}>
        <h3 className="section-title">Pickup Details</h3>
        <div className="location-fields">
          <div className="flag-placeholder">
            {localFormData.pickup.country.flag && (
              <img
                src={localFormData.pickup.country.flag}
                alt="Pickup Country Flag"
                className="flag-image"
              />
            )}
          </div>
          <div className="field-group">
            <label className="field-label">Country</label>
            <CountrySelect
              onCountrySelect={(code, flag) => handleCountrySelect('pickup', code, flag)}
              onNextFieldFocus={() => pickupPscRef.current?.focus()}
              initialValue={localFormData.pickup.country.code}
              locationType="pickup"
            />
          </div>
          <PostalCitySelect
            pscRef={pickupPscRef}
            onValidSelection={() => {}}
            onSelectionChange={(psc, city, record) => handlePostalCityChange('pickup', psc, city, record)}
            locationType="pickup"
            code={localFormData.pickup.country.code}
            dbPostalCodeMask={postalFormats[localFormData.pickup.country.code]?.format || ''}
            postalCodeRegex={postalFormats[localFormData.pickup.country.code]?.regex}
            value={localFormData.pickup.psc} // controlled value for PSC
            initialCity={localFormData.pickup.city}
          />
        </div>
        <div className="datetime-field">
          <label className="field-label">Loading Time</label>
          <input
            type="datetime-local"
            value={localFormData.pickup.time}
            onChange={(e) => handleTimeChange('pickup', e.target.value)}
            className="datetime-input"
          />
        </div>
      </div>

      {/* Delivery Section */}
      <div className={`form-section ${isDeliveryValid ? 'valid' : 'invalid'}`}>
        <h3 className="section-title">Delivery Details</h3>
        <div className="location-fields">
          <div className="flag-placeholder">
            {localFormData.delivery.country.flag && (
              <img
                src={localFormData.delivery.country.flag}
                alt="Delivery Country Flag"
                className="flag-image"
              />
            )}
          </div>
          <div className="field-group">
            <label className="field-label">Country</label>
            <CountrySelect
              onCountrySelect={(code, flag) => handleCountrySelect('delivery', code, flag)}
              onNextFieldFocus={() => deliveryPscRef.current?.focus()}
              initialValue={localFormData.delivery.country.code}
              locationType="delivery"
            />
          </div>
          <PostalCitySelect
            pscRef={deliveryPscRef}
            onValidSelection={() => {}}
            onSelectionChange={(psc, city, record) => handlePostalCityChange('delivery', psc, city, record)}
            locationType="delivery"
            code={localFormData.delivery.country.code}
            dbPostalCodeMask={postalFormats[localFormData.delivery.country.code]?.format || ''}
            postalCodeRegex={postalFormats[localFormData.delivery.country.code]?.regex}
            value={localFormData.delivery.psc} // controlled value for PSC
            initialCity={localFormData.delivery.city}
          />
        </div>
        <div className="datetime-field">
          <label className="field-label">Delivery Time</label>
          <input
            type="datetime-local"
            value={localFormData.delivery.time}
            onChange={(e) => handleTimeChange('delivery', e.target.value)}
            className="datetime-input"
          />
        </div>
      </div>

      {/* Cargo Section */}
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

      <button type="submit" className="submit-button" disabled={!isPickupValid || !isDeliveryValid}>
        Submit Transport Request
      </button>
    </form>
  );
};

export default ManualSearchForm;
