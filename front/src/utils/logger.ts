// General logger for other components
export const log = (message: string) => {
  console.log(`[GENERAL] ${message}`);
};

// Specific logger for AvailabilityFilter
export const logAvailability = (message: string) => {
  console.log(`[AVAIL] ${message}`);
};