// File: back/src/routes/device-type-test.routes.ts
// Last change: Simple test routes for device type functionality

import { Router } from 'express';
import { authenticateJWT } from '../middlewares/auth.middleware.js';
import { 
  extractOrganizationId, 
  loadPermissions, 
  requirePermission 
} from '../middlewares/device-type.middleware.js';

export const deviceTypeTestRouter = Router();

// All routes require authentication
deviceTypeTestRouter.use(authenticateJWT);

/**
 * Test route: Get user permissions in organization
 * GET /device-type-test/:organizationId/permissions
 */
deviceTypeTestRouter.get('/:organizationId/permissions', 
  extractOrganizationId,
  loadPermissions,
  (req: any, res: any) => {
    res.json({
      success: true,
      organizationId: req.organizationId,
      permissions: req.userPermissions,
      message: 'Permissions loaded successfully'
    });
  }
);

/**
 * Test route: Test canCreateTrips permission
 * GET /device-type-test/:organizationId/test-create-trips
 */
deviceTypeTestRouter.get('/:organizationId/test-create-trips',
  extractOrganizationId,
  loadPermissions,
  requirePermission('canCreateTrips'),
  (req: any, res: any) => {
    res.json({
      success: true,
      message: 'User CAN create trips',
      isSupervised: req.userPermissions.isSupervised,
      deviceType: req.userPermissions.isSupervised ? 'COMPANY' : 'PERSONAL'
    });
  }
);

/**
 * Test route: Test canManageVehicles permission
 * GET /device-type-test/:organizationId/test-manage-vehicles
 */
deviceTypeTestRouter.get('/:organizationId/test-manage-vehicles',
  extractOrganizationId,
  loadPermissions,
  requirePermission('canManageVehicles'),
  (req: any, res: any) => {
    res.json({
      success: true,
      message: 'User CAN manage vehicles',
      isSupervised: req.userPermissions.isSupervised
    });
  }
);

/**
 * Test route: Test canViewFinancials permission
 * GET /device-type-test/:organizationId/test-view-financials
 */
deviceTypeTestRouter.get('/:organizationId/test-view-financials',
  extractOrganizationId,
  loadPermissions,
  requirePermission('canViewFinancials'),
  (req: any, res: any) => {
    res.json({
      success: true,
      message: 'User CAN view financials',
      isSupervised: req.userPermissions.isSupervised
    });
  }
);

/**
 * Test route: Simulate trip creation
 * POST /device-type-test/:organizationId/create-trip
 */
deviceTypeTestRouter.post('/:organizationId/create-trip',
  extractOrganizationId,
  loadPermissions,
  requirePermission('canCreateTrips'),
  (req: any, res: any) => {
    const { destination, vehicleId } = req.body;
    
    res.json({
      success: true,
      message: `Trip to ${destination} created successfully`,
      tripData: {
        destination,
        vehicleId,
        createdBy: req.user?.userId || req.user?.id,
        deviceRestrictions: {
          isSupervised: req.userPermissions.isSupervised,
          canCreateIndependentTrips: req.userPermissions.canCreateTrips
        }
      }
    });
  }
);