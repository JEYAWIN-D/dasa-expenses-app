import { prisma } from '../../config/prisma.js';
import { logAudit } from '../../utils/audit.service.js';

/**
 * Create a new demo request lead from public marketing form or modal
 */
export async function createDemoLead(data) {
  const lead = await prisma.demoLead.create({
    data: {
      fullName: data.fullName,
      companyName: data.companyName,
      email: data.email.toLowerCase().trim(),
      phone: data.phone.trim(),
      whatsappNumber: data.whatsappNumber ? data.whatsappNumber.trim() : null,
      industry: data.industry || null,
      companySize: data.companySize || null,
      monthlyProjects: data.monthlyProjects || null,
      currentProcess: data.currentProcess || null,
      featuresInterest: Array.isArray(data.featuresInterest) ? data.featuresInterest.join(', ') : (data.featuresInterest || null),
      preferredDate: data.preferredDate || null,
      preferredTime: data.preferredTime || null,
      additionalReqs: data.additionalReqs || null,
      consentContact: data.consentContact !== undefined ? Boolean(data.consentContact) : true,
      status: 'NEW',
    },
  });

  return lead;
}

/**
 * List all demo leads with filters and pagination for internal SaaS admin
 */
export async function getDemoLeadsList({ page = 1, limit = 20, status = '', search = '', organizationId = null } = {}) {
  const skip = (page - 1) * limit;

  const where = {
    ...(organizationId && { organizationId }),
    ...(status && { status }),
    ...(search && {
      OR: [
        { fullName: { contains: search, mode: 'insensitive' } },
        { companyName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { industry: { contains: search, mode: 'insensitive' } },
      ],
    }),
  };

  const [total, leads, statusCounts] = await Promise.all([
    prisma.demoLead.count({ where }),
    prisma.demoLead.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.demoLead.groupBy({
      by: ['status'],
      where: organizationId ? { organizationId } : undefined,
      _count: { status: true },
    }),
  ]);

  const countsByStatus = statusCounts.reduce((acc, curr) => {
    acc[curr.status] = curr._count.status;
    return acc;
  }, {});

  return { leads, total, page, limit, countsByStatus };
}

/**
 * Get lead details by ID
 */
export async function getDemoLeadById(id, organizationId = null) {
  const lead = await prisma.demoLead.findUnique({
    where: { id },
  });

  if (!lead || (organizationId && lead.organizationId && lead.organizationId !== organizationId)) {
    throw new Error('Demo lead not found');
  }

  return lead;
}

/**
 * Update lead status, notes, assignment, follow-up date
 */
export async function updateDemoLead(id, updates, currentUser, organizationId = null) {
  const existing = await prisma.demoLead.findUnique({ where: { id } });
  if (!existing || (organizationId && existing.organizationId && existing.organizationId !== organizationId)) {
    throw new Error('Demo lead not found');
  }

  const updated = await prisma.demoLead.update({
    where: { id },
    data: {
      ...(updates.status && { status: updates.status }),
      ...(updates.assignedTo !== undefined && { assignedTo: updates.assignedTo }),
      ...(updates.notes !== undefined && { notes: updates.notes }),
      ...(updates.followUpDate !== undefined && {
        followUpDate: updates.followUpDate ? new Date(updates.followUpDate) : null,
      }),
    },
  });

  if (currentUser) {
    await logAudit({
      organizationId,
      userId: currentUser.id,
      userEmail: currentUser.email,
      module: 'DEMO_LEADS',
      action: 'UPDATE',
      entityId: id,
      entityType: 'DemoLead',
      details: `Updated demo lead ${existing.companyName} status to ${updates.status || existing.status}`,
    });
  }

  return updated;
}

/**
 * Delete a demo lead
 */
export async function deleteDemoLead(id, currentUser, organizationId = null) {
  const lead = await prisma.demoLead.findUnique({ where: { id } });
  if (!lead || (organizationId && lead.organizationId && lead.organizationId !== organizationId)) {
    throw new Error('Demo lead not found');
  }

  await prisma.demoLead.delete({ where: { id } });

  if (currentUser) {
    await logAudit({
      organizationId,
      userId: currentUser.id,
      userEmail: currentUser.email,
      module: 'DEMO_LEADS',
      action: 'DELETE',
      entityId: id,
      entityType: 'DemoLead',
      details: `Deleted demo lead ${lead.companyName} (${lead.fullName})`,
    });
  }

  return { success: true };
}
