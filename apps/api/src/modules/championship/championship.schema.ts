import { z } from 'zod';
import { isValidSport } from './sport-presets.js';

const sportKey = z.string().refine(isValidSport, 'Esporte inválido');

export const createChampionshipSchema = z.object({
  name: z.string().trim().min(2).max(120),
  sportType: sportKey,
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  rulesConfig: z.record(z.unknown()).optional(),
});

export const updateChampionshipSchema = z.object({
  name: z.string().trim().min(2).max(120).optional(),
  status: z.enum(['draft', 'active', 'finished', 'cancelled']).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  rulesConfig: z.record(z.unknown()).optional(),
});

export const listQuerySchema = z.object({
  q: z.string().trim().optional(),
  sport: z.string().optional(),
  status: z.enum(['draft', 'active', 'finished', 'cancelled']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export type CreateChampionshipInput = z.infer<typeof createChampionshipSchema>;
export type UpdateChampionshipInput = z.infer<typeof updateChampionshipSchema>;
export type ListQuery = z.infer<typeof listQuerySchema>;
