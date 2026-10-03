import { prisma } from '../../config/prisma.js';
import { generateNextDocumentNumber } from '../../utils/numbering.service.js';
import { logAudit } from '../../utils/audit.service.js';

export function computeMilestoneVariance(amount, paidAmount) {
  const amt = Number(amount || 0);
  const paid = Number(paidAmount || 0);
  const variance = Math.round((paid - amt) * 100) / 100;
  let category = 'UNPAID';
  let excess = 0;
  let shortfall = 0;

  if (paid <= 0) {
    category = 'UNPAID';
    shortfall = amt;
  } else if (variance === 0) {
    category = 'EXACT';
  } else if (variance > 0) {
    category = 'EXCESS';
    excess = variance;
  } else {
    category = 'SHORTFALL';
    shortfall = Math.abs(variance);
  }

  return {
    varianceAmount: variance,
    paymentStatusCategory: category,
    excessAmount: excess,
    shortfallAmount: shortfall,
  };
}

/**
 * Computes progressive cumulative waterfall across milestones:
 * Absorbs excess advances from earlier milestones into subsequent milestone dues automatically.
 */
export function computeMilestoneWaterfall(milestones = []) {
  let accumulatedExcessCredit = 0;

  return (milestones || []).map((m) => {
    const amount = Number(m.amount || 0);
    const paid = Number(m.paidAmount || 0);
    const directDue = Math.max(0, Math.round((amount - paid) * 100) / 100);
    const directExcess = Math.max(0, Math.round((paid - amount) * 100) / 100);

    // Credit that can be applied from prior accumulated unabsorbed excess
    const creditApplied = Math.min(directDue, accumulatedExcessCredit);
    const netPayableNow = Math.max(0, Math.round((directDue - creditApplied) * 100) / 100);

    // Update accumulated pool for subsequent milestones:
    accumulatedExcessCredit = Math.max(0, Math.round((accumulatedExcessCredit - creditApplied + directExcess) * 100) / 100);

    let status = m.status;
    if (paid >= amount && amount > 0) {
      status = 'PAID';
    } else if (netPayableNow === 0 && (creditApplied > 0 || paid > 0)) {
      status = 'PAID';
    } else if (paid > 0 || creditApplied > 0) {
      status = 'PARTIALLY_PAID';
    } else {
      status = 'PENDING';
    }

    return {
      ...m,
      amount,
      paidAmount: paid,
      directDue,
      directExcess,
      creditApplied,
      netPayableNow,
      accumulatedExcessCreditRemaining: accumulatedExcessCredit,
      computedStatus: status,
    };
  });
}

/**
 * Computes standard financial metrics for a project object
 */
