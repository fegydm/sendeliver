// File: src/components/sections/content/search-forms/place-select.component.tsx
// Last change: Restored broader place input logic

import React, { useState } from 'react';

interface Place {
  name: string;
  postalCode?: string;
  country?: string;
}

interface PlaceSelectProps {
  countryCode?: string;
  postalCode?: string;
  onPlaceSelect: (place: Place) => void;
  initialName?: string;
}

const PlaceSelect: React.FC<PlaceSelectProps> = ({
  countryCode,
  postalCode,
  onPlaceSelect,
  initialName = ''
}) => {
  const [place, setPlace] = useState(initialName);

  const handlePlaceChange = (value: string) => {
    // Allow broader input
    setPlace(value);

    // Trigger selection when there's meaningful input
    if (value.trim().length > 0) {
      onPlaceSelect({
        name: value,
        postalCode: postalCode,
        country: countryCode
      });
    }
  };

  return (
    <div className="place-select">
      <input
        type="text"
        value={place}
        onChange={(e) => handlePlaceChange(e.target.value)}
        placeholder="City/Place"
        className="form-input"
        disabled={!countryCode || !postalCode}
      />
    </div>
  );
};

export default PlaceSelect;