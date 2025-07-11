// File: back/src/services/gps-auth.service.ts
// Description: Handles GPS device authentication, registration, and in-memory management.
// Note: Device storage is currently in-memory and should be replaced with a persistent database solution (e.g., Prisma) for production.

import { randomBytes } from 'crypto';

// Interface for a GPS device managed by the authentication service
interface GPSDevice {
  id: string;
  vehicleId: string;
  apiKey: string;
  deviceType: 'mobile_app' | 'gps_chip' | 'telematics';
  isActive: boolean;
  lastSeen?: Date;
  createdAt: Date;
}

// Interface for raw GPS data payload received from a device
// This structure is what parseGPSData will output
interface ParsedGpsData {
  vehicleId: string;
  latitude: number;
  longitude: number;
  timestamp: string; // ISO string, will be converted to Date for database storage
  accuracy?: number;
  speed?: number;
  heading?: number;
  altitude?: number;
}

class SimpleGPSAuthService {
  // In-memory storage for GPS devices.
  // In a real application, this would be backed by a database (e.g., Prisma model for Device).
  private devices = new Map<string, GPSDevice>(); // deviceId -> GPSDevice object
  private apiKeyToDevice = new Map<string, string>(); // apiKey -> deviceId

  /**
   * Constructor: Initializes the service and registers a default service vehicle.
   */
  constructor() {
    this.registerServiceVehicle();
  }

  /**
   * Registers a predefined service vehicle for initial testing/setup.
   * Uses an API key from environment variables or a default.
   */
  private registerServiceVehicle() {
    const serviceApiKey = process.env.GPS_API_KEY || 'gps_service_mbgbf2hr_3471b7b1b0491534';
    
    const device: GPSDevice = {
      id: 'service-device-1',
      vehicleId: 'service', // A generic vehicle ID for the service device
      apiKey: serviceApiKey,
      deviceType: 'mobile_app', // Default type for the service device
      isActive: true,
      createdAt: new Date()
    };

    this.devices.set(device.id, device);
    this.apiKeyToDevice.set(device.apiKey, device.id);

    console.log('[GPS Auth] Service vehicle registered:');
    console.log(`  Vehicle ID: ${device.vehicleId}`);
    console.log(`  API Key: ${device.apiKey}`);
    console.log(`  Device ID: ${device.id}`);
  }

  /**
   * Generates a unique API key for a new GPS device.
   * @param vehicleId The ID of the vehicle associated with the device.
   * @returns A unique API key string.
   */
  private generateApiKey(vehicleId: string): string {
    const prefix = 'gps';
    const timestamp = Date.now().toString(36); // Base36 timestamp for compactness
    const random = randomBytes(8).toString('hex'); // 8 bytes of random data
    return `${prefix}_${vehicleId}_${timestamp}_${random}`;
  }

  /**
   * Registers a new GPS device.
   * This method is typically called by an administrator.
   * @param data - Object containing vehicleId, deviceType, and an optional customApiKey.
   * @returns The newly registered GPSDevice object.
   */
  registerDevice(data: {
    vehicleId: string;
    deviceType: 'mobile_app' | 'gps_chip' | 'telematics';
    customApiKey?: string;
  }): GPSDevice {
    // Generate a unique device ID
    const deviceId = `${data.vehicleId}-device-${Date.now()}`;
    const apiKey = data.customApiKey || this.generateApiKey(data.vehicleId);

    // Check for existing API key to prevent collisions if customApiKey is provided
    if (this.apiKeyToDevice.has(apiKey)) {
      throw new Error('Custom API key already exists. Please provide a unique key.');
    }
    // Check if a device already exists for this vehicleId (optional, but good practice)
    if (this.getDeviceByVehicle(data.vehicleId)) {
      throw new Error(`Device already registered for vehicle ID: ${data.vehicleId}`);
    }

    const device: GPSDevice = {
      id: deviceId,
      vehicleId: data.vehicleId,
      apiKey,
      deviceType: data.deviceType,
      isActive: true,
      createdAt: new Date()
    };

    this.devices.set(deviceId, device);
    this.apiKeyToDevice.set(apiKey, deviceId);

    console.log(`[GPS Auth] Device registered: ${deviceId} for vehicle: ${data.vehicleId}`);
    return device;
  }

