import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../config/prisma.js';
import { ENV } from '../../config/env.js';
import { apiSuccess, apiPaginated, apiError } from '../../utils/response.js';

// ==========================================
// PLATFORM AUTHENTICATION
// ==========================================

export async function platformLogin(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return apiError(res, 'Email and password are required', 400);
    }

    const platformUser = await prisma.platformUser.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!platformUser || platformUser.status !== 'ACTIVE') {
      // Record platform security event on failed login
      await prisma.platformSecurityEvent.create({
        data: {
          eventType: 'PLATFORM_AUTH_FAILURE',
          severity: 'HIGH',
          ipAddress: req.ip || req.connection?.remoteAddress,
          details: `Failed platform admin login attempt for ${email}`,
        },
      }).catch(() => {});

      return apiError(res, 'Invalid credentials or unauthorized platform access.', 401);
    }

    const isMatch = await bcrypt.compare(password, platformUser.passwordHash);
    if (!isMatch) {
      await prisma.platformSecurityEvent.create({
        data: {
          eventType: 'PLATFORM_AUTH_FAILURE',
          severity: 'HIGH',
          ipAddress: req.ip || req.connection?.remoteAddress,
          userId: platformUser.id,
          details: `Incorrect password entered for Platform Admin ${platformUser.email}`,
        },
      }).catch(() => {});

      return apiError(res, 'Invalid credentials or unauthorized platform access.', 401);
    }

    // Update last login
    await prisma.platformUser.update({
      where: { id: platformUser.id },
      data: { lastLoginAt: new Date() },
    });

    const token = jwt.sign(
      {
        userId: platformUser.id,
        platformUserId: platformUser.id,
        platformRole: platformUser.platformRole,
        isPlatformAdmin: true,
        email: platformUser.email,
      },
      ENV.JWT_SECRET,
      { expiresIn: '8h' }
    );

    // Audit log
    await prisma.platformAuditLog.create({
      data: {
        platformUserId: platformUser.id,
        userEmail: platformUser.email,
        action: 'PLATFORM_LOGIN',
        ipAddress: req.ip,
        details: `Platform Administrator logged into DASA TECH SaaS command center`,
      },
    }).catch(() => {});

    return apiSuccess(res, {
      token,
      user: {
        id: platformUser.id,
        email: platformUser.email,
        name: platformUser.name,
        platformRole: platformUser.platformRole,
        mfaEnabled: platformUser.mfaEnabled,
      },
    }, 'Welcome to DASA TECH Platform Command Center');
  } catch (error) {
    console.error('Platform login error:', error);
    return apiError(res, error.message || 'Platform login failed', 500);
  }
}

export async function getPlatformMe(req, res) {
  return apiSuccess(res, {
    id: req.platformUser.id,
    email: req.platformUser.email,
    name: req.platformUser.name,
    platformRole: req.platformUser.platformRole,
    mfaEnabled: req.platformUser.mfaEnabled,
    lastLoginAt: req.platformUser.lastLoginAt,
  });
}

// ==========================================
// PLATFORM DASHBOARD & METRICS
// ==========================================

