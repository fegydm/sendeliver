// File: back/src/controllers/organization.controllers.ts
// Last change: Complete organization management with invitations, permissions, and vehicles

import { Request, Response, NextFunction } from 'express';
import { PrismaClient, UserRole, OrgMembershipStatus, VerificationStatus } from '@prisma/client';
import { randomBytes } from 'crypto';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';

// Get organization dashboard data
export const getOrganizationDashboard = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const orgId = parseInt(req.params.orgId);

    // Verify user has access to this organization
    const membership = await prisma.organizationMembership.findFirst({
      where: {
        userId: userId,
        organizationId: orgId,
        status: OrgMembershipStatus.ACTIVE
      }
    });

    if (!membership) {
      return res.status(403).json({ message: 'Access denied to this organization' });
    }

    // Get organization with related data
    const organization = await prisma.organization.findUnique({
      where: { id: orgId },
      include: {
        memberships: {
          where: { status: OrgMembershipStatus.ACTIVE },
          include: {
            user: {
              select: { id: true, displayName: true, email: true, imageUrl: true }
            }
          }
        },
        trackableDevices: {
          include: {
            assignedToUser: {
              select: { id: true, displayName: true, email: true }
            },
            gpsData: {
              orderBy: { timestamp: 'desc' },
              take: 1 // latest GPS position
            }
          }
        }
      }
    });

    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    // Get user permissions in this org
    const permissions = await prisma.organizationPermission.findMany({
      where: {
        organizationId: orgId,
        userId: userId
      },
      select: { permission: true }
    });

    // Get pending invitations and join requests (only for users with permissions)
    const canManageMembers = permissions.some(p => p.permission === 'INVITE_MEMBERS') || 
                            membership.role === 'org_admin';
    
    let pendingInvitations: any[] = [];
    let joinRequests: any[] = [];

    if (canManageMembers) {
      pendingInvitations = await prisma.organizationInvitation.findMany({
        where: {
          organizationId: orgId,
          status: 'PENDING',
          expiresAt: { gt: new Date() }
        },
        include: {
          invitedBy: {
            select: { displayName: true, email: true }
          }
        }
      });

      joinRequests = await prisma.organizationJoinRequest.findMany({
        where: {
          organizationId: orgId,
          status: 'PENDING'
        },
        include: {
          user: {
            select: { id: true, displayName: true, email: true, imageUrl: true }
          }
        }
      });
    }

    res.json({
      organization: {
        id: organization.id,
        name: organization.name,
        type: organization.type,
        status: organization.status,
        vatNumber: organization.vatNumber,
        foundedAt: organization.foundedAt
      },
      members: organization.memberships.map(m => ({
        id: m.id,
        user: m.user,
        role: m.role,
        joinedAt: m.createdAt
      })),
      vehicles: organization.trackableDevices.map(device => ({
        id: device.id,
        name: device.name,
        deviceType: device.deviceType,
        isActive: device.isActive,
        assignedTo: device.assignedToUser,
        lastPosition: device.gpsData[0] || null,
        lastSeen: device.lastSeen
      })),
      userRole: membership.role,
      userPermissions: permissions.map(p => p.permission),
      pendingInvitations,
      joinRequests
    });

  } catch (error) {
    console.error('[Org] Dashboard error:', error);
    res.status(500).json({ message: 'Failed to load organization dashboard' });
  }
};

