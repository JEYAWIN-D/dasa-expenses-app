import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { prisma } from '../../config/prisma.js';
import { apiSuccess, apiPaginated, apiError } from '../../utils/response.js';
import { assertResourceQuota, assertFeatureEnabled } from '../../services/entitlement.service.js';
import { registerTenantDocument, listOrganizationDocuments } from '../../services/storage.service.js';
import { getOrganizationJournals, reverseJournalEntry } from '../../services/journal.service.js';

// ==========================================
// TENANT WORKSPACE & CURRENT PROFILE
// ==========================================

export async function getCurrentOrganization(req, res) {
  try {
    const org = await prisma.organization.findUnique({
      where: { id: req.orgId },
      include: {
        subscription: {
          include: {
            plan: {
              include: { entitlements: true },
            },
          },
        },
        storageUsage: true,
        _count: {
          select: {
            memberships: true,
            projects: true,
            quotations: true,
            invoices: true,
            payments: true,
            expenses: true,
            documents: true,
          },
        },
      },
    });

    return apiSuccess(res, {
      organization: org,
      currentMembership: req.membership,
      availableWorkspaces: req.userMemberships,
    });
  } catch (error) {
    return apiError(res, error.message, 500);
  }
}

export async function updateCurrentOrganization(req, res) {
  try {
    const { name, legalName, phone, email, website, address, city, state, postalCode, gstNumber, panNumber } = req.body;

    const updated = await prisma.organization.update({
      where: { id: req.orgId },
      data: {
        ...(name && { name }),
        ...(legalName && { legalName }),
        ...(phone && { phone }),
        ...(email && { email }),
        ...(website !== undefined && { website }),
        ...(address && { address }),
        ...(city && { city }),
        ...(state && { state }),
        ...(postalCode && { postalCode }),
        ...(gstNumber !== undefined && { gstNumber }),
        ...(panNumber !== undefined && { panNumber }),
      },
    });

    return apiSuccess(res, updated, 'Organization settings updated successfully');
  } catch (error) {
    return apiError(res, error.message, 500);
  }
}

// ==========================================
// TEAM & USER INVITATIONS (RBAC)
// ==========================================

export async function listOrganizationMembers(req, res) {
  try {
    const members = await prisma.organizationMembership.findMany({
      where: { organizationId: req.orgId },
      include: {
        user: {
          select: { id: true, name: true, email: true, phone: true, avatar: true, status: true, lastLoginAt: true },
        },
        role: {
          include: { permissions: true },
        },
        department: true,
        branch: true,
      },
      orderBy: { joinedAt: 'asc' },
    });

    const invitations = await prisma.userInvitation.findMany({
      where: { organizationId: req.orgId, status: 'PENDING' },
      orderBy: { createdAt: 'desc' },
    });

    const formattedMembers = members.map((m) => {
      let dob = null;
      if (m.user?.avatar?.startsWith('dob:')) {
        dob = m.user.avatar.replace('dob:', '').trim();
      }
      return {
        ...m,
        dob,
        dobPassword: dob, // Date of birth (d-m-y) credential
        user: m.user ? {
          ...m.user,
          dob,
          dobPassword: dob,
        } : null,
      };
    });

    return apiSuccess(res, { members: formattedMembers, invitations });
  } catch (error) {
    return apiError(res, error.message, 500);
  }
}

export async function inviteOrganizationMember(req, res) {
  try {
    const { email, roleId, roleTitle = 'Staff Member', departmentId, branchId } = req.body;
    if (!email) return apiError(res, 'Email is required', 400);

    // Verify seat quota in subscription
    await assertResourceQuota(req.orgId, 'USERS');

    const token = crypto.randomBytes(24).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const invitation = await prisma.userInvitation.create({
      data: {
        organizationId: req.orgId,
        email: email.toLowerCase().trim(),
        roleId: roleId || null,
        departmentId: departmentId || null,
        branchId: branchId || null,
        token,
        status: 'PENDING',
        invitedBy: req.user.email,
        expiresAt,
      },
    });

    // If user already exists in platform, add membership immediately
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existingUser) {
      await prisma.organizationMembership.upsert({
        where: {
          organizationId_userId: {
            organizationId: req.orgId,
            userId: existingUser.id,
          },
        },
        update: {
          roleId: roleId || null,
          roleTitle,
          status: 'ACTIVE',
        },
        create: {
          organizationId: req.orgId,
          userId: existingUser.id,
          roleId: roleId || null,
          roleTitle,
          status: 'ACTIVE',
        },
      });

      await prisma.userInvitation.update({
        where: { id: invitation.id },
        data: { status: 'ACCEPTED' },
      });
    }

    return apiSuccess(
      res,
      invitation,
      `Invitation sent successfully to ${email}. ${existingUser ? 'Active user enrolled.' : 'Invitation link generated.'}`,
      201
    );
  } catch (error) {
    return apiError(res, error.message, 400);
  }
}

