// File: back/src/services/gps-auth.service.ts
// Last change: Created simple GPS authentication for basic implementation

import { randomBytes } from 'crypto';

interface GPSDevice {
  id: string;
  vehicleId: string;
  apiKey: string;
  deviceType: 'mobile_app' | 'gps_chip' | 'telematics';
  isActive: boolean;
  lastSeen?: Date;
  createdAt: Date;
}

interface GPSData {
  vehicleId: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  accuracy?: number;
  speed?: number;
  heading?: number;
  altitude?: number;
}

class SimpleGPSAuthService {
  // In-memory storage for now (replace with database later)
  private devices = new Map<string, GPSDevice>();
  private apiKeyToDevice = new Map<string, string>(); // apiKey -> deviceId

  // Pre-register your service vehicle
  constructor() {
    this.registerServiceVehicle();
  }

  private registerServiceVehicle() {
  const serviceApiKey = process.env.GPS_API_KEY || 'gps_service_mbgbf2hr_3471b7b1b0491534';
  
  const device: GPSDevice = {
    id: 'service-device-1',
    vehicleId: 'service',
    apiKey: serviceApiKey,
    deviceType: 'mobile_app',
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

  // Generate API key
  private generateApiKey(vehicleId: string): string {
    const prefix = 'gps';
    const timestamp = Date.now().toString(36);
    const random = randomBytes(8).toString('hex');
    return `${prefix}_${vehicleId}_${timestamp}_${random}`;
  }

  // Register new device (for admin use)
  registerDevice(data: {
    vehicleId: string;
    deviceType: 'mobile_app' | 'gps_chip' | 'telematics';
    customApiKey?: string;
  }): GPSDevice {
    const deviceId = `${data.vehicleId}-device-${Date.now()}`;
    const apiKey = data.customApiKey || this.generateApiKey(data.vehicleId);

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

  // Authenticate GPS request
  authenticateRequest(headers: Record<string, string>): {
    success: boolean;
    device?: GPSDevice;
    error?: string;
  } {
    // Try different header formats
    const apiKey = 
      headers['x-api-key'] || 
      headers['authorization']?.replace('Bearer ', '') ||
      headers['api-key'];

    if (!apiKey) {
      return {
        success: false,
        error: 'No API key provided. Use X-API-Key header.'
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

    // Update last seen
    device.lastSeen = new Date();

    return {
      success: true,
      device
    };
  }

  // Parse and validate GPS data
  parseGPSData(rawData: any, device: GPSDevice): {
    success: boolean;
    data?: GPSData;
    error?: string;
  } {
    try {
      // Basic validation
      if (!rawData) {
        return { success: false, error: 'No GPS data provided' };
      }

      const latitude = parseFloat(rawData.latitude || rawData.lat);
      const longitude = parseFloat(rawData.longitude || rawData.lng || rawData.lon);

      if (isNaN(latitude) || isNaN(longitude)) {
        return { success: false, error: 'Invalid latitude/longitude' };
      }

      // Validate coordinate ranges
      if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
        return { success: false, error: 'Coordinates out of valid range' };
      }

      const gpsData: GPSData = {
        vehicleId: device.vehicleId,
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
        error: `GPS data parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  // Get all devices (for admin)
  getAllDevices(): GPSDevice[] {
    return Array.from(this.devices.values());
  }

  // Get device by vehicle ID
  getDeviceByVehicle(vehicleId: string): GPSDevice | null {
    return Array.from(this.devices.values()).find(d => d.vehicleId === vehicleId) || null;
  }

  // Deactivate device
  deactivateDevice(deviceId: string): boolean {
    const device = this.devices.get(deviceId);
    if (device) {
      device.isActive = false;
      console.log(`[GPS Auth] Device deactivated: ${deviceId}`);
      return true;
    }
    return false;
  }

  // Get API key for vehicle (for setup)
  getApiKeyForVehicle(vehicleId: string): string | null {
    const device = this.getDeviceByVehicle(vehicleId);
    return device?.apiKey || null;
  }
}

export default new SimpleGPSAuthService();