// ./front/src/components/elements/pin-input.element.tsx
import React, { useState, useRef } from "react";

interface PinInputProps {
  length: number;
  onComplete: (pin: string) => void;
}

const PinInput: React.FC<PinInputProps> = ({ length, onComplete }) => {
  const [values, setValues] = useState<string[]>(Array(length).fill(""));
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  React.useEffect(() => {
    if (inputsRef.current[0]) {
      inputsRef.current[0].focus();
    }
  }, []);

  const handleChange = (index: number, value: string) => {
    // Allow only numbers
    if (!/^\d*$/.test(value)) return;

    if (value.length > 1) {
      // Handle paste events
      const digits = value.split("").slice(0, length - index);
      const newValues = [...values];
      digits.forEach((digit, i) => {
        if (index + i < length) {
          newValues[index + i] = digit;
        }
      });
      setValues(newValues);

      // Focus on appropriate field
      const nextIndex = Math.min(index + digits.length, length - 1);
      inputsRef.current[nextIndex]?.focus();
    } else {
      // Handle single digit input
      const newValues = [...values];
      newValues[index] = value;
      setValues(newValues);

      if (value && index < length - 1) {
        inputsRef.current[index + 1]?.focus();
      }
    }

    // Check completion
    const updatedValues = [...values];
    updatedValues[index] = value;
    if (updatedValues.every((val) => val.length === 1)) {
      onComplete(updatedValues.join(""));
    }
  };

  const handleKeyDown = (index: number, event: React.KeyboardEvent) => {
    if (event.key === "Backspace") {
      if (values[index] === "" && index > 0) {
        const newValues = [...values];
        newValues[index - 1] = "";
        setValues(newValues);
        inputsRef.current[index - 1]?.focus();
      } else {
        const newValues = [...values];
        newValues[index] = "";
        setValues(newValues);
      }
    }
  };

  return (
    <div className="flex space-x-2" role="group" aria-label="PIN input">
      {Array.from({ length }, (_, index) => (
        <input
          key={index}
          type="text"
          inputMode="numeric"
          pattern="\d*"
          maxLength={1}
          value={values[index]}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          ref={(el) => (inputsRef.current[index] = el)}
          aria-label={`PIN digit ${index + 1}`}
          className="w-12 h-12 text-center text-xl font-medium border rounded bg-gray-100 dark:bg-gray-800 dark:text-white focus:ring focus:ring-primary-500"
        />
      ))}
    </div>
  );
};

export default PinInput;
