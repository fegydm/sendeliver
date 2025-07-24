// src/components/ui/toggle-group.ui.tsx
import * as React from "react";

/** Context to manage shared state between ToggleGroup and ToggleGroupItem */
interface ToggleGroupContextValue {
  type: "single" | "multiple";
  value?: ToggleGroupValue;
  onValueChange?: (value: ToggleGroupValue) => void;
  disabled?: boolean;
}

const ToggleGroupContext = React.createContext<toggleGroupContextValue>({
  type: "single",
});

/** Type definitions for ToggleGroup and its items */
type ToggleGroupValue = string | string[];

interface ToggleGroupProps {
  type?: "single" | "multiple";
  value?: ToggleGroupValue;
  onValueChange?: (value: ToggleGroupValue) => void;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
}

interface ToggleItemProps
  extends React.ButtonHTMLAttributes<hTMLButtonElement> {
  value: string;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
}

/** Main ToggleGroup component */
const ToggleGroup = React.forwardRef<hTMLDivElement, ToggleGroupProps>(
  (
    {
      type = "single",
      value,
      onValueChange,
      disabled = false,
      className = "",
      children,
    },
    ref
  ) => {
    const contextValue = React.useMemo(
      () => ({ type, value, onValueChange, disabled }),
      [type, value, onValueChange, disabled]
    );

    return (
      <ToggleGroupContext.Provider value={contextValue}>
        <div
          ref={ref}
          role={type === "single" ? "radiogroup" : "group"}
          aria-disabled={disabled}
          className={`toggle-group ${disabled ? "toggle-group--disabled" : ""} ${className}`.trim()}
        >
          {children}
        </div>
      </ToggleGroupContext.Provider>
    );
  }
);
ToggleGroup.displayName = "ToggleGroup";

/** ToggleGroupItem component for individual toggle buttons */
const ToggleGroupItem = React.forwardRef<hTMLButtonElement, ToggleItemProps>(
  ({ value, disabled = false, className = "", children, ...props }, ref) => {
    const {
      type,
      value: groupValue,
      onValueChange,
      disabled: groupDisabled,
    } = React.useContext(ToggleGroupContext);

    const isSelected =
      type === "single"
        ? groupValue === value
        : Array.isArray(groupValue) && groupValue.includes(value);

    const isDisabled = disabled || groupDisabled;

    const handleClick = () => {
      if (isDisabled) return;
      if (type === "single") {
        onValueChange?.(value);
      } else if (Array.isArray(groupValue)) {
        const newValue = isSelected
          ? groupValue.filter((v) => v !== value)
          : [...groupValue, value];
        onValueChange?.(newValue);
      }
    };

    return (
      <button
        ref={ref}
        type="button"
        role={type === "single" ? "radio" : "checkbox"}
        aria-checked={isSelected}
        disabled={isDisabled}
        className={`toggle-item ${isSelected ? "toggle-item--selected" : ""} ${
          isDisabled ? "toggle-item--disabled" : ""
        } ${className}`.trim()}
        onClick={handleClick}
        {...props}
      >
        {children}
      </button>
    );
  }
);
ToggleGroupItem.displayName = "ToggleGroupItem";

/** Exported components and types */
export { ToggleGroup, ToggleGroupItem };
export type { ToggleGroupProps, ToggleItemProps, ToggleGroupValue };
