// ./front/src/components/pin-form.component.tsx
import React, { useState, useEffect, useRef } from 'react';
import "@/styles/components/pin-form.component.css"

// Interface defining the props for the component
interface PinFormProps {
  onCorrectPin: () => void; // Callback function triggered on correct PIN
}

// Functional component for the PIN input form
const PinForm: React.FC<PinFormProps> = ({ onCorrectPin }) => {
  const [pin, setPin] = useState<string>(''); // State to store the entered PIN
  const [error, setError] = useState<boolean>(false); // State to indicate if there's an error
  const correctPin = '1212'; // The correct PIN value
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

    // Ensure input is numeric and does not exceed 4 digits
    if (value.length <= 4 && /^\d*$/.test(value)) {
      setPin(value); // Update the PIN state
      setError(false); // Reset error state

      // If PIN reaches 4 digits, check for correctness
      if (value.length === 4) {
        if (value === correctPin) {
          onCorrectPin(); // Trigger callback for correct PIN
        } else {
          setError(true); // Set error state for incorrect PIN
          setTimeout(() => {
            setPin(''); // Clear the PIN input
            setError(false); // Reset error state after timeout
          }, 1500); // 1.5 second delay for error feedback
        }
      }
    }
  };

  // Handles form submission
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Prevent form's default submission behavior

    // Check if the entered PIN is correct
    if (pin === correctPin) {
      onCorrectPin(); // Trigger callback for correct PIN
    } else {
      setError(true); // Set error state for incorrect PIN
      setTimeout(() => {
        setPin(''); // Clear the PIN input
        setError(false); // Reset error state after timeout
      }, 1500); // 1.5 second delay for error feedback
    }
  };

  return (
    <div 
      className="pin-form-container" 
      onClick={() => inputRef.current?.focus()} // Focus the input when the container is clicked
    >
      <form 
        onSubmit={handleSubmit} 
        className={`pin-form ${error ? 'error' : ''}`} // Add error class if there's an error
      >
        <h2 className="pin-form-title">Enter PIN</h2> {/* Form title */}
        <div className="pin-inputs">
          {/* Render 4 boxes representing the PIN digits */}
          {[...Array(4)].map((_, i) => (
            <div 
              key={i} 
              className={`pin-input 
                ${error ? 'pin-input-error' : ''} 
                ${pin.length === i ? 'pin-input-active' : ''}`} // Conditional classes for styles
            >
              {pin[i] ? pin[i] : ''} {/* Display the entered digit or leave empty */}
            </div>
          ))}
        </div>
        <input
          ref={inputRef} // Input field reference
          type="tel" // Input type restricted to numeric keyboard
          value={pin} // Bind the input value to the state
          onChange={handlePinChange} // Handle changes in the input
          className="hidden-input" // Hidden input for focus handling
          maxLength={4} // Restrict input length to 4 characters
          autoComplete="off" // Disable autocomplete
          autoCorrect="off" // Disable autocorrect
          spellCheck="false" // Disable spell check
          autoFocus // Automatically focus the input
        />
        {error && (
          <p className="error-message">Incorrect PIN</p> // Display error message if the PIN is incorrect
        )}
      </form>
    </div>
  );
};

export default PinForm; // Export the component