export function calculateProjectFinancials(project) {
  const quotationValue = Number(project.quotationValue || 0);
  const additionalCharges = Number(project.additionalCharges || 0);
  const totalProjectValue = quotationValue + additionalCharges;

  // Payments calculations
  const payments = project.payments || [];
  const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);

  // Advance payments
  const advancePayments = payments.filter((p) => p.paymentType === 'ADVANCE');
  const advanceReceived = advancePayments.reduce((sum, p) => sum + Number(p.amount || 0), 0) || Number(project.advanceReceived || 0);

  // Milestone payments
  const milestonePaymentsReceived = payments
    .filter((p) => p.paymentType !== 'ADVANCE')
    .reduce((sum, p) => sum + Number(p.amount || 0), 0);

  // Milestones variance totals
  const milestones = project.milestones || [];
  const totalMilestonesExcess = milestones.reduce((sum, m) => sum + Number(m.excessAmount || (m.paidAmount > m.amount ? m.paidAmount - m.amount : 0)), 0);
  const totalMilestonesShortfall = milestones.reduce((sum, m) => sum + Number(m.shortfallAmount || (m.paidAmount < m.amount ? m.amount - m.paidAmount : 0)), 0);

  // Outstanding balance
  const outstandingBalance = Math.max(0, Math.round((totalProjectValue - totalPaid) * 100) / 100);

  // Expenses calculations
  const expenses = project.expenses || [];
  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);

  // Available remaining funds from received collections
  const remainingFunds = Math.round((totalPaid - totalExpenses) * 100) / 100;
  const advanceUtilizationPercent = advanceReceived > 0 ? Math.min(100, Math.round((totalExpenses / advanceReceived) * 100)) : 0;

  // Profitability
  const estimatedProfit = Math.round((totalProjectValue - totalExpenses) * 100) / 100;
  const profitMarginPercent = totalProjectValue > 0 ? Math.round((estimatedProfit / totalProjectValue) * 1000) / 10 : 0;

  // Invoices calculations
  const invoices = (project.invoices || []).filter((inv) => !inv.isDeleted);
  const totalInvoiced = Math.round(invoices.reduce((sum, inv) => sum + Number(inv.totalAmount || 0), 0) * 100) / 100;
  const totalInvoicedTax = Math.round(invoices.reduce((sum, inv) => sum + Number(inv.taxAmount || 0), 0) * 100) / 100;
  const totalInvoicedSubtotal = Math.round(invoices.reduce((sum, inv) => sum + Number(inv.subtotal || 0), 0) * 100) / 100;
  const totalInvoicePaid = Math.round(invoices.reduce((sum, inv) => sum + Number(inv.paidAmount || 0), 0) * 100) / 100;
  const totalInvoiceBalanceDue = Math.round(invoices.reduce((sum, inv) => sum + Number(inv.balanceDue || 0), 0) * 100) / 100;

  // Handover check
  const isHandoverEligible = outstandingBalance <= 0;

  return {
    quotationValue,
    additionalCharges,
    totalProjectValue,
    advanceRequiredPercent: Number(project.advanceRequiredPercent || 50),
    advanceRequiredAmount: Number(project.advanceRequiredAmount || (totalProjectValue * 0.5)),
    advanceReceived,
    milestonePaymentsReceived,
    totalPaid,
    totalMilestonesExcess,
    totalMilestonesShortfall,
    outstandingBalance,
    totalExpenses,
    remainingFunds,
    advanceUtilizationPercent,
    estimatedProfit,
    profitMarginPercent,
    isHandoverEligible,
    totalInvoiced,
    totalInvoicedTax,
    totalInvoicedSubtotal,
    totalInvoicePaid,
    totalInvoiceBalanceDue,
    invoicesCount: invoices.length,
  };
}

export async function getProjectsList({ page = 1, limit = 20, search = '', status = '', clientId = '', handoverStatus = '' }) {
  const skip = (page - 1) * limit;

  const where = {
    isDeleted: false,
    ...(status && { status }),
    ...(clientId && { clientId }),
    ...(handoverStatus && { handoverStatus }),
    ...(search && {
      OR: [
        { projectCode: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
        { client: { companyName: { contains: search, mode: 'insensitive' } } },
      ],
    }),
  };

  const [total, rawProjects] = await Promise.all([
    prisma.project.count({ where }),
    prisma.project.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        client: {
          select: {
            id: true,
            companyName: true,
            contactPerson: true,
            email: true,
            phone: true,
          },
        },
        quotation: {
          select: {
            id: true,
            quotationNumber: true,
            totalAmount: true,
            status: true,
          },
        },
        milestones: {
          orderBy: { milestoneOrder: 'asc' },
        },
        payments: {
          include: {
            splits: true,
          },
        },
        expenses: {
          where: { isDeleted: false },
        },
      },
    }),
  ]);

  const projects = rawProjects.map((p) => {
    const financials = calculateProjectFinancials(p);
    return {
      ...p,
      financials,
    };
  });

  // Calculate portfolio totals
  const portfolioSummary = projects.reduce(
    (acc, p) => {
      acc.totalQuotationValue += p.financials.quotationValue;
      acc.totalProjectValue += p.financials.totalProjectValue;
      acc.totalReceived += p.financials.totalPaid;
      acc.totalOutstanding += p.financials.outstandingBalance;
      acc.totalExpenses += p.financials.totalExpenses;
      acc.totalEstimatedProfit += p.financials.estimatedProfit;
      return acc;
    },
    {
      totalQuotationValue: 0,
      totalProjectValue: 0,
      totalReceived: 0,
      totalOutstanding: 0,
      totalExpenses: 0,
      totalEstimatedProfit: 0,
      activeProjectsCount: rawProjects.filter((p) => ['PLANNING', 'IN_PROGRESS', 'ON_HOLD'].includes(p.status)).length,
      completedProjectsCount: rawProjects.filter((p) => ['COMPLETED', 'HANDED_OVER'].includes(p.status)).length,
    }
  );

  return { projects, total, page, limit, portfolioSummary };
}

