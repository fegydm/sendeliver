// components/ui/button/button.variants.ts
export type ButtonVariant = "primary" | "secondary" | "close";
export type ButtonSize = "default" | "small" | "large" | "icon";

export const getButtonClasses = (
  variant: ButtonVariant = "primary",
  size: ButtonSize = "default"
): string => {
  const baseClasses = "rounded-lg transition-colors duration-modal";

  const variantClasses = {
    primary:
      "bg-navbar-light-button-bg hover:bg-navbar-light-button-hover text-navbar-light-button-text dark:bg-navbar-dark-button-bg",
    secondary: "hover:bg-modal-light-hover dark:hover:bg-modal-dark-hover",
    close:
      "absolute top-4 right-4 p-1 hover:bg-modal-light-hover dark:hover:bg-modal-dark-hover",
  };

  const sizeClasses = {
    default: "px-4 py-2",
    small: "px-2 py-1 text-sm",
    large: "px-6 py-3 text-lg",
    icon: "p-1",
  };

  return `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]}`;
};
