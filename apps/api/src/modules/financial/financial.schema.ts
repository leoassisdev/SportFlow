import { z } from 'zod';

export const createTransactionSchema = z.object({
  championshipId: z.string().uuid(),
  type: z.enum(['income', 'expense']),
  category: z.string().trim().min(2).max(60),
  amount: z.coerce.number().positive().max(9_999_999),
  description: z.string().trim().max(280).optional(),
  sponsorName: z.string().trim().max(120).optional(),
  transactionDate: z.coerce.date(),
});

export const updateTransactionSchema = createTransactionSchema.partial();

export const summaryQuerySchema = z.object({
  championshipId: z.string().uuid(),
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;
