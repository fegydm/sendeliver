// File: back/src/routes/gps.routes.ts
// Last change: Fixed TypeScript req/res types using proper Express types,
//              corrected Prisma enum usage, and integrated GPS services.

import { Router, Request, Response, NextFunction, RequestHandler } from 'express';
import gpsAuthService from '../services/gps-auth.service.js';
import { authenticateJWT, checkRole } from '../middlewares/auth.middleware.js';
import { UserRole } from '@prisma/client'; // Corrected import from 'Role' to 'UserRole'
import { storeGPSData, broadcastGPSUpdate } from '../services/gps.services.js'; // Import functions from new service file

const router = Router();

// Helper function for error handling
const handleError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
};

// Define an interface for the expected GPS data payload
interface GpsDataPayload {
  vehicleId: string;
  latitude: number;
  longitude: number;
  speed?: number;
  timestamp: string; // ISO string
  accuracy?: number;
  heading?: number;
  altitude?: number;
}

// GPS data endpoint - main endpoint for receiving GPS data
const handleGPSData: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Authenticate GPS device
    const auth = gpsAuthService.authenticateRequest(req.headers as Record<string, string>);
    if (!auth.success) {
      res.status(401).json({ 
        error: 'GPS Authentication failed',
        message: auth.error 
      });
      return;
    }

    const device = auth.device!;

    // Parse GPS data
    // Assuming parseGPSData returns an object conforming to GpsDataPayload
    const parseResult = gpsAuthService.parseGPSData(req.body, device);
    if (!parseResult.success) {
      res.status(400).json({
        error: 'Invalid GPS data',
        message: parseResult.error
      });
      return;
    }

    const gpsData: GpsDataPayload = parseResult.data!; // Cast to GpsDataPayload

    // Log received data
    console.log(`[GPS] ${device.deviceType} data from ${gpsData.vehicleId}:`, {
      lat: gpsData.latitude,
      lng: gpsData.longitude,
      timestamp: gpsData.timestamp,
      speed: gpsData.speed || 'N/A'
    });

    // Store GPS data using the service function
    await storeGPSData(gpsData);

    // Broadcast to WebSocket clients using the service function
    broadcastGPSUpdate(gpsData);

    // Send success response
    res.json({
      success: true,
      vehicleId: gpsData.vehicleId,
      timestamp: gpsData.timestamp,
      received: new Date().toISOString()
    });

  } catch (error) {
    console.error('[GPS] Processing error:', error);
    res.status(500).json({
      error: 'GPS processing failed',
      message: handleError(error)
    });
  }
};

// Get GPS device info - for debugging/setup
const handleDeviceInfo: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const auth = gpsAuthService.authenticateRequest(req.headers as Record<string, string>);
    if (!auth.success) {
      res.status(401).json({ 
        error: 'GPS Authentication failed',
        message: auth.error 
      });
      return;
    }

    const device = auth.device!;
    res.json({
      deviceId: device.id,
      vehicleId: device.vehicleId,
      deviceType: device.deviceType,
      isActive: device.isActive,
      lastSeen: device.lastSeen,
      createdAt: device.createdAt
    });

  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to get device info',
      message: handleError(error)
    });
  }
};

// Get all GPS devices (admin only)
const handleGetDevices: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
  try {
    const devices = gpsAuthService.getAllDevices();
    res.json({
      devices: devices.map(d => ({
        id: d.id,
        vehicleId: d.vehicleId,
        deviceType: d.deviceType,
        isActive: d.isActive,
        lastSeen: d.lastSeen,
        createdAt: d.createdAt,
        apiKey: d.apiKey.substring(0, 12) + '...' // Masked API key
      }))
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to fetch devices',
      message: handleError(error)
    });
  }
};

