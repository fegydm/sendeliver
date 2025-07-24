// File: back/src/controllers/vehicle.controllers.ts  
// Last change: Complete vehicle CRUD with flexible driver assignment and GPS tracking

import { Request, Response } from 'express';
import { PrismaClient, DeviceType } from '@prisma/client';
import { randomBytes } from 'crypto';

const prisma = new PrismaClient();

// Get all vehicles for organization
export const getOrganizationVehicles = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const orgId = parseInt(req.params.orgId);

    // Verify user has access to this organization
    const hasAccess = await verifyOrganizationAccess(userId!, orgId);
    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied to this organization' });
    }

    const vehicles = await prisma.trackableDevice.findMany({
      where: {
        organizationId: orgId,
        deviceType: DeviceType.VEHICLE
      },
      include: {
        assignedToUser: {
          select: { id: true, displayName: true, email: true, imageUrl: true }
        },
        createdBy: {
          select: { displayName: true }
        },
        gpsData: {
          orderBy: { timestamp: 'desc' },
          take: 1 // latest position
        },
        _count: {
          select: { gpsData: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Get active assignments for each vehicle
    const vehiclesWithAssignments = await Promise.all(
      vehicles.map(async (vehicle) => {
        const activeAssignment = await prisma.deviceAssignment.findFirst({
          where: {
            deviceId: vehicle.id,
            isActive: true
          },
          include: {
            assignedBy: {
              select: { displayName: true }
            }
          },
          orderBy: { assignedAt: 'desc' }
        });

        return {
          id: vehicle.id,
          name: vehicle.name,
          deviceIdentifier: vehicle.deviceIdentifier,
          deviceType: vehicle.deviceType,
          isActive: vehicle.isActive,
          isShared: vehicle.isShared,
          notes: vehicle.notes,
          createdAt: vehicle.createdAt,
          createdBy: vehicle.createdBy?.displayName,
          lastSeen: vehicle.lastSeen,
          assignedTo: vehicle.assignedToUser,
          activeAssignment: activeAssignment ? {
            id: activeAssignment.id,
            assignedAt: activeAssignment.assignedAt,
            assignedBy: activeAssignment.assignedBy.displayName,
            notes: activeAssignment.notes
          } : null,
          lastPosition: vehicle.gpsData[0] || null,
          totalGpsRecords: vehicle._count.gpsData
        };
      })
    );

    res.json({
      vehicles: vehiclesWithAssignments,
      total: vehiclesWithAssignments.length,
      active: vehiclesWithAssignments.filter(v => v.isActive).length
    });

  } catch (error) {
    console.error('[Vehicle] Get vehicles error:', error);
    res.status(500).json({ message: 'Failed to load vehicles' });
  }
};

// Create new vehicle
export const createVehicle = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const orgId = parseInt(req.params.orgId);
    const { name, deviceIdentifier, deviceType, isShared, notes } = req.body;

    if (!name || !deviceType) {
      return res.status(400).json({ message: 'Name and device type are required' });
    }

    // Check if user has permission to manage vehicles
    const hasPermission = await checkUserPermission(userId!, orgId, 'MANAGE_VEHICLES');
    if (!hasPermission) {
      return res.status(403).json({ message: 'No permission to create vehicles' });
    }

    // Check if deviceIdentifier is unique (if provided)
    if (deviceIdentifier) {
      const existingDevice = await prisma.trackableDevice.findUnique({
        where: { deviceIdentifier }
      });

      if (existingDevice) {
        return res.status(409).json({ message: 'Device identifier already exists' });
      }
    }

    // Generate API key for the device
    const apiKey = generateApiKey();

    // Create vehicle
    const vehicle = await prisma.trackableDevice.create({
      data: {
        name,
        deviceIdentifier: deviceIdentifier || generateDeviceIdentifier(),
        deviceType: deviceType as DeviceType,
        apiKey,
        organizationId: orgId,
        createdByUserId: userId,
        isShared: isShared || false,
        notes: notes || null
      },
      include: {
        createdBy: {
          select: { displayName: true }
        }
      }
    });

    res.status(201).json({
      message: 'Vehicle created successfully',
      vehicle: {
        id: vehicle.id,
        name: vehicle.name,
        deviceIdentifier: vehicle.deviceIdentifier,
        apiKey: vehicle.apiKey, // Show API key only on creation
        deviceType: vehicle.deviceType,
        isActive: vehicle.isActive,
        isShared: vehicle.isShared,
        notes: vehicle.notes,
        createdAt: vehicle.createdAt,
        createdBy: vehicle.createdBy?.displayName
      }
    });

  } catch (error) {
    console.error('[Vehicle] Create error:', error);
    res.status(500).json({ message: 'Failed to create vehicle' });
  }
};

// Update vehicle
export const updateVehicle = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const vehicleId = parseInt(req.params.vehicleId);
    const { name, isActive, isShared, notes } = req.body;

    // Get vehicle with organization info
    const vehicle = await prisma.trackableDevice.findUnique({
      where: { id: vehicleId },
      select: { organizationId: true, name: true }
    });

    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    // Check if user has permission to manage vehicles
    const hasPermission = await checkUserPermission(userId!, vehicle.organizationId!, 'MANAGE_VEHICLES');
    if (!hasPermission) {
      return res.status(403).json({ message: 'No permission to update vehicles' });
    }

    // Update vehicle
    const updatedVehicle = await prisma.trackableDevice.update({
      where: { id: vehicleId },
      data: {
        ...(name && { name }),
        ...(typeof isActive === 'boolean' && { isActive }),
        ...(typeof isShared === 'boolean' && { isShared }),
        ...(notes !== undefined && { notes })
      },
      include: {
        assignedToUser: {
          select: { id: true, displayName: true, email: true }
        }
      }
    });

    res.json({
      message: 'Vehicle updated successfully',
      vehicle: {
        id: updatedVehicle.id,
        name: updatedVehicle.name,
        isActive: updatedVehicle.isActive,
        isShared: updatedVehicle.isShared,
        notes: updatedVehicle.notes,
        assignedTo: updatedVehicle.assignedToUser
      }
    });

  } catch (error) {
    console.error('[Vehicle] Update error:', error);
    res.status(500).json({ message: 'Failed to update vehicle' });
  }
};