  /**
   * Authenticates an incoming GPS data request based on API key in headers.
   * @param headers - Request headers object.
   * @returns An object indicating success/failure, the authenticated device, and an error message if any.
   */
  authenticateRequest(headers: Record<string, string>): {
    success: boolean;
    device?: GPSDevice;
    error?: string;
  } {
    // Try to extract API key from common header names
    const apiKey = 
      headers['x-api-key'] || 
      headers['authorization']?.replace('Bearer ', '') ||
      headers['api-key'];

    if (!apiKey) {
      return {
        success: false,
        error: 'No API key provided. Use X-API-Key or Authorization: Bearer header.'
      };
    }

    const deviceId = this.apiKeyToDevice.get(apiKey);
    if (!deviceId) {
      return {
        success: false,
        error: 'Invalid API key'
      };
    }

    const device = this.devices.get(deviceId);
    if (!device || !device.isActive) {
      return {
        success: false,
        error: 'Device not found or inactive'
      };
    }

    // Update last seen timestamp for the device
    device.lastSeen = new Date();

    return {
      success: true,
      device
    };
  }

  /**
   * Parses and validates raw GPS data received from a device.
   * @param rawData - The raw data object from the request body.
   * @param device - The authenticated GPS device.
   * @returns An object indicating success/failure, the parsed GPS data, and an error message if any.
   */
  parseGPSData(rawData: any, device: GPSDevice): {
    success: boolean;
    data?: ParsedGpsData;
    error?: string;
  } {
    try {
      // Basic validation for rawData existence
      if (!rawData) {
        return { success: false, error: 'No GPS data provided' };
      }

      // Parse latitude and longitude, handling common field names
      const latitude = parseFloat(rawData.latitude || rawData.lat);
      const longitude = parseFloat(rawData.longitude || rawData.lng || rawData.lon);

      if (isNaN(latitude) || isNaN(longitude)) {
        return { success: false, error: 'Invalid latitude or longitude. Must be a number.' };
      }

      // Validate coordinate ranges
      if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
        return { success: false, error: 'Coordinates out of valid range (-90 to 90 for lat, -180 to 180 for lon).' };
      }

      // Construct the parsed GPS data object
      const gpsData: ParsedGpsData = {
        vehicleId: device.vehicleId, // Associate data with the authenticated device's vehicle
        latitude,
        longitude,
        // Use provided timestamp or current ISO string if not present
        timestamp: rawData.timestamp || new Date().toISOString(), 
        accuracy: rawData.accuracy ? parseFloat(rawData.accuracy) : undefined,
        speed: rawData.speed ? parseFloat(rawData.speed) : undefined,
        // Handle common variations for heading/bearing
        heading: rawData.heading || rawData.bearing ? parseFloat(rawData.heading || rawData.bearing) : undefined,
        altitude: rawData.altitude ? parseFloat(rawData.altitude) : undefined
      };

      return {
        success: true,
        data: gpsData
      };

    } catch (error) {
      // Catch any unexpected errors during parsing
      return {
        success: false,
        error: `GPS data parsing failed: ${error instanceof Error ? error.message : 'Unknown error during parsing.'}`
      };
    }
  }

  /**
   * Retrieves a list of all registered GPS devices.
   * @returns An array of GPSDevice objects.
   */
  getAllDevices(): GPSDevice[] {
    return Array.from(this.devices.values());
  }

  /**
   * Finds a GPS device by its associated vehicle ID.
   * @param vehicleId The ID of the vehicle.
   * @returns The GPSDevice object if found, otherwise null.
   */
  getDeviceByVehicle(vehicleId: string): GPSDevice | null {
    return Array.from(this.devices.values()).find(d => d.vehicleId === vehicleId) || null;
  }

  /**
   * Deactivates a GPS device, preventing it from sending data.
   * @param deviceId The ID of the device to deactivate.
   * @returns True if the device was found and deactivated, false otherwise.
   */
  deactivateDevice(deviceId: string): boolean {
    const device = this.devices.get(deviceId);
    if (device) {
      device.isActive = false;
      console.log(`[GPS Auth] Device deactivated: ${deviceId}`);
      return true;
    }
    return false;
  }

  /**
   * Retrieves the API key for a specific vehicle's device.
   * @param vehicleId The ID of the vehicle.
   * @returns The API key string if found, otherwise null.
   */
  getApiKeyForVehicle(vehicleId: string): string | null {
    const device = this.getDeviceByVehicle(vehicleId);
    return device?.apiKey || null;
  }
}

// Export a singleton instance of the service
export default new SimpleGPSAuthService();
