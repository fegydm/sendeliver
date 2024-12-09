import React from "react";
import themeConfig from "@/configs/theme-config.json";
import logicConfig from "@/configs/logic-config.json";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "close";
  size?: "default" | "small" | "large" | "icon";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { variant = "primary", size = "default", className, children, ...props },
    ref
  ) => {
    // Fetch styles from theme config
    const variantStyles = themeConfig.button.variants[variant] || {};
    const sizeStyles = themeConfig.button.sizes[size] || {};
    const baseStyles = themeConfig.button.base;

    // Combine styles
    const styles = {
      ...baseStyles,
      ...variantStyles,
      ...sizeStyles,
    };

    // Apply logic-based properties if needed
    const isDisabled = logicConfig.modal.backdropOpacity === 0; // Example of using logicConfig

    return (
      <button
        ref={ref}
        disabled={isDisabled || props.disabled}
        style={{
          backgroundColor: styles.backgroundColor,
          color: styles.color,
          padding: styles.padding,
          fontSize: styles.fontSize,
          borderRadius: styles.borderRadius,
          ...styles.customStyles, // Add custom styles if defined in theme config
        }}
        className={className}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
