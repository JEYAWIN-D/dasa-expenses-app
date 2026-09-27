import { prisma } from '../../config/prisma.js';
import { logAudit } from '../../utils/audit.service.js';

export async function getNegotiationsByQuotation(quotationId) {
  return await prisma.quotationNegotiation.findMany({
    where: { quotationId },
    orderBy: { round: 'asc' },
  });
}

export async function addNegotiationRound(data, user) {
  const { quotationId, proposedBy, personName, offeredAmount, reason, notes, status } = data;

  return await prisma.$transaction(async (tx) => {
    const quotation = await tx.quotation.findFirst({
      where: { id: quotationId, isDeleted: false },
      include: { negotiations: { orderBy: { round: 'desc' }, take: 1 } },
    });

    if (!quotation) {
      throw new Error('Quotation not found');
    }

    const previousAmount = quotation.negotiations.length > 0
      ? quotation.negotiations[0].offeredAmount
      : quotation.totalAmount;

    const changeAmount = offeredAmount - previousAmount;
    const nextRound = (quotation.negotiations[0]?.round || 0) + 1;

    const negotiation = await tx.quotationNegotiation.create({
      data: {
        quotationId,
        round: nextRound,
        proposedBy,
        personName,
        previousAmount,
        offeredAmount,
        changeAmount,
        reason,
        notes,
        status: status || 'PENDING',
      },
    });

    // If agreement accepted, update the quotation amount and mark status as APPROVED or NEGOTIATION
    if (status === 'ACCEPTED') {
      await tx.quotation.update({
        where: { id: quotationId },
        data: {
          totalAmount: offeredAmount,
          status: 'NEGOTIATION',
        },
      });
    } else {
      await tx.quotation.update({
        where: { id: quotationId },
        data: { status: 'NEGOTIATION' },
      });
    }

    await logAudit({
      userId: user.id,
      userEmail: user.email,
      module: 'QUOTATION',
      action: 'NEGOTIATE',
      entityId: quotationId,
      entityType: 'QUOTATION_NEGOTIATION',
      details: `Round ${nextRound} negotiation proposed by ${proposedBy} (${personName}): ₹${offeredAmount} (Change: ₹${changeAmount})`,
    });

    return negotiation;
  });
}
