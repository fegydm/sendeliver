// components/ui/input/input.variants.ts
export type InputVariant = "default" | "search";
export type InputState = "normal" | "error" | "success";

export const getInputClasses = (
  variant: InputVariant = "default",
  state: InputState = "normal"
): string => {
  const baseClasses = "w-full rounded-lg transition-colors duration-modal";

  const variantClasses = {
    default:
      "px-3 py-2 border border-modal-light-border dark:border-modal-dark-border bg-modal-light-bg dark:bg-modal-dark-bg",
    search:
      "pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800",
  };

  const stateClasses = {
    normal: "focus:outline-none focus:ring-2 focus:ring-primary-500",
    error: "border-red-500 focus:ring-red-500",
    success: "border-green-500 focus:ring-green-500",
  };

  return `${baseClasses} ${variantClasses[variant]} ${stateClasses[state]}`;
};
