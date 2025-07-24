// File: back/src/routes/organization.routes.ts
// Last change: Clean organization routes without duplicates

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