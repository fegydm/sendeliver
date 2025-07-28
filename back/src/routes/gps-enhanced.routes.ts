// File: back/src/routes/gps-enhanced.routes.ts
// Last change: Added device type permissions to existing GPS routes

import { Router, Request, Response, NextFunction, RequestHandler } from 'express';
import gpsAuthService from '../services/gps-auth.service.js';
import { authenticateJWT, checkRole } from '../middlewares/auth.middleware.js';
import { 
  extractOrganizationId, 
  loadPermissions, 
  requirePermission 
} from '../middlewares/device-type.middleware.js';
import { UserRole } from '@prisma/client';
import { storeGPSData, broadcastGPSUpdate, getGpsData } from '../services/gps.services.js';

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
    const auth = await gpsAuthService.authenticateRequest(req.headers as Record<string, string>);
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
    const auth = await gpsAuthService.authenticateRequest(req.headers as Record<string, string>);
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

// ✅ NEW: Get organization vehicles with device type permissions
const handleGetOrganizationVehicles: RequestHandler = async (req: any, res: Response, next: NextFunction) => {
  try {
    const organizationId = req.organizationId;
    
    // Get all devices for organization
    const allDevices = await gpsAuthService.getAllDevices();
    const orgDevices = allDevices.filter(d => d.organizationId === organizationId);

    // Get latest GPS data for each device
    const vehiclesWithLocation = await Promise.all(
      orgDevices.map(async (device) => {
        try {
          const gpsData = await getGpsData({ 
            trackableDeviceId: device.id, 
            limit: 1 
          });
          
          const latestGPS = gpsData[0];
          const now = new Date();
          const lastSeenMinutes = device.lastSeen ? 
            (now.getTime() - device.lastSeen.getTime()) / (1000 * 60) : 999;

          let status = 'OFFLINE';
          if (lastSeenMinutes <= 5) {
            status = (latestGPS?.speed && latestGPS.speed > 5) ? 'MOVING' : 'IDLE';
          }

          return {
            deviceId: device.id,
            deviceIdentifier: device.deviceIdentifier,
            name: device.name,
            deviceType: device.deviceType,
            isActive: device.isActive,
            status,
            lastSeen: device.lastSeen,
            location: latestGPS ? {
              latitude: latestGPS.latitude,
              longitude: latestGPS.longitude,
              speed: latestGPS.speed,
              heading: latestGPS.heading,
              timestamp: latestGPS.timestamp
            } : null
          };
        } catch (error) {
          console.error(`Error getting GPS for device ${device.id}:`, error);
          return {
            deviceId: device.id,
            deviceIdentifier: device.deviceIdentifier,
            name: device.name,
            deviceType: device.deviceType,
            isActive: device.isActive,
            status: 'ERROR',
            lastSeen: device.lastSeen,
            location: null
          };
        }
      })
    );

    res.json({
      success: true,
      organizationId,
      vehicles: vehiclesWithLocation,
      count: vehiclesWithLocation.length,
      onlineCount: vehiclesWithLocation.filter(v => v.status !== 'OFFLINE').length,
      userPermissions: req.userPermissions // Include user permissions in response
    });

  } catch (error) {
    console.error('[GPS] Error getting organization vehicles:', error);
    res.status(500).json({ error: 'Failed to get organization vehicles' });
  }
};

// Get all GPS devices (admin only).
const handleGetDevices: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const devices = await gpsAuthService.getAllDevices();
    res.json({
      devices: devices.map(d => ({
        id: d.id,
        deviceIdentifier: d.deviceIdentifier,
        name: d.name,
        deviceType: d.deviceType,
        isActive: d.isActive,
        lastSeen: d.lastSeen,
        createdAt: d.createdAt,
        organizationId: d.organizationId,
        apiKey: d.apiKey.substring(0, 12) + '...' // Masked API key
      }))
    });
    return;
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to fetch devices',
      message: handleError(error)
    });
    return;
  }
};

// Register new GPS device (admin only).
const handleRegisterDevice: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, deviceType, deviceIdentifier } = req.body; 

    if (!name || !deviceType || !deviceIdentifier) {
      res.status(400).json({ 
        error: 'name, deviceType, and deviceIdentifier are required' 
      });
      return;
    }

    const existingDevice = await gpsAuthService.getDeviceByIdentifier(deviceIdentifier);
    if (existingDevice) {
      res.status(409).json({ 
        error: 'Device already registered with this identifier',
        existingDeviceId: existingDevice.id
      });
      return;
    }

    const device = await gpsAuthService.registerDevice({
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
    return;

  } catch (error) {
    console.error('[GPS Admin] Registration error:', error);
    res.status(500).json({ 
      error: 'Device registration failed',
      message: handleError(error)
    });
    return;
  }
};

