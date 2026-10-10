import bcrypt from 'bcryptjs';
import { prisma } from '../../config/prisma.js';
import { generateNextDocumentNumber } from '../../utils/numbering.service.js';
import { logAudit } from '../../utils/audit.service.js';
import { computeMilestoneWaterfall } from '../projects/project.service.js';

export async function getPaymentsList({ page = 1, limit = 20, search = '', paymentMode = '', clientId = '', invoiceId = '', projectId = '' }) {
  const skip = (page - 1) * limit;

  const where = {
    ...(paymentMode && { paymentMode }),
    ...(clientId && { clientId }),
    ...(invoiceId && { invoiceId }),
    ...(projectId && { projectId }),
    ...(search && {
      OR: [
        { receiptNumber: { contains: search, mode: 'insensitive' } },
        { referenceNumber: { contains: search, mode: 'insensitive' } },
        { client: { companyName: { contains: search, mode: 'insensitive' } } },
        { invoice: { invoiceNumber: { contains: search, mode: 'insensitive' } } },
        { project: { name: { contains: search, mode: 'insensitive' } } },
        { project: { projectCode: { contains: search, mode: 'insensitive' } } },
      ],
    }),
  };

  const [total, payments] = await Promise.all([
    prisma.payment.count({ where }),
    prisma.payment.findMany({
      where,
      skip,
      take: limit,
      orderBy: { paymentDate: 'desc' },
      include: {
        client: {
          select: {
            id: true,
            companyName: true,
            contactPerson: true,
          },
        },
        invoice: {
          select: {
            id: true,
            invoiceNumber: true,
            totalAmount: true,
            balanceDue: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
            projectCode: true,
          },
        },
        splits: true,
      },
    }),
  ]);

  return { payments, total, page, limit };
}

export async function getPaymentById(id) {
  const payment = await prisma.payment.findUnique({
    where: { id },
    include: {
      client: true,
      invoice: {
        include: {
          items: true,
        },
      },
      project: {
        include: {
          milestones: true,
        },
      },
      splits: true,
    },
  });

  if (!payment) {
    throw new Error('Payment receipt not found');
  }

  const companyProfile = await prisma.companyProfile.findFirst({
    include: { assets: true },
  });

  return { ...payment, companyProfile };
}

/**
 * Record Payment with Multi-Method Split Support:
 * E.g., Advance payment split:
 * - Cash: ₹9,000
 * - GPay: ₹1,000
 * - Bank Transfer: ₹1,200
 * Automatically updates accounts and project / milestone balances!
 */
