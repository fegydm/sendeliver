// src/components/ui/toggle-group.ui.tsx
import * as React from "react";
import "./toggle-group.ui.css";
import themeConfig from "@/configs/theme-config.json";

type ToggleGroupValue = string | string[];

interface ToggleGroupProps {
  type?: "single" | "multiple";
  value?: ToggleGroupValue;
  defaultValue?: ToggleGroupValue;
  onValueChange?: (value: ToggleGroupValue) => void;
  disabled?: boolean;
  className?: string;
  label?: string; // Add label prop
  children: React.ReactNode;
}

interface ToggleItemProps {
  value: string;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
}

const ToggleGroupContext = React.createContext<{
  type: "single" | "multiple";
  value?: ToggleGroupValue;
  onValueChange?: (value: ToggleGroupValue) => void;
  disabled?: boolean;
}>({
  type: "single",
});

const ToggleGroup = React.forwardRef<HTMLDivElement, ToggleGroupProps>(
  (
    {
      type = "single",
      value,
      defaultValue,
      onValueChange,
      disabled = false,
      className = "",
      label, // Destructure label prop
      children,
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = React.useState<ToggleGroupValue>(
      value ?? defaultValue ?? (type === "multiple" ? [] : "")
    );

    React.useEffect(() => {
      if (value !== undefined) {
        setInternalValue(value);
      }
    }, [value]);

    const handleValueChange = (newValue: ToggleGroupValue) => {
      setInternalValue(newValue);
      onValueChange?.(newValue);
    };

    const activeColor = themeConfig.button.base.backgroundColor;
    const baseStyles = themeConfig.button.base;

    return (
      <ToggleGroupContext.Provider
        value={{
          type,
          value: internalValue,
          onValueChange: handleValueChange,
          disabled,
        }}
      >
        <div
          ref={ref}
          role={type === "single" ? "radiogroup" : "group"}
          className={`toggle-group ${disabled ? "opacity-50" : ""} ${className}`}
          style={
            {
              "--background-color": baseStyles.backgroundColor,
              "--color": baseStyles.color,
              "--active-color": activeColor,
            } as React.CSSProperties
          }
        >
          {label && <label className="toggle-label">{label}</label>}{" "}
          {/* Add label */}
          {children}
        </div>
      </ToggleGroupContext.Provider>
    );
  }
);

ToggleGroup.displayName = "ToggleGroup";

const ToggleGroupItem = React.forwardRef<HTMLButtonElement, ToggleItemProps>(
  ({ value, disabled = false, className = "", children }, ref) => {
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

    const handleClick = () => {
      if (disabled || groupDisabled) return;

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
        disabled={disabled || groupDisabled}
        className={`toggle-item ${isSelected ? "active" : ""} ${className}`}
        onClick={handleClick}
      >
        {children}
      </button>
    );
  }
);

ToggleGroupItem.displayName = "ToggleGroupItem";

export { ToggleGroup, ToggleGroupItem };