// Register new GPS device (admin only)
const handleRegisterDevice: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
  try {
    const { vehicleId, deviceType } = req.body;

    if (!vehicleId || !deviceType) {
      res.status(400).json({ 
        error: 'vehicleId and deviceType are required' 
      });
      return;
    }

    // Check if device already exists for this vehicle
    const existingDevice = gpsAuthService.getDeviceByVehicle(vehicleId);
    if (existingDevice) {
      res.status(409).json({ 
        error: 'Device already registered for this vehicle',
        existingDeviceId: existingDevice.id
      });
      return;
    }

    const device = gpsAuthService.registerDevice({
      vehicleId,
      deviceType
    });

    res.status(201).json({
      success: true,
      device: {
        id: device.id,
        vehicleId: device.vehicleId,
        apiKey: device.apiKey, // Full API key for setup
        deviceType: device.deviceType,
        isActive: device.isActive
      },
      setupInstructions: getSetupInstructions(device)
    });

  } catch (error) {
    console.error('[GPS Admin] Registration error:', error);
    res.status(500).json({ 
      error: 'Device registration failed',
      message: handleError(error)
    });
  }
};

// Get API key for vehicle (admin only)
const handleGetApiKey: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
  try {
    const { vehicleId } = req.params;
    const apiKey = gpsAuthService.getApiKeyForVehicle(vehicleId);
    
    if (!apiKey) {
      res.status(404).json({ 
        error: 'No device registered for this vehicle' 
      });
      return;
    }

    res.json({ vehicleId, apiKey });
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to get API key',
      message: handleError(error)
    });
  }
};

// Deactivate device (admin only)
const handleDeactivateDevice: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
  try {
    const { deviceId } = req.params;
    const success = gpsAuthService.deactivateDevice(deviceId);
    
    if (!success) {
      res.status(404).json({ error: 'Device not found' });
      return;
    }

    res.json({ success: true, message: 'Device deactivated' });
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to deactivate device',
      message: handleError(error)
    });
  }
};

// Route definitions
router.post('/gps', handleGPSData);
router.get('/gps/device-info', handleDeviceInfo);

// Admin endpoints - require authentication
router.use('/gps/admin', authenticateJWT);
// Corrected Role.admin, Role.carrier to UserRole.superadmin, UserRole.org_admin
// Assuming 'admin' in context means superadmin or organization admin,
// and 'carrier' refers to a user role that manages carrier operations,
// which is best represented by 'org_admin' or 'dispatcher' based on your schema.
// Using superadmin and org_admin for broad admin access.
router.get('/gps/admin/devices', checkRole(UserRole.superadmin, UserRole.org_admin), handleGetDevices);
router.post('/gps/admin/register', checkRole(UserRole.superadmin, UserRole.org_admin), handleRegisterDevice);
router.get('/gps/admin/apikey/:vehicleId', checkRole(UserRole.superadmin, UserRole.org_admin), handleGetApiKey);
router.post('/gps/admin/deactivate/:deviceId', checkRole(UserRole.superadmin, UserRole.org_admin), handleDeactivateDevice);


// Helper functions (moved to gps.services.ts and imported)
// Removed local storeGPSData and broadcastGPSUpdate functions

function getSetupInstructions(device: any): any {
  const baseUrl = process.env.API_BASE_URL || 'http://localhost:5000';
  
  switch (device.deviceType) {
    case 'mobile_app':
      return {
        type: 'Mobile App Setup',
        endpoint: `${baseUrl}/api/gps`,
        method: 'POST',
        headers: {
          'X-API-Key': device.apiKey,
          'Content-Type': 'application/json'
        },
        examplePayload: {
          vehicleId: device.vehicleId,
          latitude: 48.1486,
          longitude: 17.1077,
          timestamp: new Date().toISOString(),
          accuracy: 5,
          speed: 50,
          heading: 180
        }
      };
      
    case 'gps_chip':
      return {
        type: 'GPS Chip Setup',
        endpoint: `${baseUrl}/api/gps`,
        method: 'POST',
        headers: {
          'X-API-Key': device.apiKey
        },
        note: 'Configure your GPS chip to send HTTP POST requests to the endpoint above'
      };
      
    default:
      return {
        type: 'Generic Setup',
        endpoint: `${baseUrl}/api/gps`,
        apiKey: device.apiKey
      };
  }
}

export default router;
