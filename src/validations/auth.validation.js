import { z } from 'zod';

export const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
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