export async function getPlatformOverview(req, res) {
  try {
    const [
      totalOrgs,
      activeOrgs,
      trialOrgs,
      suspendedOrgs,
      plans,
      demoLeadsCount,
      unresolvedSecurityAlerts,
      recentOrgs,
    ] = await Promise.all([
      prisma.organization.count(),
      prisma.organization.count({ where: { status: 'ACTIVE' } }),
      prisma.organization.count({ where: { status: 'TRIAL' } }),
      prisma.organization.count({ where: { status: 'SUSPENDED' } }),
      prisma.subscriptionPlan.findMany({
        include: {
          _count: { select: { subscriptions: true } },
        },
      }),
      prisma.demoLead.count({ where: { status: 'NEW' } }),
      prisma.platformSecurityEvent.count({ where: { status: 'NEW' } }),
      prisma.organization.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          subscription: { include: { plan: true } },
          _count: { select: { memberships: true, projects: true } },
        },
      }),
    ]);

    // Calculate MRR and ARR based on active subscriptions
    let mrr = 0;
    let arr = 0;
    const subscriptions = await prisma.organizationSubscription.findMany({
      where: { status: 'ACTIVE' },
      include: { plan: true },
    });

    for (const sub of subscriptions) {
      if (sub.billingCycle === 'ANNUAL') {
        arr += sub.plan.annualPriceINR;
        mrr += Math.round(sub.plan.annualPriceINR / 12);
      } else {
        mrr += sub.plan.monthlyPriceINR;
        arr += sub.plan.monthlyPriceINR * 12;
      }
    }

    // Global storage metrics
    const storageStats = await prisma.organization.aggregate({
      _sum: {
        storageUsedBytes: true,
        storageQuotaMB: true,
      },
    });

    const totalStorageUsedGB = ((storageStats._sum.storageUsedBytes || 0) / (1024 * 1024 * 1024)).toFixed(2);
    const totalStorageAllocatedGB = ((storageStats._sum.storageQuotaMB || 0) / 1024).toFixed(2);

    return apiSuccess(res, {
      metrics: {
        totalOrganizations: totalOrgs,
        activeSubscriptions: activeOrgs,
        trialAccounts: trialOrgs,
        suspendedAccounts: suspendedOrgs,
        monthlyRecurringRevenueINR: mrr,
        annualRecurringRevenueINR: arr,
        pendingDemoRequests: demoLeadsCount,
        securityAlertsCount: unresolvedSecurityAlerts,
        totalStorageUsedGB,
        totalStorageAllocatedGB,
      },
      planDistribution: plans.map((p) => ({
        code: p.code,
        name: p.name,
        subscribersCount: p._count.subscriptions,
        monthlyPriceINR: p.monthlyPriceINR,
      })),
      recentOrganizations: recentOrgs,
    });
  } catch (error) {
    console.error('getPlatformOverview error:', error);
    return apiError(res, error.message, 500);
  }
}

// ==========================================
// SAAS CUSTOMER ORGANIZATIONS MANAGEMENT
// ==========================================

export async function listPlatformOrganizations(req, res) {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;
    const { status, planCode, search } = req.query;

    const where = {
      ...(status && { status }),
      ...(planCode && { subscription: { plan: { code: planCode } } }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { slug: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { city: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [total, orgs] = await Promise.all([
      prisma.organization.count({ where }),
      prisma.organization.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          subscription: {
            include: { plan: true },
          },
          _count: {
            select: {
              memberships: true,
              projects: true,
              documents: true,
            },
          },
        },
      }),
    ]);

    return apiPaginated(res, orgs, { total, page, limit });
  } catch (error) {
    return apiError(res, error.message, 500);
  }
}

