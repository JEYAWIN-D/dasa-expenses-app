import { z } from 'zod';

export const updateCompanySchema = z.object({
  companyName: z.string().min(2, 'Company name is required'),
  tagline: z.string().optional().nullable(),
  logoUrl: z.string().optional().nullable(),
  sealUrl: z.string().optional().nullable(),
  address: z.string().min(2, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  country: z.string().default('India'),
  postalCode: z.string().optional().nullable(),
  phone: z.string().min(5, 'Phone number is required'),
  email: z.string().email('Valid email is required'),
  website: z.string().optional().nullable(),
  gstNumber: z.string().optional().nullable(),
  panNumber: z.string().optional().nullable(),
  bankName: z.string().optional().nullable(),
  bankAccountName: z.string().optional().nullable(),
  bankAccountNumber: z.string().optional().nullable(),
  bankIfsc: z.string().optional().nullable(),
  bankSwift: z.string().optional().nullable(),
  termsAndConditions: z.string().optional().nullable(),
  authorizedPerson: z.string().optional().nullable(),
  signatureImageUrl: z.string().optional().nullable(),
  currency: z.string().default('INR'),
});

export const createAssetSchema = z.object({
  type: z.enum(['LOGO', 'SEAL', 'SIGNATURE']),
  name: z.string().min(1, 'Asset name is required'),
  url: z.string().min(1, 'Image URL or file data is required'),
  isPrimary: z.boolean().default(false),
});

export const updatePinSchema = z.object({
  currentPin: z.string().length(4, 'Current PIN must be 4 digits'),
  newPin: z.string().length(4, 'New PIN must be 4 digits'),
});

export const updateTemplateSchema = z.object({
  headerText: z.string().optional().nullable(),
  footerText: z.string().optional().nullable(),
  termsText: z.string().optional().nullable(),
  primaryColor: z.string().default('#0f172a'),
  accentColor: z.string().default('#3b82f6'),
  showLogo: z.boolean().default(true),
  showBankDetails: z.boolean().default(true),
  showSignature: z.boolean().default(true),
  showSeal: z.boolean().default(true),
});

export const updateNumberingSchema = z.object({
  prefix: z.string().min(1).max(10),
  includeFiscalYear: z.boolean().default(true),
  currentSequence: z.number().int().min(1),
  padLength: z.number().int().min(2).max(8).default(4),
});

export const createUserSchema = z.object({
  email: z.string().email('Valid email required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(2, 'Name is required'),
  role: z.enum(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'FINANCE', 'SALES', 'STAFF', 'VIEWER']),
  phone: z.string().optional().nullable(),
});

export const updateUserSchema = z.object({
  name: z.string().min(2, 'Name is required').optional(),
  email: z.string().email('Valid email required').optional(),
  role: z.enum(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'FINANCE', 'SALES', 'STAFF', 'VIEWER']).optional(),
  phone: z.string().optional().nullable(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']).optional(),
  password: z.string().min(6, 'Password must be at least 6 characters').optional().or(z.literal('')),
});
