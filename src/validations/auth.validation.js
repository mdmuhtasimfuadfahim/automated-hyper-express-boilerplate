import { z } from 'zod';
import validator from 'validator';

export const registerSchema = z.object({
  email: z
    .string()
    .email({ message: 'Invalid email' })
    .refine((value) => validator.isEmail(value), {
      message: 'Invalid email',
    }),
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters long' })
    .refine((value) => /\d/.test(value) && /[a-zA-Z]/.test(value), {
      message: 'Password must contain at least one letter and one number',
    }),
  name: z.string().min(1, { message: 'Name is required' }),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  token: z.string(),
  password: z.string().min(6),
});

export const verifyEmailSchema = z.object({
  token: z.string(),
});