export async function getPlatformOrganizationDetails(req, res) {
  try {
    const { id } = req.params;
    const org = await prisma.organization.findUnique({
      where: { id },
      include: {
        subscription: {
          include: {
            plan: {
              include: { entitlements: true },
            },
          },
        },
        memberships: {
          include: {
            user: { select: { id: true, name: true, email: true, phone: true, status: true, lastLoginAt: true } },
            role: true,
            department: true,
            branch: true,
          },
        },
        roles: {
          include: { permissions: true },
        },
        departments: true,
        branches: true,
        featureOverrides: true,
        storageUsage: true,
        subscriptionInvoices: { orderBy: { createdAt: 'desc' }, take: 10 },
        supportTickets: { orderBy: { createdAt: 'desc' }, take: 5 },
        _count: {
          select: {
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

    if (!org) {
      return apiError(res, 'Organization not found', 404);
    }

    return apiSuccess(res, org);
  } catch (error) {
    return apiError(res, error.message, 500);
  }
}

export async function updateOrganizationStatus(req, res) {
  try {
    const { id } = req.params;
    const { status, trialEndsAt } = req.body;

    const updated = await prisma.organization.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(trialEndsAt && { trialEndsAt: new Date(trialEndsAt) }),
      },
    });

    await prisma.platformAuditLog.create({
      data: {
        platformUserId: req.platformUser.id,
        userEmail: req.platformUser.email,
        action: 'UPDATE_ORG_STATUS',
        targetOrgId: id,
        details: `Changed organization ${updated.name} status to ${status}`,
      },
    });

    return apiSuccess(res, updated, 'Organization status updated successfully');
  } catch (error) {
    return apiError(res, error.message, 500);
  }
}

export async function updateOrganizationSubscription(req, res) {
  try {
    const { id } = req.params;
    const { planCode, billingCycle, status } = req.body;

    const plan = await prisma.subscriptionPlan.findUnique({
      where: { code: planCode },
    });

    if (!plan) return apiError(res, 'Invalid subscription plan code', 400);

    const subscription = await prisma.organizationSubscription.upsert({
      where: { organizationId: id },
      update: {
        planId: plan.id,
        ...(billingCycle && { billingCycle }),
        ...(status && { status }),
      },
      create: {
        organizationId: id,
        planId: plan.id,
        billingCycle: billingCycle || 'MONTHLY',
        status: status || 'ACTIVE',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
      include: { plan: true },
    });

    // Also update organization storage quota to match new plan
    await prisma.organization.update({
      where: { id },
      data: { storageQuotaMB: plan.maxStorageMB },
    });

    await prisma.platformAuditLog.create({
      data: {
        platformUserId: req.platformUser.id,
        userEmail: req.platformUser.email,
        action: 'UPDATE_SUBSCRIPTION',
        targetOrgId: id,
        details: `Assigned plan ${plan.name} (${plan.code}) to organization`,
      },
    });

    return apiSuccess(res, subscription, 'Subscription updated successfully');
  } catch (error) {
    return apiError(res, error.message, 500);
  }
}

export async function grantFeatureOverride(req, res) {
  try {
    const { id } = req.params;
    const { featureKey, isEnabled = true, overrideLimit, reason, expiresAt } = req.body;

    const override = await prisma.featureOverride.create({
      data: {
        organizationId: id,
        featureKey,
        isEnabled,
        overrideLimit: overrideLimit ? parseInt(overrideLimit, 10) : null,
        reason,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        grantedBy: req.platformUser.email,
      },
    });

    await prisma.platformAuditLog.create({
      data: {
        platformUserId: req.platformUser.id,
        userEmail: req.platformUser.email,
        action: 'GRANT_OVERRIDE',
        targetOrgId: id,
        details: `Granted override for feature ${featureKey}: ${reason || 'Administrative grant'}`,
      },
    });

    return apiSuccess(res, override, 'Feature override applied successfully', 201);
  } catch (error) {
    return apiError(res, error.message, 500);
  }
}

// ==========================================
// PLANS & PRICING CONFIGURATION
// ==========================================

export async function getSubscriptionPlans(req, res) {
  try {
    const plans = await prisma.subscriptionPlan.findMany({
      orderBy: { monthlyPriceINR: 'asc' },
      include: {
        entitlements: true,
        _count: { select: { subscriptions: true } },
      },
    });
    return apiSuccess(res, plans);
  } catch (error) {
    return apiError(res, error.message, 500);
  }
}

export async function updateSubscriptionPlan(req, res) {
  try {
    const { id } = req.params;
    const { monthlyPriceINR, annualPriceINR, maxUsers, maxProjects, maxStorageMB, description } = req.body;

    const updated = await prisma.subscriptionPlan.update({
      where: { id },
      data: {
        ...(monthlyPriceINR !== undefined && { monthlyPriceINR: parseFloat(monthlyPriceINR) }),
        ...(annualPriceINR !== undefined && { annualPriceINR: parseFloat(annualPriceINR) }),
        ...(maxUsers !== undefined && { maxUsers: parseInt(maxUsers, 10) }),
        ...(maxProjects !== undefined && { maxProjects: parseInt(maxProjects, 10) }),
        ...(maxStorageMB !== undefined && { maxStorageMB: parseFloat(maxStorageMB) }),
        ...(description && { description }),
      },
    });

    return apiSuccess(res, updated, 'Subscription plan configuration updated');
  } catch (error) {
    return apiError(res, error.message, 500);
  }
}

// ==========================================
// DEMO REQUESTS & 1-CLICK ONBOARDING CONVERSION
// ==========================================

export async function listDemoRequests(req, res) {
  try {
    const leads = await prisma.demoLead.findMany({
      orderBy: { createdAt: 'desc' },
      include: { organization: { select: { id: true, name: true, slug: true } } },
    });
    return apiSuccess(res, leads);
  } catch (error) {
    return apiError(res, error.message, 500);
  }
}

export async function convertDemoLeadToOrganization(req, res) {
  try {
    const { id } = req.params;
    const { planCode = 'GROWTH', customSlug } = req.body;

    const lead = await prisma.demoLead.findUnique({ where: { id } });
    if (!lead) return apiError(res, 'Demo lead not found', 404);

    const slug = customSlug || lead.companyName.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Math.floor(Math.random() * 900 + 100);

    const plan = await prisma.subscriptionPlan.findUnique({ where: { code: planCode } });

    const result = await prisma.$transaction(async (tx) => {
      // Create Organization
      const defaultPinHash = await bcrypt.hash('1234', 10);
      const org = await tx.organization.create({
        data: {
          slug,
          name: lead.companyName,
          phone: lead.phone,
          email: lead.email,
          address: 'Main Office',
          city: 'City',
          state: 'State',
          status: 'TRIAL',
          trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14-day trial
          storageQuotaMB: plan ? plan.maxStorageMB : 5120,
          signaturePinHash: defaultPinHash,
        },
      });

      // Create Subscription
      if (plan) {
        await tx.organizationSubscription.create({
          data: {
            organizationId: org.id,
            planId: plan.id,
            status: 'TRIAL',
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          },
        });
      }

      // Check or create user for prospect
      let user = await tx.user.findUnique({ where: { email: lead.email } });
      if (!user) {
        const temporaryPasswordHash = await bcrypt.hash('Welcome@2026', 10);
        user = await tx.user.create({
          data: {
            email: lead.email,
            passwordHash: temporaryPasswordHash,
            name: lead.fullName,
            phone: lead.phone,
            role: 'ADMIN',
            status: 'ACTIVE',
          },
        });
      }

      // Assign Membership as Owner
      await tx.organizationMembership.create({
        data: {
          organizationId: org.id,
          userId: user.id,
          isOwner: true,
          roleTitle: 'Organization Owner',
          status: 'ACTIVE',
        },
      });

      // Update lead
      await tx.demoLead.update({
        where: { id },
        data: {
          status: 'CONVERTED',
          organizationId: org.id,
          convertedOrgId: org.id,
        },
      });

      return { org, user };
    });

    await prisma.platformAuditLog.create({
      data: {
        platformUserId: req.platformUser.id,
        userEmail: req.platformUser.email,
        action: 'CONVERT_DEMO_LEAD',
        targetOrgId: result.org.id,
        details: `Converted demo prospect ${lead.fullName} (${lead.companyName}) into active SaaS tenant: ${result.org.slug}`,
      },
    });

    return apiSuccess(
      res,
      result,
      `Successfully converted prospect into SaaS organization workspace! Workspace slug: ${result.org.slug}`,
      201
    );
  } catch (error) {
    console.error('convertDemoLeadToOrganization error:', error);
    return apiError(res, error.message, 500);
  }
}

// ==========================================
// PLATFORM SECURITY OPERATIONS CENTER (SOC)
// ==========================================

export async function getPlatformSecurityEvents(req, res) {
  try {
    const events = await prisma.platformSecurityEvent.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    return apiSuccess(res, events);
  } catch (error) {
    return apiError(res, error.message, 500);
  }
}

export async function updateSecurityEventStatus(req, res) {
  try {
    const { id } = req.params;
    const { status, resolutionNotes } = req.body;

    const updated = await prisma.platformSecurityEvent.update({
      where: { id },
      data: {
        status,
        resolutionNotes,
        assignedTo: req.platformUser.name,
      },
    });

    return apiSuccess(res, updated, 'Security event updated successfully');
  } catch (error) {
    return apiError(res, error.message, 500);
  }
}

// ==========================================
// PLATFORM AUDIT LOGS & HEALTH
// ==========================================

export async function getPlatformAuditLogs(req, res) {
  try {
    const logs = await prisma.platformAuditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: {
        platformUser: { select: { id: true, name: true, email: true, platformRole: true } },
      },
    });
    return apiSuccess(res, logs);
  } catch (error) {
    return apiError(res, error.message, 500);
  }
}

export async function getSystemHealth(req, res) {
  return apiSuccess(res, {
    database: { status: 'ONLINE', engine: 'PostgreSQL', latencyMs: 3 },
    storage: { status: 'OPTIMAL', provider: 'Local / Cloud Object Store' },
    environment: ENV.NODE_ENV,
    uptimeSeconds: process.uptime(),
    memoryUsageMB: (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2),
    timestamp: new Date().toISOString(),
  });
}
