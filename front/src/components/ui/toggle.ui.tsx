// src/components/ui/toggle.ui.tsx
import React from "react";
import "./toggle.ui.css";

export interface ToggleProps {
  initialState?: boolean;
}

const Toggle: React.FC<ToggleProps> = ({ initialState = false }) => {
  return (
    <div className="toggle-container">
      <input
        type="checkbox"
        id="toggle"
        className="toggle-checkbox"
        defaultChecked={initialState}
      />
      <label htmlFor="toggle" className="toggle-label">
        <span className="toggle-inner"></span>
        <span className="toggle-switch"></span>
      </label>
    </div>
  );
};

export default Toggle;
