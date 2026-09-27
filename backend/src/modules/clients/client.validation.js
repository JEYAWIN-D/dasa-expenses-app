import { z } from 'zod';

export const createClientSchema = z.object({
  companyName: z.string().min(2, 'Company name is required'),
  contactPerson: z.string().min(2, 'Contact person name is required'),
  email: z.string().email('Invalid email format').optional().nullable().or(z.literal('')),
  phone: z.string().min(5, 'Valid phone number is required'),
  alternatePhone: z.string().optional().nullable(),
  website: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  country: z.string().default('India'),
  postalCode: z.string().optional().nullable(),
  gstNumber: z.string().optional().nullable(),
  panNumber: z.string().optional().nullable(),
  industry: z.string().optional().nullable(),
  clientType: z.string().optional().nullable(),
  leadSource: z.string().optional().nullable(),
  accountManager: z.string().optional().nullable(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'LEAD']).default('ACTIVE'),
  tags: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  contacts: z.array(
    z.object({
      name: z.string().min(2, 'Name is required'),
      designation: z.string().optional().nullable(),
      email: z.string().email().optional().nullable(),
      phone: z.string().optional().nullable(),
      isPrimary: z.boolean().default(false),
    })
  ).optional(),
});

export const updateClientSchema = createClientSchema.partial();