export async function removeOrganizationMember(req, res) {
  try {
    const { id } = req.params;
    const membership = await prisma.organizationMembership.findUnique({ where: { id } });

    if (!membership || membership.organizationId !== req.orgId) {
      return apiError(res, 'Membership not found', 404);
    }

    if (membership.isOwner) {
      return apiError(res, 'Cannot remove the primary Organization Owner', 400);
    }

    await prisma.organizationMembership.delete({ where: { id } });

    return apiSuccess(res, null, 'Team member removed from workspace');
  } catch (error) {
    return apiError(res, error.message, 500);
  }
}

export async function createDirectOrganizationMember(req, res) {
  try {
    const { name, dob, email, roleId, roleTitle, departmentId, branchId, permissions, submodules, scope = 'ORGANIZATION' } = req.body;
    if (!name || !name.trim()) {
      return apiError(res, 'User name is required', 400);
    }
    if (!dob || !dob.trim()) {
      return apiError(res, 'Date of Birth (DOB) is required to generate user password (d-m-y)', 400);
    }

    // Format DOB to standardized DD-MM-YYYY (d-m-y)
    let formattedDob = dob.trim();
    // Normalize YYYY-MM-DD -> DD-MM-YYYY
    const ymd = formattedDob.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
    if (ymd) {
      formattedDob = `${ymd[3].padStart(2, '0')}-${ymd[2].padStart(2, '0')}-${ymd[1]}`;
    } else {
      // Normalize DD/MM/YYYY -> DD-MM-YYYY
      const dmy = formattedDob.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
      if (dmy) {
        formattedDob = `${dmy[1].padStart(2, '0')}-${dmy[2].padStart(2, '0')}-${dmy[3]}`;
      }
    }

    // Password is set to their Date of Birth in (d-m-y) format
    const password = formattedDob;
    const passwordHash = await bcrypt.hash(password, 10);

    // Auto-generate clean unique email if not provided
    const cleanUsernameSlug = name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const userEmail = email && email.trim()
      ? email.toLowerCase().trim()
      : `${cleanUsernameSlug}_${Date.now().toString().slice(-4)}@workspace.internal`;

    // Check if user already exists
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: userEmail },
          { name: { equals: name.trim(), mode: 'insensitive' } },
        ],
      },
    });

    if (user) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          passwordHash,
          avatar: `dob:${formattedDob}`,
          status: 'ACTIVE',
        },
      });
    } else {
      user = await prisma.user.create({
        data: {
          name: name.trim(),
          email: userEmail,
          passwordHash,
          avatar: `dob:${formattedDob}`,
          role: 'STAFF',
          status: 'ACTIVE',
        },
      });
    }

    // If custom permissions were provided on-the-fly without an existing roleId
    let finalRoleId = roleId || null;
    if (!finalRoleId && permissions && permissions.length > 0) {
      const customRole = await prisma.organizationRole.create({
        data: {
          organizationId: req.orgId,
          name: `${name.trim()} Access Role`,
          description: JSON.stringify({ submodules: submodules || {} }),
          isSystemDefault: false,
          permissions: {
            create: permissions.map((p) => ({
              module: p.module,
              canView: Boolean(p.canView),
              canCreate: Boolean(p.canCreate),
              canEdit: Boolean(p.canEdit),
              canSubmit: Boolean(p.canSubmit),
              canApprove: Boolean(p.canApprove),
              canReject: Boolean(p.canReject),
              canDelete: Boolean(p.canDelete),
              canExport: Boolean(p.canExport),
              scope: p.scope || scope || 'ORGANIZATION',
            })),
          },
        },
      });
      finalRoleId = customRole.id;
    }

    // Create or update organization membership
    const membership = await prisma.organizationMembership.upsert({
      where: {
        organizationId_userId: {
          organizationId: req.orgId,
          userId: user.id,
        },
      },
      update: {
        roleId: finalRoleId,
        roleTitle: roleTitle || 'Staff Member',
        departmentId: departmentId || null,
        branchId: branchId || null,
        status: 'ACTIVE',
      },
      create: {
        organizationId: req.orgId,
        userId: user.id,
        roleId: finalRoleId,
        roleTitle: roleTitle || 'Staff Member',
        departmentId: departmentId || null,
        branchId: branchId || null,
        status: 'ACTIVE',
        isOwner: false,
      },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true, avatar: true, status: true } },
        role: { include: { permissions: true } },
        department: true,
        branch: true,
      },
    });

    return apiSuccess(
      res,
      {
        membership,
        credentials: {
          username: user.name,
          email: user.email,
          dob: formattedDob,
          password: formattedDob, // Date of birth (d-m-y)
        },
      },
      `Staff member created successfully! Login with Name "${user.name}" and Password (DOB) "${formattedDob}".`,
      201
    );
  } catch (error) {
    return apiError(res, error.message, 400);
  }
}

