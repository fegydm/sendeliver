// File: common/configs/vehicle-status.config.ts
// Last change: Created vehicle status configuration with i18n keys and styling for shared FE+BE usage

export const VEHICLE_STATUS_CONFIG = {
  AVAILABLE: {
    key: 'AVAILABLE',
    labelKey: 'vehicle_status_available',
    color: '#28a745',
    bgColor: 'rgba(40, 167, 69, 0.1)',
    icon: '✅',
    priority: 1,
    canAssignDriver: true,
    canStartTrip: true
  },
  ON_ROUTE: {
    key: 'ON_ROUTE', 
    labelKey: 'vehicle_status_on_route',
    color: '#007bff',
    bgColor: 'rgba(0, 123, 255, 0.1)',
    icon: '🚛',
    priority: 2,
    canAssignDriver: false,
    canStartTrip: false
  },
  SERVICE: {
    key: 'SERVICE',
    labelKey: 'vehicle_status_service', 
    color: '#fd7e14',
    bgColor: 'rgba(253, 126, 20, 0.1)',
    icon: '🔧',
    priority: 3,
    canAssignDriver: false,
    canStartTrip: false
  },
  MAINTENANCE: {
    key: 'MAINTENANCE',
    labelKey: 'vehicle_status_maintenance',
    color: '#ffc107', 
    bgColor: 'rgba(255, 193, 7, 0.1)',
    icon: '⚠️',
    priority: 4,
    canAssignDriver: false,
    canStartTrip: false
  },
  INACTIVE: {
    key: 'INACTIVE',
    labelKey: 'vehicle_status_inactive',
    color: '#6c757d',
    bgColor: 'rgba(108, 117, 125, 0.1)', 
    icon: '⏸️',
    priority: 5,
    canAssignDriver: false,
    canStartTrip: false
  },
  PARKING: {
    key: 'PARKING',
    labelKey: 'vehicle_status_parking',
    color: '#17a2b8',
    bgColor: 'rgba(23, 162, 184, 0.1)',
    icon: '🅿️', 
    priority: 6,
    canAssignDriver: true,
    canStartTrip: true
  }
} as const;

export type VehicleStatusKey = keyof typeof VEHICLE_STATUS_CONFIG;

// Helper functions for both FE and BE usage
export const getVehicleStatusConfig = (status: string) => {
  return VEHICLE_STATUS_CONFIG[status as VehicleStatusKey] || VEHICLE_STATUS_CONFIG.INACTIVE;
};

export const getAllVehicleStatuses = () => {
  return Object.values(VEHICLE_STATUS_CONFIG).sort((a, b) => a.priority - b.priority);
};

export const getVehicleStatusKeys = () => {
  return Object.keys(VEHICLE_STATUS_CONFIG) as VehicleStatusKey[];
};

// Backend business logic helpers
export const getAssignableStatuses = () => {
  return Object.values(VEHICLE_STATUS_CONFIG)
    .filter(config => config.canAssignDriver)
    .map(config => config.key);
};

export const getTripReadyStatuses = () => {
  return Object.values(VEHICLE_STATUS_CONFIG)
    .filter(config => config.canStartTrip)
    .map(config => config.key);
};

export const isVehicleAvailableForAssignment = (status: string): boolean => {
  const config = getVehicleStatusConfig(status);
  return config.canAssignDriver;
};

export const isVehicleReadyForTrip = (status: string): boolean => {
  const config = getVehicleStatusConfig(status);
  return config.canStartTrip;
};