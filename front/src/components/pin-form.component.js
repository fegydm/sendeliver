// ./front/src/components/pin-form.component.js

import React, { useState } from 'react';

const PinForm = ({ onCorrectPin }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const correctPin = '2024'; // Tu nastav svoj PIN

  const handlePinChange = (e) => {
    const value = e.target.value;
    // Povoľ len čísla a max 4 znaky
    if (value.length <= 4 && /^\d*$/.test(value)) {
      setPin(value);
      setError(false);
      
      // Automatická kontrola pri zadaní 4 čísel
      if (value.length === 4) {
        if (value === correctPin) {
          onCorrectPin();
        } else {
          setError(true);
          setTimeout(() => {
            setPin('');
            setError(false);
          }, 1500);
        }
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (pin === correctPin) {
      onCorrectPin();
    } else {
      setError(true);
      setTimeout(() => {
        setPin('');
        setError(false);
      }, 1500);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-90 backdrop-blur-lg z-50">
      <form 
        onSubmit={handleSubmit} 
        className={`bg-white p-8 rounded-lg shadow-xl transition-all duration-300 ${error ? 'shake' : ''}`}
      >
        <h2 className="text-2xl font-bold mb-4 text-center">Zadajte PIN</h2>
        <div className="flex gap-2 mb-6">
          {[...Array(4)].map((_, i) => (
            <div 
              key={i} 
              className={`w-12 h-12 border-2 ${
                error ? 'border-red-500' : 'border-gray-300'
              } rounded-lg flex items-center justify-center text-2xl font-bold`}
            >
              {pin[i] ? '•' : ''}
            </div>
          ))}
        </div>
        <input
          type="password"
          value={pin}
          onChange={handlePinChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" // Zvýraznené aktívne pole
          autoFocus
        />
        {error && (
          <p className="text-red-500 text-center mb-4">Nesprávny PIN</p>
        )}
      </form>
    </div>
  );
};

export default PinForm;
