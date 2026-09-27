import { z } from 'zod';

const paymentSplitItemSchema = z.object({
  paymentMode: z.enum(['CASH', 'BANK_TRANSFER', 'UPI', 'CREDIT_CARD', 'DEBIT_CARD', 'CHEQUE', 'OTHER']).default('CASH'),
  amount: z.number().positive('Split amount must be greater than 0'),
  accountId: z.string().uuid().optional().nullable(),
  accountName: z.string().optional().nullable(),
  referenceNumber: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const recordPaymentSchema = z.object({
  invoiceId: z.string().uuid().optional().nullable(),
  clientId: z.string().uuid('Valid client ID is required'),
  projectId: z.string().uuid().optional().nullable(),
  milestoneId: z.string().uuid().optional().nullable(),
  paymentType: z.enum(['ADVANCE', 'PARTIAL', 'FULL', 'OTHER_INCOME']).default('ADVANCE'),
  amount: z.number().nonnegative().optional(),
  paymentDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)).optional(),
  paymentMode: z.enum(['CASH', 'BANK_TRANSFER', 'UPI', 'CREDIT_CARD', 'DEBIT_CARD', 'CHEQUE', 'OTHER']).optional(),
  referenceNumber: z.string().optional().nullable(),
  bankAccount: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  splits: z.array(paymentSplitItemSchema).optional(),
});

export const signPaymentSchema = z.object({
  pin: z.string().length(4, 'PIN must be exactly 4 digits'),
});
