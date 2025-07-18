// File: back/src/services/gps-auth.service.ts
// Description: Handles GPS device authentication, registration, and management.
// Note: This service uses Prisma for persistent storage of TrackableDevices.

import { randomBytes } from 'crypto';
import { PrismaClient, DeviceType, TrackableDevice as PrismaTrackableDevice } from '@prisma/client'; // Import Prisma models

const prisma = new PrismaClient();

// Interface for a GPS device managed by the authentication service.
interface GPSDevice {
  id: number; // Changed to number as per Prisma's Int ID
  name: string; // Added name as per TrackableDevice model
  deviceIdentifier: string; // Changed from vehicleId to deviceIdentifier
  apiKey: string;
  deviceType: DeviceType; // Changed to Prisma's DeviceType enum
  isActive: boolean;
  lastSeen?: Date;
  createdAt: Date;
  // organizationId and ownerId are part of PrismaTrackableDevice, but not directly used in this simplified interface
}

// Interface for raw GPS data payload received from a device.
interface ParsedGpsData {
  deviceIdentifier: string; // Changed from vehicleId
  latitude: number;
  longitude: number;
  timestamp: string; // ISO string
  accuracy?: number;
  speed?: number;
  heading?: number;
  altitude?: number;
}

class SimpleGPSAuthService {
  // Constructor: Initializes the service.
  constructor() {
    // In a production setup, we might fetch active devices from the DB here
    // or rely on a separate process to keep in-memory cache updated.
  }

  /**
   * Generates a unique API key for a new GPS device.
   * @param deviceIdentifier The unique identifier of the device.
   * @returns A unique API key string.
   */
  private generateApiKey(deviceIdentifier: string): string {
    const prefix = 'gps';
    const timestamp = Date.now().toString(36);
    const random = randomBytes(8).toString('hex');
    return `${prefix}_${deviceIdentifier.substring(0, 8)}_${timestamp}_${random}`; // Use part of identifier
  }

  /**
   * Registers a new TrackableDevice in the database.
   * This method is typically called by an administrator.
   * @param data - Object containing name, deviceIdentifier, deviceType, and an optional customApiKey.
   * @returns A promise that resolves to the newly registered TrackableDevice object.
   */
  async registerDevice(data: {
    name: string; // User-friendly name
    deviceIdentifier: string; // Unique technical ID
    deviceType: DeviceType; // Prisma enum
    customApiKey?: string;
  }): Promise<PrismaTrackableDevice> {
    // Check for existing deviceIdentifier to prevent collisions.
    const existingDevice = await prisma.trackableDevice.findUnique({
      where: { deviceIdentifier: data.deviceIdentifier }
    });
    if (existingDevice) {
      throw new Error(`Device already registered with identifier: ${data.deviceIdentifier}`);
    }

    const apiKey = data.customApiKey || this.generateApiKey(data.deviceIdentifier);

    // In a real scenario, you'd also check if the customApiKey is unique if provided.

    const device = await prisma.trackableDevice.create({
      data: {
        name: data.name,
        deviceIdentifier: data.deviceIdentifier,
        apiKey,
        deviceType: data.deviceType,
        isActive: true,
        createdAt: new Date()
      }
    });

    console.log(`[GPS Auth] Device registered: ${device.id} for identifier: ${data.deviceIdentifier}`);
    return device;
  }

  /**
   * Authenticates an incoming GPS data request based on API key in headers.
   * @param headers - Request headers object.
   * @returns An object indicating success/failure, the authenticated device, and an error message if any.
   */
  async authenticateRequest(headers: Record<string, string>): Promise<{
    success: boolean;
    device?: PrismaTrackableDevice; // Returns PrismaTrackableDevice
    error?: string;
  }> {
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

    const device = await prisma.trackableDevice.findUnique({
      where: { apiKey: apiKey }
    });

    if (!device || !device.isActive) {
      return {
        success: false,
        error: 'Device not found or inactive'
      };
    }

    // Update last seen timestamp for the device.
    await prisma.trackableDevice.update({
      where: { id: device.id },
      data: { lastSeen: new Date() }
    });

    return {
      success: true,
      device
    };
  }

