// File: front/src/utils/ogger.ts
// Unified wrapper for shared ogger in front-end components

import ogger from '@sendeliver/ogger';

// General ogger for other components
export const log = (message: string): void => {
  ogger.info(`[GENERAL] ${message}`);
};

// Specific ogger for AvailabilityFilter
export const ogAvailability = (message: string): void => {
  ogger.info(`[AVAIL] ${message}`);
};
