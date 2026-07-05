import { z } from 'zod';

export const exportModulesEnum = z.enum(['results', 'financial', 'participants']);

export const createExportSchema = z.object({
  championshipId: z.string().uuid(),
  format: z.enum(['pdf', 'csv']),
  modules: z.array(exportModulesEnum).min(1),
});

export type CreateExportInput = z.infer<typeof createExportSchema>;
