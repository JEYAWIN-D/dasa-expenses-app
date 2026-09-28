import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().min(1, 'Please enter email or user name'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

export const initialSetupSchema = z.object({
  name: z.string().min(2, 'Full name is required'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().optional().nullable(),
  signaturePin: z.string().length(4, 'PIN must be exactly 4 digits').optional(),
});