export async function recordPayment(data, user) {
  const {
    invoiceId,
    clientId,
    projectId,
    milestoneId,
    paymentType = 'ADVANCE',
    paymentDate = new Date(),
    referenceNumber,
    bankAccount,
    notes,
    splits = [],
  } = data;

  // Calculate total amount from splits if provided
  let amount = Number(data.amount || 0);
  if (Array.isArray(splits) && splits.length > 0) {
    amount = splits.reduce((sum, s) => sum + Number(s.amount || 0), 0);
  }

  if (amount <= 0) {
    throw new Error('Payment amount must be greater than 0');
  }

  // Primary payment mode fallback
  const primaryPaymentMode = splits.length > 0 ? splits[0].paymentMode : (data.paymentMode || 'BANK_TRANSFER');

  return await prisma.$transaction(async (tx) => {
    // 1. If invoiceId is provided, validate invoice
    let invoice = null;
    if (invoiceId) {
      invoice = await tx.invoice.findFirst({
        where: { id: invoiceId, isDeleted: false },
      });

      if (!invoice) {
        throw new Error('Associated invoice not found');
      }

      if (invoice.balanceDue <= 0 && invoice.status === 'PAID') {
        throw new Error('This invoice is already fully paid');
      }
    }

    // 2. If projectId is provided, validate project
    let project = null;
    if (projectId) {
      project = await tx.project.findFirst({
        where: { id: projectId, isDeleted: false },
      });
      if (!project) {
        throw new Error('Associated project not found');
      }
    }

    // 3. Generate next receipt sequence atomically
    const receiptNumber = await generateNextDocumentNumber('PAYMENT', tx);

    // 4. Create payment record
    const payment = await tx.payment.create({
      data: {
        receiptNumber,
        invoiceId: invoiceId || null,
        clientId,
        projectId: projectId || null,
        milestoneId: milestoneId || null,
        paymentType,
        amount: Number(amount),
        paymentDate: new Date(paymentDate),
        paymentMode: primaryPaymentMode,
        referenceNumber,
        bankAccount,
        notes,
        createdBy: user.email,
      },
      include: {
        client: true,
        invoice: true,
        project: true,
      },
    });

    // 5. Create Payment Splits and update corresponding Financial Accounts
    if (Array.isArray(splits) && splits.length > 0) {
      for (const split of splits) {
        const splitAmount = Number(split.amount || 0);
        if (splitAmount <= 0) continue;

        let account = null;
        if (split.accountId) {
          account = await tx.financialAccount.findUnique({
            where: { id: split.accountId },
          });
        } else {
          // Find default account matching mode
          const modeMatch = split.paymentMode === 'CASH' ? 'CASH' : (split.paymentMode === 'UPI' ? 'UPI' : 'BANK');
          account = await tx.financialAccount.findFirst({
            where: { accountType: modeMatch, isActive: true },
          });
        }

        await tx.paymentSplit.create({
          data: {
            paymentId: payment.id,
            paymentMode: split.paymentMode || primaryPaymentMode,
            amount: splitAmount,
            accountId: account?.id || null,
            accountName: account?.accountName || split.accountName || null,
            referenceNumber: split.referenceNumber || referenceNumber || null,
            notes: split.notes || null,
          },
        });

        // Update financial account balance
        if (account) {
          const newBal = account.currentBalance + splitAmount;
          await tx.financialAccount.update({
            where: { id: account.id },
            data: { currentBalance: newBal },
          });

          await tx.accountTransaction.create({
            data: {
              accountId: account.id,
              transactionType: 'CREDIT',
              amount: splitAmount,
              balanceAfter: newBal,
              category: 'PAYMENT_RECEIVED',
              referenceId: payment.id,
              referenceNumber: split.referenceNumber || receiptNumber,
              description: `Payment ${receiptNumber} (${paymentType}) from ${payment.client.companyName}`,
              transactionDate: new Date(paymentDate),
            },
          });
        }
      }
    } else {
      // Single method payment without explicit splits: create 1 split and update default account
      const modeMatch = primaryPaymentMode === 'CASH' ? 'CASH' : (primaryPaymentMode === 'UPI' ? 'UPI' : 'BANK');
      const account = await tx.financialAccount.findFirst({
        where: { accountType: modeMatch, isActive: true },
      });

      await tx.paymentSplit.create({
        data: {
          paymentId: payment.id,
          paymentMode: primaryPaymentMode,
          amount: Number(amount),
          accountId: account?.id || null,
          accountName: account?.accountName || null,
          referenceNumber: referenceNumber || null,
          notes: notes || null,
        },
      });

      if (account) {
        const newBal = account.currentBalance + Number(amount);
        await tx.financialAccount.update({
          where: { id: account.id },
          data: { currentBalance: newBal },
        });

        await tx.accountTransaction.create({
          data: {
            accountId: account.id,
            transactionType: 'CREDIT',
            amount: Number(amount),
            balanceAfter: newBal,
            category: 'PAYMENT_RECEIVED',
            referenceId: payment.id,
            referenceNumber: receiptNumber,
            description: `Payment ${receiptNumber} (${paymentType}) from ${payment.client.companyName}`,
            transactionDate: new Date(paymentDate),
          },
        });
      }
    }

    // 6. Update Project balances if linked
    if (project) {
      if (paymentType === 'ADVANCE') {
        await tx.project.update({
          where: { id: project.id },
          data: {
            advanceReceived: {
              increment: Number(amount),
            },
          },
        });
      }

      // If tied to milestone
      if (milestoneId) {
        const milestone = await tx.projectMilestone.findUnique({
          where: { id: milestoneId },
        });

        if (milestone) {
          const newPaid = Math.round((milestone.paidAmount + Number(amount)) * 100) / 100;

          // Update this milestone's paid amount first
          await tx.projectMilestone.update({
            where: { id: milestone.id },
            data: { paidAmount: newPaid },
          });

          // Fetch all milestones for this project to compute waterfall
          const allMilestones = await tx.projectMilestone.findMany({
            where: { projectId: project.id },
            orderBy: { milestoneOrder: 'asc' },
          });

          const waterfall = computeMilestoneWaterfall(allMilestones);
          const currentWf = waterfall.find((w) => w.id === milestone.id);

          const isComplete = currentWf ? currentWf.computedStatus === 'PAID' : newPaid >= milestone.amount;
          const variance = Math.round((newPaid - milestone.amount) * 100) / 100;

          await tx.projectMilestone.update({
            where: { id: milestone.id },
            data: {
              varianceAmount: variance,
              paymentStatusCategory: isComplete ? (variance > 0 ? 'EXCESS' : 'EXACT') : (newPaid > 0 ? 'SHORTFALL' : 'UNPAID'),
              excessAmount: currentWf ? currentWf.directExcess : Math.max(0, variance),
              shortfallAmount: currentWf ? currentWf.netPayableNow : Math.max(0, -variance),
              status: isComplete ? 'PAID' : (newPaid > 0 || (currentWf && currentWf.creditApplied > 0) ? 'PARTIALLY_PAID' : 'PENDING'),
              completedAt: isComplete ? (milestone.completedAt || new Date()) : null,
              excessAllocationNotes: currentWf && currentWf.creditApplied > 0
                ? `₹${currentWf.creditApplied.toLocaleString('en-IN')} advance credit applied from prior milestones`
                : null,
            },
          });
        }
      }
    }

    // 7. Update Invoice if tied to an invoice
    if (invoice) {
      const newPaidAmount = Math.round((invoice.paidAmount + Number(amount)) * 100) / 100;
      const newBalanceDue = Math.max(0, Math.round((invoice.totalAmount - newPaidAmount) * 100) / 100);
      const newStatus = newBalanceDue === 0 ? 'PAID' : 'PARTIALLY_PAID';

      await tx.invoice.update({
        where: { id: invoice.id },
        data: {
          paidAmount: newPaidAmount,
          balanceDue: newBalanceDue,
          status: newStatus,
        },
      });
    }

    // 8. Audit record
    await logAudit({
      userId: user.id,
      userEmail: user.email,
      module: 'PAYMENT',
      action: 'CREATE',
      entityId: payment.id,
      entityType: 'PAYMENT',
      details: `Recorded ${paymentType} payment ${receiptNumber} of ₹${amount} with ${splits.length || 1} split methods${project ? ` for project ${project.projectCode}` : ''}`,
    });

    return payment;
  });
}

