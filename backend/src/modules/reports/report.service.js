import { prisma } from '../../config/prisma.js';

export async function getSalesReport({ startDate, endDate }) {
  const where = {
    isDeleted: false,
    ...(startDate || endDate ? {
      quotationDate: {
        ...(startDate && { gte: new Date(startDate) }),
        ...(endDate && { lte: new Date(endDate) }),
      },
    } : {}),
  };

  const [totalQuotes, approvedQuotes, rejectedQuotes, convertedQuotes, totalInvoiced] = await Promise.all([
    prisma.quotation.count({ where }),
    prisma.quotation.count({ where: { ...where, status: 'APPROVED' } }),
    prisma.quotation.count({ where: { ...where, status: 'REJECTED' } }),
    prisma.quotation.count({ where: { ...where, status: 'CONVERTED' } }),
    prisma.invoice.aggregate({
      where: {
        isDeleted: false,
        ...(startDate || endDate ? {
          invoiceDate: {
            ...(startDate && { gte: new Date(startDate) }),
            ...(endDate && { lte: new Date(endDate) }),
          },
        } : {}),
      },
      _sum: { totalAmount: true },
    }),
  ]);

  const totalWon = approvedQuotes + convertedQuotes;
  const conversionRate = totalQuotes > 0 ? Math.round((totalWon / totalQuotes) * 100) : 0;

  return {
    totalQuotations: totalQuotes,
    approvedQuotations: approvedQuotes,
    rejectedQuotations: rejectedQuotes,
    convertedQuotations: convertedQuotes,
    conversionRate,
    totalInvoicedAmount: totalInvoiced._sum.totalAmount || 0,
  };
}

