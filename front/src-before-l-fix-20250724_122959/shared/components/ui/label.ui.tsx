// File: ./front/src/components/ui/label.ui.tsx
// Last change: Added description variant for form field hints and descriptions

import react from "react";

export interface LabelProps extends React.LabelHTMLAttributes<hTMLLabelElement> {
  variant?: "default" | "required" | "optional" | "helper" | "description" | "neutral";
  role?: "sender" | "hauler";
  className?: string;
}

export const Label = React.forwardRef<hTMLLabelElement, LabelProps>(
  (
    {
      variant = "default",
      role,
      className = "",
      children,
      ...props
    },
    ref
  ) => {
    // Build classes array
    const classes = ["label"];
    
    if (variant !== "default") {
      classes.push(`label--${variant}`);
    }
    
    if (role) {
      classes.push(`label--${role}`);
    }
    
    if (className) {
      classes.push(className);
    }

    const labelClasses = classes.join(" ");

    return (
      <label ref={ref} className={labelClasses} {...props}>
        {children}
      </label>
    );
  }
);

Label.displayName = "Label";

export default Label;