export async function signPayment(id, pin, user) {
  const companyProfile = await prisma.companyProfile.findFirst();
  if (!companyProfile || !companyProfile.signaturePinHash) {
    throw new Error('Digital signature PIN is not configured');
  }

  const isPinValid = await bcrypt.compare(pin, companyProfile.signaturePinHash);
  if (!isPinValid) {
    await logAudit({
      userId: user.id,
      userEmail: user.email,
      module: 'PAYMENT',
      action: 'PIN_VERIFY_FAILED',
      entityId: id,
      entityType: 'PAYMENT',
      details: `Security Alert: Invalid digital signature PIN entered while attempting to sign payment receipt ID: ${id} by ${user.email}`,
    });
    throw new Error('Invalid 4-digit PIN for digital signature authorization');
  }

  const payment = await prisma.payment.findUnique({
    where: { id },
  });

  if (!payment) {
    throw new Error('Payment not found');
  }

  const updated = await prisma.payment.update({
    where: { id },
    data: {
      isDigitallySigned: true,
      signedAt: new Date(),
      signedBy: `${user.name} (${user.role})`,
    },
  });

  await logAudit({
    userId: user.id,
    userEmail: user.email,
    module: 'PAYMENT',
    action: 'SIGN',
    entityId: id,
    entityType: 'PAYMENT',
    details: `Digitally signed payment receipt ${payment.receiptNumber} after PIN verification`,
  });

  return updated;
}

export async function unsignPayment(id, user) {
  const payment = await prisma.payment.findFirst({
    where: { id, isDeleted: false },
  });

  if (!payment) {
    throw new Error('Payment not found');
  }

  const updated = await prisma.payment.update({
    where: { id },
    data: {
      isDigitallySigned: false,
      signedAt: null,
      signedBy: null,
    },
  });

  await logAudit({
    userId: user.id,
    userEmail: user.email,
    module: 'PAYMENT',
    action: 'UNSIGN',
    entityId: id,
    entityType: 'PAYMENT',
    details: `Digital signature removed from payment receipt ${payment.receiptNumber}`,
  });

  return updated;
}
