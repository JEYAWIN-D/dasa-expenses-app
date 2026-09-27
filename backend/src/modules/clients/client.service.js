import { prisma } from '../../config/prisma.js';
import { generateNextDocumentNumber } from '../../utils/numbering.service.js';
import { logAudit } from '../../utils/audit.service.js';

export async function getClientsList({ page = 1, limit = 10, search = '', status = '', tag = '' }) {
  const skip = (page - 1) * limit;

  const where = {
    isDeleted: false,
    ...(status && { status }),
    ...(tag && { tags: { contains: tag, mode: 'insensitive' } }),
    ...(search && {
      OR: [
        { companyName: { contains: search, mode: 'insensitive' } },
        { contactPerson: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { clientCode: { contains: search, mode: 'insensitive' } },
      ],
    }),
  };

  const [total, clients] = await Promise.all([
    prisma.client.count({ where }),
    prisma.client.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        clientCode: true,
        companyName: true,
        contactPerson: true,
        email: true,
        phone: true,
        city: true,
        state: true,
        industry: true,
        clientType: true,
        status: true,
        tags: true,
        createdAt: true,
        _count: {
          select: {
            quotations: true,
            invoices: true,
            payments: true,
          },
        },
      },
    }),
  ]);

  return { clients, total, page, limit };
}

export async function searchClientsQuick(query = '') {
  if (!query) {
    return prisma.client.findMany({
      where: { isDeleted: false, status: 'ACTIVE' },
      take: 15,
      select: {
        id: true,
        clientCode: true,
        companyName: true,
        contactPerson: true,
        email: true,
        phone: true,
        gstNumber: true,
        address: true,
        city: true,
      },
      orderBy: { companyName: 'asc' },
    });
  }

  return prisma.client.findMany({
    where: {
      isDeleted: false,
      OR: [
        { companyName: { contains: query, mode: 'insensitive' } },
        { contactPerson: { contains: query, mode: 'insensitive' } },
        { clientCode: { contains: query, mode: 'insensitive' } },
        { email: { contains: query, mode: 'insensitive' } },
      ],
    },
    take: 15,
    select: {
      id: true,
      clientCode: true,
      companyName: true,
      contactPerson: true,
      email: true,
      phone: true,
      gstNumber: true,
      address: true,
      city: true,
    },
    orderBy: { companyName: 'asc' },
  });
}

export async function getClientById(id) {
  const client = await prisma.client.findFirst({
    where: { id, isDeleted: false },
    include: {
      contacts: {
        orderBy: { isPrimary: 'desc' },
      },
      quotations: {
        where: { isDeleted: false },
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true,
          quotationNumber: true,
          quotationDate: true,
          totalAmount: true,
          status: true,
          isDigitallySigned: true,
        },
      },
      invoices: {
        where: { isDeleted: false },
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true,
          invoiceNumber: true,
          invoiceDate: true,
          dueDate: true,
          totalAmount: true,
          paidAmount: true,
          balanceDue: true,
          status: true,
        },
      },
      payments: {
        orderBy: { paymentDate: 'desc' },
        take: 10,
        select: {
          id: true,
          receiptNumber: true,
          paymentDate: true,
          amount: true,
          paymentMode: true,
          paymentType: true,
          referenceNumber: true,
        },
      },
    },
  });

  if (!client) {
    throw new Error('Client not found');
  }

  // Calculate financial statistics for this client
  const [invoicesSummary, paymentsSummary] = await Promise.all([
    prisma.invoice.aggregate({
      where: { clientId: id, isDeleted: false },
      _sum: {
        totalAmount: true,
        paidAmount: true,
        balanceDue: true,
      },
    }),
    prisma.payment.aggregate({
      where: { clientId: id },
      _sum: {
        amount: true,
      },
    }),
  ]);

  const stats = {
    totalInvoiced: invoicesSummary._sum.totalAmount || 0,
    totalPaid: paymentsSummary._sum.amount || 0,
    pendingBalance: invoicesSummary._sum.balanceDue || 0,
  };

  return { ...client, stats };
}

export async function createClient(data, user) {
  const { contacts, ...clientData } = data;

  return await prisma.$transaction(async (tx) => {
    const clientCode = await generateNextDocumentNumber('CLIENT', tx);

    const client = await tx.client.create({
      data: {
        ...clientData,
        clientCode,
        ...(contacts && contacts.length > 0 && {
          contacts: {
            create: contacts,
          },
        }),
      },
      include: {
        contacts: true,
      },
    });

    await logAudit({
      userId: user.id,
      userEmail: user.email,
      module: 'CLIENT',
      action: 'CREATE',
      entityId: client.id,
      entityType: 'CLIENT',
      details: `Created client ${client.companyName} (${client.clientCode})`,
    });

    return client;
  });
}

export async function updateClient(id, data, user) {
  const { contacts, ...clientData } = data;

  const existing = await prisma.client.findFirst({
    where: { id, isDeleted: false },
  });

  if (!existing) {
    throw new Error('Client not found');
  }

  const updated = await prisma.client.update({
    where: { id },
    data: clientData,
    include: {
      contacts: true,
    },
  });

  await logAudit({
    userId: user.id,
    userEmail: user.email,
    module: 'CLIENT',
    action: 'UPDATE',
    entityId: id,
    entityType: 'CLIENT',
    details: `Updated client ${updated.companyName}`,
  });

  return updated;
}

export async function deleteClient(id, user) {
  const existing = await prisma.client.findFirst({
    where: { id, isDeleted: false },
  });

  if (!existing) {
    throw new Error('Client not found');
  }

  await prisma.client.update({
    where: { id },
    data: {
      isDeleted: true,
      deletedAt: new Date(),
      deletedBy: user.email,
    },
  });

  await logAudit({
    userId: user.id,
    userEmail: user.email,
    module: 'CLIENT',
    action: 'DELETE',
    entityId: id,
    entityType: 'CLIENT',
    details: `Soft deleted client ${existing.companyName} (${existing.clientCode})`,
  });

  return { message: 'Client deleted successfully' };
}
