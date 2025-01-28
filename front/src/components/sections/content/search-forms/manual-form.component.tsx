// File: src/components/sections/content/search-forms/ManualSearchForm.tsx
// Last change: Integrated modular location search components with CSS styling

import React, { useState } from 'react';
// import { FormData } from "@/types/ai.types";
import CountrySelect from './CountrySelect';
import PostalCodeSelect from './PostalCodeSelect';
import PlaceSelect from './PlaceSelect';
import "@/styles/sections/manual-form.component.css";

interface CountryInfo {
  code: string;
  flag: string;
}

interface LocationDetails {
  country: CountryInfo;
  postalCode: string;
  city: string;
}

interface TransportRequest {
  pickupDetails: LocationDetails;
  deliveryDetails: LocationDetails;
  scheduleDetails: {
    loadingDateTime: string;
    deliveryDateTime: string;
  };
  cargoDetails: {
    palletCount: number;
    totalWeight: number;
  };
}

const ManualSearchForm: React.FC = () => {
  const [transportRequest, setTransportRequest] = useState<TransportRequest>({
    pickupDetails: {
      country: { 
        code: '', 
        flag: '' 
      },
      postalCode: '',
      city: ''
    },
    deliveryDetails: {
      country: { 
        code: '', 
        flag: '' 
      },
      postalCode: '',
      city: ''
    },
    scheduleDetails: {
      loadingDateTime: '',
      deliveryDateTime: ''
    },
    cargoDetails: {
      palletCount: 0,
      totalWeight: 0
    }
  });

  const updateTransportRequest = <K extends keyof TransportRequest>(
    section: K, 
    updates: Partial<TransportRequest[K]>
  ) => {
    setTransportRequest(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        ...updates
      }
    }));
  };

  const handleCountrySelect = (
    section: 'pickupDetails' | 'deliveryDetails', 
    countryCode: string, 
    flagPath: string
  ) => {
    updateTransportRequest(section, {
      country: { 
        code: countryCode, 
        flag: flagPath 
      },
      postalCode: '',
      city: ''
    });
  };

  const handleSubmit = () => {
    console.log(transportRequest);
  };

  return (
    <div className="transport-request-form">
      <h2>Transport Request</h2>

      <div className="pickup-details">
        <h3>Pickup Details</h3>
        <div className="location-row">
          <div className="country-selection">
            {transportRequest.pickupDetails.country.flag && (
              <img 
                src={transportRequest.pickupDetails.country.flag} 
                alt="Pickup Country Flag" 
                className="country-flag"
              />
            )}
            <CountrySelect
              onCountrySelect={(code, flag) => 
                handleCountrySelect('pickupDetails', code, flag)
              }
              initialValue={transportRequest.pickupDetails.country.code}
            />
          </div>

          <PostalCodeSelect
            countryCode={transportRequest.pickupDetails.country.code}
            onPostalCodeSelect={(postalCode) => 
              updateTransportRequest('pickupDetails', { 
                postalCode: postalCode.code,
                city: postalCode.city || '' 
              })
            }
            initialCode={transportRequest.pickupDetails.postalCode}
          />

          <PlaceSelect
            countryCode={transportRequest.pickupDetails.country.code}
            postalCode={transportRequest.pickupDetails.postalCode}
            onPlaceSelect={(place) => 
              updateTransportRequest('pickupDetails', { 
                city: place.name 
              })
            }
            initialName={transportRequest.pickupDetails.city}
          />
        </div>
      </div>

      <div className="delivery-details">
        <h3>Delivery Details</h3>
        <div className="location-row">
          <div className="country-selection">
            {transportRequest.deliveryDetails.country.flag && (
              <img 
                src={transportRequest.deliveryDetails.country.flag} 
                alt="Delivery Country Flag" 
                className="country-flag"
              />
            )}
            <CountrySelect
              onCountrySelect={(code, flag) => 
                handleCountrySelect('deliveryDetails', code, flag)
              }
              initialValue={transportRequest.deliveryDetails.country.code}
            />
          </div>

          <PostalCodeSelect
            countryCode={transportRequest.deliveryDetails.country.code}
            onPostalCodeSelect={(postalCode) => 
              updateTransportRequest('deliveryDetails', { 
                postalCode: postalCode.code,
                city: postalCode.city || '' 
              })
            }
            initialCode={transportRequest.deliveryDetails.postalCode}
          />

          <PlaceSelect
            countryCode={transportRequest.deliveryDetails.country.code}
            postalCode={transportRequest.deliveryDetails.postalCode}
            onPlaceSelect={(place) => 
              updateTransportRequest('deliveryDetails', { 
                city: place.name 
              })
            }
            initialName={transportRequest.deliveryDetails.city}
          />
        </div>
      </div>

      <div className="datetime-section">
        <div className="loading-datetime">
          <label>Loading Date/Time</label>
          <input
            type="datetime-local"
            value={transportRequest.scheduleDetails.loadingDateTime}
            onChange={(e) => updateTransportRequest('scheduleDetails', {
              loadingDateTime: e.target.value
            })}
          />
        </div>
        <div className="delivery-datetime">
          <label>Delivery Date/Time</label>
          <input
            type="datetime-local"
            value={transportRequest.scheduleDetails.deliveryDateTime}
            onChange={(e) => updateTransportRequest('scheduleDetails', {
              deliveryDateTime: e.target.value
            })}
          />
        </div>
      </div>

      <div className="cargo-details">
        <div>
          <label>Number of Pallets</label>
          <input
            type="number"
            value={transportRequest.cargoDetails.palletCount}
            onChange={(e) => updateTransportRequest('cargoDetails', {
              palletCount: Number(e.target.value)
            })}
            min="0"
          />
        </div>
        <div>
          <label>Total Weight (kg)</label>
          <input
            type="number"
            value={transportRequest.cargoDetails.totalWeight}
            onChange={(e) => updateTransportRequest('cargoDetails', {
              totalWeight: Number(e.target.value)
            })}
            min="0"
            step="0.1"
          />
        </div>
      </div>

      <button 
        onClick={handleSubmit}
        disabled={
          !transportRequest.pickupDetails.country.code ||
          !transportRequest.pickupDetails.postalCode ||
          !transportRequest.pickupDetails.city ||
          !transportRequest.deliveryDetails.country.code ||
          !transportRequest.deliveryDetails.postalCode ||
          !transportRequest.deliveryDetails.city
        }
      >
        Submit Transport Request
      </button>
    </div>
  );
};

export default ManualSearchForm;