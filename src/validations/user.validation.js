import { z } from 'zod';
import { objectIdSchema } from './objectId.validation.js';

// Zod schema validation for POST request
const createUserSchema = z.object({
    name: z.string(),
    email: z.string().email(),
    password: z.string().min(6)
});

// Zod schema validation for GET request with id
const getUserSchema = z.object({
    id: objectIdSchema
});

export { createUserSchema, getUserSchema };