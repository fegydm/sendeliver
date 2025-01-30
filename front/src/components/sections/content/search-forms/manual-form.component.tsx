// File: src/components/sections/content/search-forms/manual-form.component.tsx
// Last change: Added LocationSelect for postal code and city fields

import React, { useState, useRef } from 'react';
import CountrySelect from './CountrySelect';
import LocationSelect from './LocationSelect';
import "@/styles/sections/manual-form.component.css";

interface FormData {
  pickup: {
    country: {
      code: string;
      flag: string;
    };
    postalCode: string;
    city: string;
    loadingTime: string;
  };
  delivery: {
    country: {
      code: string;
      flag: string;
    };
    postalCode: string;
    city: string;
    deliveryTime: string;
  };
  cargo: {
    pallets: number;
    weight: number;
  };
}

const ManualSearchForm: React.FC = () => {
  // Refs for postal code inputs
  const pickupPostalRef = useRef<HTMLInputElement>(null);
  const deliveryPostalRef = useRef<HTMLInputElement>(null);

  // Form state
  const [formData, setFormData] = useState<FormData>({
    pickup: {
      country: { code: '', flag: '' },
      postalCode: '',
      city: '',
      loadingTime: ''
    },
    delivery: {
      country: { code: '', flag: '' },
      postalCode: '',
      city: '',
      deliveryTime: ''
    },
    cargo: {
      pallets: 0,
      weight: 0
    }
  });

  // Handle country selection
  const handleCountrySelect = (type: 'pickup' | 'delivery', code: string, flag: string) => {
    setFormData(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        country: { code, flag },
        postalCode: '',
        city: ''
      }
    }));
  };

  // Handle location selection
  const handleLocationSelect = (type: 'pickup' | 'delivery', location: { postal_code: string; place_name: string }) => {
    setFormData(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        postalCode: location.postal_code,
        city: location.place_name
      }
    }));
  };

  // Focus management for postal code fields
  const focusPostalCode = (type: 'pickup' | 'delivery') => {
    if (type === 'pickup') {
      pickupPostalRef.current?.focus();
    } else {
      deliveryPostalRef.current?.focus();
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitting form:', formData);
  };

  return (
    <form className="manual-form" onSubmit={handleSubmit}>
      {/* Pickup section */}
      <div className="form-section">
        <h3 className="section-title">Pickup Details</h3>
        
        <div className="location-fields">
          {/* Flag placeholder */}
          <div className="flag-placeholder">
            {formData.pickup.country.flag && (
              <img 
                src={formData.pickup.country.flag} 
                alt="Pickup Country Flag" 
                className="flag-image"
              />
            )}
          </div>
          
          {/* Country select with dropdown */}
          <div className="field-group">
            <label className="field-label">Country</label>
            <CountrySelect
              onCountrySelect={(code, flag) => handleCountrySelect('pickup', code, flag)}
              onNextFieldFocus={() => focusPostalCode('pickup')}
              initialValue={formData.pickup.country.code}
            />
          </div>
          
          {/* Location select for postal code and city */}
          <LocationSelect
            countryCode={formData.pickup.country.code}
            onLocationSelect={(location) => handleLocationSelect('pickup', location)}
            initialPostalCode={formData.pickup.postalCode}
            initialCity={formData.pickup.city}
            postalCodeRef={pickupPostalRef}
          />
        </div>

        <div className="datetime-field">
          <label className="field-label">Loading Time</label>
          <input
            type="datetime-local"
            value={formData.pickup.loadingTime}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              pickup: { ...prev.pickup, loadingTime: e.target.value }
            }))}
            className="datetime-input"
          />
        </div>
      </div>

      {/* Delivery section */}
      <div className="form-section">
        <h3 className="section-title">Delivery Details</h3>
        
        <div className="location-fields">
          <div className="flag-placeholder">
            {formData.delivery.country.flag && (
              <img 
                src={formData.delivery.country.flag} 
                alt="Delivery Country Flag" 
                className="flag-image"
              />
            )}
          </div>
          
          <div className="field-group">
            <label className="field-label">Country</label>
            <CountrySelect
              onCountrySelect={(code, flag) => handleCountrySelect('delivery', code, flag)}
              onNextFieldFocus={() => focusPostalCode('delivery')}
              initialValue={formData.delivery.country.code}
            />
          </div>
          
          <LocationSelect
            countryCode={formData.delivery.country.code}
            onLocationSelect={(location) => handleLocationSelect('delivery', location)}
            initialPostalCode={formData.delivery.postalCode}
            initialCity={formData.delivery.city}
            postalCodeRef={deliveryPostalRef}
          />
        </div>

        <div className="datetime-field">
          <label className="field-label">Delivery Time</label>
          <input
            type="datetime-local"
            value={formData.delivery.deliveryTime}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              delivery: { ...prev.delivery, deliveryTime: e.target.value }
            }))}
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
              value={formData.cargo.pallets}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                cargo: { ...prev.cargo, pallets: Number(e.target.value) }
              }))}
              min="0"
              className="form-input"
            />
          </div>
          <div className="field-group">
            <label className="field-label">Total Weight (kg)</label>
            <input
              type="number"
              value={formData.cargo.weight}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                cargo: { ...prev.cargo, weight: Number(e.target.value) }
              }))}
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
        disabled={
          !formData.pickup.country.code ||
          !formData.pickup.postalCode ||
          !formData.pickup.city ||
          !formData.delivery.country.code ||
          !formData.delivery.postalCode ||
          !formData.delivery.city
        }
      >
        Submit Transport Request
      </button>
    </form>
  );
};

export default ManualSearchForm;