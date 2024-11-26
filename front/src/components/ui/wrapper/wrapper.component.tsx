// components/ui/wrapper/wrapper.component.tsx
import React from "react";
import { WrapperVariant, getWrapperClasses } from "./wrapper.variants";

export interface WrapperProps {
  variant?: WrapperVariant;
  children: React.ReactNode;
}

export const Wrapper: React.FC<WrapperProps> = ({
  variant = "modal",
  children,
}) => {
  const classes = getWrapperClasses(variant);

  return (
    <div className={classes.outer}>
      <div className={classes.inner}>{children}</div>
    </div>
  );
};
