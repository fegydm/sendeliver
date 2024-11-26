// components/ui/wrapper/wrapper.variants.ts
export type WrapperVariant = "modal" | "section";

export const getWrapperClasses = (
  variant: WrapperVariant = "modal"
): { outer: string; inner: string } => {
  const variantClasses = {
    modal: {
      outer: [
        "fixed inset-0",
        "flex justify-center",
        "bg-modal-backdrop",
        "backdrop-blur-modal",
        "z-modalBackdrop",
      ].join(" "),
      inner: [
        "absolute",
        "w-full max-w-modal",
        "mx-modal-sides",
        "max-h-[90vh]",
        "overflow-y-auto",
        "bg-modal-light-bg dark:bg-modal-dark-bg",
        "rounded-modal",
        "shadow-modal",
        "top-[var(--modal-top-offset)]",
      ].join(" "),
    },
    section: {
      outer: "w-full max-w-screen-xl mx-auto px-4 py-8 sm:py-12 lg:py-16",
      inner: "w-full",
    },
  };

  return variantClasses[variant];
};
