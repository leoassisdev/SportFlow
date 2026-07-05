import { z } from 'zod';

export const createLicenseSchema = z.object({
  tenantId: z.string().uuid(),
  durationDays: z.coerce.number().int().min(1).max(365),
  priceBrl: z.coerce.number().positive().max(1_000_000),
});

export type CreateLicenseInput = z.infer<typeof createLicenseSchema>;