// Invite user to organization
export const inviteUserToOrganization = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const orgId = parseInt(req.params.orgId);
    const { email, role } = req.body;

    if (!email || !role) {
      return res.status(400).json({ message: 'Email and role are required' });
    }

    // Check if user has permission to invite
    const hasPermission = await checkUserPermission(userId!, orgId, 'INVITE_MEMBERS');
    if (!hasPermission) {
      return res.status(403).json({ message: 'No permission to invite users' });
    }

    // Check if user is already a member
    const existingMembership = await prisma.organizationMembership.findFirst({
      where: {
        organizationId: orgId,
        user: { email: email.toLowerCase() }
      }
    });

    if (existingMembership) {
      return res.status(409).json({ message: 'User is already a member of this organization' });
    }

    // Check for existing pending invitation
    const existingInvitation = await prisma.organizationInvitation.findFirst({
      where: {
        organizationId: orgId,
        email: email.toLowerCase(),
        status: 'PENDING',
        expiresAt: { gt: new Date() }
      }
    });

    if (existingInvitation) {
      return res.status(409).json({ message: 'Invitation already sent to this email' });
    }

    // Create invitation
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const invitation = await prisma.organizationInvitation.create({
      data: {
        organizationId: orgId,
        invitedByUserId: userId!,
        email: email.toLowerCase(),
        role: role as UserRole,
        token,
        expiresAt
      },
      include: {
        organization: { select: { name: true } },
        invitedBy: { select: { displayName: true } }
      }
    });

    // TODO: Send invitation email
    console.log(`[DEV] Invitation link: ${process.env.FRONTEND_URL}/accept-invitation?token=${token}`);

    res.status(201).json({
      message: 'Invitation sent successfully',
      invitation: {
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        expiresAt: invitation.expiresAt
      }
    });

  } catch (error) {
    console.error('[Org] Invite error:', error);
    res.status(500).json({ message: 'Failed to send invitation' });
  }
};

// Accept organization invitation
export const acceptInvitation = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: 'Invitation token is required' });
    }

    const invitation = await prisma.organizationInvitation.findUnique({
      where: { token },
      include: {
        organization: true
      }
    });

    if (!invitation) {
      return res.status(404).json({ message: 'Invalid invitation token' });
    }

    if (invitation.expiresAt < new Date()) {
      return res.status(410).json({ message: 'Invitation has expired' });
    }

    if (invitation.status !== 'PENDING') {
      return res.status(409).json({ message: 'Invitation has already been processed' });
    }

    // Check if user exists
    let user = await prisma.user.findUnique({
      where: { email: invitation.email }
    });

    if (!user) {
      // Create user account - they'll need to complete setup
      user = await prisma.user.create({
        data: {
          email: invitation.email,
          primaryRole: invitation.role,
          userType: 'ORGANIZED',
          isEmailVerified: false // They'll need to verify
        }
      });
    }

    // Create membership
    await prisma.organizationMembership.create({
      data: {
        userId: user.id,
        organizationId: invitation.organizationId,
        role: invitation.role,
        status: OrgMembershipStatus.ACTIVE
      }
    });

    // Mark invitation as accepted
    await prisma.organizationInvitation.update({
      where: { id: invitation.id },
      data: { status: 'ACCEPTED' }
    });

    res.json({
      message: 'Invitation accepted successfully',
      organization: {
        id: invitation.organization.id,
        name: invitation.organization.name
      },
      needsAccountSetup: !user.passwordHash && !user.googleId
    });

  } catch (error) {
    console.error('[Org] Accept invitation error:', error);
    res.status(500).json({ message: 'Failed to accept invitation' });
  }
};

// Request to join organization (driver-initiated)
export const requestToJoinOrganization = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const orgId = parseInt(req.params.orgId);
    const { requestedRole, message } = req.body;

    // Check if organization exists and allows join requests
    const organization = await prisma.organization.findUnique({
      where: { id: orgId }
    });

    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    // Check if user is already a member
    const existingMembership = await prisma.organizationMembership.findFirst({
      where: {
        userId: userId,
        organizationId: orgId
      }
    });

    if (existingMembership) {
      return res.status(409).json({ message: 'You are already a member of this organization' });
    }

    // Check for existing pending request
    const existingRequest = await prisma.organizationJoinRequest.findFirst({
      where: {
        userId: userId,
        organizationId: orgId,
        status: 'PENDING'
      }
    });

    if (existingRequest) {
      return res.status(409).json({ message: 'You already have a pending request for this organization' });
    }

    // Create join request
    const joinRequest = await prisma.organizationJoinRequest.create({
      data: {
        userId: userId!,
        organizationId: orgId,
        requestedRole: requestedRole as UserRole,
        message: message || null
      },
      include: {
        user: {
          select: { displayName: true, email: true }
        },
        organization: {
          select: { name: true }
        }
      }
    });

    // TODO: Notify organization admins about new join request

    res.status(201).json({
      message: 'Join request submitted successfully',
      request: {
        id: joinRequest.id,
        organizationName: joinRequest.organization.name,
        requestedRole: joinRequest.requestedRole,
        status: joinRequest.status
      }
    });

  } catch (error) {
    console.error('[Org] Join request error:', error);
    res.status(500).json({ message: 'Failed to submit join request' });
  }
};