export async function updateMemberDob(req, res) {
  try {
    const { id } = req.params;
    const { dob } = req.body;
    if (!dob) return apiError(res, 'Date of Birth (DOB) is required', 400);

    const membership = await prisma.organizationMembership.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!membership || membership.organizationId !== req.orgId) {
      return apiError(res, 'Member not found', 404);
    }

    let formattedDob = dob.trim();
    const ymd = formattedDob.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
    if (ymd) {
      formattedDob = `${ymd[3].padStart(2, '0')}-${ymd[2].padStart(2, '0')}-${ymd[1]}`;
    } else {
      const dmy = formattedDob.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
      if (dmy) {
        formattedDob = `${dmy[1].padStart(2, '0')}-${dmy[2].padStart(2, '0')}-${dmy[3]}`;
      }
    }

    const passwordHash = await bcrypt.hash(formattedDob, 10);

    await prisma.user.update({
      where: { id: membership.userId },
      data: {
        avatar: `dob:${formattedDob}`,
        passwordHash,
      },
    });

    return apiSuccess(res, { dob: formattedDob, password: formattedDob }, 'Member DOB and password updated');
  } catch (error) {
    return apiError(res, error.message, 500);
  }
}

// ==========================================
// ROLES & CUSTOM PERMISSION MATRICES
// ==========================================

