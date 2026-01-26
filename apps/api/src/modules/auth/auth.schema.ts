import { z } from 'zod'

export const registerSchema = z.object({
    email: z.email(),
    password: z.string().min(8, "Password must be at least 8 characters"),
    name: z.string()
});
export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
    email: z.email(),
    password: z.string().min(8),
});
export type LoginInput = z.infer<typeof loginSchema>;

