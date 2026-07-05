import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().toLowerCase(),
  password: z
    .string()
    .min(8)
    .max(72)
    .regex(/[a-z]/, 'Precisa de letra minuscula')
    .regex(/[A-Z]/, 'Precisa de letra maiuscula')
    .regex(/\d/, 'Precisa de numero'),
  whatsapp: z
    .string()
    .trim()
    .regex(/^\+?\d[\d\s().-]{7,}$/, 'WhatsApp invalido'),
  sport: z.enum(['futebol', 'volei', 'tenis', 'skate']),
  organizationName: z.string().trim().min(2).max(120),
});

export const loginSchema = z.object({
  email: z.string().trim().email().toLowerCase(),
  password: z.string().min(1),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
