import { prisma } from '../config/prisma.js';

/**
 * Double-Entry Financial Journal Ledger Service
 * Implements strict financial data security and accounting immutability.
 */
export async function recordJournalEntry({
  organizationId,
  entryNumber,
  referenceType,
  referenceId = null,
  description,
  lines,
  postedBy = 'System',
}) {
  if (!lines || lines.length < 2) {
    throw new Error('A valid journal entry must contain at least one Debit and one Credit line.');
  }

  let totalDebit = 0;
  let totalCredit = 0;

  for (const line of lines) {
    if (line.lineType === 'DEBIT') totalDebit += line.amount;
    else if (line.lineType === 'CREDIT') totalCredit += line.amount;
    else throw new Error(`Invalid lineType '${line.lineType}'. Must be DEBIT or CREDIT.`);
  }

  // Float precision comparison check (tolerance of 0.01)
  if (Math.abs(totalDebit - totalCredit) > 0.01) {
    throw new Error(`Accounting Imbalance: Total Debit (₹${totalDebit.toFixed(2)}) must exactly equal Total Credit (₹${totalCredit.toFixed(2)}).`);
  }

  // Generate sequence number if not passed
  const autoEntryNumber = entryNumber || `JRN-${Date.now().toString().slice(-6)}`;

  return await prisma.journalEntry.create({
    data: {
      organizationId,
      entryNumber: autoEntryNumber,
      referenceType: referenceType || 'ADJUSTMENT',
      referenceId,
      description,
      totalDebit,
      totalCredit,
      status: 'POSTED',
      postedBy,
      lines: {
        create: lines.map((l) => ({
          accountId: l.accountId || null,
          accountName: l.accountName,
          lineType: l.lineType,
          amount: l.amount,
          narration: l.narration || null,
        })),
      },
    },
    include: {
      lines: true,
    },
  });
}

/**
 * Reverse an existing finalized journal entry
 * Ensures accounting immutability by creating an offsetting reversal instead of deleting.
 */
export async function reverseJournalEntry(journalId, { voidReason, reversedBy = 'User' }) {
  const original = await prisma.journalEntry.findUnique({
    where: { id: journalId },
    include: { lines: true },
  });

  if (!original) throw new Error('Original journal entry not found');
  if (original.status === 'VOIDED') throw new Error('This journal entry has already been reversed.');

  return await prisma.$transaction(async (tx) => {
    // Mark original as voided
    await tx.journalEntry.update({
      where: { id: journalId },
      data: {
        status: 'VOIDED',
        voidReason,
      },
    });

    // Create offsetting reversal entry
    const reversalNumber = `REV-${original.entryNumber}`;
    const reversedLines = original.lines.map((l) => ({
      accountId: l.accountId,
      accountName: l.accountName,
      lineType: l.lineType === 'DEBIT' ? 'CREDIT' : 'DEBIT', // Swap debits and credits
      amount: l.amount,
      narration: `Reversal of ${original.entryNumber}: ${l.narration || ''}`.trim(),
    }));

    return await tx.journalEntry.create({
      data: {
        organizationId: original.organizationId,
        entryNumber: reversalNumber,
        referenceType: 'REVERSAL',
        referenceId: original.id,
        description: `Official reversal of entry ${original.entryNumber}. Reason: ${voidReason}`,
        totalDebit: original.totalCredit,
        totalCredit: original.totalDebit,
        status: 'POSTED',
        postedBy: reversedBy,
        lines: {
          create: reversedLines,
        },
      },
      include: { lines: true },
    });
  });
}

/**
 * List journal entries with filter by organization
 */
export async function getOrganizationJournals(organizationId, { page = 1, limit = 20 } = {}) {
  const skip = (page - 1) * limit;
  const where = { organizationId };

  const [total, entries] = await Promise.all([
    prisma.journalEntry.count({ where }),
    prisma.journalEntry.findMany({
      where,
      skip,
      take: limit,
      orderBy: { entryDate: 'desc' },
      include: { lines: true },
    }),
  ]);

  return { entries, total, page, limit };
}