// ✅ NEW: Simulate GPS data with permissions
const handleSimulateGPS: RequestHandler = async (req: any, res: Response, next: NextFunction) => {
  try {
    if (process.env.NODE_ENV === 'production') {
      res.status(403).json({ error: 'Simulation not allowed in production' });
      return;
    }

    const { deviceIdentifier } = req.params;
    
    // Check if device exists
    const device = await gpsAuthService.getDeviceByIdentifier(deviceIdentifier);
    if (!device) {
      res.status(404).json({ error: 'Device not found' });
      return;
    }

    // Generate random GPS data around Bratislava
    const baseLat = 48.1486;
    const baseLng = 17.1077;
    
    const simulatedData = {
      deviceIdentifier,
      latitude: baseLat + (Math.random() - 0.5) * 0.01,
      longitude: baseLng + (Math.random() - 0.5) * 0.01,
      speed: Math.random() * 60,
      heading: Math.random() * 360,
      accuracy: 5 + Math.random() * 10,
      timestamp: new Date().toISOString()
    };

    // Store simulated data
    const storedData = await storeGPSData(simulatedData);
    
    // Broadcast update
    broadcastGPSUpdate(simulatedData);

    res.json({
      success: true,
      message: `Simulated GPS data for device ${deviceIdentifier}`,
      recordId: storedData.id,
      simulatedData,
      userPermissions: req.userPermissions // Include permissions for audit
    });

  } catch (error) {
    console.error('[GPS] Error simulating GPS:', error);
    res.status(500).json({ error: 'Failed to simulate GPS data' });
  }
};

// Get API key for device (admin only).
const handleGetApiKey: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { deviceIdentifier } = req.params;
    const apiKey = await gpsAuthService.getApiKeyForDeviceIdentifier(deviceIdentifier);
    
    if (!apiKey) {
      res.status(404).json({ 
        error: 'No device registered with this identifier' 
      });
      return;
    }

    res.json({ deviceIdentifier, apiKey });
    return;
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to get API key',
      message: handleError(error)
    });
    return;
  }
};

// Deactivate device (admin only).
const handleDeactivateDevice: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { deviceIdentifier } = req.params;
    const success = await gpsAuthService.deactivateDeviceByIdentifier(deviceIdentifier);
    
    if (!success) {
      res.status(404).json({ error: 'Device not found' });
      return;
    }

    res.json({ success: true, message: 'Device deactivated' });
    return;
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to deactivate device',
      message: handleError(error)
    });
    return;
  }
};

// ================================
// ROUTE DEFINITIONS
// ================================

// Public GPS endpoint (no auth needed for device GPS updates)
router.post('/gps', handleGPSData);
router.get('/gps/device-info', handleDeviceInfo);

// ✅ NEW: Organization-specific routes with device type permissions
router.get('/gps/organization/:organizationId/vehicles',
  authenticateJWT,
  extractOrganizationId,
  loadPermissions,
  requirePermission('canViewAnalytics'), // Requires analytics permission
  handleGetOrganizationVehicles
);

// ✅ NEW: GPS simulation with permissions
router.post('/gps/simulate/:deviceIdentifier',
  authenticateJWT,
  extractOrganizationId,
  loadPermissions,
  requirePermission('canManageVehicles'), // Requires vehicle management permission
  handleSimulateGPS
);

// Admin endpoints - require authentication and specific roles
router.use('/gps/admin', authenticateJWT);
router.get('/gps/admin/devices', 
  checkRole(UserRole.superadmin, UserRole.org_admin), 
  handleGetDevices
);
router.post('/gps/admin/register', 
  checkRole(UserRole.superadmin, UserRole.org_admin), 
  handleRegisterDevice
);
router.get('/gps/admin/apikey/:deviceIdentifier', 
  checkRole(UserRole.superadmin, UserRole.org_admin), 
  handleGetApiKey
);
router.post('/gps/admin/deactivate/:deviceIdentifier', 
  checkRole(UserRole.superadmin, UserRole.org_admin), 
  handleDeactivateDevice
);

// Helper function for setup instructions
function getSetupInstructions(device: any): any {
  const baseUrl = process.env.API_BASE_URL || 'http://localhost:10000';
  
  return {
    type: 'GPS Device Setup',
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
    },
    testCommand: `curl -X POST ${baseUrl}/api/gps \\
  -H "X-API-Key: ${device.apiKey}" \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify({
    deviceIdentifier: device.deviceIdentifier,
    latitude: 48.1486,
    longitude: 17.1077,
    timestamp: new Date().toISOString(),
    speed: 45
  }, null, 2)}'`
  };
}

export default router;