export async function getProjectById(id) {
  const project = await prisma.project.findFirst({
    where: { id, isDeleted: false },
    include: {
      client: {
        include: {
          contacts: true,
        },
      },
      quotation: {
        include: {
          items: true,
          revisions: {
            orderBy: { revisionNumber: 'desc' },
          },
        },
      },
      projectQuotations: {
        where: { isDeleted: false },
        orderBy: { createdAt: 'desc' },
        include: {
          items: true,
          client: {
            select: {
              id: true,
              companyName: true,
              contactPerson: true,
            },
          },
        },
      },
      milestones: {
        orderBy: { milestoneOrder: 'asc' },
      },
      payments: {
        orderBy: { paymentDate: 'desc' },
        include: {
          splits: true,
        },
      },
      expenses: {
        where: { isDeleted: false },
        orderBy: { expenseDate: 'desc' },
        include: {
          vendor: true,
        },
      },
      invoices: {
        where: { isDeleted: false },
        orderBy: { invoiceDate: 'desc' },
        include: {
          items: true,
          payments: {
            include: {
              splits: true,
            },
          },
        },
      },
    },
  });

  if (!project) {
    throw new Error('Project not found');
  }

  const financials = calculateProjectFinancials(project);

  // Parse team JSON if available
  let parsedTeam = [];
  if (project.assignedTeam) {
    try {
      parsedTeam = JSON.parse(project.assignedTeam);
    } catch {
      parsedTeam = [{ name: project.assignedTeam, role: 'Lead' }];
    }
  }

  const companyProfile = await prisma.companyProfile.findFirst({
    include: { assets: true },
  });

  return {
    ...project,
    assignedTeamMembers: parsedTeam,
    financials,
    companyProfile,
  };
}

export async function createProject(data, user) {
  const quotationValue = Number(data.quotationValue || 0);
  const additionalCharges = Number(data.additionalCharges || 0);
  const totalProjectValue = quotationValue + additionalCharges;

  const advanceRequiredPercent = Number(data.advanceRequiredPercent || 50);
  const advanceRequiredAmount = Number(data.advanceRequiredAmount || (totalProjectValue * (advanceRequiredPercent / 100)));

  return await prisma.$transaction(async (tx) => {
    const projectCode = await generateNextDocumentNumber('PROJECT', tx);

    const project = await tx.project.create({
      data: {
        projectCode,
        name: data.name,
        description: data.description || null,
        clientId: data.clientId,
        quotationId: data.quotationId || null,
        status: data.status || 'PLANNING',
        startDate: data.startDate ? new Date(data.startDate) : new Date(),
        deadline: data.deadline ? new Date(data.deadline) : null,
        quotationValue,
        additionalCharges,
        totalProjectValue,
        advanceRequiredPercent,
        advanceRequiredAmount,
        advanceReceived: 0,
        assignedTeam: typeof data.assignedTeam === 'object' ? JSON.stringify(data.assignedTeam) : data.assignedTeam,
        handoverStatus: 'NOT_READY',
        createdBy: user.email,
      },
      include: {
        client: true,
      },
    });

    // Create default milestones if provided, otherwise standard 3 milestones (50% Advance, 30% Mid, 20% Final)
    const milestonesInput = Array.isArray(data.milestones) && data.milestones.length > 0 ? data.milestones : [
      {
        title: 'Phase 1: Project Kickoff & Advance Payment',
        milestoneOrder: 1,
        percentage: advanceRequiredPercent,
        amount: advanceRequiredAmount,
        dueDate: data.startDate ? new Date(data.startDate) : new Date(),
        status: 'PENDING',
        notes: 'Initial deposit required before project kickoff.',
      },
      {
        title: 'Phase 2: Core Development & Architecture Delivery',
        milestoneOrder: 2,
        percentage: 30,
        amount: Math.round(totalProjectValue * 0.3 * 100) / 100,
        dueDate: data.deadline ? new Date(new Date(data.deadline).getTime() - 15 * 86400000) : null,
        status: 'PENDING',
        notes: 'Intermediate milestone upon delivery of staging build.',
      },
      {
        title: 'Phase 3: Final Production Cutover & Handover',
        milestoneOrder: 3,
        percentage: Math.max(0, 100 - advanceRequiredPercent - 30),
        amount: Math.round((totalProjectValue - advanceRequiredAmount - (totalProjectValue * 0.3)) * 100) / 100,
        dueDate: data.deadline ? new Date(data.deadline) : null,
        status: 'PENDING',
        notes: 'Final settlement required for project handover clearance.',
      },
    ];

    for (const m of milestonesInput) {
      await tx.projectMilestone.create({
        data: {
          projectId: project.id,
          title: m.title,
          milestoneOrder: m.milestoneOrder || 1,
          percentage: Number(m.percentage || 0),
          amount: Number(m.amount || 0),
          dueDate: m.dueDate ? new Date(m.dueDate) : null,
          status: m.status || 'PENDING',
          notes: m.notes || null,
        },
      });
    }

    await logAudit({
      userId: user.id,
      userEmail: user.email,
      module: 'PROJECT',
      action: 'CREATE',
      entityId: project.id,
      entityType: 'PROJECT',
      details: `Created project ${project.projectCode} (${project.name}) with value ₹${totalProjectValue}`,
    });

    return project;
  });
}

