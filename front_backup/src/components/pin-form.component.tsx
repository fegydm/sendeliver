// ./front/src/components/pin-form.component.tsx
import React, { useState, useEffect, useRef } from 'react';
import './pin-form.component.css'; // Importujeme CSS súbor

interface PinFormProps {
  onCorrectPin: () => void;
}

const PinForm: React.FC<PinFormProps> = ({ onCorrectPin }) => {
  const [pin, setPin] = useState<string>('');
  const [error, setError] = useState<boolean>(false);
  const correctPin = '1212'; // Nastav svoj PIN
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
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
    <div className="pin-form-container" onClick={() => inputRef.current?.focus()}>
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
          maxLength={4}
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
