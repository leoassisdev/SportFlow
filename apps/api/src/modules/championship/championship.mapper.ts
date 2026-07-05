import type { Championship } from '@prisma/client';

export const toChampionshipResponse = (c: Championship & { _count?: { participants: number; matches?: number } }) => ({
  id: c.id,
  name: c.name,
  sportType: c.sportType,
  status: c.status,
  startDate: c.startDate,
  endDate: c.endDate,
  rulesConfig: c.rulesConfig,
  participantsCount: c._count?.participants ?? 0,
  matchesCount: c._count?.matches ?? 0,
  createdAt: c.createdAt,
  updatedAt: c.updatedAt,
});
