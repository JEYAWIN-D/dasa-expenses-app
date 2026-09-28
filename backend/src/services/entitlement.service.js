import { prisma } from '../config/prisma.js';

/**
 * Enterprise Feature Entitlement & Plan Limit Engine
 * Enforces server-side subscription boundaries on all customer workspaces.
 */
export async function getOrganizationPlanDetails(organizationId) {
  const subscription = await prisma.organizationSubscription.findUnique({
    where: { organizationId },
    include: {
      plan: {
        include: {
          entitlements: true,
        },
      },
    },
  });

  const overrides = await prisma.featureOverride.findMany({
    where: {
      organizationId,
      isEnabled: true,
      OR: [
        { expiresAt: null },
        { expiresAt: { gt: new Date() } },
      ],
    },
  });

  return {
    subscription,
    plan: subscription?.plan,
    overrides,
  };
}

/**
 * Validate resource creation against subscription limits (USERS, PROJECTS, STORAGE)
 */
export async function assertResourceQuota(organizationId, resourceType) {
  const { plan, overrides } = await getOrganizationPlanDetails(organizationId);

  if (!plan) {
    // If no plan is found, default to Starter limits
    throw new Error('No active subscription plan found for this organization.');
  }

  // Check for temporary overrides
  const override = overrides.find((o) => o.featureKey === `MAX_${resourceType}`);

  if (resourceType === 'USERS') {
    const limit = override?.overrideLimit ?? plan.maxUsers;
    const currentCount = await prisma.organizationMembership.count({
      where: { organizationId, status: 'ACTIVE' },
    });

    if (currentCount >= limit) {
      throw new Error(
        `Subscription Limit Reached: Your current plan (${plan.name}) permits a maximum of ${limit} active users. You currently have ${currentCount}. Please upgrade to add more staff.`
      );
    }
  } else if (resourceType === 'PROJECTS') {
    const limit = override?.overrideLimit ?? plan.maxProjects;
    const currentCount = await prisma.project.count({
      where: { organizationId, isDeleted: false },
    });

    if (currentCount >= limit) {
      throw new Error(
        `Subscription Limit Reached: Your current plan (${plan.name}) allows up to ${limit} active projects. You currently have ${currentCount}. Upgrade your plan to launch more projects.`
      );
    }
  } else if (resourceType === 'CUSTOM_ROLES') {
    if (!plan.hasCustomBranding && plan.code === 'STARTER') {
      throw new Error('Custom roles are only available on the Business and Enterprise tiers. Please upgrade.');
    }
  }
}

/**
 * Validate if a specific feature is enabled for an organization
 */
export async function assertFeatureEnabled(organizationId, featureKey) {
  const { plan, overrides } = await getOrganizationPlanDetails(organizationId);

  // Overrides take precedence
  const override = overrides.find((o) => o.featureKey === featureKey);
  if (override) {
    if (!override.isEnabled) {
      throw new Error(`The feature '${featureKey}' has been restricted for your organization.`);
    }
    return true;
  }

  if (!plan) return true;

  const entitlement = plan.entitlements.find((e) => e.featureKey === featureKey);
  if (entitlement && !entitlement.isEnabled) {
    throw new Error(`The feature '${entitlement.featureName}' is not included in your ${plan.name} plan. Upgrade to unlock this capability.`);
  }

  return true;
}