  /**
   * Parses and validates raw GPS data received from a device.
   * @param rawData - The raw data object from the request body.
   * @param device - The authenticated TrackableDevice.
   * @returns An object indicating success/failure, the parsed GPS data, and an error message if any.
   */
  parseGPSData(rawData: any, device: PrismaTrackableDevice): { // Device type is PrismaTrackableDevice
    success: boolean;
    data?: ParsedGpsData;
    error?: string;
  } {
    try {
      if (!rawData) {
        return { success: false, error: 'No GPS data provided' };
      }

      const latitude = parseFloat(rawData.latitude || rawData.lat);
      const longitude = parseFloat(rawData.longitude || rawData.lng || rawData.lon);

      if (isNaN(latitude) || isNaN(longitude)) {
        return { success: false, error: 'Invalid latitude or longitude. Must be a number.' };
      }

      if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
        return { success: false, error: 'Coordinates out of valid range (-90 to 90 for lat, -180 to 180 for lon).' };
      }

      const gpsData: ParsedGpsData = {
        deviceIdentifier: device.deviceIdentifier, // Use the authenticated device's identifier
        latitude,
        longitude,
        timestamp: rawData.timestamp || new Date().toISOString(), 
        accuracy: rawData.accuracy ? parseFloat(rawData.accuracy) : undefined,
        speed: rawData.speed ? parseFloat(rawData.speed) : undefined,
        heading: rawData.heading || rawData.bearing ? parseFloat(rawData.heading || rawData.bearing) : undefined,
        altitude: rawData.altitude ? parseFloat(rawData.altitude) : undefined
      };

      return {
        success: true,
        data: gpsData
      };

    } catch (error) {
      return {
        success: false,
        error: `GPS data parsing failed: ${error instanceof Error ? error.message : 'Unknown error during parsing.'}`
      };
    }
  }

  /**
   * Retrieves a list of all registered TrackableDevices from the database.
   * @returns A promise that resolves to an array of TrackableDevice objects.
   */
  async getAllDevices(): Promise<PrismaTrackableDevice[]> {
    return prisma.trackableDevice.findMany();
  }

  /**
   * Finds a TrackableDevice by its unique identifier.
   * @param deviceIdentifier The unique identifier of the device.
   * @returns A promise that resolves to the TrackableDevice object if found, otherwise null.
   */
  async getDeviceByIdentifier(deviceIdentifier: string): Promise<PrismaTrackableDevice | null> {
    return prisma.trackableDevice.findUnique({ where: { deviceIdentifier: deviceIdentifier } });
  }

  /**
   * Deactivates a TrackableDevice by its unique identifier.
   * @param deviceIdentifier The unique identifier of the device to deactivate.
   * @returns A promise that resolves to true if the device was found and deactivated, false otherwise.
   */
  async deactivateDeviceByIdentifier(deviceIdentifier: string): Promise<boolean> {
    try {
      const device = await prisma.trackableDevice.update({
        where: { deviceIdentifier: deviceIdentifier },
        data: { isActive: false }
      });
      console.log(`[GPS Auth] Device deactivated: ${device.id} (${device.deviceIdentifier})`);
      return true;
    } catch (error) {
      // Handle case where deviceIdentifier is not found (P2025) or other errors
      console.error(`[GPS Auth] Error deactivating device ${deviceIdentifier}:`, error);
      return false;
    }
  }

  /**
   * Retrieves the API key for a specific device's identifier.
   * @param deviceIdentifier The unique identifier of the device.
   * @returns A promise that resolves to the API key string if found, otherwise null.
   */
  async getApiKeyForDeviceIdentifier(deviceIdentifier: string): Promise<string | null> {
    const device = await prisma.trackableDevice.findUnique({
      where: { deviceIdentifier: deviceIdentifier },
      select: { apiKey: true }
    });
    return device?.apiKey || null;
  }
}

// Export a singleton instance of the service
export default new SimpleGPSAuthService();