export async function listOrganizationRoles(req, res) {
  try {
    const roles = await prisma.organizationRole.findMany({
      where: { organizationId: req.orgId },
      include: {
        permissions: true,
        _count: { select: { memberships: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return apiSuccess(res, roles);
  } catch (error) {
    return apiError(res, error.message, 500);
  }
}

export async function createCustomRole(req, res) {
  try {
    const { name, description, permissions, submodules } = req.body;
    if (!name || !name.trim()) return apiError(res, 'Role name is required', 400);

    let descString = description || '';
    if (submodules && typeof submodules === 'object') {
      try {
        const payload = typeof description === 'object' ? description : { text: description || '' };
        payload.submodules = submodules;
        descString = JSON.stringify(payload);
      } catch (e) {}
    }

    const role = await prisma.organizationRole.create({
      data: {
        organizationId: req.orgId,
        name: name.trim(),
        description: descString || null,
        isSystemDefault: false,
        permissions: {
          create: (permissions || []).map((p) => ({
            module: p.module,
            canView: Boolean(p.canView),
            canCreate: Boolean(p.canCreate),
            canEdit: Boolean(p.canEdit),
            canSubmit: Boolean(p.canSubmit),
            canApprove: Boolean(p.canApprove),
            canReject: Boolean(p.canReject),
            canDelete: Boolean(p.canDelete),
            canExport: Boolean(p.canExport),
            scope: p.scope || 'ORGANIZATION',
          })),
        },
      },
      include: { permissions: true },
    });

    return apiSuccess(res, role, 'Custom role created successfully', 201);
  } catch (error) {
    return apiError(res, error.message, 400);
  }
}

export async function updateOrganizationRole(req, res) {
  try {
    const { id } = req.params;
    const { name, description, permissions, submodules } = req.body;

    const existingRole = await prisma.organizationRole.findFirst({
      where: { id, organizationId: req.orgId },
    });

    if (!existingRole) {
      return apiError(res, 'Role not found', 404);
    }

    let descString = description || '';
    if (submodules && typeof submodules === 'object') {
      try {
        const payload = typeof description === 'object' ? description : { text: description || '' };
        payload.submodules = submodules;
        descString = JSON.stringify(payload);
      } catch (e) {}
    }

    // Delete existing permissions and re-create
    await prisma.rolePermission.deleteMany({
      where: { roleId: id },
    });

    const updatedRole = await prisma.organizationRole.update({
      where: { id },
      data: {
        name: name ? name.trim() : existingRole.name,
        description: descString || existingRole.description,
        permissions: {
          create: (permissions || []).map((p) => ({
            module: p.module,
            canView: Boolean(p.canView),
            canCreate: Boolean(p.canCreate),
            canEdit: Boolean(p.canEdit),
            canSubmit: Boolean(p.canSubmit),
            canApprove: Boolean(p.canApprove),
            canReject: Boolean(p.canReject),
            canDelete: Boolean(p.canDelete),
            canExport: Boolean(p.canExport),
            scope: p.scope || 'ORGANIZATION',
          })),
        },
      },
      include: { permissions: true },
    });

    return apiSuccess(res, updatedRole, 'Custom role updated successfully');
  } catch (error) {
    return apiError(res, error.message, 400);
  }
}

export async function deleteOrganizationRole(req, res) {
  try {
    const { id } = req.params;
    const role = await prisma.organizationRole.findFirst({
      where: { id, organizationId: req.orgId },
    });

    if (!role) {
      return apiError(res, 'Role not found', 404);
    }

    await prisma.organizationRole.delete({ where: { id } });

    return apiSuccess(res, null, 'Custom role deleted successfully');
  } catch (error) {
    return apiError(res, error.message, 500);
  }
}

export async function clearAllOrganizationRoles(req, res) {
  try {
    await prisma.rolePermission.deleteMany({
      where: { role: { organizationId: req.orgId } },
    });
    const result = await prisma.organizationRole.deleteMany({
      where: { organizationId: req.orgId },
    });
    return apiSuccess(res, { count: result.count }, 'All role entries removed successfully');
  } catch (error) {
    return apiError(res, error.message, 500);
  }
}

// ==========================================
// TENANT STORAGE & DOCUMENTS
// ==========================================

export async function getStorageOverview(req, res) {
  try {
    const org = await prisma.organization.findUnique({
      where: { id: req.orgId },
      select: { storageQuotaMB: true, storageUsedBytes: true },
    });

    const docsCount = await prisma.document.count({
      where: { organizationId: req.orgId, isDeleted: false },
    });

    const usedMB = (org.storageUsedBytes / (1024 * 1024)).toFixed(2);
    const quotaMB = org.storageQuotaMB;
    const usagePercent = Math.min(100, ((usedMB / quotaMB) * 100).toFixed(1));

    // Breakdown by document type
    const byType = await prisma.document.groupBy({
      by: ['docType'],
      where: { organizationId: req.orgId, isDeleted: false },
      _count: { id: true },
      _sum: { fileSizeBytes: true },
    });

    return apiSuccess(res, {
      quotaMB,
      usedMB,
      usagePercent,
      documentsCount: docsCount,
      breakdown: byType.map((b) => ({
        type: b.docType,
        count: b._count.id,
        sizeMB: ((b._sum.fileSizeBytes || 0) / (1024 * 1024)).toFixed(2),
      })),
    });
  } catch (error) {
    return apiError(res, error.message, 500);
  }
}

export async function uploadTenantDocument(req, res) {
  try {
    const { title, docType, fileName, fileSizeBytes, mimeType, projectId } = req.body;
    if (!fileName || !fileSizeBytes) {
      return apiError(res, 'File name and file size are required', 400);
    }

    const doc = await registerTenantDocument({
      organizationId: req.orgId,
      projectId: projectId || null,
      title,
      docType,
      fileName,
      fileSizeBytes: parseFloat(fileSizeBytes),
      mimeType,
      uploadedBy: req.user.name,
    });

    return apiSuccess(res, doc, 'Document uploaded and registered in isolated tenant vault', 201);
  } catch (error) {
    return apiError(res, error.message, 400);
  }
}

export async function listTenantDocuments(req, res) {
  try {
    const { projectId, docType } = req.query;
    const docs = await listOrganizationDocuments(req.orgId, { projectId, docType });
    return apiSuccess(res, docs);
  } catch (error) {
    return apiError(res, error.message, 500);
  }
}

// ==========================================
// FINANCIAL JOURNAL LEDGER & IMMUTABILITY
// ==========================================

export async function listJournals(req, res) {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const data = await getOrganizationJournals(req.orgId, { page, limit });
    return apiPaginated(res, data.entries, { total: data.total, page, limit });
  } catch (error) {
    return apiError(res, error.message, 500);
  }
}

export async function reverseJournal(req, res) {
  try {
    const { id } = req.params;
    const { voidReason } = req.body;
    if (!voidReason) return apiError(res, 'A formal reversal reason is required for financial auditing', 400);

    const reversed = await reverseJournalEntry(id, {
      voidReason,
      reversedBy: req.user.name,
    });

    return apiSuccess(res, reversed, 'Financial journal entry successfully reversed with audit trail');
  } catch (error) {
    return apiError(res, error.message, 400);
  }
}

// ==========================================
// CUSTOMER SECURITY CENTER
// ==========================================

export async function getOrganizationSecurity(req, res) {
  try {
    const org = await prisma.organization.findUnique({
      where: { id: req.orgId },
      select: {
        enforceOrgMfa: true,
        signaturePinHash: true,
        authorizedPerson: true,
      },
    });

    const activeSessions = await prisma.userSession.findMany({
      where: { isValid: true },
      take: 20,
      orderBy: { lastActiveAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    const recentAudit = await prisma.auditLog.findMany({
      where: { organizationId: req.orgId },
      take: 20,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    return apiSuccess(res, {
      enforceOrgMfa: org.enforceOrgMfa,
      hasSignaturePin: Boolean(org.signaturePinHash),
      authorizedPerson: org.authorizedPerson,
      activeSessions,
      recentAudit,
    });
  } catch (error) {
    return apiError(res, error.message, 500);
  }
}

export async function toggleOrganizationMfa(req, res) {
  try {
    const { enforceOrgMfa } = req.body;

    const updated = await prisma.organization.update({
      where: { id: req.orgId },
      data: { enforceOrgMfa: Boolean(enforceOrgMfa) },
    });

    return apiSuccess(res, updated, `Organization-wide MFA enforcement ${enforceOrgMfa ? 'enabled' : 'disabled'}`);
  } catch (error) {
    return apiError(res, error.message, 500);
  }
}

// ==========================================
// SAAS SUBSCRIPTION & ENTITLEMENTS
// ==========================================

export async function getOrganizationSubscription(req, res) {
  try {
    const org = await prisma.organization.findUnique({
      where: { id: req.orgId },
      include: {
        subscription: {
          include: {
            plan: {
              include: { entitlements: true },
            },
          },
        },
      },
    });

    const [usersCount, projectsCount, storageDocs] = await Promise.all([
      prisma.organizationMembership.count({ where: { organizationId: req.orgId } }),
      prisma.project.count({ where: { isDeleted: false } }),
      prisma.document.aggregate({
        where: { organizationId: req.orgId, isDeleted: false },
        _sum: { fileSizeBytes: true },
      }),
    ]);

    const availablePlans = await prisma.subscriptionPlan.findMany({
      where: { isActive: true },
      include: { entitlements: true },
      orderBy: { monthlyPriceINR: 'asc' },
    });

    const entitlements = {};
    if (org.subscription?.plan?.entitlements) {
      org.subscription.plan.entitlements.forEach((e) => {
        entitlements[e.featureKey] = e.isEnabled;
      });
    }
    entitlements.MAX_USERS = org.subscription?.plan?.maxUsers || 50;
    entitlements.MAX_PROJECTS = org.subscription?.plan?.maxProjects || 250;
    entitlements.MAX_STORAGE_GB = `${Math.round((org.subscription?.plan?.maxStorageMB || 102400) / 1024)} GB`;

    return apiSuccess(res, {
      subscription: org.subscription,
      usage: {
        usersCount: Math.max(usersCount, 1),
        projectsCount,
        storageBytes: storageDocs._sum?.fileSizeBytes || 0,
      },
      entitlements,
      availablePlans: availablePlans.map((p) => ({
        id: p.id,
        code: p.code,
        name: p.name,
        description: p.description,
        monthlyPrice: p.monthlyPriceINR,
        annualPrice: p.annualPriceINR,
        maxUsers: p.maxUsers,
        maxProjects: p.maxProjects,
        maxStorageGB: Math.round(p.maxStorageMB / 1024),
        supportTier: p.supportTier,
        features: [
          `${p.maxUsers >= 999999 ? 'Unlimited' : p.maxUsers} Team Members`,
          `${p.maxProjects >= 999999 ? 'Unlimited' : p.maxProjects} Active Projects`,
          `${Math.round(p.maxStorageMB / 1024)} GB Encrypted Storage`,
          p.hasApiAccess ? 'REST & Webhook API Access' : null,
          p.hasAdvancedAnalytics ? 'Real-Time Financial Analytics' : null,
          p.hasDedicatedDb ? 'Dedicated PostgreSQL Database' : null,
        ].filter(Boolean),
      })),
    });
  } catch (error) {
    return apiError(res, error.message, 500);
  }
}

export async function upgradeOrganizationSubscription(req, res) {
  try {
    const { planId, billingCycle = 'MONTHLY' } = req.body;
    if (!planId) return apiError(res, 'Plan ID is required', 400);

    const targetPlan = await prisma.subscriptionPlan.findUnique({ where: { id: planId } });
    if (!targetPlan) return apiError(res, 'Target subscription plan not found', 404);

    const now = new Date();
    const periodEnd = new Date(now);
    if (billingCycle === 'ANNUAL') {
      periodEnd.setFullYear(periodEnd.getFullYear() + 1);
    } else {
      periodEnd.setMonth(periodEnd.getMonth() + 1);
    }

    const updated = await prisma.organizationSubscription.upsert({
      where: { organizationId: req.orgId },
      update: {
        planId: targetPlan.id,
        billingCycle,
        status: 'ACTIVE',
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        nextBillingAmount: billingCycle === 'ANNUAL' ? targetPlan.annualPriceINR : targetPlan.monthlyPriceINR,
      },
      create: {
        organizationId: req.orgId,
        planId: targetPlan.id,
        billingCycle,
        status: 'ACTIVE',
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        nextBillingAmount: billingCycle === 'ANNUAL' ? targetPlan.annualPriceINR : targetPlan.monthlyPriceINR,
      },
      include: { plan: true },
    });

    await prisma.organization.update({
      where: { id: req.orgId },
      data: { storageQuotaMB: targetPlan.maxStorageMB },
    });

    return apiSuccess(res, updated, `Successfully switched to ${targetPlan.name}`);
  } catch (error) {
    return apiError(res, error.message, 500);
  }
}

export async function deleteTenantDocument(req, res) {
  try {
    const { id } = req.params;
    const doc = await prisma.document.findFirst({
      where: { id, organizationId: req.orgId },
    });
    if (!doc) return apiError(res, 'Document not found', 404);

    await prisma.$transaction(async (tx) => {
      await tx.document.update({
        where: { id },
        data: { isDeleted: true },
      });
      await tx.organization.update({
        where: { id: req.orgId },
        data: {
          storageUsedBytes: { decrement: doc.fileSizeBytes },
        },
      });
      await tx.storageUsage.updateMany({
        where: { organizationId: req.orgId },
        data: {
          totalUsedBytes: { decrement: doc.fileSizeBytes },
          documentsCount: { decrement: 1 },
        },
      });
    });

    return apiSuccess(res, null, 'Document deleted successfully');
  } catch (error) {
    return apiError(res, error.message, 500);
  }
}

export async function updateMemberStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const membership = await prisma.organizationMembership.findFirst({
      where: { id, organizationId: req.orgId },
    });
    if (!membership) return apiError(res, 'Member not found', 404);

    const updated = await prisma.organizationMembership.update({
      where: { id },
      data: { status },
      include: {
        user: { select: { id: true, name: true, email: true, status: true } },
        role: true,
      },
    });

    return apiSuccess(res, updated, 'Member status updated successfully');
  } catch (error) {
    return apiError(res, error.message, 500);
  }
}

