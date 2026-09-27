import { prisma } from '../../config/prisma.js';
import { calculateProjectFinancials } from '../projects/project.service.js';

export async function getDashboardMetrics() {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // Parallel optimized aggregations
  const [
    invoicesAggregate,
    overdueAggregate,
    todayIncomeAggregate,
    monthlyIncomeAggregate,
    todayExpenseAggregate,
    monthlyExpenseAggregate,
    vendorPayablesAggregate,
    activeClientsCount,
    quotationsSummary,
    pendingInvoicesCount,
    rawProjects,
    financialAccounts,
  ] = await Promise.all([
    // Total Revenue (all paid invoices) & Pending Receivables (all active balance due)
    prisma.invoice.aggregate({
      where: { isDeleted: false },
      _sum: {
        paidAmount: true,
        balanceDue: true,
        totalAmount: true,
      },
    }),
    // Overdue amount
    prisma.invoice.aggregate({
      where: {
        isDeleted: false,
        balanceDue: { gt: 0 },
        dueDate: { lt: startOfToday },
      },
      _sum: { balanceDue: true },
    }),
    // Today's Income
    prisma.payment.aggregate({
      where: {
        paymentDate: { gte: startOfToday, lte: endOfToday },
      },
      _sum: { amount: true },
    }),
    // Monthly Income
    prisma.payment.aggregate({
      where: {
        paymentDate: { gte: startOfMonth },
      },
      _sum: { amount: true },
    }),
    // Today's Expenses
    prisma.expense.aggregate({
      where: {
        isDeleted: false,
        expenseDate: { gte: startOfToday, lte: endOfToday },
      },
      _sum: { amount: true },
    }),
    // Monthly Expenses
    prisma.expense.aggregate({
      where: {
        isDeleted: false,
        expenseDate: { gte: startOfMonth },
      },
      _sum: { amount: true },
    }),
    // Vendor Payables (outstanding)
    prisma.vendor.aggregate({
      where: { isDeleted: false },
      _sum: { outstanding: true },
    }),
    // Active Clients
    prisma.client.count({
      where: { isDeleted: false, status: 'ACTIVE' },
    }),
    // Quotations Status Breakdown
    prisma.quotation.groupBy({
      by: ['status'],
      where: { isDeleted: false },
      _count: { id: true },
    }),
    // Pending Invoices Count (ISSUED or PARTIALLY_PAID)
    prisma.invoice.count({
      where: {
        isDeleted: false,
        status: { in: ['ISSUED', 'PARTIALLY_PAID', 'OVERDUE'] },
      },
    }),
    // Projects for Centralized Dashboard & Profitability Table
    prisma.project.findMany({
      where: { isDeleted: false },
      orderBy: { createdAt: 'desc' },
      include: {
        client: {
          select: { companyName: true },
        },
        payments: true,
        expenses: {
          where: { isDeleted: false },
        },
        milestones: true,
      },
    }),
    // Financial Accounts (Cash, UPI, Bank)
    prisma.financialAccount.findMany({
      where: { isActive: true },
    }),
  ]);

  const quotationCounts = quotationsSummary.reduce((acc, curr) => {
    acc[curr.status] = curr._count.id;
    return acc;
  }, {});

  const totalRevenue = invoicesAggregate._sum.paidAmount || 0;
  const pendingReceivables = invoicesAggregate._sum.balanceDue || 0;
  const overdueAmount = overdueAggregate._sum.balanceDue || 0;

  const todayIncome = todayIncomeAggregate._sum.amount || 0;
  const monthlyIncome = monthlyIncomeAggregate._sum.amount || 0;
  const todayExpenses = todayExpenseAggregate._sum.amount || 0;
  const monthlyExpenses = monthlyExpenseAggregate._sum.amount || 0;
  const netCashflow = monthlyIncome - monthlyExpenses;
  const vendorPayables = vendorPayablesAggregate._sum.outstanding || 0;

  // Process Projects and Profitability Table
  const projectCards = rawProjects.map((p) => {
    const fin = calculateProjectFinancials(p);
    return {
      id: p.id,
      projectCode: p.projectCode,
      name: p.name,
      clientName: p.client.companyName,
      status: p.status,
      handoverStatus: p.handoverStatus,
      startDate: p.startDate,
      deadline: p.deadline,
      totalProjectValue: fin.totalProjectValue,
      totalPaid: fin.totalPaid,
      outstandingBalance: fin.outstandingBalance,
      totalExpenses: fin.totalExpenses,
      remainingFunds: fin.remainingFunds,
      estimatedProfit: fin.estimatedProfit,
      profitMarginPercent: fin.profitMarginPercent,
      isHandoverEligible: fin.isHandoverEligible,
      milestonesCount: p.milestones.length,
      paidMilestonesCount: p.milestones.filter((m) => m.status === 'PAID').length,
    };
  });

  const projectMetrics = projectCards.reduce(
    (acc, p) => {
      acc.totalProjectValue += p.totalProjectValue;
      acc.totalReceived += p.totalPaid;
      acc.totalOutstanding += p.outstandingBalance;
      acc.totalExpenses += p.totalExpenses;
      acc.totalEstimatedProfit += p.estimatedProfit;
      if (['PLANNING', 'IN_PROGRESS', 'ON_HOLD'].includes(p.status)) {
        acc.activeProjectsCount += 1;
      }
      if (['COMPLETED', 'HANDED_OVER'].includes(p.status)) {
        acc.completedProjectsCount += 1;
      }
      return acc;
    },
    {
      totalProjectsCount: projectCards.length,
      activeProjectsCount: 0,
      completedProjectsCount: 0,
      totalProjectValue: 0,
      totalReceived: 0,
      totalOutstanding: 0,
      totalExpenses: 0,
      totalEstimatedProfit: 0,
    }
  );

  projectMetrics.overallProfitMargin =
    projectMetrics.totalProjectValue > 0
      ? Math.round((projectMetrics.totalEstimatedProfit / projectMetrics.totalProjectValue) * 1000) / 10
      : 0;

  // Accounts Liquidity
  const totalCashInHand = financialAccounts
    .filter((a) => a.accountType === 'CASH')
    .reduce((sum, a) => sum + (a.currentBalance || 0), 0);

  const totalBankBalance = financialAccounts
    .filter((a) => a.accountType === 'BANK' || a.accountType === 'UPI')
    .reduce((sum, a) => sum + (a.currentBalance || 0), 0);

  const totalLiquidity = totalCashInHand + totalBankBalance;

  // Monthly trends for past 6 months
  const monthlyTrends = await getMonthlyFinancialTrends();

  // Quotation conversion rate
  const totalQuotes = Object.values(quotationCounts).reduce((a, b) => a + b, 0);
  const approvedQuotes = (quotationCounts['APPROVED'] || 0) + (quotationCounts['CONVERTED'] || 0);
  const conversionRate = totalQuotes > 0 ? Math.round((approvedQuotes / totalQuotes) * 100) : 0;

  // Recent 6 activities
  const recentActivities = await prisma.auditLog.findMany({
    take: 6,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      module: true,
      action: true,
      userEmail: true,
      details: true,
      createdAt: true,
    },
  });

  return {
    kpis: {
      totalRevenue,
      pendingReceivables,
      overdueAmount,
      todayIncome,
      todayExpenses,
      monthlyIncome,
      monthlyExpenses,
      netCashflow,
      activeClients: activeClientsCount,
      pendingQuotations: quotationCounts['PENDING'] || quotationCounts['NEGOTIATION'] || quotationCounts['SENT'] || 0,
      approvedQuotations: approvedQuotes,
      pendingInvoices: pendingInvoicesCount,
      vendorPayables,
      conversionRate,
    },
    projectMetrics,
    projectProfitabilityTable: projectCards,
    accountsMetrics: {
      totalCashInHand,
      totalBankBalance,
      totalLiquidity,
      accounts: financialAccounts.map((a) => ({
        id: a.id,
        code: a.accountCode,
        name: a.accountName,
        type: a.accountType,
        balance: a.currentBalance,
        isDefault: a.isDefault,
      })),
    },
    quotationBreakdown: quotationCounts,
    monthlyTrends,
    recentActivities,
  };
}

async function getMonthlyFinancialTrends() {
  const months = [];
  const now = new Date();

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const endD = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59, 999);
    const monthName = d.toLocaleString('default', { month: 'short' });

    const [income, expense] = await Promise.all([
      prisma.payment.aggregate({
        where: { paymentDate: { gte: d, lte: endD } },
        _sum: { amount: true },
      }),
      prisma.expense.aggregate({
        where: { isDeleted: false, expenseDate: { gte: d, lte: endD } },
        _sum: { amount: true },
      }),
    ]);

    months.push({
      month: monthName,
      income: income._sum.amount || 0,
      expense: expense._sum.amount || 0,
      net: (income._sum.amount || 0) - (expense._sum.amount || 0),
    });
  }

  return months;
}
