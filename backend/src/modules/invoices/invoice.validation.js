import { z } from 'zod';

const invoiceItemSchema = z.object({
  id: z.string().optional(),
  title: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  quantity: z.number().positive('Quantity must be greater than 0').default(1),
  unitPrice: z.number().nonnegative('Unit price must be >= 0').default(0),
  discountPercent: z.number().min(0).default(0),
  discountType: z.enum(['PERCENTAGE', 'FIXED']).default('PERCENTAGE').optional(),
  discountAmount: z.number().min(0).default(0).optional(),
  taxPercent: z.number().min(0).max(100).default(0),
}).refine(data => (data.title && data.title.trim().length > 0) || (data.description && data.description.trim().length > 0), {
  message: 'Each invoice line item must have either a Heading or Description',
});

export const createInvoiceSchema = z.object({
  clientId: z.string().uuid('Valid client ID is required'),
  quotationId: z.string().uuid().optional().nullable(),
  projectId: z.string().uuid().optional().nullable(),
  milestoneId: z.string().uuid().optional().nullable(),
  invoiceDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)),
  dueDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)),
  status: z.enum(['DRAFT', 'ISSUED', 'PARTIALLY_PAID', 'PAID', 'OVERDUE', 'CANCELLED']).default('ISSUED'),
  discountAmount: z.number().min(0).default(0).optional(),
  discountRate: z.number().min(0).default(0).optional(),
  discountType: z.enum(['PERCENTAGE', 'FIXED']).default('FIXED').optional(),
  taxRate: z.number().min(0).max(100).default(0),
  notes: z.string().optional().nullable(),
  terms: z.string().optional().nullable(),
  items: z.array(invoiceItemSchema).min(1, 'At least one item is required'),
});

export const updateInvoiceSchema = createInvoiceSchema.partial();

export const signInvoiceSchema = z.object({
  pin: z.string().length(4, 'PIN must be exactly 4 digits'),
});
