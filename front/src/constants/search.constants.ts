// File: ./front/src/constants/search.constants.ts
// Constants for frontend search and status logic

export const SEARCH_CONSTANTS = {
  MAX_DISTANCE_KM: 500, // Maximum distance for vehicle search in kilometers (sync with backend)
  DEFAULT_LOADING_TIME_OFFSET_HOURS: 3, // Default offset for loading_dt if not provided (now + 3h)
  AVAILABILITY_NOW_OFFSET_HOURS: -1, // Offset for "available now" condition (now - 1h)
  AVAILABILITY_OFFSET_HOURS: 2, // Offset for availability_dt (delivery_dt + 1h)
} as const;