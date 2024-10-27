// ./front/src/components/pin-form.component.js

import React, { useState, useEffect, useRef } from 'react';
import './PinForm.css'; // Importujeme CSS súbor

const PinForm = ({ onCorrectPin }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const correctPin = '2024'; // Nastav svoj PIN
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handlePinChange = (e) => {
    const value = e.target.value;
    if (value.length <= 4 && /^\d*$/.test(value)) {
      setPin(value);
      setError(false);
      
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
    <div className="pin-form-container" onClick={() => inputRef.current.focus()}>
      <form 
        onSubmit={handleSubmit} 
        className={`pin-form ${error ? 'error' : ''}`}
      >
        <h2 className="pin-form-title">Zadajte PIN</h2>
        <div className="pin-inputs">
          {[...Array(4)].map((_, i) => (
            <div 
              key={i} 
              className={`pin-input ${error ? 'pin-input-error' : ''} ${pin.length === i ? 'pin-input-active' : ''}`}
            >
              {pin[i] ? pin[i] : ''}
            </div>
          ))}
        </div>
        <input
          ref={inputRef}
          type="tel" 
          value={pin}
          onChange={handlePinChange}
          className="hidden-input"
          maxLength="4"
          autoComplete="off"
          autoCorrect="off"
          spellCheck="false"
          autoFocus
        />
        {error && (
          <p className="error-message">Nesprávny PIN</p>
        )}
      </form>
    </div>
  );
};

export default PinForm;