// Assign driver to vehicle
export const assignDriverToVehicle = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const vehicleId = parseInt(req.params.vehicleId);
    const { driverId, notes } = req.body;

    // Get vehicle with organization info
    const vehicle = await prisma.trackableDevice.findUnique({
      where: { id: vehicleId },
      include: {
        organization: true,
        assignedToUser: {
          select: { id: true, displayName: true }
        }
      }
    });

    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    // Check if user has permission to assign drivers
    const hasPermission = await checkUserPermission(userId!, vehicle.organizationId!, 'ASSIGN_DRIVERS');
    if (!hasPermission) {
      return res.status(403).json({ message: 'No permission to assign drivers' });
    }

    // If driverId is provided, verify the driver exists and belongs to organization
    if (driverId) {
      const driver = await prisma.organizationMembership.findFirst({
        where: {
          userId: driverId,
          organizationId: vehicle.organizationId || undefined,
          status: 'ACTIVE',
          OR: [
            { role: 'driver' },
            { role: 'org_admin' },
            { role: 'dispatcher' }
          ]
        },
        include: {
          user: {
            select: { id: true, displayName: true, email: true }
          }
        }
      });

      if (!driver) {
        return res.status(404).json({ message: 'Driver not found or not authorized for this organization' });
      }

      // Check if vehicle is already assigned to this driver
      if (vehicle.assignedToUserId === driverId) {
        return res.status(409).json({ message: 'Vehicle is already assigned to this driver' });
      }

      // Deactivate previous assignment if exists
      if (vehicle.assignedToUserId) {
        await prisma.deviceAssignment.updateMany({
          where: {
            deviceId: vehicleId,
            isActive: true
          },
          data: {
            isActive: false,
            unassignedAt: new Date(),
            unassignedByUserId: userId
          }
        });
      }

      // Create new assignment record
      await prisma.deviceAssignment.create({
        data: {
          deviceId: vehicleId,
          userId: driverId,
          assignedByUserId: userId!,
          notes: notes || null
        }
      });

      // Update vehicle assignment
      await prisma.trackableDevice.update({
        where: { id: vehicleId },
        data: {
          assignedToUserId: driverId
        }
      });

      res.json({
        message: 'Driver assigned successfully',
        assignment: {
          vehicleName: vehicle.name,
          driverName: driver.user.displayName,
          assignedAt: new Date()
        }
      });

    } else {
      // Unassign driver
      if (!vehicle.assignedToUserId) {
        return res.status(409).json({ message: 'Vehicle is not currently assigned to any driver' });
      }

      // Deactivate current assignment
      await prisma.deviceAssignment.updateMany({
        where: {
          deviceId: vehicleId,
          isActive: true
        },
        data: {
          isActive: false,
          unassignedAt: new Date(),
          unassignedByUserId: userId,
          notes: notes || null
        }
      });

      // Clear vehicle assignment
      await prisma.trackableDevice.update({
        where: { id: vehicleId },
        data: {
          assignedToUserId: null
        }
      });

      res.json({
        message: 'Driver unassigned successfully',
        vehicleName: vehicle.name,
        previousDriver: vehicle.assignedToUser?.displayName
      });
    }

  } catch (error) {
    console.error('[Vehicle] Assign driver error:', error);
    res.status(500).json({ message: 'Failed to assign driver' });
  }
};