export async function convertQuotationToProject(quotationId, data = {}, user) {
  const quotation = await prisma.quotation.findUnique({
    where: { id: quotationId },
    include: { client: true, items: true },
  });

  if (!quotation) {
    throw new Error('Quotation not found');
  }

  return await prisma.$transaction(async (tx) => {
    const projectCode = await generateNextDocumentNumber('PROJECT', tx);
    const quotationValue = quotation.totalAmount;
    const additionalCharges = Number(data.additionalCharges || 0);
    const totalProjectValue = quotationValue + additionalCharges;

    const advancePercent = Number(data.advanceRequiredPercent || 50);
    const advanceAmount = Math.round(totalProjectValue * (advancePercent / 100) * 100) / 100;

    const project = await tx.project.create({
      data: {
        projectCode,
        name: data.name || `${quotation.client.companyName} - Software Implementation`,
        description: data.description || quotation.notes || `Project initiated from approved quotation ${quotation.quotationNumber}`,
        clientId: quotation.clientId,
        quotationId: quotation.id,
        status: 'IN_PROGRESS',
        startDate: data.startDate ? new Date(data.startDate) : new Date(),
        deadline: data.deadline ? new Date(data.deadline) : null,
        quotationValue,
        additionalCharges,
        totalProjectValue,
        advanceRequiredPercent: advancePercent,
        advanceRequiredAmount: advanceAmount,
        advanceReceived: 0,
        assignedTeam: typeof data.assignedTeam === 'object' ? JSON.stringify(data.assignedTeam) : data.assignedTeam,
        handoverStatus: 'NOT_READY',
        createdBy: user.email,
      },
    });

    // Create 3 standard milestones
    const midPercent = advancePercent <= 50 ? 30 : Math.max(10, 100 - advancePercent - 10);
    const finalPercent = Math.max(0, 100 - advancePercent - midPercent);

    await tx.projectMilestone.createMany({
      data: [
        {
          projectId: project.id,
          title: `Milestone 1: Project Kickoff & Advance (${advancePercent}%)`,
          milestoneOrder: 1,
          percentage: advancePercent,
          amount: advanceAmount,
          dueDate: data.startDate ? new Date(data.startDate) : new Date(),
          status: 'PENDING',
          notes: 'Advance payment due upon agreement signing.',
        },
        {
          projectId: project.id,
          title: `Milestone 2: Core Development & Review (${midPercent}%)`,
          milestoneOrder: 2,
          percentage: midPercent,
          amount: Math.round(totalProjectValue * (midPercent / 100) * 100) / 100,
          dueDate: data.deadline ? new Date(new Date(data.deadline).getTime() - 14 * 86400000) : null,
          status: 'PENDING',
          notes: 'Payment upon delivery of staging and user validation.',
        },
        {
          projectId: project.id,
          title: `Milestone 3: Final Deployment & Handover (${finalPercent}%)`,
          milestoneOrder: 3,
          percentage: finalPercent,
          amount: Math.round(totalProjectValue * (finalPercent / 100) * 100) / 100,
          dueDate: data.deadline ? new Date(data.deadline) : null,
          status: 'PENDING',
          notes: 'Final settlement required for project sign-off and handover.',
        },
      ],
    });

    // Mark quotation as CONVERTED
    await tx.quotation.update({
      where: { id: quotation.id },
      data: { status: 'CONVERTED' },
    });

    await logAudit({
      userId: user.id,
      userEmail: user.email,
      module: 'PROJECT',
      action: 'CONVERT',
      entityId: project.id,
      entityType: 'PROJECT',
      details: `Converted quotation ${quotation.quotationNumber} into project ${project.projectCode}`,
    });

    return project;
  });
}

