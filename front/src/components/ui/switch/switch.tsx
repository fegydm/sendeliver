import React, { useState } from "react";

interface SwitchProps {
  defaultValue?: boolean;
  onChange?: (value: boolean) => void;
}

const Switch: React.FC<SwitchProps> = ({ defaultValue = false, onChange }) => {
  const [value, setValue] = useState(defaultValue);

  const toggleValue = () => {
    const newValue = !value;
    setValue(newValue);
    if (onChange) {
      onChange(newValue);
    }
  };

  return (
    <button
      className={`relative w-10 h-6 rounded-full transition-colors ${
        value ? "bg-[var(--forwarder-color)]" : "bg-gray-400 dark:bg-gray-700"
      }`}
      onClick={toggleValue}
    >
      <span
        className={`absolute top-1 ${value ? "right-[5px]" : "left-1"} w-4 h-4 bg-gray-500 hover:bg-gray-600 rounded-full shadow transition-transform`}
      >
        <span className="sr-only">Switch Knob</span>
      </span>
      <span className="sr-only">Switch Container</span>
    </button>
  );
};

export default Switch;
