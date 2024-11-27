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
