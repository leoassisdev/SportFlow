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
    .regex(/\d/, 'Precisa de número'),
  whatsapp: z
    .string()
    .trim()
    .regex(/^\+?\d[\d\s().-]{7,}$/, 'WhatsApp inválido'),
  sport: z.enum(['futebol', 'volei', 'tenis', 'skate']),
  organizationName: z.string().trim().min(2).max(120),
  acceptPrivacy: z.literal(true, {
    errorMap: () => ({ message: 'Voce precisa aceitar a Política de Privacidade' }),
  }),
  acceptEmailMarketing: z.boolean().default(false),
  acceptWhatsappMarketing: z.boolean().default(false),
});

export const loginSchema = z.object({
  email: z.string().trim().email().toLowerCase(),
  password: z.string().min(1),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