export async function updateProject(id, data, user) {
  const existing = await prisma.project.findUnique({ where: { id } });
  if (!existing) {
    throw new Error('Project not found');
  }

  const quotationValue = data.quotationValue !== undefined ? Number(data.quotationValue) : existing.quotationValue;
  const additionalCharges = data.additionalCharges !== undefined ? Number(data.additionalCharges) : existing.additionalCharges;
  const totalProjectValue = quotationValue + additionalCharges;

  const updated = await prisma.project.update({
    where: { id },
    data: {
      name: data.name,
      description: data.description,
      status: data.status,
      startDate: data.startDate ? new Date(data.startDate) : undefined,
      deadline: data.deadline ? new Date(data.deadline) : undefined,
      completedDate: data.completedDate ? new Date(data.completedDate) : undefined,
      quotationValue,
      additionalCharges,
      totalProjectValue,
      advanceRequiredPercent: data.advanceRequiredPercent !== undefined ? Number(data.advanceRequiredPercent) : undefined,
      advanceRequiredAmount: data.advanceRequiredAmount !== undefined ? Number(data.advanceRequiredAmount) : undefined,
      assignedTeam: data.assignedTeam ? (typeof data.assignedTeam === 'object' ? JSON.stringify(data.assignedTeam) : data.assignedTeam) : undefined,
    },
  });

  await logAudit({
    userId: user.id,
    userEmail: user.email,
    module: 'PROJECT',
    action: 'UPDATE',
    entityId: id,
    entityType: 'PROJECT',
    details: `Updated project ${updated.projectCode} details and status to ${updated.status}`,
  });

  return updated;
}

export async function deleteProject(id, user) {
  const existing = await prisma.project.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new Error('Project not found');
  }

  const deleted = await prisma.project.update({
    where: { id },
    data: {
      isDeleted: true,
      deletedAt: new Date(),
    },
  });

  await logAudit({
    userId: user?.id,
    userEmail: user?.email,
    module: 'PROJECT',
    action: 'DELETE',
    entityId: id,
    entityType: 'PROJECT',
    details: `Deleted project ${existing.projectCode} (${existing.name})`,
  });

  return deleted;
}

export async function addMilestone(projectId, milestoneData, user) {
  const amount = Number(milestoneData.amount || 0);
  const paidAmount = Number(milestoneData.paidAmount || 0);
  const varianceData = computeMilestoneVariance(amount, paidAmount);

  const milestone = await prisma.projectMilestone.create({
    data: {
      projectId,
      title: milestoneData.title,
      milestoneOrder: Number(milestoneData.milestoneOrder || 1),
      percentage: Number(milestoneData.percentage || 0),
      amount,
      paidAmount,
      varianceAmount: varianceData.varianceAmount,
      paymentStatusCategory: varianceData.paymentStatusCategory,
      excessAmount: varianceData.excessAmount,
      shortfallAmount: varianceData.shortfallAmount,
      excessAllocationNotes: milestoneData.excessAllocationNotes || null,
      dueDate: milestoneData.dueDate ? new Date(milestoneData.dueDate) : null,
      status: milestoneData.status || (paidAmount >= amount && amount > 0 ? 'PAID' : paidAmount > 0 ? 'PARTIALLY_PAID' : 'PENDING'),
      notes: milestoneData.notes || null,
    },
  });

  if (user) {
    await logAudit({
      userId: user.id,
      userEmail: user.email,
      module: 'PROJECT',
      action: 'UPDATE',
      entityId: projectId,
      entityType: 'PROJECT',
      details: `Added milestone "${milestone.title}" (₹${amount}) to project`,
    });
  }

  return milestone;
}

