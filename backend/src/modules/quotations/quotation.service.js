import bcrypt from 'bcryptjs';
import { prisma } from '../../config/prisma.js';
import { generateNextDocumentNumber } from '../../utils/numbering.service.js';
import { logAudit } from '../../utils/audit.service.js';

function computeQuotationTotals(items, discountRate = 0, taxRate = 0, discountType = 'PERCENTAGE', discountAmountInput = 0) {
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

  let discountAmount = 0;
  let finalDiscountRate = Number(discountRate) || 0;

  if (discountType === 'FIXED' || (Number(discountAmountInput) > 0 && Number(discountRate) === 0)) {
    discountAmount = Math.min(subtotal, Math.max(0, Number(discountAmountInput) || 0));
    finalDiscountRate = subtotal > 0 ? Math.round(((discountAmount / subtotal) * 100) * 100) / 100 : 0;
  } else {
    discountAmount = Math.round(((subtotal * finalDiscountRate) / 100) * 100) / 100;
  }

  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const taxAmount = Math.round(((taxableAmount * taxRate) / 100) * 100) / 100;
  const totalAmount = Math.round((taxableAmount + taxAmount) * 100) / 100;

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    discountRate: finalDiscountRate,
    discountAmount,
    taxAmount,
    totalAmount,
    processedItems,
  };
}

export async function getQuotationsList({ page = 1, limit = 10, search = '', status = '', clientId = '' }) {
  const skip = (page - 1) * limit;

  const where = {
    isDeleted: false,
    ...(status && { status }),
    ...(clientId && { clientId }),
    ...(search && {
      OR: [
        { quotationNumber: { contains: search, mode: 'insensitive' } },
        { client: { companyName: { contains: search, mode: 'insensitive' } } },
        { client: { contactPerson: { contains: search, mode: 'insensitive' } } },
      ],
    }),
  };

  const [total, quotations] = await Promise.all([
    prisma.quotation.count({ where }),
    prisma.quotation.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        quotationNumber: true,
        revisionNumber: true,
        quotationDate: true,
        expiryDate: true,
        status: true,
        subtotal: true,
        totalAmount: true,
        isDigitallySigned: true,
        signedAt: true,
        signedBy: true,
        createdAt: true,
        client: {
          select: {
            id: true,
            companyName: true,
            contactPerson: true,
            email: true,
          },
        },
        _count: {
          select: {
            items: true,
            revisions: true,
            negotiations: true,
          },
        },
      },
    }),
  ]);

  return { quotations, total, page, limit };
}

export async function getQuotationById(id) {
  const quotation = await prisma.quotation.findFirst({
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
      revisions: {
        orderBy: { revisionNumber: 'desc' },
      },
      negotiations: {
        orderBy: { round: 'desc' },
      },
    },
  });

  if (!quotation) {
    throw new Error('Quotation not found');
  }

  // Fetch company profile for branding in PDF/preview
  const companyProfile = await prisma.companyProfile.findFirst({
    include: { assets: true },
  });

  return { ...quotation, companyProfile };
}

export async function createQuotation(data, user) {
  const { items, discountRate = 0, discountAmount = 0, discountType = 'PERCENTAGE', taxRate = 0, amcPackages, ...rest } = data;

  const totals = computeQuotationTotals(items, discountRate, taxRate, discountType, discountAmount);

  return await prisma.$transaction(async (tx) => {
    const quotationNumber = await generateNextDocumentNumber('QUOTATION', tx);

    const quotation = await tx.quotation.create({
      data: {
        quotationNumber,
        clientId: rest.clientId,
        quotationDate: new Date(rest.quotationDate),
        expiryDate: new Date(rest.expiryDate),
        status: rest.status || 'DRAFT',
        subtotal: totals.subtotal,
        discountRate: totals.discountRate,
        discountAmount: totals.discountAmount,
        taxRate: taxRate,
        taxAmount: totals.taxAmount,
        totalAmount: totals.totalAmount,
        notes: rest.notes,
        terms: rest.terms,
        amcPackages: amcPackages ? (typeof amcPackages === 'string' ? amcPackages : JSON.stringify(amcPackages)) : null,
        createdBy: user.email,
        items: {
          create: totals.processedItems,
        },
      },
      include: {
        client: true,
        items: true,
      },
    });

    await logAudit({
      userId: user.id,
      userEmail: user.email,
      module: 'QUOTATION',
      action: 'CREATE',
      entityId: quotation.id,
      entityType: 'QUOTATION',
      details: `Created quotation ${quotation.quotationNumber} for amount ₹${quotation.totalAmount}`,
    });

    return quotation;
  });
}

