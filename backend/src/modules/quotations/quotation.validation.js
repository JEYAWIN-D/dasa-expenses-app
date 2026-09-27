import { z } from 'zod';

const quotationItemSchema = z.object({
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
  message: 'Each line item must have either a Heading or Description',
});

export const createQuotationSchema = z.object({
  clientId: z.string().uuid('Valid client ID is required'),
  quotationDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)),
  expiryDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)),
  status: z.enum([
    'DRAFT',
    'SENT',
    'VIEWED',
    'NEGOTIATION',
    'REVISED',
    'APPROVED',
    'REJECTED',
    'EXPIRED',
    'CONVERTED',
    'CANCELLED',
  ]).default('DRAFT'),
  discountRate: z.number().min(0).default(0).optional(),
  discountAmount: z.number().min(0).default(0).optional(),
  discountType: z.enum(['PERCENTAGE', 'FIXED']).default('PERCENTAGE').optional(),
  taxRate: z.number().min(0).max(100).default(0),
  notes: z.string().optional().nullable(),
  terms: z.string().optional().nullable(),
  amcPackages: z.any().optional().nullable(),
  items: z.array(quotationItemSchema).min(1, 'At least one item is required'),
});

export const updateQuotationSchema = createQuotationSchema.partial();

export const reviseQuotationSchema = z.object({
  reason: z.string().min(2, 'Revision reason is required'),
  discountRate: z.number().min(0).optional(),
  discountAmount: z.number().min(0).optional(),
  discountType: z.enum(['PERCENTAGE', 'FIXED']).optional(),
  taxRate: z.number().min(0).max(100).optional(),
  notes: z.string().optional().nullable(),
  terms: z.string().optional().nullable(),
  amcPackages: z.any().optional().nullable(),
  items: z.array(quotationItemSchema).min(1, 'At least one item is required'),
});

export const signDocumentSchema = z.object({
  pin: z.string().length(4, 'PIN must be exactly 4 digits'),
});

export const updateStatusSchema = z.object({
  status: z.enum([
    'DRAFT',
    'SENT',
    'VIEWED',
    'NEGOTIATION',
    'REVISED',
    'APPROVED',
    'REJECTED',
    'EXPIRED',
    'CONVERTED',
    'CANCELLED',
  ]),
});
