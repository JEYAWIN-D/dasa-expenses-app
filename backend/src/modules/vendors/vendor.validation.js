import { z } from 'zod';

export const createVendorSchema = z.object({
  vendorName: z.string().min(2, 'Vendor name is required'),
  company: z.string().optional().nullable(),
  contactPerson: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  gstNumber: z.string().optional().nullable(),
  panNumber: z.string().optional().nullable(),
  bankDetails: z.string().optional().nullable(),
  totalPayable: z.number().min(0).default(0),
  totalPaid: z.number().min(0).default(0),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
  notes: z.string().optional().nullable(),
});

export const updateVendorSchema = createVendorSchema.partial();
