import { z } from 'zod';

export const createExpenseSchema = z.object({
  category: z.string().min(2, 'Category is required'),
  amount: z.number().positive('Amount must be greater than 0'),
  expenseDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)),
  paymentMode: z.enum(['CASH', 'BANK_TRANSFER', 'UPI', 'CREDIT_CARD', 'DEBIT_CARD', 'CHEQUE', 'OTHER']).default('BANK_TRANSFER'),
  vendorId: z.string().uuid().optional().nullable(),
  projectId: z.string().uuid().optional().nullable(),
  accountId: z.string().uuid().optional().nullable(),
  description: z.string().min(2, 'Description is required'),
  referenceNumber: z.string().optional().nullable(),
  receiptUrl: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  isReimbursable: z.boolean().optional(),
  employeeName: z.string().optional().nullable(),
  reimbursementStatus: z.string().optional(),
  approvalStatus: z.string().optional(),
});

export const updateExpenseSchema = createExpenseSchema.partial();
