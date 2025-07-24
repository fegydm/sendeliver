// File: src/pages/pin-form-luke.container.tsx
import React, { useState, useEffect, useRef } from 'react';
// import './pin-form.comp.css'; // Importing the CSS file for styling

// Props definition for the component
interface PinFormProps {
  onCorrectPin: () => void; // Callback function to trigger when the correct PIN is entered
}

// Functional component for the PIN input form
const PinForm: React.FC<PinFormProps> = ({ onCorrectPin }) => {
  const [pin, setPin] = useState<string>(''); // State to store the PIN input
  const [error, setError] = useState<boolean>(false); // State to track errors
  const correctPin = '1810'; // The correct PIN value
  const inputRef = useRef<HTMLInputElement>(null); // Reference to the hidden input field

  // Automatically focus on the input field when the component is mounted
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Handles changes in the PIN input field
  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Validates input to ensure it's numeric and up to 4 characters
    if (value.length <= 4 && /^\d*$/.test(value)) {
      setPin(value); // Updates the PIN value
      setError(false); // Resets error state

      // Checks the PIN when 4 characters are entered
      if (value.length === 4) {
        if (value === correctPin) {
          onCorrectPin(); // Calls the callback if the PIN is correct
        } else {
          setError(true); // Shows error state
          setTimeout(() => {
            setPin(''); // Resets the PIN input
            setError(false); // Hides the error
          }, 1500); // Error state timeout duration
        }
      }
    }
  };

  // Handles the form submission
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Prevents default form submission behavior

    // Checks if the entered PIN is correct
    if (pin === correctPin) {
      onCorrectPin(); // Calls the callback if the PIN is correct
    } else {
      setError(true); // Shows error state
      setTimeout(() => {
        setPin(''); // Resets the PIN input
        setError(false); // Hides the error
      }, 1500); // Error state timeout duration
    }
  };

  return (
    <div 
      className="pin-form-container" 
      onClick={() => inputRef.current?.focus()} // Focuses on the input when the container is clicked
    >
      <form 
        onSubmit={handleSubmit} 
        className={`pin-form ${error ? 'error' : ''}`} // Applies 'error' class conditionally
      >
        <h2 className="pin-form-title">Enter PIN</h2> {/* Form title */}
        <div className="pin-inputs">
          {/* Renders 4 placeholders for the PIN digits */}
          {[...Array(4)].map((_, i) => (
            <div 
              key={i} 
              className={`pin-input 
                ${error ? 'pin-input-error' : ''} 
                ${pin.length === i ? 'pin-input-active' : ''}`} // Conditional styling
            >
              {pin[i] ? pin[i] : ''} {/* Displays entered digits */}
            </div>
          ))}
        </div>
        <input
          ref={inputRef} // Ref to access the input
          type="tel" // Input type for numeric input
          value={pin} // Binds the input value to the state
          onChange={handlePinChange} // Handles changes in input
          className="hidden-input" // Hidden input field
          maxLength={4} // Restricts input length to 4 characters
          autoComplete="off" // Disables auto-complete
          autoCorrect="off" // Disables auto-correct
          spellCheck="false" // Disables spell check
          autoFocus // Automatically focuses on the input
        />
        {error && (
          <p className="error-message">Incorrect PIN</p> // Error message displayed on incorrect PIN
        )}
      </form>
    </div>
  );
};

export default PinForm; // Exports the component
