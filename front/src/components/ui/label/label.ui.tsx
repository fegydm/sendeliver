// ./front/src/components/ui/label/label.ui.tsx
import React from "react";
import themeConfig from "@/configs/theme-config.json";

interface LabelProps {
  variant?: "default" | "error" | "success";
  children: React.ReactNode;
  htmlFor?: string; // Pridané pre podporu htmlFor
}

export const Label: React.FC<LabelProps> = ({
  variant = "default",
  children,
  htmlFor,
}) => {
  const styles = themeConfig.label[variant];

  return (
    <label
      htmlFor={htmlFor}
      style={{
        color: styles.color,
        fontSize: styles.fontSize,
        fontWeight: styles.fontWeight,
      }}
      className={`label ${variant}`}
    >
      {children}
      <style>{`
        .label.${variant}:hover {
          color: ${styles.hover?.color};
        }
        .label.${variant}:focus {
          outline: ${styles.focus?.outline};
        }
      `}</style>
    </label>
  );
};

export default Label;
