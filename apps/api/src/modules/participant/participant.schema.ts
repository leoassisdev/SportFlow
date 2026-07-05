import { z } from 'zod';

export const createParticipantSchema = z.object({
  championshipId: z.string().uuid(),
  name: z.string().trim().min(2).max(120),
  category: z.string().trim().max(60).optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const updateParticipantSchema = z.object({
  name: z.string().trim().min(2).max(120).optional(),
  category: z.string().trim().max(60).optional(),
  metadata: z.record(z.unknown()).optional(),
});

export type CreateParticipantInput = z.infer<typeof createParticipantSchema>;
export type UpdateParticipantInput = z.infer<typeof updateParticipantSchema>;
