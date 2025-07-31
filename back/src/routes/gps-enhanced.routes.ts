// File: back/src/routes/gps-enhanced.routes.ts
// Last change: Removed '/gps' prefix from routes to match new mount point.

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

const handleError = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  return String(error);
};

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

const handleGPSData: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const auth = await gpsAuthService.authenticateRequest(req.headers as Record<string, string>);
    if (!auth.success) {
      return res.status(401).json({ error: 'GPS Authentication failed', message: auth.error });
    }
    const device = auth.device!; 
    const parseResult = gpsAuthService.parseGPSData(req.body, device);
    if (!parseResult.success) {
      return res.status(400).json({ error: 'Invalid GPS data', message: parseResult.error });
    }
    const gpsData: GpsDataPayload = parseResult.data!;
    await storeGPSData(gpsData);
    broadcastGPSUpdate(gpsData);
    res.json({ success: true, deviceIdentifier: gpsData.deviceIdentifier, timestamp: gpsData.timestamp, received: new Date().toISOString() });
  } catch (error) {
    console.error('[GPS] Processing error:', error);
    res.status(500).json({ error: 'GPS processing failed', message: handleError(error) });
  }
};

const handleDeviceInfo: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const auth = await gpsAuthService.authenticateRequest(req.headers as Record<string, string>);
    if (!auth.success) {
      return res.status(401).json({ error: 'GPS Authentication failed', message: auth.error });
    }
    const device = auth.device!; 
    res.json({ id: device.id, deviceIdentifier: device.deviceIdentifier, deviceType: device.deviceType, isActive: device.isActive, lastSeen: device.lastSeen, createdAt: device.createdAt });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get device info', message: handleError(error) });
  }
};

const handleGetOrganizationVehicles: RequestHandler = async (req: any, res: Response, next: NextFunction) => {
  try {
    const organizationId = req.organizationId;
    const allDevices = await gpsAuthService.getAllDevices();
    const orgDevices = allDevices.filter(d => d.organizationId === organizationId);
    const vehiclesWithLocation = await Promise.all(
      orgDevices.map(async (device) => {
        try {
          const gpsData = await getGpsData({ trackableDeviceId: device.id, limit: 1 });
          const latestGPS = gpsData[0];
          const lastSeenMinutes = device.lastSeen ? (new Date().getTime() - device.lastSeen.getTime()) / 60000 : 999;
          let status = 'OFFLINE';
          if (lastSeenMinutes <= 5) {
            status = (latestGPS?.speed && latestGPS.speed > 5) ? 'MOVING' : 'IDLE';
          }
          return { deviceId: device.id, deviceIdentifier: device.deviceIdentifier, name: device.name, deviceType: device.deviceType, isActive: device.isActive, status, lastSeen: device.lastSeen, location: latestGPS ? { latitude: latestGPS.latitude, longitude: latestGPS.longitude, speed: latestGPS.speed, heading: latestGPS.heading, timestamp: latestGPS.timestamp } : null };
        } catch (error) {
          console.error(`Error getting GPS for device ${device.id}:`, error);
          return { deviceId: device.id, deviceIdentifier: device.deviceIdentifier, name: device.name, deviceType: device.deviceType, isActive: device.isActive, status: 'ERROR', lastSeen: device.lastSeen, location: null };
        }
      })
    );
    res.json({ success: true, organizationId, vehicles: vehiclesWithLocation, count: vehiclesWithLocation.length, onlineCount: vehiclesWithLocation.filter(v => v.status !== 'OFFLINE').length, userPermissions: req.userPermissions });
  } catch (error) {
    console.error('[GPS] Error getting organization vehicles:', error);
    res.status(500).json({ error: 'Failed to get organization vehicles' });
  }
};

const handleGetDevices: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const devices = await gpsAuthService.getAllDevices();
    res.json({ devices: devices.map(d => ({ id: d.id, deviceIdentifier: d.deviceIdentifier, name: d.name, deviceType: d.deviceType, isActive: d.isActive, lastSeen: d.lastSeen, createdAt: d.createdAt, organizationId: d.organizationId, apiKey: d.apiKey.substring(0, 12) + '...' })) });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch devices', message: handleError(error) });
  }
};

