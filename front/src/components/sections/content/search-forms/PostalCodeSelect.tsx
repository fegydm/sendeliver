// File: src/components/sections/content/search-forms/postal-code-select.component.tsx
// Last change: Restored original postal code input logic

import React, { useState } from 'react';

interface PostalCode {
  code: string;
  city?: string;
  country?: string;
}

interface PostalCodeSelectProps {
  countryCode?: string;
  onPostalCodeSelect: (postalCode: PostalCode) => void;
  initialCode?: string;
}

const PostalCodeSelect: React.FC<PostalCodeSelectProps> = ({
  countryCode,
  onPostalCodeSelect,
  initialCode = ''
}) => {
  const [postalCode, setPostalCode] = useState(initialCode);

  const handlePostalCodeChange = (value: string) => {
    // Limit to 8 characters
    const sanitizedValue = value.replace(/[^0-9]/g, '').slice(0, 8);
    setPostalCode(sanitizedValue);

    // Optional: Add logic to fetch postal code details if needed
    if (sanitizedValue.length >= 3) {
      onPostalCodeSelect({
        code: sanitizedValue,
        country: countryCode
      });
    }
  };

  return (
    <div className="postal-code-select">
      <input
        type="text"
        value={postalCode}
        onChange={(e) => handlePostalCodeChange(e.target.value)}
        placeholder="Postal Code"
        maxLength={8}
        className="form-input"
        disabled={!countryCode}
      />
    </div>
  );
};

export default PostalCodeSelect;