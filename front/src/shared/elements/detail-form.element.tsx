// File: src/shared/elements/detail-form/detail-form.element.tsx
// Last change: Created universal detail form element for consistent form layouts

import React from "react";
import { Field, FieldOption } from "@/shared/ui/field/field.ui";
import "./detail-form.element.css";

export interface DetailFormField {
  /** Unique field key */
  key: string;
  /** Field label */
  label: string;
  /** Field type */
  type?: "text" | "number" | "email" | "password" | "tel" | "url" | "date" | "select" | "textarea";
  /** Field value */
  value: string | number;
  /** Options for select fields */
  options?: FieldOption[];
  /** Whether field is required */
  required?: boolean;
  /** Whether field is disabled */
  disabled?: boolean;
  /** Placeholder text */
  placeholder?: string;
  /** Textarea rows (for textarea type) */
  rows?: number;
  /** Custom validation error */
  error?: string;
  /** Additional field props */
  fieldProps?: Record<string, any>;
}

export interface DetailFormProps {
  /** Form title */
  title?: string;
  /** Array of form fields */
  fields: DetailFormField[];
  /** Change handler for field values */
  onChange: (fieldKey: string, value: string | number) => void;
  /** Form layout - single column or two columns */
  layout?: "single" | "two-column";
  /** Additional CSS class */
  className?: string;
  /** Loading state */
  isLoading?: boolean;
  /** Whether form is read-only */
  readOnly?: boolean;
  /** Custom header content */
  headerContent?: React.ReactNode;
  /** Custom footer content */
  footerContent?: React.ReactNode;
}

export const DetailForm: React.FC<DetailFormProps> = ({
  title,
  fields,
  onChange,
  layout = "single",
  className = "",
  isLoading = false,
  readOnly = false,
  headerContent,
  footerContent,
}) => {
  const formClasses = [
    "detail-form",
    `detail-form--${layout}`,
    isLoading && "detail-form--loading",
    readOnly && "detail-form--read-only",
    className
  ].filter(Boolean).join(" ");

  const handleFieldChange = (fieldKey: string, value: string | number) => {
    if (!readOnly && !isLoading) {
      onChange(fieldKey, value);
    }
  };

  return (
    <div className={formClasses}>
      {/* Header section */}
      {(title || headerContent) && (
        <div className="detail-form__header">
          {title && <h3 className="detail-form__title">{title}</h3>}
          {headerContent}
        </div>
      )}

      {/* Loading overlay */}
      {isLoading && (
        <div className="detail-form__loading">
          <div className="detail-form__spinner" />
          <span>Loading...</span>
        </div>
      )}

      {/* Form fields */}
      <div className="detail-form__content">
        <div className="detail-form__fields">
          {fields.map((field) => (
            <div key={field.key} className="detail-form__field">
              <Field
                type={field.type}
                label={field.label}
                value={field.value}
                onChange={(value) => handleFieldChange(field.key, value)}
                options={field.options}
                required={field.required}
                disabled={field.disabled || readOnly || isLoading}
                placeholder={field.placeholder}
                rows={field.rows}
                error={field.error}
                {...field.fieldProps}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Footer section */}
      {footerContent && (
        <div className="detail-form__footer">
          {footerContent}
        </div>
      )}
    </div>
  );
};

export default DetailForm;