export async function getRevenueReport({ year = new Date().getFullYear() }) {
  const startOfYear = new Date(year, 0, 1);
  const endOfYear = new Date(year, 11, 31, 23, 59, 59, 999);

  const payments = await prisma.payment.findMany({
    where: {
      paymentDate: { gte: startOfYear, lte: endOfYear },
    },
    select: {
      amount: true,
      paymentDate: true,
      paymentMode: true,
      client: { select: { companyName: true } },
    },
  });

  const monthlyMap = {};
  for (let m = 0; m < 12; m++) {
    const monthName = new Date(year, m, 1).toLocaleString('default', { month: 'short' });
    monthlyMap[monthName] = 0;
  }

  const clientMap = {};
  let totalRevenue = 0;

  payments.forEach((p) => {
    const mName = p.paymentDate.toLocaleString('default', { month: 'short' });
    monthlyMap[mName] = (monthlyMap[mName] || 0) + p.amount;
    totalRevenue += p.amount;

    const cName = p.client?.companyName || 'Unknown';
    clientMap[cName] = (clientMap[cName] || 0) + p.amount;
  });

  const monthlyData = Object.entries(monthlyMap).map(([month, amount]) => ({ month, amount }));
  const topClients = Object.entries(clientMap)
    .map(([clientName, revenue]) => ({ clientName, revenue }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  return {
    year,
    totalRevenue,
    monthlyData,
    topClients,
  };
}

export async function getExpensesReport({ startDate, endDate }) {
  const where = {
    isDeleted: false,
    ...(startDate || endDate ? {
      expenseDate: {
        ...(startDate && { gte: new Date(startDate) }),
        ...(endDate && { lte: new Date(endDate) }),
      },
    } : {}),
  };

  const [categories, vendors, totalSummary] = await Promise.all([
    prisma.expense.groupBy({
      by: ['category'],
      where,
      _sum: { amount: true },
      _count: { id: true },
      orderBy: { _sum: { amount: 'desc' } },
    }),
    prisma.vendor.findMany({
      where: { isDeleted: false },
      select: {
        id: true,
        vendorName: true,
        totalPayable: true,
        totalPaid: true,
        outstanding: true,
      },
      orderBy: { totalPayable: 'desc' },
      take: 10,
    }),
    prisma.expense.aggregate({
      where,
      _sum: { amount: true },
    }),
  ]);

  return {
    totalExpenses: totalSummary._sum.amount || 0,
    categories: categories.map((c) => ({
      category: c.category,
      amount: c._sum.amount || 0,
      count: c._count.id,
    })),
    topVendors: vendors,
  };
}

export async function getClientBalancesReport() {
  const clients = await prisma.client.findMany({
    where: { isDeleted: false },
    select: {
      id: true,
      clientCode: true,
      companyName: true,
      contactPerson: true,
      email: true,
      invoices: {
        where: { isDeleted: false },
        select: {
          totalAmount: true,
          paidAmount: true,
          balanceDue: true,
        },
      },
    },
  });

  return clients.map((c) => {
    const totalBilled = c.invoices.reduce((acc, inv) => acc + inv.totalAmount, 0);
    const totalPaid = c.invoices.reduce((acc, inv) => acc + inv.paidAmount, 0);
    const pendingDue = c.invoices.reduce((acc, inv) => acc + inv.balanceDue, 0);

    return {
      id: c.id,
      clientCode: c.clientCode,
      companyName: c.companyName,
      contactPerson: c.contactPerson,
      email: c.email,
      totalBilled,
      totalPaid,
      pendingDue,
    };
  }).filter((c) => c.totalBilled > 0 || c.pendingDue > 0);
}

export async function getProjectsFinancialReport({ status, clientId, startDate, endDate } = {}) {
  const where = {
    isDeleted: false,
    ...(status && { status }),
    ...(clientId && { clientId }),
    ...(startDate || endDate ? {
      createdAt: {
        ...(startDate && { gte: new Date(startDate) }),
        ...(endDate && { lte: new Date(endDate) }),
      },
    } : {}),
  };

  const projects = await prisma.project.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      client: {
        select: {
          id: true,
          companyName: true,
          contactPerson: true,
          gstNumber: true,
          city: true,
        },
      },
      payments: {
        orderBy: { paymentDate: 'desc' },
        include: { splits: true },
      },
      expenses: {
        where: { isDeleted: false },
      },
      invoices: {
        where: { isDeleted: false },
      },
      milestones: {
        orderBy: { milestoneOrder: 'asc' },
      },
    },
  });

  const projectRows = projects.map((p) => {
    const totalProjectVal = (p.quotationValue || 0) + (p.additionalCharges || 0);
    const totalPaid = (p.payments || []).reduce((sum, pay) => sum + (pay.amount || 0), 0);
    const outstandingDue = Math.max(0, totalProjectVal - totalPaid);
    const totalExpenses = (p.expenses || []).reduce((sum, exp) => sum + (exp.amount || 0), 0);
    const totalInvoiced = (p.invoices || []).reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
    const totalInvoicedTax = (p.invoices || []).reduce((sum, inv) => sum + (inv.taxAmount || 0), 0);
    const estimatedProfit = totalProjectVal - totalExpenses;
    const profitMargin = totalProjectVal > 0 ? Math.round((estimatedProfit / totalProjectVal) * 1000) / 10 : 0;

    return {
      id: p.id,
      projectCode: p.projectCode,
      name: p.name,
      clientName: p.client?.companyName || 'N/A',
      clientGst: p.client?.gstNumber || 'Unregistered',
      city: p.client?.city || '',
      status: p.status,
      handoverStatus: p.handoverStatus,
      startDate: p.startDate,
      deadline: p.deadline,
      quotationValue: p.quotationValue || 0,
      additionalCharges: p.additionalCharges || 0,
      totalProjectValue: totalProjectVal,
      totalInvoiced,
      totalInvoicedTax,
      advanceReceived: p.advanceReceived || 0,
      totalPaid,
      outstandingDue,
      totalExpenses,
      estimatedProfit,
      profitMargin,
      milestonesCount: p.milestones?.length || 0,
      invoicesCount: p.invoices?.length || 0,
    };
  });

  const summary = {
    totalProjects: projectRows.length,
    totalPortfolioValue: projectRows.reduce((sum, r) => sum + r.totalProjectValue, 0),
    totalInvoiced: projectRows.reduce((sum, r) => sum + r.totalInvoiced, 0),
    totalCollected: projectRows.reduce((sum, r) => sum + r.totalPaid, 0),
    totalOutstanding: projectRows.reduce((sum, r) => sum + r.outstandingDue, 0),
    totalExpenses: projectRows.reduce((sum, r) => sum + r.totalExpenses, 0),
    totalNetProfit: projectRows.reduce((sum, r) => sum + r.estimatedProfit, 0),
    averageProfitMargin: projectRows.length > 0
      ? Math.round((projectRows.reduce((sum, r) => sum + r.profitMargin, 0) / projectRows.length) * 10) / 10
      : 0,
  };

  return { summary, projects: projectRows };
}

