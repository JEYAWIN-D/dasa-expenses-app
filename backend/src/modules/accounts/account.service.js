import { prisma } from '../../config/prisma.js';
import { logAudit } from '../../utils/audit.service.js';

export async function getAccountsSummary() {
  const accounts = await prisma.financialAccount.findMany({
    where: { isActive: true },
    orderBy: [{ isDefault: 'desc' }, { accountName: 'asc' }],
    include: {
      transactions: {
        take: 5,
        orderBy: { transactionDate: 'desc' },
      },
    },
  });

  const totalCashInHand = accounts
    .filter((a) => a.accountType === 'CASH')
    .reduce((sum, a) => sum + (a.currentBalance || 0), 0);

  const totalBankBalance = accounts
    .filter((a) => a.accountType === 'BANK' || a.accountType === 'UPI')
    .reduce((sum, a) => sum + (a.currentBalance || 0), 0);

  const totalLiquidity = totalCashInHand + totalBankBalance;

  const recentTransactions = await prisma.accountTransaction.findMany({
    take: 15,
    orderBy: { transactionDate: 'desc' },
    include: {
      account: {
        select: {
          id: true,
          accountName: true,
          accountType: true,
          accountCode: true,
        },
      },
    },
  });

  return {
    accounts,
    summary: {
      totalCashInHand,
      totalBankBalance,
      totalLiquidity,
      accountCount: accounts.length,
    },
    recentTransactions,
  };
}

export async function createAccount(data, user) {
  const account = await prisma.financialAccount.create({
    data: {
      accountCode: data.accountCode.toUpperCase(),
      accountName: data.accountName,
      accountType: data.accountType,
      bankName: data.bankName || null,
      accountNumber: data.accountNumber || null,
      ifscCode: data.ifscCode || null,
      openingBalance: Number(data.openingBalance || 0),
      currentBalance: Number(data.openingBalance || 0),
      isDefault: Boolean(data.isDefault),
    },
  });

  if (account.openingBalance > 0) {
    await prisma.accountTransaction.create({
      data: {
        accountId: account.id,
        transactionType: 'CREDIT',
        amount: account.openingBalance,
        balanceAfter: account.openingBalance,
        category: 'OPENING_BALANCE',
        description: 'Account Opening Initial Balance',
      },
    });
  }

  await logAudit({
    userId: user.id,
    userEmail: user.email,
    module: 'SETTINGS',
    action: 'CREATE',
    entityId: account.id,
    entityType: 'FINANCIAL_ACCOUNT',
    details: `Created financial account ${account.accountName} (${account.accountType}) with opening balance ₹${account.openingBalance}`,
  });

  return account;
}

export async function updateAccount(id, data, user) {
  const updated = await prisma.financialAccount.update({
    where: { id },
    data: {
      accountName: data.accountName,
      accountType: data.accountType,
      bankName: data.bankName,
      accountNumber: data.accountNumber,
      ifscCode: data.ifscCode,
      isDefault: data.isDefault !== undefined ? Boolean(data.isDefault) : undefined,
      isActive: data.isActive !== undefined ? Boolean(data.isActive) : undefined,
    },
  });

  await logAudit({
    userId: user.id,
    userEmail: user.email,
    module: 'SETTINGS',
    action: 'UPDATE',
    entityId: id,
    entityType: 'FINANCIAL_ACCOUNT',
    details: `Updated financial account ${updated.accountName}`,
  });

  return updated;
}

export async function transferBetweenAccounts({ fromAccountId, toAccountId, amount, referenceNumber, notes }, user) {
  const transferAmount = Number(amount);
  if (!transferAmount || transferAmount <= 0) {
    throw new Error('Valid transfer amount greater than 0 is required');
  }

  if (fromAccountId === toAccountId) {
    throw new Error('Source and destination accounts must be different');
  }

  return await prisma.$transaction(async (tx) => {
    const fromAccount = await tx.financialAccount.findUnique({ where: { id: fromAccountId } });
    const toAccount = await tx.financialAccount.findUnique({ where: { id: toAccountId } });

    if (!fromAccount || !toAccount) {
      throw new Error('One or both specified accounts could not be found');
    }

    if (fromAccount.currentBalance < transferAmount) {
      throw new Error(`Insufficient funds in ${fromAccount.accountName}. Available: ₹${fromAccount.currentBalance.toLocaleString('en-IN')}`);
    }

    const newFromBal = fromAccount.currentBalance - transferAmount;
    const newToBal = toAccount.currentBalance + transferAmount;

    await tx.financialAccount.update({
      where: { id: fromAccountId },
      data: { currentBalance: newFromBal },
    });

    await tx.financialAccount.update({
      where: { id: toAccountId },
      data: { currentBalance: newToBal },
    });

    // Debit transaction
    await tx.accountTransaction.create({
      data: {
        accountId: fromAccountId,
        transactionType: 'TRANSFER_OUT',
        amount: transferAmount,
        balanceAfter: newFromBal,
        category: 'INTERNAL_TRANSFER',
        referenceNumber: referenceNumber || null,
        description: `Transfer to ${toAccount.accountName}${notes ? `: ${notes}` : ''}`,
      },
    });

    // Credit transaction
    await tx.accountTransaction.create({
      data: {
        accountId: toAccountId,
        transactionType: 'TRANSFER_IN',
        amount: transferAmount,
        balanceAfter: newToBal,
        category: 'INTERNAL_TRANSFER',
        referenceNumber: referenceNumber || null,
        description: `Transfer from ${fromAccount.accountName}${notes ? `: ${notes}` : ''}`,
      },
    });

    await logAudit({
      userId: user.id,
      userEmail: user.email,
      module: 'SETTINGS',
      action: 'UPDATE',
      entityId: fromAccountId,
      entityType: 'FINANCIAL_ACCOUNT',
      details: `Transferred ₹${transferAmount} from ${fromAccount.accountName} to ${toAccount.accountName}`,
    });

    return {
      success: true,
      amount: transferAmount,
      fromAccount: { id: fromAccount.id, name: fromAccount.accountName, newBalance: newFromBal },
      toAccount: { id: toAccount.id, name: toAccount.accountName, newBalance: newToBal },
    };
  });
}

export async function getAccountTransactions(accountId, { page = 1, limit = 20 }) {
  const skip = (page - 1) * limit;
  const where = { accountId };

  const [total, transactions] = await Promise.all([
    prisma.accountTransaction.count({ where }),
    prisma.accountTransaction.findMany({
      where,
      skip,
      take: limit,
      orderBy: { transactionDate: 'desc' },
    }),
  ]);

  return { transactions, total, page, limit };
}
