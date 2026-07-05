import { z } from 'zod';

export const createMatchSchema = z.object({
  championshipId: z.string().uuid(),
  homeParticipantId: z.string().uuid(),
  awayParticipantId: z.string().uuid(),
  scheduledAt: z.coerce.date().optional(),
});

export const scoreUpdateSchema = z.object({
  participantId: z.string().uuid(),
  delta: z.number().int().min(-10).max(10),
});

export const timerActionSchema = z.object({
  action: z.enum(['start', 'pause', 'reset']),
});

export type CreateMatchInput = z.infer<typeof createMatchSchema>;
export type ScoreUpdateInput = z.infer<typeof scoreUpdateSchema>;
export type TimerActionInput = z.infer<typeof timerActionSchema>;