const handleRegisterDevice: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, deviceType, deviceIdentifier } = req.body; 
    if (!name || !deviceType || !deviceIdentifier) {
      return res.status(400).json({ error: 'name, deviceType, and deviceIdentifier are required' });
    }
    const existingDevice = await gpsAuthService.getDeviceByIdentifier(deviceIdentifier);
    if (existingDevice) {
      return res.status(409).json({ error: 'Device already registered with this identifier', existingDeviceId: existingDevice.id });
    }
    const device = await gpsAuthService.registerDevice({ name, deviceIdentifier, deviceType });
    res.status(201).json({ success: true, device: { id: device.id, name: device.name, deviceIdentifier: device.deviceIdentifier, apiKey: device.apiKey, deviceType: device.deviceType, isActive: device.isActive }, setupInstructions: getSetupInstructions(device) });
  } catch (error) {
    console.error('[GPS Admin] Registration error:', error);
    res.status(500).json({ error: 'Device registration failed', message: handleError(error) });
  }
};

const handleSimulateGPS: RequestHandler = async (req: any, res: Response, next: NextFunction) => {
  try {
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({ error: 'Simulation not allowed in production' });
    }
    const { deviceIdentifier } = req.params;
    const device = await gpsAuthService.getDeviceByIdentifier(deviceIdentifier);
    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }
    const simulatedData = { deviceIdentifier, latitude: 48.1486 + (Math.random() - 0.5) * 0.01, longitude: 17.1077 + (Math.random() - 0.5) * 0.01, speed: Math.random() * 60, heading: Math.random() * 360, accuracy: 5 + Math.random() * 10, timestamp: new Date().toISOString() };
    const storedData = await storeGPSData(simulatedData);
    broadcastGPSUpdate(simulatedData);
    res.json({ success: true, message: `Simulated GPS data for device ${deviceIdentifier}`, recordId: storedData.id, simulatedData, userPermissions: req.userPermissions });
  } catch (error) {
    console.error('[GPS] Error simulating GPS:', error);
    res.status(500).json({ error: 'Failed to simulate GPS data' });
  }
};

const handleGetApiKey: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { deviceIdentifier } = req.params;
    const apiKey = await gpsAuthService.getApiKeyForDeviceIdentifier(deviceIdentifier);
    if (!apiKey) {
      return res.status(404).json({ error: 'No device registered with this identifier' });
    }
    res.json({ deviceIdentifier, apiKey });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get API key', message: handleError(error) });
  }
};

const handleDeactivateDevice: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { deviceIdentifier } = req.params;
    const success = await gpsAuthService.deactivateDeviceByIdentifier(deviceIdentifier);
    if (!success) {
      return res.status(404).json({ error: 'Device not found' });
    }
    res.json({ success: true, message: 'Device deactivated' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to deactivate device', message: handleError(error) });
  }
};

router.post('/', handleGPSData);
router.get('/device-info', handleDeviceInfo);

router.get('/organization/:organizationId/vehicles',
  authenticateJWT,
  extractOrganizationId,
  loadPermissions,
  requirePermission('canViewAnalytics'),
  handleGetOrganizationVehicles
);

router.post('/simulate/:deviceIdentifier',
  authenticateJWT,
  extractOrganizationId,
  loadPermissions,
  requirePermission('canManageVehicles'),
  handleSimulateGPS
);

const adminRouter = Router();
adminRouter.get('/devices', checkRole(UserRole.superadmin, UserRole.org_admin), handleGetDevices);
adminRouter.post('/register', checkRole(UserRole.superadmin, UserRole.org_admin), handleRegisterDevice);
adminRouter.get('/apikey/:deviceIdentifier', checkRole(UserRole.superadmin, UserRole.org_admin), handleGetApiKey);
adminRouter.post('/deactivate/:deviceIdentifier', checkRole(UserRole.superadmin, UserRole.org_admin), handleDeactivateDevice);
router.use('/admin', authenticateJWT, adminRouter);

function getSetupInstructions(device: any): any {
  const baseUrl = process.env.API_BASE_URL || 'http://localhost:10001';
  return { type: 'GPS Device Setup', endpoint: `${baseUrl}/api/gps`, method: 'POST', headers: { 'X-API-Key': device.apiKey, 'Content-Type': 'application/json' }, examplePayload: { deviceIdentifier: device.deviceIdentifier, latitude: 48.1486, longitude: 17.1077, timestamp: new Date().toISOString(), accuracy: 5, speed: 50, heading: 180 }, testCommand: `curl -X POST ${baseUrl}/api/gps -H "X-API-Key: ${device.apiKey}" -H "Content-Type: application/json" -d '${JSON.stringify({ deviceIdentifier: device.deviceIdentifier, latitude: 48.1486, longitude: 17.1077, timestamp: new Date().toISOString(), speed: 45 }, null, 2)}'` };
}

export default router;
