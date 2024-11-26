// components/ui/input/input.component.tsx
import React from "react";
import { InputVariant, InputState, getInputClasses } from "./input.variants";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  variant?: InputVariant;
  state?: InputState;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      variant = "default",
      state = "normal",
      error,
      className,
      ...props
    },
    ref
  ) => {
    return (
      <div className="w-full">
        {label && <label className="block mb-2 text-modal-text">{label}</label>}
        <input
          ref={ref}
          className={getInputClasses(variant, state)}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
