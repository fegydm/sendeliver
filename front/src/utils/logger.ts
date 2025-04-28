// File: front/src/utils/logger.ts
// Unified wrapper for shared logger in front-end components

import logger from '@sendeliver/logger';

// General logger for other components
export const log = (message: string): void => {
  logger.info(`[GENERAL] ${message}`);
};

// Specific logger for AvailabilityFilter
export const logAvailability = (message: string): void => {
  logger.info(`[AVAIL] ${message}`);
};
