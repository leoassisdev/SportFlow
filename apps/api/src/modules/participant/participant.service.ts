import type { Prisma } from '@prisma/client';
import { prisma } from '../../config/database.js';
import { NotFoundError, PreviewLimitedError } from '../../shared/errors.js';
import { getPreset } from '../championship/sport-presets.js';
import type { CreateParticipantInput, UpdateParticipantInput } from './participant.schema.js';

const toJson = (v: Record<string, unknown> | undefined): Prisma.InputJsonValue | undefined =>
  v === undefined ? undefined : (v as unknown as Prisma.InputJsonValue);

const PREVIEW_MAX_PARTICIPANTS = 3;

const isTenantPreview = async (tenantId: string) => {
  const t = await prisma.tenant.findUnique({ where: { id: tenantId }, select: { status: true } });
  return t?.status === 'preview';
};

export const participantService = {
  async create(tenantId: string, input: CreateParticipantInput) {
    const championship = await prisma.championship.findFirst({
      where: { id: input.championshipId, tenantId, deletedAt: null },
      select: { id: true, sportType: true },
    });
    if (!championship) throw new NotFoundError('Campeonato');

    const currentCount = await prisma.participant.count({
      where: { championshipId: championship.id, deletedAt: null },
    });

    if (await isTenantPreview(tenantId)) {
      if (currentCount >= PREVIEW_MAX_PARTICIPANTS) {
        throw new PreviewLimitedError('Mais de 3 participantes por campeonato');
      }
    } else {
      const preset = getPreset(championship.sportType);
      if (preset && currentCount >= preset.maxParticipants) {
        throw new PreviewLimitedError(`Limite de ${preset.maxParticipants} para ${preset.label}`);
      }
    }

    return prisma.participant.create({
      data: {
        tenantId,
        championshipId: championship.id,
        name: input.name,
        category: input.category ?? null,
        metadata: toJson(input.metadata),
      },
    });
  },

  list(tenantId: string, championshipId: string) {
    return prisma.participant.findMany({
      where: { tenantId, championshipId, deletedAt: null },
      orderBy: { createdAt: 'asc' },
    });
  },

  async update(tenantId: string, id: string, input: UpdateParticipantInput) {
    const found = await prisma.participant.findFirst({ where: { id, tenantId, deletedAt: null } });
    if (!found) throw new NotFoundError('Participante');
    const data: Prisma.ParticipantUncheckedUpdateInput = {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.category !== undefined ? { category: input.category } : {}),
      ...(input.metadata !== undefined ? { metadata: toJson(input.metadata)! } : {}),
    };
    return prisma.participant.update({ where: { id }, data });
  },

  async remove(tenantId: string, id: string) {
    const found = await prisma.participant.findFirst({ where: { id, tenantId, deletedAt: null } });
    if (!found) throw new NotFoundError('Participante');
    await prisma.participant.update({ where: { id }, data: { deletedAt: new Date() } });
  },
};
