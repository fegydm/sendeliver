// File: back/src/routes/organization.routes.ts
// Last change: Fixed import names to match actual middleware exports

import { Router } from 'express';
import { authenticateJWT } from '../middlewares/auth.middleware.js';
import { 
  extractOrganizationId,  // OPRAVENÉ: bol extractOrganizationContext
  loadPermissions,        // OPRAVENÉ: bol loadUserPermissions
  requirePermission
} from '../middlewares/device-type.middleware.js';

const router = Router();

// All routes require authentication
router.use(authenticateJWT);

/**
 * Driver requests to join organization
 * No special permissions needed - any authenticated user can request
 */
router.post('/join-request', 
  (req: any, res: any) => {
    // TODO: Implement join request logic
    res.json({ 
      message: 'Join request functionality - to be implemented',
      body: req.body 
    });
  }
);

/**
 * Get user's effective permissions in organization
 * Useful for frontend to show/hide UI elements
 */
router.get('/:organizationId/my-permissions',
  extractOrganizationId,
  loadPermissions,
  (req: any, res: any) => {
    res.json({
      success: true,
      permissions: req.userPermissions,
      organizationId: req.organizationId,
      isSupervised: req.userPermissions.isSupervised
    });
  }
);

/**
 * Create trip - different permissions based on device type
 * Personal device: Full autonomy
 * Company device: Restricted for drivers, full for dispatchers
 */
router.post('/:organizationId/trips',
  extractOrganizationId,
  loadPermissions,
  requirePermission('canCreateTrips'),
  (req: any, res: any) => {
    res.json({ 
      success: true,
      message: 'Trip created successfully',
      isSupervised: req.userPermissions.isSupervised,
      tripData: req.body
    });
  }
);

/**
 * Manage vehicles - requires canManageVehicles
 * Company drivers are excluded from this
 */
router.post('/:organizationId/vehicles',
  extractOrganizationId,
  loadPermissions,
  requirePermission('canManageVehicles'),
  (req: any, res: any) => {
    res.json({ 
      success: true,
      message: 'Vehicle management access granted',
      isSupervised: req.userPermissions.isSupervised,
      vehicleData: req.body
    });
  }
);

/**
 * View financials - sensitive operation
 * Restricted for company devices (except admins)
 */
router.get('/:organizationId/financials',
  extractOrganizationId,
  loadPermissions,
  requirePermission('canViewFinancials'),
  (req: any, res: any) => {
    res.json({ 
      success: true,
      message: 'Financial data access granted',
      supervisionLevel: req.userPermissions.isSupervised ? 'supervised' : 'autonomous',
      financialData: {
        revenue: 125000,
        expenses: 89000,
        profit: 36000
      }
    });
  }
);

/**
 * Assign drivers - dispatcher function
 * Available based on device type and role
 */
router.post('/:organizationId/assign-driver',
  extractOrganizationId,
  loadPermissions,
  requirePermission('canAssignDrivers'),
  (req: any, res: any) => {
    res.json({ 
      success: true,
      message: 'Driver assignment access granted',
      permissions: req.userPermissions,
      assignmentData: req.body
    });
  }
);

/**
 * Get organization members
 * Requires: canViewAnalytics permission
 */
router.get('/:organizationId/members',
  extractOrganizationId,
  loadPermissions,
  requirePermission('canViewAnalytics'),
  (req: any, res: any) => {
    // TODO: Implement real member fetching
    res.json({
      success: true,
      message: 'Members list access granted',
      organizationId: req.organizationId,
      members: [
        { id: 1, name: 'Test User', role: 'driver', deviceType: 'COMPANY' },
        { id: 2, name: 'Test Admin', role: 'org_admin', deviceType: 'PERSONAL' }
      ]
    });
  }
);

export default router;