export async function updateMilestone(milestoneId, milestoneData, user) {
  const existing = await prisma.projectMilestone.findUnique({
    where: { id: milestoneId },
  });

  if (!existing) {
    throw new Error('Milestone not found');
  }

  const amount = milestoneData.amount !== undefined ? Number(milestoneData.amount) : existing.amount;
  const paidAmount = milestoneData.paidAmount !== undefined ? Number(milestoneData.paidAmount) : existing.paidAmount;
  const varianceData = computeMilestoneVariance(amount, paidAmount);

  let computedStatus = milestoneData.status || existing.status;
  if (milestoneData.paidAmount !== undefined && !milestoneData.status) {
    if (paidAmount >= amount && amount > 0) {
      computedStatus = 'PAID';
    } else if (paidAmount > 0) {
      computedStatus = 'PARTIALLY_PAID';
    } else {
      computedStatus = 'PENDING';
    }
  }

  const updated = await prisma.projectMilestone.update({
    where: { id: milestoneId },
    data: {
      title: milestoneData.title,
      milestoneOrder: milestoneData.milestoneOrder !== undefined ? Number(milestoneData.milestoneOrder) : undefined,
      percentage: milestoneData.percentage !== undefined ? Number(milestoneData.percentage) : undefined,
      amount,
      paidAmount,
      varianceAmount: varianceData.varianceAmount,
      paymentStatusCategory: varianceData.paymentStatusCategory,
      excessAmount: varianceData.excessAmount,
      shortfallAmount: varianceData.shortfallAmount,
      excessAllocationNotes: milestoneData.excessAllocationNotes !== undefined ? milestoneData.excessAllocationNotes : undefined,
      dueDate: milestoneData.dueDate ? new Date(milestoneData.dueDate) : undefined,
      status: computedStatus,
      notes: milestoneData.notes !== undefined ? milestoneData.notes : undefined,
      completedAt: computedStatus === 'PAID' ? (existing.completedAt || new Date()) : null,
    },
  });

  if (user) {
    await logAudit({
      userId: user.id,
      userEmail: user.email,
      module: 'PROJECT',
      action: 'UPDATE',
      entityId: updated.projectId,
      entityType: 'PROJECT',
      details: `Updated milestone "${updated.title}" - Paid: ₹${paidAmount}, Variance: ₹${varianceData.varianceAmount} (${varianceData.paymentStatusCategory})`,
    });
  }

  return updated;
}

export async function deleteMilestone(milestoneId, user) {
  const existing = await prisma.projectMilestone.findUnique({
    where: { id: milestoneId },
  });

  const deleted = await prisma.projectMilestone.delete({
    where: { id: milestoneId },
  });

  if (user && existing) {
    await logAudit({
      userId: user.id,
      userEmail: user.email,
      module: 'PROJECT',
      action: 'DELETE',
      entityId: existing.projectId,
      entityType: 'PROJECT',
      details: `Deleted milestone "${existing.title}"`,
    });
  }

  return deleted;
}

/**
 * Strict Handover Verification:
 * Validates that all payments have been received and outstanding balance is 0.
 * If outstanding balance > 0, handover is strictly prevented!
 */
export async function verifyAndHandoverProject(projectId, { handoverNotes, authorizedBy }, user) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      payments: true,
      milestones: true,
      expenses: { where: { isDeleted: false } },
    },
  });

  if (!project) {
    throw new Error('Project not found');
  }

  const financials = calculateProjectFinancials(project);

  if (financials.outstandingBalance > 0) {
    throw new Error(
      `Handover Blocked: Cannot approve handover because project has an outstanding balance of ₹${financials.outstandingBalance.toLocaleString(
        'en-IN'
      )}. All dues must be cleared and reconciled prior to handover clearance.`
    );
  }

  const updatedProject = await prisma.project.update({
    where: { id: projectId },
    data: {
      status: 'HANDED_OVER',
      handoverStatus: 'HANDED_OVER',
      handoverDate: new Date(),
      completedDate: project.completedDate || new Date(),
      handoverApprovedBy: authorizedBy || user.name,
      handoverNotes: handoverNotes || 'Final financial audit passed. All payments cleared and customer handover authorized.',
    },
    include: {
      client: true,
      quotation: true,
      milestones: true,
    },
  });

  // Mark all milestones as PAID if not already
  await prisma.projectMilestone.updateMany({
    where: { projectId, status: { not: 'PAID' } },
    data: { status: 'PAID', completedAt: new Date() },
  });

  await logAudit({
    userId: user.id,
    userEmail: user.email,
    module: 'PROJECT',
    action: 'UPDATE',
    entityId: projectId,
    entityType: 'PROJECT',
    details: `Approved final settlement & official handover for project ${project.projectCode} by ${authorizedBy || user.name}`,
  });

  return updatedProject;
}

