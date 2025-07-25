// File: back/src/middlewares/device-type.middleware.ts
// Last change: Using any types to avoid TypeScript conflicts

import { Request, Response, NextFunction } from 'express';
import { DeviceTypePermissionService, PermissionSet } from '../services/permissions.services.js';

/**
 * Simple middleware to extract organization ID from request
 */
export const extractOrganizationId = (req: any, res: Response, next: NextFunction) => {
  const orgId = req.params.organizationId || req.query.organizationId || req.body.organizationId;
  
  if (!orgId) {
    return res.status(400).json({ 
      error: 'Organization ID is required',
      message: 'Poskytni organizationId v URL, query alebo body'
    });
  }

  req.organizationId = parseInt(orgId.toString());
  next();
};

/**
 * Simple middleware to load user permissions
 */
export const loadPermissions = async (req: any, res: Response, next: NextFunction) => {
  // Support both old and new auth format
  const userId = req.user?.userId || parseInt(req.user?.id || '0');
  
  if (!userId || !req.organizationId) {
    return res.status(401).json({ 
      error: 'Authentication required',
      message: 'Najprv sa prihlás a poskytni organizationId'
    });
  }

  try {
    const permissions = await DeviceTypePermissionService.getUserPermissionsInOrganization(
      userId,
      req.organizationId
    );

    if (!permissions) {
      return res.status(403).json({ 
        error: 'Not a member',
        message: 'Nie si členom tejto organizácie alebo nie si aktívny'
      });
    }

    req.userPermissions = permissions;
    next();
    
  } catch (error) {
    console.error('Error loading permissions:', error);
    return res.status(500).json({ 
      error: 'Permission load failed',
      message: 'Nepodarilo sa načítať oprávnenia'
    });
  }
};

/**
 * Simple permission check middleware
 */
export const requirePermission = (permission: keyof PermissionSet) => {
  return (req: any, res: Response, next: NextFunction) => {
    if (!req.userPermissions) {
      return res.status(500).json({ 
        error: 'Permissions not loaded',
        message: 'Oprávnenia neboli načítané - používaj loadPermissions middleware'
      });
    }

    if (!req.userPermissions[permission]) {
      const userId = req.user?.userId || req.user?.id;
      
      console.log(`[PERMISSION_DENIED] User ${userId} denied ${permission}:`, {
        organizationId: req.organizationId,
        isSupervised: req.userPermissions.isSupervised
      });

      return res.status(403).json({ 
        error: 'Insufficient permissions',
        message: `Nemáš oprávnenie: ${permission}`,
        required: permission,
        isSupervised: req.userPermissions.isSupervised
      });
    }

    const userId = req.user?.userId || req.user?.id;
    console.log(`[PERMISSION_GRANTED] User ${userId} granted ${permission}`);
    next();
  };
};