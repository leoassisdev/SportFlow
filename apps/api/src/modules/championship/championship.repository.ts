import type { Prisma } from '@prisma/client';
import { prisma } from '../../config/database.js';
import type { ListQuery } from './championship.schema.js';

export const championshipRepository = {
  create: (tenantId: string, data: Prisma.ChampionshipUncheckedCreateInput) =>
    prisma.championship.create({ data: { ...data, tenantId } }),

  update: (id: string, tenantId: string, data: Prisma.ChampionshipUncheckedUpdateInput) =>
    prisma.championship.update({
      where: { id, tenantId, deletedAt: null } as Prisma.ChampionshipWhereUniqueInput,
      data,
    }),

  softDelete: (id: string, tenantId: string) =>
    prisma.championship.update({
      where: { id, tenantId } as Prisma.ChampionshipWhereUniqueInput,
      data: { deletedAt: new Date(), status: 'cancelled' },
    }),

  findById: (id: string, tenantId: string) =>
    prisma.championship.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: {
        _count: { select: { participants: true, matches: true } },
      },
    }),

  list: async (tenantId: string, query: ListQuery) => {
    const where: Prisma.ChampionshipWhereInput = {
      tenantId,
      deletedAt: null,
      ...(query.q ? { name: { contains: query.q, mode: 'insensitive' } } : {}),
      ...(query.sport ? { sportType: query.sport } : {}),
      ...(query.status ? { status: query.status } : {}),
    };
    const [items, total] = await Promise.all([
      prisma.championship.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
        include: { _count: { select: { participants: true } } },
      }),
      prisma.championship.count({ where }),
    ]);
    return { items, total };
  },

  countParticipants: (championshipId: string) =>
    prisma.participant.count({ where: { championshipId, deletedAt: null } }),
};
