// File: src/validation/device-type.validation.ts
// Last change: Added validation schemas for device type operations

import { z } from 'zod';
import { UserRole } from '@prisma/client';
import { MembershipDeviceType } from '../services/permissions.services.js';
/**
 * Schema for join request submission
 */
export const joinRequestSchema = z.object({
  organizationId: z.number().int().positive(),
  requestedRole: z.nativeEnum(UserRole),
  requestedDeviceType: z.nativeEnum(MembershipDeviceType).optional(),
  message: z.string().max(500).optional()
});

/**
 * Schema for join request review (dispatcher action)
 */
export const reviewJoinRequestSchema = z.object({
  action: z.enum(['approve', 'reject']),
  finalDeviceType: z.nativeEnum(MembershipDeviceType).optional(),
  finalRole: z.nativeEnum(UserRole).optional(),
  reviewNotes: z.string().max(500).optional()
});

/**
 * Schema for device type update
 */
export const updateDeviceTypeSchema = z.object({
  deviceType: z.nativeEnum(MembershipDeviceType),
  reason: z.string().max(200).optional()
});

/**
 * Schema for organization invitation with device type
 */
export const organizationInvitationSchema = z.object({
  email: z.string().email(),
  role: z.nativeEnum(UserRole),
  deviceType: z.nativeEnum(MembershipDeviceType).default(MembershipDeviceType.COMPANY),
  message: z.string().max(500).optional()
});

/**
 * Validation middleware factory
 */
export const validateBody = (schema: z.ZodSchema) => {
  return (req: any, res: any, next: any) => {
    try {
      const validatedData = schema.parse(req.body);
      req.body = validatedData;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation failed',
          details: error.errors
        });
      }
      next(error);
    }
  };
};

/**
 * Device type business logic validations
 */
export class DeviceTypeValidator {
  
  /**
   * Validate device type assignment based on role
   * Some roles may have restrictions on device types
   */
  static validateDeviceTypeForRole(role: UserRole, deviceType: MembershipDeviceType): string[] {
    const errors: string[] = [];

    // Business rules based on ADR
    switch (role) {
      case UserRole.driver:
        // Drivers can have both personal and company devices
        break;
        
      case UserRole.dispatcher:
        // Dispatchers typically use company devices, but personal is allowed
        break;
        
      case UserRole.org_admin:
        // Admins can use any device type
        break;
        
      case UserRole.external_worker:
        // External workers should typically use personal devices
        if (deviceType === MembershipDeviceType.COMPANY) {
          errors.push('External workers should typically use personal devices');
        }
        break;
        
      case UserRole.accountant:
        // Accountants handling sensitive data should prefer personal devices
        if (deviceType === MembershipDeviceType.COMPANY) {
          errors.push('Accountants should use personal devices for sensitive financial operations');
        }
        break;
        
      default:
        // Default case - no specific restrictions
        break;
    }

    return errors;
  }

  /**
   * Validate permission combinations
   * Ensure logical consistency in permission grants
   */
  static validatePermissionLogic(
    role: UserRole, 
    deviceType: MembershipDeviceType,
    requestedPermissions: string[]
  ): string[] {
    const errors: string[] = [];

    // Company device drivers shouldn't have trip creation permissions
    if (role === UserRole.driver && 
        deviceType === MembershipDeviceType.COMPANY && 
        requestedPermissions.includes('canCreateTrips')) {
      errors.push('Company device drivers cannot create independent trips');
    }

    // Personal device users with sensitive permissions should be validated
    if (deviceType === MembershipDeviceType.PERSONAL &&
        requestedPermissions.includes('canViewFinancials')) {
      // This is allowed but should be logged for audit
      console.log(`[AUDIT] Personal device user granted financial access: role=${role}`);
    }

    return errors;
  }

  /**
   * Validate device type change request
   * Some changes may require additional verification
   */
  static validateDeviceTypeChange(
    currentType: MembershipDeviceType,
    newType: MembershipDeviceType,
    userRole: UserRole
  ): { allowed: boolean; warnings: string[]; requirements: string[] } {
    const warnings: string[] = [];
    const requirements: string[] = [];

    // Personal -> Company: Generally safe
    if (currentType === MembershipDeviceType.PERSONAL && 
        newType === MembershipDeviceType.COMPANY) {
      warnings.push('User will lose some autonomous privileges');
      requirements.push('Ensure user has been provided with company device');
    }

    // Company -> Personal: Requires verification
    if (currentType === MembershipDeviceType.COMPANY && 
        newType === MembershipDeviceType.PERSONAL) {
      warnings.push('User will gain autonomous access');
      requirements.push('Verify user device ownership');
      requirements.push('Update asset management records');
      
      if (userRole === UserRole.driver) {
        warnings.push('Driver will be able to create independent trips');
      }
    }

    return {
      allowed: true, // Generally allowed, but with warnings
      warnings,
      requirements
    };
  }
}