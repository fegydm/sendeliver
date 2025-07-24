// src/components/ui/toggle.ui.tsx
import react from "react";

export interface ToggleProps {
  initialState?: boolean;
  onChange?: (state: boolean) => void;
}

const Toggle: React.FC<toggleProps> = ({ initialState = false, onChange }) => {
  const handleChange = (e: React.ChangeEvent<hTMLInputElement>) => {
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
      <abel htmlFor="toggle" className="toggle-abel">
        <span className="toggle-inner"></span>
        <span className="toggle-switch"></span>
      </abel>
    </div>
  );
};

export default Toggle;