export async function reviseQuotation(id, data, user) {
  const existing = await prisma.quotation.findFirst({
    where: { id, isDeleted: false },
    include: { items: true },
  });

  if (!existing) {
    throw new Error('Quotation not found');
  }

  const {
    reason,
    items,
    discountRate = existing.discountRate,
    discountAmount = existing.discountAmount,
    discountType = 'PERCENTAGE',
    taxRate = existing.taxRate,
    notes,
    terms,
    amcPackages,
  } = data;
  const totals = computeQuotationTotals(items, discountRate, taxRate, discountType, discountAmount);

  return await prisma.$transaction(async (tx) => {
    // 1. Snapshot previous state into revisions table
    await tx.quotationRevision.create({
      data: {
        quotationId: id,
        revisionNumber: existing.revisionNumber,
        revisedBy: user.email,
        reason: reason || 'Scope and pricing revision',
        snapshot: JSON.stringify(existing),
      },
    });

    // 2. Remove old items and replace with new
    await tx.quotationItem.deleteMany({
      where: { quotationId: id },
    });

    // 3. Update quotation
    const updated = await tx.quotation.update({
      where: { id },
      data: {
        revisionNumber: existing.revisionNumber + 1,
        status: 'REVISED',
        subtotal: totals.subtotal,
        discountRate: totals.discountRate,
        discountAmount: totals.discountAmount,
        taxRate,
        taxAmount: totals.taxAmount,
        totalAmount: totals.totalAmount,
        ...(notes !== undefined && { notes }),
        ...(terms !== undefined && { terms }),
        ...(amcPackages !== undefined && {
          amcPackages: amcPackages ? (typeof amcPackages === 'string' ? amcPackages : JSON.stringify(amcPackages)) : null,
        }),
        items: {
          create: totals.processedItems,
        },
      },
      include: {
        items: true,
        revisions: true,
      },
    });

    await logAudit({
      userId: user.id,
      userEmail: user.email,
      module: 'QUOTATION',
      action: 'UPDATE',
      entityId: id,
      entityType: 'QUOTATION',
      details: `Revised quotation ${existing.quotationNumber} to Rev #${updated.revisionNumber}. Reason: ${reason}`,
    });

    return updated;
  });
}

export async function updateQuotationStatus(id, status, user) {
  const quotation = await prisma.quotation.findFirst({
    where: { id, isDeleted: false },
  });

  if (!quotation) {
    throw new Error('Quotation not found');
  }

  const updated = await prisma.quotation.update({
    where: { id },
    data: { status },
  });

  await logAudit({
    userId: user.id,
    userEmail: user.email,
    module: 'QUOTATION',
    action: 'UPDATE',
    entityId: id,
    entityType: 'QUOTATION',
    details: `Updated quotation ${quotation.quotationNumber} status to ${status}`,
  });

  return updated;
}

export async function signQuotation(id, pin, user) {
  const companyProfile = await prisma.companyProfile.findFirst();
  if (!companyProfile || !companyProfile.signaturePinHash) {
    throw new Error('Digital signature PIN is not set up in Company Settings');
  }

  const isPinValid = await bcrypt.compare(pin, companyProfile.signaturePinHash);
  if (!isPinValid) {
    await logAudit({
      userId: user.id,
      userEmail: user.email,
      module: 'QUOTATION',
      action: 'PIN_VERIFY_FAILED',
      entityId: id,
      entityType: 'QUOTATION',
      details: `Security Alert: Invalid digital signature PIN entered while attempting to sign quotation ID: ${id} by ${user.email}`,
    });
    throw new Error('Invalid 4-digit PIN for digital signature authorization');
  }

  const quotation = await prisma.quotation.findFirst({
    where: { id, isDeleted: false },
  });

  if (!quotation) {
    throw new Error('Quotation not found');
  }

  const updated = await prisma.quotation.update({
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
    module: 'QUOTATION',
    action: 'SIGN',
    entityId: id,
    entityType: 'QUOTATION',
    details: `Digitally signed quotation ${quotation.quotationNumber} after PIN verification`,
  });

  return updated;
}

export async function convertQuotationToInvoice(quotationId, user) {
  return await prisma.$transaction(async (tx) => {
    const quotation = await tx.quotation.findFirst({
      where: { id: quotationId, isDeleted: false },
      include: { items: true },
    });

    if (!quotation) {
      throw new Error('Quotation not found');
    }

    if (quotation.status === 'CONVERTED' || quotation.convertedInvoiceId) {
      throw new Error('Quotation has already been converted to an invoice');
    }

    const invoiceNumber = await generateNextDocumentNumber('INVOICE', tx);

    // Calculate due date: 15 days from today by default
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 15);

    const invoice = await tx.invoice.create({
      data: {
        invoiceNumber,
        clientId: quotation.clientId,
        quotationId: quotation.id,
        invoiceDate: new Date(),
        dueDate,
        status: 'ISSUED',
        subtotal: quotation.subtotal,
        discountAmount: quotation.discountAmount,
        taxAmount: quotation.taxAmount,
        totalAmount: quotation.totalAmount,
        paidAmount: 0,
        balanceDue: quotation.totalAmount,
        notes: quotation.notes,
        terms: quotation.terms,
        createdBy: user.email,
        items: {
          create: quotation.items.map((item) => ({
            itemOrder: item.itemOrder,
            title: item.title,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            discountPercent: item.discountPercent,
            taxPercent: item.taxPercent,
            totalPrice: item.totalPrice,
          })),
        },
      },
    });

    // Mark quotation as converted
    await tx.quotation.update({
      where: { id: quotationId },
      data: {
        status: 'CONVERTED',
        convertedInvoiceId: invoice.id,
      },
    });

    await logAudit({
      userId: user.id,
      userEmail: user.email,
      module: 'QUOTATION',
      action: 'CONVERT',
      entityId: quotationId,
      entityType: 'QUOTATION',
      details: `Converted quotation ${quotation.quotationNumber} to invoice ${invoice.invoiceNumber}`,
    });

    return invoice;
  });
}

export async function deleteQuotation(id, user) {
  const quotation = await prisma.quotation.findFirst({
    where: { id, isDeleted: false },
  });

  if (!quotation) {
    throw new Error('Quotation not found');
  }

  await prisma.quotation.update({
    where: { id },
    data: {
      isDeleted: true,
      deletedAt: new Date(),
    },
  });

  await logAudit({
    userId: user.id,
    userEmail: user.email,
    module: 'QUOTATION',
    action: 'DELETE',
    entityId: id,
    entityType: 'QUOTATION',
    details: `Soft deleted quotation ${quotation.quotationNumber}`,
  });

  return { message: 'Quotation deleted successfully' };
}