// Approve/reject join request
export const reviewJoinRequest = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const requestId = parseInt(req.params.requestId);
    const { action } = req.body; // 'approve' or 'reject'

    const joinRequest = await prisma.organizationJoinRequest.findUnique({
      where: { id: requestId },
      include: {
        user: {
          select: { id: true, displayName: true, email: true }
        },
        organization: {
          select: { id: true, name: true }
        }
      }
    });

    if (!joinRequest) {
      return res.status(404).json({ message: 'Join request not found' });
    }

    // Check if user has permission to review requests
    const hasPermission = await checkUserPermission(userId!, joinRequest.organizationId, 'INVITE_MEMBERS');
    if (!hasPermission) {
      return res.status(403).json({ message: 'No permission to review join requests' });
    }

    if (joinRequest.status !== 'PENDING') {
      return res.status(409).json({ message: 'Join request has already been processed' });
    }

    if (action === 'approve') {
      // Create membership
      await prisma.organizationMembership.create({
        data: {
          userId: joinRequest.userId,
          organizationId: joinRequest.organizationId,
          role: joinRequest.requestedRole,
          status: OrgMembershipStatus.ACTIVE
        }
      });

      // Update user type if they were standalone
      await prisma.user.update({
        where: { id: joinRequest.userId },
        data: { userType: 'ORGANIZED' }
      });
    }

    // Update request status
    await prisma.organizationJoinRequest.update({
      where: { id: requestId },
      data: {
        status: action === 'approve' ? 'APPROVED' : 'REJECTED',
        reviewedAt: new Date(),
        reviewedByUserId: userId!
      }
    });

    res.json({
      message: `Join request ${action}d successfully`,
      request: {
        id: joinRequest.id,
        userName: joinRequest.user.displayName,
        status: action === 'approve' ? 'APPROVED' : 'REJECTED'
      }
    });

  } catch (error) {
    console.error('[Org] Review join request error:', error);
    res.status(500).json({ message: 'Failed to review join request' });
  }
};

// Utility function to check user permissions
async function checkUserPermission(userId: number, orgId: number, permission: string): Promise<boolean> {
  // Org admins have all permissions
  const membership = await prisma.organizationMembership.findFirst({
    where: {
      userId,
      organizationId: orgId,
      status: OrgMembershipStatus.ACTIVE,
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

// Toggle forwarder mode (CLIENT/CARRIER)
export const toggleForwarderMode = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { mode } = req.body; // 'CLIENT' or 'CARRIER'

    if (!['CLIENT', 'CARRIER'].includes(mode)) {
      return res.status(400).json({ message: 'Invalid mode. Must be CLIENT or CARRIER' });
    }

    // Verify user belongs to a FORWARDER organization
    const forwarderMembership = await prisma.organizationMembership.findFirst({
      where: {
        userId: userId,
        status: OrgMembershipStatus.ACTIVE,
        organization: {
          type: 'FORWARDER'
        }
      }
    });

    if (!forwarderMembership) {
      return res.status(403).json({ message: 'Only forwarder organization members can toggle mode' });
    }

    // Update user's active forwarder mode
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        forwarderActiveMode: mode as any
      },
      select: {
        id: true,
        forwarderActiveMode: true
      }
    });

    res.json({
      message: `Switched to ${mode} mode`,
      activeMode: updatedUser.forwarderActiveMode
    });

  } catch (error) {
    console.error('[Org] Toggle forwarder mode error:', error);
    res.status(500).json({ message: 'Failed to toggle forwarder mode' });
  }
};