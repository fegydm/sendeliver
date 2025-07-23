// File: back/src/routes/organization.routes.ts
// Last change: Complete organization and vehicle management routes

import { Router } from 'express';
import { authenticateJWT } from '../middlewares/auth.middleware.js';
import {
  getOrganizationDashboard,
  inviteUserToOrganization,
  acceptInvitation,
  requestToJoinOrganization,
  reviewJoinRequest,
  toggleForwarderMode
} from '../controllers/organization.controllers.js';
import {
  getOrganizationVehicles,
  createVehicle,
  updateVehicle,
  assignDriverToVehicle,
  getVehicleAssignmentHistory,
  getVehicleGpsData,
  deleteVehicle
} from '../controllers/vehicle.controllers.js';

export const organizationRouter = Router();

// All routes require authentication
organizationRouter.use(authenticateJWT);

// Organization management
organizationRouter.get('/:orgId/dashboard', getOrganizationDashboard);
organizationRouter.post('/:orgId/invite', inviteUserToOrganization);
organizationRouter.post('/accept-invitation', acceptInvitation);
organizationRouter.post('/:orgId/join-request', requestToJoinOrganization);
organizationRouter.post('/join-requests/:requestId/review', reviewJoinRequest);

// Forwarder specific
organizationRouter.post('/forwarder/toggle-mode', toggleForwarderMode);

// Vehicle management
organizationRouter.get('/:orgId/vehicles', getOrganizationVehicles);
organizationRouter.post('/:orgId/vehicles', createVehicle);
organizationRouter.put('/vehicles/:vehicleId', updateVehicle);
organizationRouter.delete('/vehicles/:vehicleId', deleteVehicle);

// Driver assignment
organizationRouter.post('/vehicles/:vehicleId/assign', assignDriverToVehicle);
organizationRouter.get('/vehicles/:vehicleId/assignments', getVehicleAssignmentHistory);

// GPS tracking
organizationRouter.get('/vehicles/:vehicleId/gps', getVehicleGpsData);

// File: back/src/routes/tracker.routes.ts  
// Last change: API endpoints for Tracker app communication

import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const trackerRouter = Router();
const prisma = new PrismaClient();

// Middleware to authenticate vehicle by API key
const authenticateVehicle = async (req: any, res: any, next: any) => {
  try {
    const apiKey = req.headers['x-api-key'] || req.headers['authorization']?.replace('Bearer ', '');
    
    if (!apiKey) {
      return res.status(401).json({ error: 'API key required' });
    }

    const device = await prisma.trackableDevice.findUnique({
      where: { apiKey },
      include: {
        organization: {
          select: { id: true, name: true, status: true }
        },
        assignedToUser: {
          select: { id: true, displayName: true }
        }
      }
    });

    if (!device) {
      return res.status(401).json({ error: 'Invalid API key' });
    }

    if (!device.isActive) {
      return res.status(403).json({ error: 'Device is deactivated' });
    }

    req.device = device;
    next();
  } catch (error) {
    console.error('[Tracker] Auth error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

// GPS data endpoint
trackerRouter.post('/gps', authenticateVehicle, async (req: any, res: any) => {
  try {
    const { latitude, longitude, speed, heading, altitude, accuracy, timestamp } = req.body;
    const device = req.device;

    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    // Save GPS data
    const gpsData = await prisma.gpsData.create({
      data: {
        trackableDeviceId: device.id,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        speed: speed ? parseFloat(speed) : null,
        heading: heading ? parseFloat(heading) : null,
        altitude: altitude ? parseFloat(altitude) : null,
        accuracy: accuracy ? parseFloat(accuracy) : null,
        timestamp: timestamp ? new Date(timestamp) : new Date()
      }
    });

    // Update device last seen
    await prisma.trackableDevice.update({
      where: { id: device.id },
      data: { lastSeen: new Date() }
    });

    // TODO: Broadcast to WebSocket clients for real-time updates
    
    res.json({
      success: true,
      message: 'GPS data received',
      recordId: gpsData.id
    });

  } catch (error) {
    console.error('[Tracker] GPS data error:', error);
    res.status(500).json({ error: 'Failed to save GPS data' });
  }
});

// Device status endpoint
trackerRouter.get('/status', authenticateVehicle, async (req: any, res: any) => {
  try {
    const device = req.device;

    res.json({
      device: {
        id: device.id,
        name: device.name,
        deviceType: device.deviceType,
        isActive: device.isActive,
        lastSeen: device.lastSeen
      },
      organization: {
        id: device.organization.id,
        name: device.organization.name,
        status: device.organization.status
      },
      assignedDriver: device.assignedToUser ? {
        id: device.assignedToUser.id,
        name: device.assignedToUser.displayName
      } : null
    });

  } catch (error) {
    console.error('[Tracker] Status error:', error);
    res.status(500).json({ error: 'Failed to get device status' });
  }
});

// Heartbeat endpoint
trackerRouter.post('/heartbeat', authenticateVehicle, async (req: any, res: any) => {
  try {
    const device = req.device;

    // Update last seen timestamp
    await prisma.trackableDevice.update({
      where: { id: device.id },
      data: { lastSeen: new Date() }
    });

    res.json({
      success: true,
      serverTime: new Date(),
      message: 'Heartbeat received'
    });

  } catch (error) {
    console.error('[Tracker] Heartbeat error:', error);
    res.status(500).json({ error: 'Heartbeat failed' });
  }
});

export { trackerRouter };

// File: back/src/routes/index.ts
// Last change: Updated route index with new organization and tracker routes

import express from 'express';
import { publicAuthRouter } from './auth.routes.js';
import { organizationRouter } from './organization.routes.js';
import { trackerRouter } from './tracker.routes.js';

const router = express.Router();

// Public routes (no authentication required)
router.use('/auth', publicAuthRouter);

// Protected routes (authentication required)  
router.use('/organizations', organizationRouter);

// Tracker API routes (API key authentication)
router.use('/tracker', trackerRouter);

// Health check
router.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date(),
    services: {
      database: 'connected',
      auth: 'active',
      tracker: 'active'
    }
  });
});

export default router;