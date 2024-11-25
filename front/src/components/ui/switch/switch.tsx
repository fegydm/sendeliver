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
      className={`relative w-10 h-6 bg-gray-300 dark:bg-gray-700 rounded-full transition-colors ${
        value ? "bg-green-600" : "bg-gray-300"
      }`}
      onClick={toggleValue}
    >
      <span
        className={`absolute top-1 ${value ? "right-1" : "left-1"} w-4 h-4 bg-black rounded-full shadow transition-transform`}
      />
    </button>
  );
};

export default Switch;