// Get vehicle assignment history
export const getVehicleAssignmentHistory = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const vehicleId = parseInt(req.params.vehicleId);

    // Get vehicle and verify access
    const vehicle = await prisma.trackableDevice.findUnique({
      where: { id: vehicleId },
      select: { organizationId: true, name: true }
    });

    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    const hasAccess = await verifyOrganizationAccess(userId!, vehicle.organizationId!);
    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Get assignment history
    const assignments = await prisma.deviceAssignment.findMany({
      where: { deviceId: vehicleId },
      include: {
        user: {
          select: { id: true, displayName: true, email: true }
        },
        assignedBy: {
          select: { displayName: true }
        },
        unassignedBy: {
          select: { displayName: true }
        }
      },
      orderBy: { assignedAt: 'desc' }
    });

    res.json({
      vehicleName: vehicle.name,
      assignments: assignments.map(assignment => ({
        id: assignment.id,
        driver: assignment.user ? {
          id: assignment.user.id,
          name: assignment.user.displayName,
          email: assignment.user.email
        } : null,
        assignedAt: assignment.assignedAt,
        assignedBy: assignment.assignedBy.displayName,
        unassignedAt: assignment.unassignedAt,
        unassignedBy: assignment.unassignedBy?.displayName,
        isActive: assignment.isActive,
        notes: assignment.notes
      })),
      total: assignments.length
    });

  } catch (error) {
    console.error('[Vehicle] Assignment history error:', error);
    res.status(500).json({ message: 'Failed to load assignment history' });
  }
};

