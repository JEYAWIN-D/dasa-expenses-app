import { z } from 'zod';

export const demoRequestSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters').max(100),
  companyName: z.string().min(2, 'Company name must be at least 2 characters').max(150),
  email: z.string().email('Please provide a valid email address').max(150),
  phone: z.string().min(7, 'Phone number must be at least 7 characters').max(25),
  whatsappNumber: z.string().max(25).optional().nullable(),
  industry: z.string().max(100).optional().nullable(),
  companySize: z.string().max(50).optional().nullable(),
  monthlyProjects: z.string().max(50).optional().nullable(),
  currentProcess: z.string().max(100).optional().nullable(),
  featuresInterest: z.union([z.array(z.string()), z.string()]).optional().nullable(),
  preferredDate: z.string().max(50).optional().nullable(),
  preferredTime: z.string().max(50).optional().nullable(),
  additionalReqs: z.string().max(1000).optional().nullable(),
  consentContact: z.boolean().optional(),
});

export const updateLeadSchema = z.object({
  status: z.enum(['NEW', 'CONTACTED', 'DEMO_SCHEDULED', 'DEMO_COMPLETED', 'FOLLOW_UP', 'CONVERTED', 'CLOSED']).optional(),
  assignedTo: z.string().max(100).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
  followUpDate: z.string().optional().nullable(),
});
