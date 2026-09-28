import { prisma } from '../config/prisma.js';
import { apiError } from '../utils/response.js';

/**
 * Tenant Isolation Middleware
 * Enforces strict organization-level scoping for all customer workspace requests.
 * Derives active organization securely from server-side authenticated user session/memberships.
 * Never blindly trusts user-supplied organization headers.
 */
export async function requireTenant(req, res, next) {
  try {
    if (!req.user) {
      return apiError(res, 'Authentication required before tenant scoping.', 401);
    }

    // Check if an explicit organization was requested via header or query, or use token claim
    const requestedOrgId = req.headers['x-organization-id'] || req.query.orgId || req.user.activeOrgId;

    // Fetch user memberships
    const memberships = await prisma.organizationMembership.findMany({
      where: {
        userId: req.user.id,
        status: 'ACTIVE',
      },
      include: {
        organization: true,
        role: {
          include: {
            permissions: true,
          },
        },
        department: true,
        branch: true,
      },
    });

    if (!memberships || memberships.length === 0) {
      return apiError(res, 'Access Denied: You do not belong to any active organization workspace.', 403);
    }

    // Determine target membership
    let targetMembership = null;

    if (requestedOrgId) {
      targetMembership = memberships.find(
        (m) => m.organizationId === requestedOrgId || m.organization.slug === requestedOrgId
      );

      // If user attempted to access an organization they do NOT belong to:
      if (!targetMembership) {
        // Log cross-tenant security breach attempt
        await prisma.platformSecurityEvent.create({
          data: {
            eventType: 'CROSS_TENANT_ACCESS_ATTEMPT',
            severity: 'HIGH',
            ipAddress: req.ip || req.connection?.remoteAddress,
            userId: req.user.id,
            organizationId: requestedOrgId,
            details: `User ${req.user.email} attempted unauthorized access to unassigned organization: ${requestedOrgId}`,
          },
        }).catch(() => {});

        return apiError(res, 'Security Violation: You are not authorized to access this organization workspace.', 403);
      }
    } else {
      // Default to the user's primary/first active membership
      targetMembership = memberships.find((m) => m.isOwner) || memberships[0];
    }

    // Check organization active status
    const org = targetMembership.organization;
    if (org.status === 'SUSPENDED') {
      return apiError(res, 'Organization workspace is suspended. Please contact DASA TECH support.', 403);
    }

    if (org.status === 'CANCELLED') {
      return apiError(res, 'Organization subscription has been cancelled.', 403);
    }

    // Attach verified tenant context to request
    req.orgId = org.id;
    req.organization = org;
    req.membership = targetMembership;
    req.isOrgOwner = targetMembership.isOwner;
    req.orgRole = targetMembership.role;
    req.orgPermissions = targetMembership.role?.permissions || [];
    req.userMemberships = memberships.map((m) => ({
      organizationId: m.organizationId,
      organizationName: m.organization.name,
      slug: m.organization.slug,
      isOwner: m.isOwner,
      roleTitle: m.roleTitle,
    }));

    next();
  } catch (error) {
    console.error('Tenant isolation error:', error);
    return apiError(res, 'Tenant authorization verification failed.', 500);
  }
}

/**
 * Check Granular Permission within Organization
 * @param {string} module - QUOTATIONS, INVOICES, PAYMENTS, EXPENSES, PROJECTS, TREASURY, DOCUMENTS, TEAM, REPORTS, SETTINGS
 * @param {string} action - canView, canCreate, canEdit, canSubmit, canApprove, canReject, canDelete, canExport
 */
export function requirePermission(module, action = 'canView') {
  return (req, res, next) => {
    // Organization owners have unrestricted permissions within their organization
    if (req.isOrgOwner) {
      return next();
    }

    const perm = req.orgPermissions.find((p) => p.module === module);

    if (!perm || !perm[action]) {
      return apiError(
        res,
        `Access Denied: You do not possess the required permission [${module}.${action}] in this organization.`,
        403
      );
    }

    req.currentPermissionScope = perm.scope; // OWN, ASSIGNED_PROJECTS, ASSIGNED_DEPARTMENT, ORGANIZATION
    next();
  };
}
