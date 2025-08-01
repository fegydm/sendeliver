// ./front/src/components/ui/card/card.ui.tsx
/**
 * Unified Card Component with Variants
 */

import React from "react";

export const cardVariants = {
  default:
    "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700",
  destructive:
    "bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-800",
  success:
    "bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-800",
  warning:
    "bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-800",
};

export type CardVariant = keyof typeof cardVariants;

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: CardVariant;
}

// Unified Card component with its subcomponents
const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className = "", variant = "default", children, ...props }, ref) => (
    <div
      ref={ref}
      className={`rounded-lg shadow-sm ${cardVariants[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
);
Card.displayName = "Card";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className = "", children, ...props }, ref) => (
  <div ref={ref} className={`p-6 ${className}`} {...props}>
    {children}
  </div>
));
CardContent.displayName = "CardContent";

const CardTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className = "", children, ...props }, ref) => (
  <div
    ref={ref}
    className={`font-semibold leading-none tracking-tight ${className}`}
    {...props}
  >
    {children}
  </div>
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className = "", children, ...props }, ref) => (
  <div
    ref={ref}
    className={`text-sm text-gray-500 dark:text-gray-400 ${className}`}
    {...props}
  >
    {children}
  </div>
));
CardDescription.displayName = "CardDescription";

// Exports
export { Card, CardContent, CardTitle, CardDescription };
