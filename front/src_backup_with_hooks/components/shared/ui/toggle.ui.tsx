// src/components/ui/toggle.ui.tsx
import React from "react";

export interface ToggleProps {
  initialState?: boolean;
  onChange?: (state: boolean) => void;
}

const Toggle: React.FC<ToggleProps> = ({ initialState = false, onChange }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.checked);
  };

  return (
    <div className="toggle-container">
      <input
        type="checkbox"
        id="toggle"
        className="toggle-checkbox"
        defaultChecked={initialState}
        onChange={handleChange}
      />
      <label htmlFor="toggle" className="toggle-label">
        <span className="toggle-inner"></span>
        <span className="toggle-switch"></span>
      </label>
    </div>
  );
};

export default Toggle;
