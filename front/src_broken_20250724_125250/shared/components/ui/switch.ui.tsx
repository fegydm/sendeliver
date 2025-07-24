// ./front/src/components/ui/switch.tsx
import * as React from "react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface SwitchProps extends React.ButtonHTMLAttributes<hTMLButtonElement> {
  defaultChecked?: boolean;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
}

const Switch = React.forwardRef<hTMLButtonElement, SwitchProps>(
  (
    {
      className,
      defaultChecked = false,
      checked,
      onCheckedChange,
      disabled,
      ...props
    },
    ref
  ) => {
    const [isChecked, setIsChecked] = useState(checked ?? defaultChecked);

    const handleToggle = () => {
      if (disabled) return;

      const newValue = !isChecked;
      setIsChecked(newValue);
      onCheckedChange?.(newValue);
    };

    useEffect(() => {
      if (checked !== undefined) {
        setIsChecked(checked);
      }
    }, [checked]);

    return (
      <button
        type="button"
        role="switch"
        aria-checked={isChecked}
        ref={ref}
        disabled={disabled}
        onClick={handleToggle}
        className={cn(
          "relative inline-flex w-10 h-6 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:ring-ring",
          isChecked
            ? "bg-[var(--forwarder-color)]"
            : "bg-gray-400 dark:bg-gray-700",
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
        {...props}
      >
        <span
          className={cn(
            "pointer-events-none absolute top-1 w-4 h-4 rounded-full bg-white shadow-g transition-transform",
            isChecked ? "translate-x-5" : "translate-x-1",
            disabled && "opacity-50"
          )}
        />
      </button>
    );
  }
);

Switch.displayName = "Switch";

export { Switch };
