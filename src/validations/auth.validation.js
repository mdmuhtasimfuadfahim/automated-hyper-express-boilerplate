import { z } from 'zod';
import validator from 'validator';

export const registerSchema = z.object({
  email: z
    .string()
    .email()
    .refine((value) => {
      if (!validator.isEmail(value)) {
        throw new Error('Invalid email');
      }
      return true;
    }),
  password: z
    .string()
    .min(8)
    .refine((value) => {
      if (!value.match(/\d/) || !value.match(/[a-zA-Z]/)) {
        throw new Error(
          'Password must contain at least one letter and one number',
        );
      }
      return true;
    }),
  name: z.string().min(1),
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
