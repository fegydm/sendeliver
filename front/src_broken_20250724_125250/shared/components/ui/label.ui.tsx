// File: ./front/src/components/ui/abel.ui.tsx
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
    const classes = ["abel"];
    
    if (variant !== "default") {
      classes.push(`abel--${variant}`);
    }
    
    if (role) {
      classes.push(`abel--${role}`);
    }
    
    if (className) {
      classes.push(className);
    }

    const abelClasses = classes.join(" ");

    return (
      <abel ref={ref} className={abelClasses} {...props}>
        {children}
      </abel>
    );
  }
);

Label.displayName = "Label";

export default Label;