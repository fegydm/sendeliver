// File: back/src/services/permissions.service.ts
// Last change: Fixed TypeScript errors and implemented device type based permission system

import { PrismaClient, UserRole, OrganizationMembership } from '@prisma/client';

const prisma = new PrismaClient();

// Define enum locally since it might not be exported from Prisma yet
export enum MembershipDeviceType {
  PERSONAL = 'PERSONAL',
  COMPANY = 'COMPANY'
}

export interface PermissionSet {
  canCreateTrips: boolean;
  canViewAllTrips: boolean;
  canManageVehicles: boolean;
  canAssignDrivers: boolean;
  canViewFinancials: boolean;
  canInviteMembers: boolean;
  canManagePermissions: boolean;
  canViewAnalytics: boolean;
  isSupervised: boolean; // Key field for company devices
}

// Helper type for database record with device_type
type MembershipRecord = OrganizationMembership & {
  device_type?: string; // Raw database field
};

export class DeviceTypePermissionService {
  
  /**
   * Helper method to extract device type from database record
   */
  private static getDeviceTypeFromRecord(membership: any): MembershipDeviceType {
    // Try different possible field names from database
    const deviceTypeValue = membership.deviceType || membership.device_type || 'COMPANY';
    
    // Convert string to enum
    return deviceTypeValue === 'PERSONAL' ? MembershipDeviceType.PERSONAL : MembershipDeviceType.COMPANY;
  }
  
  /**
   * Get effective permissions based on device type and role
   * Core logic from ADR: Device type determines supervision level
   */
  static getEffectivePermissions(
    membership: OrganizationMembership, 
    deviceType: MembershipDeviceType
  ): PermissionSet {
    
    // PERSONAL device type - Full autonomy (like standalone user)
    if (deviceType === MembershipDeviceType.PERSONAL) {
      return this.getPersonalDevicePermissions(membership.role);
    }
    
    // COMPANY device type - Supervised access
    return this.getCompanyDevicePermissions(membership.role);
  }

  /**
   * Personal device permissions - Full access based on role
   */
  private static getPersonalDevicePermissions(role: UserRole): PermissionSet {
    const basePermissions = {
      isSupervised: false, // No supervision for personal devices
    };

    switch (role) {
      case UserRole.driver:
        return {
          ...basePermissions,
          canCreateTrips: true,
          canViewAllTrips: false, // Only own trips
          canManageVehicles: false,
          canAssignDrivers: false,
          canViewFinancials: false,
          canInviteMembers: false,
          canManagePermissions: false,
          canViewAnalytics: false,
        };

      case UserRole.dispatcher:
        return {
          ...basePermissions,
          canCreateTrips: true,
          canViewAllTrips: true,
          canManageVehicles: true,
          canAssignDrivers: true,
          canViewFinancials: false,
          canInviteMembers: true,
          canManagePermissions: false,
          canViewAnalytics: true,
        };

      case UserRole.org_admin:
        return {
          ...basePermissions,
          canCreateTrips: true,
          canViewAllTrips: true,
          canManageVehicles: true,
          canAssignDrivers: true,
          canViewFinancials: true,
          canInviteMembers: true,
          canManagePermissions: true,
          canViewAnalytics: true,
        };

      default:
        return {
          ...basePermissions,
          canCreateTrips: false,
          canViewAllTrips: false,
          canManageVehicles: false,
          canAssignDrivers: false,
          canViewFinancials: false,
          canInviteMembers: false,
          canManagePermissions: false,
          canViewAnalytics: false,
        };
    }
  }

  /**
   * Company device permissions - Supervised access with restrictions
   */
  private static getCompanyDevicePermissions(role: UserRole): PermissionSet {
    const basePermissions = {
      isSupervised: true, // All company devices are supervised
    };

    switch (role) {
      case UserRole.driver:
        return {
          ...basePermissions,
          canCreateTrips: false, // Company drivers can't create own trips
          canViewAllTrips: false, // Only assigned trips
          canManageVehicles: false,
          canAssignDrivers: false,
          canViewFinancials: false,
          canInviteMembers: false,
          canManagePermissions: false,
          canViewAnalytics: false,
        };

      case UserRole.dispatcher:
        return {
          ...basePermissions,
          canCreateTrips: true,
          canViewAllTrips: true,
          canManageVehicles: true,
          canAssignDrivers: true,
          canViewFinancials: false, // Restricted on company devices
          canInviteMembers: true,
          canManagePermissions: false,
          canViewAnalytics: true,
        };

      case UserRole.org_admin:
        return {
          ...basePermissions,
          canCreateTrips: true,
          canViewAllTrips: true,
          canManageVehicles: true,
          canAssignDrivers: true,
          canViewFinancials: true, // Admins have full access even on company devices
          canInviteMembers: true,
          canManagePermissions: true,
          canViewAnalytics: true,
        };

      default:
        return {
          ...basePermissions,
          canCreateTrips: false,
          canViewAllTrips: false,
          canManageVehicles: false,
          canAssignDrivers: false,
          canViewFinancials: false,
          canInviteMembers: false,
          canManagePermissions: false,
          canViewAnalytics: false,
        };
    }
  }

  /**
   * Get user's permissions for specific organization considering device type
   */
  static async getUserPermissionsInOrganization(
    userId: number, 
    organizationId: number
  ): Promise<PermissionSet | null> {
    
    const membership = await prisma.organizationMembership.findUnique({
      where: {
        userId_organizationId: {
          userId,
          organizationId
        }
      },
      include: {
        user: true,
        organization: true
      }
    });

    if (!membership || membership.status !== 'ACTIVE') {
      return null;
    }

    // Extract device type safely from the record
    const deviceType = this.getDeviceTypeFromRecord(membership);

    return this.getEffectivePermissions(membership, deviceType);
  }

  /**
   * Validate if user can perform specific action in organization
   */
  static async canUserPerformAction(
    userId: number,
    organizationId: number,
    action: keyof PermissionSet
  ): Promise<boolean> {
    
    const permissions = await this.getUserPermissionsInOrganization(userId, organizationId);
    
    if (!permissions) {
      return false;
    }

    return permissions[action] === true;
  }

  /**
   * Get supervision status for audit logging
   */
  static async getUserSupervisionStatus(
    userId: number,
    organizationId: number
  ): Promise<{ isSupervised: boolean; deviceType: MembershipDeviceType } | null> {
    
    const membership = await prisma.organizationMembership.findUnique({
      where: {
        userId_organizationId: {
          userId,
          organizationId
        }
      }
    });

    if (!membership) {
      return null;
    }

    // Extract device type safely from the record
    const deviceType = this.getDeviceTypeFromRecord(membership);
    const permissions = this.getEffectivePermissions(membership, deviceType);
    
    return {
      isSupervised: permissions.isSupervised,
      deviceType: deviceType
    };
  }
}