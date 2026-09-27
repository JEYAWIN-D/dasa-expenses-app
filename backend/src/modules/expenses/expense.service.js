import { prisma } from '../../config/prisma.js';
import { generateNextDocumentNumber } from '../../utils/numbering.service.js';
import { logAudit } from '../../utils/audit.service.js';

export async function getExpensesList({
  page = 1,
  limit = 20,
  search = '',
  category = '',
  vendorId = '',
  projectId = '',
  approvalStatus = '',
  isReimbursable = '',
  startDate = '',
  endDate = '',
}) {
  const skip = (page - 1) * limit;

  const where = {
    isDeleted: false,
    ...(category && { category }),
    ...(vendorId && { vendorId }),
    ...(projectId && { projectId }),
    ...(approvalStatus && { approvalStatus }),
    ...(isReimbursable !== '' && { isReimbursable: isReimbursable === 'true' }),
    ...((startDate || endDate) && {
      expenseDate: {
        ...(startDate && { gte: new Date(startDate) }),
        ...(endDate && { lte: new Date(endDate) }),
      },
    }),
    ...(search && {
      OR: [
        { expenseCode: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
        { employeeName: { contains: search, mode: 'insensitive' } },
        { referenceNumber: { contains: search, mode: 'insensitive' } },
        { vendor: { vendorName: { contains: search, mode: 'insensitive' } } },
        { project: { name: { contains: search, mode: 'insensitive' } } },
      ],
    }),
  };

  const [total, expenses, summary] = await Promise.all([
    prisma.expense.count({ where }),
    prisma.expense.findMany({
      where,
      skip,
      take: limit,
      orderBy: { expenseDate: 'desc' },
      include: {
        vendor: {
          select: {
            id: true,
            vendorName: true,
            vendorCode: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
            projectCode: true,
          },
        },
      },
    }),
    prisma.expense.aggregate({
      where,
      _sum: { amount: true },
    }),
  ]);

  return {
    expenses,
    total,
    page,
    limit,
    totalExpenseAmount: summary._sum.amount || 0,
  };
}

export async function getExpenseById(id) {
  const expense = await prisma.expense.findFirst({
    where: { id, isDeleted: false },
    include: {
      vendor: true,
      project: true,
    },
  });

  if (!expense) {
    throw new Error('Expense record not found');
  }

  return expense;
}

export async function createExpense(data, user) {
  return await prisma.$transaction(async (tx) => {
    const expenseCode = await generateNextDocumentNumber('EXPENSE', tx);
    const amount = Number(data.amount);

    const expense = await tx.expense.create({
      data: {
        expenseCode,
        category: data.category,
        amount,
        expenseDate: new Date(data.expenseDate || Date.now()),
        paymentMode: data.paymentMode || 'BANK_TRANSFER',
        vendorId: data.vendorId || null,
        projectId: data.projectId || null,
        description: data.description,
        referenceNumber: data.referenceNumber || null,
        receiptUrl: data.receiptUrl || null,
        notes: data.notes || null,
        isReimbursable: Boolean(data.isReimbursable),
        employeeName: data.employeeName || null,
        reimbursementStatus: data.isReimbursable ? (data.reimbursementStatus || 'PENDING') : 'N_A',
        approvalStatus: data.approvalStatus || 'APPROVED',
        approvedBy: data.approvalStatus === 'APPROVED' ? user.name : null,
        approvedAt: data.approvalStatus === 'APPROVED' ? new Date() : null,
        accountId: data.accountId || null,
        createdBy: user.email,
      },
      include: {
        vendor: true,
        project: true,
      },
    });

    // 1. Deduct funds from FinancialAccount if specified
    if (data.accountId) {
      const account = await tx.financialAccount.findUnique({
        where: { id: data.accountId },
      });

      if (account) {
        const newBal = account.currentBalance - amount;
        await tx.financialAccount.update({
          where: { id: account.id },
          data: { currentBalance: newBal },
        });

        await tx.accountTransaction.create({
          data: {
            accountId: account.id,
            transactionType: 'DEBIT',
            amount,
            balanceAfter: newBal,
            category: data.isReimbursable ? 'REIMBURSEMENT' : 'EXPENSE_PAID',
            referenceId: expense.id,
            referenceNumber: expense.expenseCode,
            description: `Expense ${expense.expenseCode}: ${expense.description}${expense.project ? ` (${expense.project.projectCode})` : ''}`,
            transactionDate: new Date(data.expenseDate || Date.now()),
          },
        });
      }
    }

    // 2. If linked to vendor, update vendor totalPaid & outstanding
    if (data.vendorId) {
      const vendor = await tx.vendor.findUnique({
        where: { id: data.vendorId },
      });

      if (vendor) {
        const newTotalPaid = vendor.totalPaid + amount;
        const newOutstanding = Math.max(0, vendor.totalPayable - newTotalPaid);

        await tx.vendor.update({
          where: { id: vendor.id },
          data: {
            totalPaid: newTotalPaid,
            outstanding: newOutstanding,
          },
        });
      }
    }

    await logAudit({
      userId: user.id,
      userEmail: user.email,
      module: 'EXPENSE',
      action: 'CREATE',
      entityId: expense.id,
      entityType: 'EXPENSE',
      details: `Created expense ${expense.expenseCode} [${expense.category}]: ₹${expense.amount}${expense.projectId ? ` (Project: ${expense.projectId})` : ''}`,
    });

    return expense;
  });
}

export async function updateExpense(id, data, user) {
  const existing = await prisma.expense.findFirst({
    where: { id, isDeleted: false },
  });

  if (!existing) {
    throw new Error('Expense record not found');
  }

  const updated = await prisma.expense.update({
    where: { id },
    data: {
      category: data.category,
      description: data.description,
      notes: data.notes,
      referenceNumber: data.referenceNumber,
      projectId: data.projectId,
      vendorId: data.vendorId,
      isReimbursable: data.isReimbursable !== undefined ? Boolean(data.isReimbursable) : undefined,
      employeeName: data.employeeName,
      approvalStatus: data.approvalStatus,
      reimbursementStatus: data.reimbursementStatus,
      ...(data.amount !== undefined && { amount: Number(data.amount) }),
      ...(data.expenseDate !== undefined && { expenseDate: new Date(data.expenseDate) }),
    },
    include: { vendor: true, project: true },
  });

  await logAudit({
    userId: user.id,
    userEmail: user.email,
    module: 'EXPENSE',
    action: 'UPDATE',
    entityId: id,
    entityType: 'EXPENSE',
    details: `Updated expense ${updated.expenseCode}`,
  });

  return updated;
}

export async function approveExpense(id, user) {
  const updated = await prisma.expense.update({
    where: { id },
    data: {
      approvalStatus: 'APPROVED',
      approvedBy: user.name,
      approvedAt: new Date(),
    },
  });

  await logAudit({
    userId: user.id,
    userEmail: user.email,
    module: 'EXPENSE',
    action: 'UPDATE',
    entityId: id,
    entityType: 'EXPENSE',
    details: `Approved expense ${updated.expenseCode} by ${user.name}`,
  });

  return updated;
}

export async function reimburseExpense(id, accountId, user) {
  return await prisma.$transaction(async (tx) => {
    const expense = await tx.expense.findUnique({ where: { id } });
    if (!expense) throw new Error('Expense not found');
    if (!expense.isReimbursable) throw new Error('Expense is not marked as reimbursable');

    const account = await tx.financialAccount.findUnique({ where: { id: accountId } });
    if (!account) throw new Error('Payment account not found');

    const newBal = account.currentBalance - expense.amount;
    await tx.financialAccount.update({
      where: { id: account.id },
      data: { currentBalance: newBal },
    });

    await tx.accountTransaction.create({
      data: {
        accountId: account.id,
        transactionType: 'DEBIT',
        amount: expense.amount,
        balanceAfter: newBal,
        category: 'REIMBURSEMENT',
        referenceId: expense.id,
        referenceNumber: expense.expenseCode,
        description: `Employee Reimbursement to ${expense.employeeName || 'Staff'} for ${expense.description}`,
      },
    });

    const updated = await tx.expense.update({
      where: { id },
      data: {
        reimbursementStatus: 'REIMBURSED',
        approvalStatus: 'APPROVED',
        accountId: account.id,
        notes: `${expense.notes || ''}\nReimbursed on ${new Date().toLocaleDateString('en-IN')} via ${account.accountName}`.trim(),
      },
    });

    await logAudit({
      userId: user.id,
      userEmail: user.email,
      module: 'EXPENSE',
      action: 'UPDATE',
      entityId: id,
      entityType: 'EXPENSE',
      details: `Reimbursed expense ${expense.expenseCode} of ₹${expense.amount} to ${expense.employeeName} via ${account.accountName}`,
    });

    return updated;
  });
}

export async function deleteExpense(id, user) {
  const existing = await prisma.expense.findFirst({
    where: { id, isDeleted: false },
  });

  if (!existing) {
    throw new Error('Expense not found');
  }

  await prisma.expense.update({
    where: { id },
    data: {
      isDeleted: true,
      deletedAt: new Date(),
    },
  });

  await logAudit({
    userId: user.id,
    userEmail: user.email,
    module: 'EXPENSE',
    action: 'DELETE',
    entityId: id,
    entityType: 'EXPENSE',
    details: `Soft deleted expense ${existing.expenseCode}`,
  });

  return { message: 'Expense deleted successfully' };
}

export async function getCashflowOverview({ period = 'month', startDate = '', endDate = '' }) {
  const now = new Date();
  let fromDate;
  let toDate = new Date();

  if (startDate && endDate) {
    fromDate = new Date(startDate);
    toDate = new Date(endDate);
  } else if (period === 'today') {
    fromDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  } else if (period === 'week') {
    fromDate = new Date(now);
    fromDate.setDate(now.getDate() - 7);
  } else if (period === 'month') {
    fromDate = new Date(now.getFullYear(), now.getMonth(), 1);
  } else if (period === 'quarter') {
    const quarterMonth = Math.floor(now.getMonth() / 3) * 3;
    fromDate = new Date(now.getFullYear(), quarterMonth, 1);
  } else if (period === 'year') {
    fromDate = new Date(now.getFullYear(), 0, 1);
  } else {
    fromDate = new Date(now.getFullYear(), now.getMonth(), 1);
  }

  const paymentsAggregate = await prisma.payment.aggregate({
    where: {
      paymentDate: { gte: fromDate, lte: toDate },
    },
    _sum: { amount: true },
  });

  const expensesAggregate = await prisma.expense.aggregate({
    where: {
      isDeleted: false,
      expenseDate: { gte: fromDate, lte: toDate },
    },
    _sum: { amount: true },
  });

  const categoryExpenses = await prisma.expense.groupBy({
    by: ['category'],
    where: {
      isDeleted: false,
      expenseDate: { gte: fromDate, lte: toDate },
    },
    _sum: { amount: true },
    orderBy: {
      _sum: { amount: 'desc' },
    },
  });

  const [priorIncome, priorExpense] = await Promise.all([
    prisma.payment.aggregate({
      where: { paymentDate: { lt: fromDate } },
      _sum: { amount: true },
    }),
    prisma.expense.aggregate({
      where: { isDeleted: false, expenseDate: { lt: fromDate } },
      _sum: { amount: true },
    }),
  ]);

  const openingBalance = Math.round(((priorIncome._sum.amount || 0) - (priorExpense._sum.amount || 0)) * 100) / 100;
  const periodIncome = Math.round((paymentsAggregate._sum.amount || 0) * 100) / 100;
  const periodExpense = Math.round((expensesAggregate._sum.amount || 0) * 100) / 100;
  const netCashflow = Math.round((periodIncome - periodExpense) * 100) / 100;
  const closingBalance = Math.round((openingBalance + netCashflow) * 100) / 100;

  return {
    period,
    fromDate,
    toDate,
    openingBalance,
    totalIncome: periodIncome,
    totalExpense: periodExpense,
    netCashflow,
    closingBalance,
    categoryBreakdown: categoryExpenses.map((c) => ({
      category: c.category,
      amount: c._sum.amount || 0,
    })),
  };
}
