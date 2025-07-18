// File: back/src/routes/gps.routes.ts
// Last change: Added 'await' to all asynchronous calls from services.

import { Router, Request, Response, NextFunction, RequestHandler } from 'express';
import gpsAuthService from '../services/gps-auth.service.js';
import { authenticateJWT, checkRole } from '../middlewares/auth.middleware.js';
import { UserRole } from '@prisma/client';
import { storeGPSData, broadcastGPSUpdate } from '../services/gps.services.js';

const router = Router();

// Helper function for error handling.
const handleError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
};

// Define an interface for the expected GPS data payload.
interface GpsDataPayload {
  deviceIdentifier: string;
  latitude: number;
  longitude: number;
  speed?: number;
  timestamp: string;
  accuracy?: number;
  heading?: number;
  altitude?: number;
}

// GPS data endpoint - main endpoint for receiving GPS data.
const handleGPSData: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Authenticate GPS device.
    const auth = await gpsAuthService.authenticateRequest(req.headers as Record<string, string>); // ADDED await
    if (!auth.success) {
      res.status(401).json({ 
        error: 'GPS Authentication failed',
        message: auth.error 
      });
      return;
    }

    const device = auth.device!; 

    // Parse GPS data.
    const parseResult = gpsAuthService.parseGPSData(req.body, device);
    if (!parseResult.success) {
      res.status(400).json({
        error: 'Invalid GPS data',
        message: parseResult.error
      });
      return;
    }

    const gpsData: GpsDataPayload = parseResult.data!;

    // Log received data using deviceIdentifier.
    console.log(`[GPS] ${device.deviceType} data from ${gpsData.deviceIdentifier}:`, {
      lat: gpsData.latitude,
      lng: gpsData.longitude,
      timestamp: gpsData.timestamp,
      speed: gpsData.speed || 'N/A'
    });

    // Store GPS data using the service function.
    await storeGPSData(gpsData);

    // Broadcast to WebSocket clients using the service function.
    broadcastGPSUpdate(gpsData);

    // Send success response.
    res.json({
      success: true,
      deviceIdentifier: gpsData.deviceIdentifier,
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

// Get GPS device info - for debugging/setup.
const handleDeviceInfo: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const auth = await gpsAuthService.authenticateRequest(req.headers as Record<string, string>); // ADDED await
    if (!auth.success) {
      res.status(401).json({ 
        error: 'GPS Authentication failed',
        message: auth.error 
      });
      return;
    }

    const device = auth.device!; 
    res.json({
      id: device.id,
      deviceIdentifier: device.deviceIdentifier,
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

// Get all GPS devices (admin only).
const handleGetDevices: RequestHandler = async (req: Request, res: Response, next: NextFunction) => { // ADDED async
  try {
    const devices = await gpsAuthService.getAllDevices(); // ADDED await
    res.json({
      devices: devices.map(d => ({
        id: d.id,
        deviceIdentifier: d.deviceIdentifier,
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

// Register new GPS device (admin only).
const handleRegisterDevice: RequestHandler = async (req: Request, res: Response, next: NextFunction) => { // ADDED async
  try {
    const { name, deviceType, deviceIdentifier } = req.body; 

    if (!name || !deviceType || !deviceIdentifier) {
      res.status(400).json({ 
        error: 'name, deviceType, and deviceIdentifier are required' 
      });
      return;
    }

    const existingDevice = await gpsAuthService.getDeviceByIdentifier(deviceIdentifier); // ADDED await
    if (existingDevice) {
      res.status(409).json({ 
        error: 'Device already registered with this identifier',
        existingDeviceId: existingDevice.id
      });
      return;
    }

    const device = await gpsAuthService.registerDevice({ // ADDED await
      name,
      deviceIdentifier,
      deviceType
    });

    res.status(201).json({
      success: true,
      device: {
        id: device.id,
        name: device.name,
        deviceIdentifier: device.deviceIdentifier,
        apiKey: device.apiKey,
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

// Get API key for device (admin only).
const handleGetApiKey: RequestHandler = async (req: Request, res: Response, next: NextFunction) => { // ADDED async
  try {
    const { deviceIdentifier } = req.params;
    const apiKey = await gpsAuthService.getApiKeyForDeviceIdentifier(deviceIdentifier); // ADDED await
    
    if (!apiKey) {
      res.status(404).json({ 
        error: 'No device registered with this identifier' 
      });
      return;
    }

    res.json({ deviceIdentifier, apiKey });
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to get API key',
      message: handleError(error)
    });
  }
};

// Deactivate device (admin only).
const handleDeactivateDevice: RequestHandler = async (req: Request, res: Response, next: NextFunction) => { // ADDED async
  try {
    const { deviceIdentifier } = req.params;
    const success = await gpsAuthService.deactivateDeviceByIdentifier(deviceIdentifier); // ADDED await
    
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

// Route definitions.
router.post('/gps', handleGPSData);
router.get('/gps/device-info', handleDeviceInfo);

// Admin endpoints - require authentication.
router.use('/gps/admin', authenticateJWT);
router.get('/gps/admin/devices', checkRole(UserRole.superadmin, UserRole.org_admin), handleGetDevices);
router.post('/gps/admin/register', checkRole(UserRole.superadmin, UserRole.org_admin), handleRegisterDevice);
router.get('/gps/admin/apikey/:deviceIdentifier', checkRole(UserRole.superadmin, UserRole.org_admin), handleGetApiKey);
router.post('/gps/admin/deactivate/:deviceIdentifier', checkRole(UserRole.superadmin, UserRole.org_admin), handleDeactivateDevice);


// Helper functions (moved to gps.services.ts and imported).
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
          deviceIdentifier: device.deviceIdentifier,
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
