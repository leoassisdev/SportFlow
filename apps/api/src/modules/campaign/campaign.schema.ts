import { z } from 'zod';

export const createCampaignSchema = z.object({
  title: z.string().trim().min(2).max(160),
  channel: z.enum(['email', 'whatsapp']),
  audience: z.enum(['leads', 'users_active', 'users_preview', 'users_all']),
  subject: z.string().trim().max(160).optional(),
  body: z.string().trim().min(1).max(20_000),
  scheduledAt: z.coerce.date().optional(),
});

export const updateCampaignSchema = createCampaignSchema.partial();

export type CreateCampaignInput = z.infer<typeof createCampaignSchema>;
export type UpdateCampaignInput = z.infer<typeof updateCampaignSchema>;
