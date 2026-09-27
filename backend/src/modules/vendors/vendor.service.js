import { prisma } from '../../config/prisma.js';
import { generateNextDocumentNumber } from '../../utils/numbering.service.js';
import { logAudit } from '../../utils/audit.service.js';

export async function getVendorsList({ page = 1, limit = 10, search = '', status = '' }) {
  const skip = (page - 1) * limit;

  const where = {
    isDeleted: false,
    ...(status && { status }),
    ...(search && {
      OR: [
        { vendorCode: { contains: search, mode: 'insensitive' } },
        { vendorName: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } },
        { contactPerson: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ],
    }),
  };

  const [total, vendors] = await Promise.all([
    prisma.vendor.count({ where }),
    prisma.vendor.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { expenses: true },
        },
      },
    }),
  ]);

  return { vendors, total, page, limit };
}

export async function searchVendorsQuick(query = '') {
  return prisma.vendor.findMany({
    where: {
      isDeleted: false,
      status: 'ACTIVE',
      ...(query && {
        OR: [
          { vendorName: { contains: query, mode: 'insensitive' } },
          { vendorCode: { contains: query, mode: 'insensitive' } },
          { company: { contains: query, mode: 'insensitive' } },
        ],
      }),
    },
    take: 15,
    select: {
      id: true,
      vendorCode: true,
      vendorName: true,
      company: true,
      contactPerson: true,
      email: true,
      phone: true,
      outstanding: true,
    },
    orderBy: { vendorName: 'asc' },
  });
}

export async function getVendorById(id) {
  const vendor = await prisma.vendor.findFirst({
    where: { id, isDeleted: false },
    include: {
      expenses: {
        orderBy: { expenseDate: 'desc' },
        take: 20,
      },
    },
  });

  if (!vendor) {
    throw new Error('Vendor not found');
  }

  return vendor;
}

export async function createVendor(data, user) {
  return await prisma.$transaction(async (tx) => {
    const vendorCode = await generateNextDocumentNumber('VENDOR', tx);

    const payable = Number(data.totalPayable) || 0;
    const paid = Number(data.totalPaid) || 0;
    const outstanding = Math.max(0, payable - paid);

    const vendor = await tx.vendor.create({
      data: {
        ...data,
        vendorCode,
        totalPayable: payable,
        totalPaid: paid,
        outstanding,
      },
    });

    await logAudit({
      userId: user.id,
      userEmail: user.email,
      module: 'VENDOR',
      action: 'CREATE',
      entityId: vendor.id,
      entityType: 'VENDOR',
      details: `Created vendor ${vendor.vendorName} (${vendor.vendorCode})`,
    });

    return vendor;
  });
}

export async function updateVendor(id, data, user) {
  const existing = await prisma.vendor.findFirst({
    where: { id, isDeleted: false },
  });

  if (!existing) {
    throw new Error('Vendor not found');
  }

  const payable = data.totalPayable !== undefined ? Number(data.totalPayable) : existing.totalPayable;
  const paid = data.totalPaid !== undefined ? Number(data.totalPaid) : existing.totalPaid;
  const outstanding = Math.max(0, payable - paid);

  const updated = await prisma.vendor.update({
    where: { id },
    data: {
      ...data,
      totalPayable: payable,
      totalPaid: paid,
      outstanding,
    },
  });

  await logAudit({
    userId: user.id,
    userEmail: user.email,
    module: 'VENDOR',
    action: 'UPDATE',
    entityId: id,
    entityType: 'VENDOR',
    details: `Updated vendor details for ${updated.vendorName}`,
  });

  return updated;
}

export async function deleteVendor(id, user) {
  const existing = await prisma.vendor.findFirst({
    where: { id, isDeleted: false },
  });

  if (!existing) {
    throw new Error('Vendor not found');
  }

  await prisma.vendor.update({
    where: { id },
    data: {
      isDeleted: true,
      deletedAt: new Date(),
    },
  });

  await logAudit({
    userId: user.id,
    userEmail: user.email,
    module: 'VENDOR',
    action: 'DELETE',
    entityId: id,
    entityType: 'VENDOR',
    details: `Soft deleted vendor ${existing.vendorName}`,
  });

  return { message: 'Vendor deleted successfully' };
}