export async function getGstTaxReport({ startDate, endDate, clientId } = {}) {
  const companyProfile = await prisma.companyProfile.findFirst();
  const companyState = companyProfile?.state?.toLowerCase().trim() || 'tamil nadu';

  const where = {
    isDeleted: false,
    ...(clientId && { clientId }),
    ...(startDate || endDate ? {
      invoiceDate: {
        ...(startDate && { gte: new Date(startDate) }),
        ...(endDate && { lte: new Date(endDate) }),
      },
    } : {}),
  };

  const invoices = await prisma.invoice.findMany({
    where,
    orderBy: { invoiceDate: 'desc' },
    include: {
      client: {
        select: {
          id: true,
          companyName: true,
          gstNumber: true,
          state: true,
          city: true,
        },
      },
      project: {
        select: {
          id: true,
          projectCode: true,
          name: true,
        },
      },
      items: true,
    },
  });

  let totalTaxableValue = 0;
  let totalCgst = 0;
  let totalSgst = 0;
  let totalIgst = 0;
  let totalTaxAmount = 0;
  let totalInvoiceAmount = 0;
  let totalPaidAmount = 0;
  let totalBalanceDue = 0;

  const invoiceRows = invoices.map((inv) => {
    const taxableValue = Math.max(0, (inv.subtotal || 0) - (inv.discountAmount || 0));
    const isInterstate = inv.client?.state && inv.client.state.toLowerCase().trim() !== companyState;

    let cgst = 0;
    let sgst = 0;
    let igst = 0;

    if (isInterstate) {
      igst = inv.taxAmount || 0;
    } else {
      cgst = Math.round(((inv.taxAmount || 0) / 2) * 100) / 100;
      sgst = Math.round(((inv.taxAmount || 0) - cgst) * 100) / 100;
    }

    totalTaxableValue += taxableValue;
    totalCgst += cgst;
    totalSgst += sgst;
    totalIgst += igst;
    totalTaxAmount += (inv.taxAmount || 0);
    totalInvoiceAmount += (inv.totalAmount || 0);
    totalPaidAmount += (inv.paidAmount || 0);
    totalBalanceDue += (inv.balanceDue || 0);

    return {
      id: inv.id,
      invoiceNumber: inv.invoiceNumber,
      invoiceDate: inv.invoiceDate,
      dueDate: inv.dueDate,
      status: inv.status,
      clientName: inv.client?.companyName || 'N/A',
      clientGst: inv.client?.gstNumber || 'Unregistered / Consumer',
      clientState: inv.client?.state || 'Local',
      isInterstate,
      projectCode: inv.project?.projectCode || '—',
      projectName: inv.project?.name || '—',
      taxableValue: Math.round(taxableValue * 100) / 100,
      taxAmount: inv.taxAmount || 0,
      cgst,
      sgst,
      igst,
      totalAmount: inv.totalAmount || 0,
      paidAmount: inv.paidAmount || 0,
      balanceDue: inv.balanceDue || 0,
      itemsCount: inv.items?.length || 0,
      isDigitallySigned: inv.isDigitallySigned,
    };
  });

  return {
    companyGst: companyProfile?.gstNumber || '29ABCDE1234F1Z5',
    companyState: companyProfile?.state || 'Tamil Nadu',
    summary: {
      totalInvoices: invoiceRows.length,
      totalTaxableValue: Math.round(totalTaxableValue * 100) / 100,
      totalCgst: Math.round(totalCgst * 100) / 100,
      totalSgst: Math.round(totalSgst * 100) / 100,
      totalIgst: Math.round(totalIgst * 100) / 100,
      totalTaxAmount: Math.round(totalTaxAmount * 100) / 100,
      totalInvoiceAmount: Math.round(totalInvoiceAmount * 100) / 100,
      totalPaidAmount: Math.round(totalPaidAmount * 100) / 100,
      totalBalanceDue: Math.round(totalBalanceDue * 100) / 100,
    },
    invoices: invoiceRows,
  };
}

export async function getPaymentsCollectedReport({ startDate, endDate, paymentMode, clientId, projectId } = {}) {
  const where = {
    ...(paymentMode && { paymentMode }),
    ...(clientId && { clientId }),
    ...(projectId && { projectId }),
    ...(startDate || endDate ? {
      paymentDate: {
        ...(startDate && { gte: new Date(startDate) }),
        ...(endDate && { lte: new Date(endDate) }),
      },
    } : {}),
  };

  const payments = await prisma.payment.findMany({
    where,
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
        },
      },
      project: {
        select: {
          id: true,
          projectCode: true,
          name: true,
        },
      },
      splits: true,
    },
  });

  const paymentRows = payments.map((p) => ({
    id: p.id,
    receiptNumber: p.receiptNumber,
    paymentDate: p.paymentDate,
    paymentType: p.paymentType,
    paymentMode: p.paymentMode,
    amount: p.amount,
    clientName: p.client?.companyName || 'N/A',
    projectCode: p.project?.projectCode || '—',
    projectName: p.project?.name || '—',
    invoiceNumber: p.invoice?.invoiceNumber || '—',
    referenceNumber: p.referenceNumber || '—',
    bankAccount: p.bankAccount || '—',
    notes: p.notes || '',
    splits: p.splits || [],
  }));

  const byMode = {
    CASH: paymentRows.filter((r) => r.paymentMode === 'CASH').reduce((sum, r) => sum + r.amount, 0),
    UPI: paymentRows.filter((r) => r.paymentMode === 'UPI').reduce((sum, r) => sum + r.amount, 0),
    BANK_TRANSFER: paymentRows.filter((r) => ['BANK_TRANSFER', 'CHEQUE', 'ONLINE'].includes(r.paymentMode)).reduce((sum, r) => sum + r.amount, 0),
  };

  return {
    summary: {
      totalReceipts: paymentRows.length,
      totalAmountCollected: paymentRows.reduce((sum, r) => sum + r.amount, 0),
      byMode,
    },
    payments: paymentRows,
  };
}
