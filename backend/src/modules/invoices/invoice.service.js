import bcrypt from 'bcryptjs';
import { prisma } from '../../config/prisma.js';
import { generateNextDocumentNumber } from '../../utils/numbering.service.js';
import { logAudit } from '../../utils/audit.service.js';

function computeInvoiceTotals(items, discountAmount = 0, taxRate = 0, discountType = 'FIXED', discountRate = 0) {
  let subtotal = 0;

  const processedItems = items.map((item, index) => {
    const qty = Number(item.quantity) || 1;
    const price = Number(item.unitPrice) || 0;
    const taxPct = Number(item.taxPercent) || 0;

    const gross = qty * price;
    let discAmt = 0;
    let discPct = 0;
    const itemDiscType = item.discountType === 'FIXED' || item.discountType === '₹' ? 'FIXED' : 'PERCENTAGE';
    if (itemDiscType === 'FIXED') {
      discAmt = Math.min(gross, Math.max(0, Number(item.discountAmount) || 0));
      discPct = gross > 0 ? Math.round(((discAmt / gross) * 100) * 100) / 100 : 0;
    } else {
      discPct = Number(item.discountPercent) || 0;
      discAmt = (gross * discPct) / 100;
    }
    const net = gross - discAmt;
    const taxAmt = (net * taxPct) / 100;
    const totalPrice = net + taxAmt;

    subtotal += net;

    return {
      itemOrder: index + 1,
      title: item.title?.trim() || null,
      description: item.description?.trim() || item.title?.trim() || '',
      quantity: qty,
      unitPrice: price,
      discountPercent: discPct,
      discountType: itemDiscType,
      discountAmount: Math.round(discAmt * 100) / 100,
      taxPercent: taxPct,
      totalPrice: Math.round(totalPrice * 100) / 100,
    };
  });

  let finalDiscountAmount = 0;
  if (discountType === 'PERCENTAGE' || (Number(discountRate) > 0 && Number(discountAmount) === 0)) {
    finalDiscountAmount = Math.round(((subtotal * Number(discountRate)) / 100) * 100) / 100;
  } else {
    finalDiscountAmount = Math.min(subtotal, Math.max(0, Math.round(Number(discountAmount) * 100) / 100));
  }

  const taxableAmount = Math.max(0, subtotal - finalDiscountAmount);
  const taxAmount = Math.round(((taxableAmount * taxRate) / 100) * 100) / 100;
  const totalAmount = Math.round((taxableAmount + taxAmount) * 100) / 100;

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    discountAmount: finalDiscountAmount,
    taxAmount,
    totalAmount,
    processedItems,
  };
}

export async function getInvoicesList({ page = 1, limit = 10, search = '', status = '', clientId = '', projectId = '' }) {
  const skip = (page - 1) * limit;

  const where = {
    isDeleted: false,
    ...(status && { status }),
    ...(clientId && { clientId }),
    ...(projectId && { projectId }),
    ...(search && {
      OR: [
        { invoiceNumber: { contains: search, mode: 'insensitive' } },
        { client: { companyName: { contains: search, mode: 'insensitive' } } },
        { client: { contactPerson: { contains: search, mode: 'insensitive' } } },
      ],
    }),
  };

  const [total, invoices] = await Promise.all([
    prisma.invoice.count({ where }),
    prisma.invoice.findMany({
      where,
      skip,
      take: limit,
      orderBy: { invoiceDate: 'desc' },
      select: {
        id: true,
        invoiceNumber: true,
        invoiceDate: true,
        dueDate: true,
        status: true,
        subtotal: true,
        taxAmount: true,
        totalAmount: true,
        paidAmount: true,
        balanceDue: true,
        isDigitallySigned: true,
        signedAt: true,
        signedBy: true,
        projectId: true,
        milestoneId: true,
        client: {
          select: {
            id: true,
            companyName: true,
            contactPerson: true,
            email: true,
          },
        },
        project: {
          select: {
            id: true,
            projectCode: true,
            name: true,
          },
        },
        _count: {
          select: {
            items: true,
            payments: true,
          },
        },
      },
    }),
  ]);

  return { invoices, total, page, limit };
}

export async function getInvoiceById(id) {
  const invoice = await prisma.invoice.findFirst({
    where: { id, isDeleted: false },
    include: {
      client: {
        include: {
          contacts: true,
        },
      },
      items: {
        orderBy: { itemOrder: 'asc' },
      },
      payments: {
        orderBy: { paymentDate: 'desc' },
        include: {
          splits: true,
        },
      },
      quotation: {
        select: {
          id: true,
          quotationNumber: true,
        },
      },
      project: {
        select: {
          id: true,
          projectCode: true,
          name: true,
        },
      },
    },
  });

  if (!invoice) {
    throw new Error('Invoice not found');
  }

  const companyProfile = await prisma.companyProfile.findFirst({
    include: { assets: true },
  });

  return { ...invoice, companyProfile };
}

