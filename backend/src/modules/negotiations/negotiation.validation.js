import { z } from 'zod';

export const addNegotiationSchema = z.object({
  quotationId: z.string().uuid('Valid quotation ID is required'),
  proposedBy: z.enum(['CLIENT', 'COMPANY']),
  personName: z.string().min(2, 'Person name is required'),
  offeredAmount: z.number().positive('Offered amount must be greater than 0'),
  reason: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  status: z.enum(['PENDING', 'ACCEPTED', 'COUNTER_OFFERED', 'REJECTED']).default('PENDING'),
});

export const updateNegotiationStatusSchema = z.object({
  status: z.enum(['PENDING', 'ACCEPTED', 'COUNTER_OFFERED', 'REJECTED']),
});