/**
 * Generates structured document payload for customizable official letters & receipts:
 * - advance-request: Advance payment request letter
 * - acknowledgment: Payment acknowledgment letter
 * - milestone-request: Milestone payment request
 * - receipt: Official split payment receipt
 * - final-reminder: Final payment reminder before handover
 * - handover-certificate: Project handover & settlement clearance certificate
 */
export async function getProjectDocumentData(projectId, docType, options = {}) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      client: {
        include: { contacts: true },
      },
      quotation: true,
      milestones: { orderBy: { milestoneOrder: 'asc' } },
      payments: {
        orderBy: { paymentDate: 'desc' },
        include: { splits: true },
      },
      expenses: { where: { isDeleted: false } },
    },
  });

  if (!project) {
    throw new Error('Project not found');
  }

  const financials = calculateProjectFinancials(project);
  const company = await prisma.companyProfile.findFirst({
    include: { assets: true },
  });

  const accounts = await prisma.financialAccount.findMany({
    where: { isActive: true },
    orderBy: { isDefault: 'desc' },
  });

  const currentDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const primaryContact = project.client.contacts?.find((c) => c.isPrimary) || project.client.contacts?.[0];

  const waterfall = computeMilestoneWaterfall(project.milestones);
  let targetMilestone = null;
  let targetWaterfallItem = null;

  if (options.milestoneId) {
    targetMilestone = project.milestones.find((m) => m.id === options.milestoneId) || null;
    targetWaterfallItem = waterfall.find((m) => m.id === options.milestoneId) || null;
  }

  const requestedAmount = options.requestedAmount !== undefined && options.requestedAmount !== ''
    ? Number(options.requestedAmount)
    : targetWaterfallItem
      ? targetWaterfallItem.netPayableNow
      : financials.outstandingBalance;

  return {
    docType,
    date: currentDate,
    project: {
      id: project.id,
      code: project.projectCode,
      name: project.name,
      description: project.description,
      startDate: project.startDate,
      deadline: project.deadline,
      completedDate: project.completedDate,
      handoverDate: project.handoverDate,
      handoverApprovedBy: project.handoverApprovedBy,
      handoverNotes: project.handoverNotes,
      status: project.status,
      handoverStatus: project.handoverStatus,
    },
    client: {
      name: project.client.companyName,
      contactPerson: primaryContact?.name || project.client.contactPerson,
      email: primaryContact?.email || project.client.email,
      phone: primaryContact?.phone || project.client.phone,
      address: project.client.address,
      city: project.client.city,
      state: project.client.state,
      gstNumber: project.client.gstNumber,
    },
    quotation: project.quotation ? {
      number: project.quotation.quotationNumber,
      date: project.quotation.quotationDate,
      totalAmount: project.quotation.totalAmount,
    } : null,
    financials,
    milestones: waterfall,
    targetMilestone: targetWaterfallItem || targetMilestone,
    paymentRequest: {
      requestedAmount,
      dueDate: options.dueDate || null,
      customNote: options.customNote || null,
      selectedMilestoneId: options.milestoneId || null,
      milestoneTitle: targetWaterfallItem?.title || null,
      milestoneAmount: targetWaterfallItem?.amount || null,
      creditApplied: targetWaterfallItem?.creditApplied || 0,
      netPayableNow: targetWaterfallItem?.netPayableNow !== undefined ? targetWaterfallItem.netPayableNow : requestedAmount,
    },
    payments: project.payments,
    company,
    bankAccounts: accounts,
  };
}