// Get vehicle GPS tracking data
export const getVehicleGpsData = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const vehicleId = parseInt(req.params.vehicleId);
    const { startDate, endDate, limit = 100 } = req.query;

    // Get vehicle and verify access
    const vehicle = await prisma.trackableDevice.findUnique({
      where: { id: vehicleId },
      select: { organizationId: true, name: true, isActive: true }
    });

    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    const hasAccess = await verifyOrganizationAccess(userId!, vehicle.organizationId!);
    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Build where clause for date filtering
    const whereClause: any = { trackableDeviceId: vehicleId };
    
    if (startDate || endDate) {
      whereClause.timestamp = {};
      if (startDate) whereClause.timestamp.gte = new Date(startDate as string);
      if (endDate) whereClause.timestamp.lte = new Date(endDate as string);
    }

    // Get GPS data
    const gpsData = await prisma.gpsData.findMany({
      where: whereClause,
      orderBy: { timestamp: 'desc' },
      take: parseInt(limit as string),
      select: {
        id: true,
        latitude: true,
        longitude: true,
        speed: true,
        heading: true,
        altitude: true,
        accuracy: true,
        timestamp: true
      }
    });

    // Get summary statistics
    const stats = await prisma.gpsData.aggregate({
      where: whereClause,
      _count: { id: true },
      _avg: { speed: true },
      _max: { speed: true }
    });

    res.json({
      vehicleName: vehicle.name,
      isActive: vehicle.isActive,
      gpsData,
      summary: {
        totalRecords: stats._count.id,
        averageSpeed: stats._avg.speed,
        maxSpeed: stats._max.speed,
        dateRange: {
          start: startDate,
          end: endDate
        }
      }
    });

  } catch (error) {
    console.error('[Vehicle] GPS data error:', error);
    res.status(500).json({ message: 'Failed to load GPS data' });
  }
};

// Delete vehicle
export const deleteVehicle = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const vehicleId = parseInt(req.params.vehicleId);

    // Get vehicle with organization info
    const vehicle = await prisma.trackableDevice.findUnique({
      where: { id: vehicleId },
      include: {
        _count: {
          select: { gpsData: true }
        }
      }
    });

    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    // Check if user has permission to manage vehicles
    const hasPermission = await checkUserPermission(userId!, vehicle.organizationId!, 'MANAGE_VEHICLES');
    if (!hasPermission) {
      return res.status(403).json({ message: 'No permission to delete vehicles' });
    }

    // Check if vehicle has GPS data (optional warning)
    const hasGpsData = vehicle._count.gpsData > 0;

    // Deactivate all assignments first
    await prisma.deviceAssignment.updateMany({
      where: {
        deviceId: vehicleId,
        isActive: true
      },
      data: {
        isActive: false,
        unassignedAt: new Date(),
        unassignedByUserId: userId
      }
    });

    // Delete the vehicle (cascading will handle GPS data and assignments)
    await prisma.trackableDevice.delete({
      where: { id: vehicleId }
    });

    res.json({
      message: 'Vehicle deleted successfully',
      vehicleName: vehicle.name,
      deletedGpsRecords: vehicle._count.gpsData
    });

  } catch (error) {
    console.error('[Vehicle] Delete error:', error);
    res.status(500).json({ message: 'Failed to delete vehicle' });
  }
};

// Utility functions
async function verifyOrganizationAccess(userId: number, orgId: number): Promise<boolean> {
  const membership = await prisma.organizationMembership.findFirst({
    where: {
      userId,
      organizationId: orgId,
      status: 'ACTIVE'
    }
  });
  return !!membership;
}

async function checkUserPermission(userId: number, orgId: number, permission: string): Promise<boolean> {
  // Org admins have all permissions
  const membership = await prisma.organizationMembership.findFirst({
    where: {
      userId,
      organizationId: orgId,
      status: 'ACTIVE',
      role: 'org_admin'
    }
  });

  if (membership) return true;

  // Check specific permission
  const hasPermission = await prisma.organizationPermission.findFirst({
    where: {
      userId,
      organizationId: orgId,
      permission: permission as any
    }
  });

  return !!hasPermission;
}

function generateApiKey(): string {
  return 'vk_' + randomBytes(32).toString('hex');
}

function generateDeviceIdentifier(): string {
  return 'DEV_' + Date.now() + '_' + randomBytes(4).toString('hex').toUpperCase();
}