export async function createInvoice(data, user) {
  const { items, discountAmount = 0, discountRate = 0, discountType = 'FIXED', taxRate = 0, ...rest } = data;
  const totals = computeInvoiceTotals(items, discountAmount, taxRate, discountType, discountRate);

  return await prisma.$transaction(async (tx) => {
    const invoiceNumber = await generateNextDocumentNumber('INVOICE', tx);

    const invoice = await tx.invoice.create({
      data: {
        invoiceNumber,
        clientId: rest.clientId,
        quotationId: rest.quotationId || null,
        projectId: rest.projectId || null,
        milestoneId: rest.milestoneId || null,
        invoiceDate: new Date(rest.invoiceDate),
        dueDate: new Date(rest.dueDate),
        status: rest.status || 'ISSUED',
        subtotal: totals.subtotal,
        discountAmount: totals.discountAmount,
        taxAmount: totals.taxAmount,
        totalAmount: totals.totalAmount,
        paidAmount: 0,
        balanceDue: totals.totalAmount,
        notes: rest.notes,
        terms: rest.terms,
        createdBy: user.email,
        items: {
          create: totals.processedItems,
        },
      },
      include: {
        client: true,
        items: true,
        project: true,
      },
    });

    if (rest.milestoneId) {
      await tx.projectMilestone.update({
        where: { id: rest.milestoneId },
        data: { status: 'INVOICED' },
      }).catch(() => {});
    }

    await logAudit({
      userId: user.id,
      userEmail: user.email,
      module: 'INVOICE',
      action: 'CREATE',
      entityId: invoice.id,
      entityType: 'INVOICE',
      details: `Created invoice ${invoice.invoiceNumber} for ₹${invoice.totalAmount}`,
    });

    return invoice;
  });
}

export async function signInvoice(id, pin, user) {
  const companyProfile = await prisma.companyProfile.findFirst();
  if (!companyProfile || !companyProfile.signaturePinHash) {
    throw new Error('Digital signature PIN is not set up in Company Settings');
  }

  const isPinValid = await bcrypt.compare(pin, companyProfile.signaturePinHash);
  if (!isPinValid) {
    await logAudit({
      userId: user.id,
      userEmail: user.email,
      module: 'INVOICE',
      action: 'PIN_VERIFY_FAILED',
      entityId: id,
      entityType: 'INVOICE',
      details: `Security Alert: Invalid digital signature PIN entered while attempting to sign invoice ID: ${id} by ${user.email}`,
    });
    throw new Error('Invalid 4-digit PIN for digital signature authorization');
  }

  const invoice = await prisma.invoice.findFirst({
    where: { id, isDeleted: false },
  });

  if (!invoice) {
    throw new Error('Invoice not found');
  }

  const updated = await prisma.invoice.update({
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
    module: 'INVOICE',
    action: 'SIGN',
    entityId: id,
    entityType: 'INVOICE',
    details: `Digitally signed invoice ${invoice.invoiceNumber} after PIN verification`,
  });

  return updated;
}

export async function getPaymentRemindersSummary() {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  const endOfWeek = new Date(startOfToday);
  endOfWeek.setDate(endOfWeek.getDate() + 7);

  const [dueToday, dueThisWeek, overdue, paid] = await Promise.all([
    // Due today
    prisma.invoice.findMany({
      where: {
        isDeleted: false,
        balanceDue: { gt: 0 },
        dueDate: { gte: startOfToday, lte: endOfToday },
      },
      include: { client: { select: { companyName: true, contactPerson: true, phone: true, email: true } } },
    }),
    // Due this week
    prisma.invoice.findMany({
      where: {
        isDeleted: false,
        balanceDue: { gt: 0 },
        dueDate: { gt: endOfToday, lte: endOfWeek },
      },
      include: { client: { select: { companyName: true, contactPerson: true, phone: true, email: true } } },
    }),
    // Overdue
    prisma.invoice.findMany({
      where: {
        isDeleted: false,
        balanceDue: { gt: 0 },
        dueDate: { lt: startOfToday },
      },
      include: { client: { select: { companyName: true, contactPerson: true, phone: true, email: true } } },
    }),
    // Paid in full
    prisma.invoice.count({
      where: {
        isDeleted: false,
        status: 'PAID',
      },
    }),
  ]);

  const overdueTotal = overdue.reduce((sum, inv) => sum + inv.balanceDue, 0);
  const dueTodayTotal = dueToday.reduce((sum, inv) => sum + inv.balanceDue, 0);
  const dueThisWeekTotal = dueThisWeek.reduce((sum, inv) => sum + inv.balanceDue, 0);

  return {
    dueToday: { count: dueToday.length, amount: dueTodayTotal, invoices: dueToday },
    dueThisWeek: { count: dueThisWeek.length, amount: dueThisWeekTotal, invoices: dueThisWeek },
    overdue: { count: overdue.length, amount: overdueTotal, invoices: overdue },
    paidCount: paid,
  };
}

export async function deleteInvoice(id, user) {
  const invoice = await prisma.invoice.findFirst({
    where: { id, isDeleted: false },
    include: { payments: true },
  });

  if (!invoice) {
    throw new Error('Invoice not found');
  }

  if (invoice.payments.length > 0) {
    throw new Error('Cannot delete an invoice that has payments recorded against it');
  }

  await prisma.invoice.update({
    where: { id },
    data: {
      isDeleted: true,
      deletedAt: new Date(),
    },
  });

  await logAudit({
    userId: user.id,
    userEmail: user.email,
    module: 'INVOICE',
    action: 'DELETE',
    entityId: id,
    entityType: 'INVOICE',
    details: `Soft deleted invoice ${invoice.invoiceNumber}`,
  });

  return { message: 'Invoice deleted successfully' };
}
