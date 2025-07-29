// File: src/shared/ui/field/field.ui.tsx
// Last change: Created simple field component for basic form inputs

import React from "react";
import "./field.ui.css";

export interface FieldOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface FieldProps {
  /** Field type */
  type?: "text" | "number" | "email" | "password" | "tel" | "url" | "date" | "select" | "textarea";
  /** Field label */
  label?: string;
  /** Field value */
  value?: string | number;
  /** Change handler */
  onChange?: (value: string | number) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Whether field is required */
  required?: boolean;
  /** Whether field is disabled */
  disabled?: boolean;
  /** Error message */
  error?: string;
  /** Options for select type */
  options?: FieldOption[];
  /** Textarea rows */
  rows?: number;
  /** Additional CSS class */
  className?: string;
  /** Unique id for the field */
  id?: string;
  /** HTML attributes */
  [key: string]: any;
}

export const Field: React.FC<FieldProps> = ({
  type = "text",
  label,
  value = "",
  onChange,
  placeholder,
  required = false,
  disabled = false,
  error,
  options = [],
  rows = 3,
  className = "",
  id,
  ...props
}) => {
  const fieldId = id || `field-${Math.random().toString(36).substr(2, 9)}`;
  const errorId = `${fieldId}-error`;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    if (onChange) {
      const newValue = type === "number" ? Number(e.target.value) : e.target.value;
      onChange(newValue);
    }
  };

  const fieldClasses = [
    "field",
    error && "field--error",
    disabled && "field--disabled",
    className
  ].filter(Boolean).join(" ");

  const renderInput = () => {
    const commonProps = {
      id: fieldId,
      value: value,
      onChange: handleChange,
      placeholder,
      required,
      disabled,
      className: "field__input",
      "aria-invalid": !!error,
      "aria-describedby": error ? errorId : undefined,
      ...props
    };

    switch (type) {
      case "select":
        return (
          <select {...commonProps} className="field__select">
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option 
                key={option.value} 
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>
        );

      case "textarea":
        return (
          <textarea 
            {...commonProps} 
            rows={rows}
            className="field__textarea"
          />
        );

      default:
        return (
          <input 
            {...commonProps}
            type={type}
          />
        );
    }
  };

  return (
    <div className={fieldClasses}>
      {label && (
        <label htmlFor={fieldId} className="field__label">
          {label}
          {required && <span className="field__required">*</span>}
        </label>
      )}
      
      <div className="field__wrapper">
        {renderInput()}
      </div>

      {error && (
        <div id={errorId} className="field__error" role="alert">
          {error}
        </div>
      )}
    </div>
  );
};

export default Field;