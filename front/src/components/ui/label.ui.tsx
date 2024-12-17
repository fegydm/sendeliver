// ./src/components/ui/label/label.ui.tsx

import React from "react";

export interface LabelProps {
  variant?: "default" | "error" | "success";
  children: React.ReactNode;
  htmlFor?: string;
}

export const Label: React.FC<LabelProps> = ({
  variant = "default",
  children,
  htmlFor,
}) => {
  return (
    <label htmlFor={htmlFor} className={`label label-${variant}`}>
      {children}
    </label>
  );
};

export default Label;
