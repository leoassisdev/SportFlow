import type { Prisma } from '@prisma/client';
import { prisma } from '../../config/database.js';
import { NotFoundError, PreviewLimitedError } from '../../shared/errors.js';
import { championshipRepository } from './championship.repository.js';
import { toChampionshipResponse } from './championship.mapper.js';
import type { CreateChampionshipInput, ListQuery, UpdateChampionshipInput } from './championship.schema.js';
import { getPreset } from './sport-presets.js';

const toJson = (v: Record<string, unknown> | undefined): Prisma.InputJsonValue | undefined =>
  v === undefined ? undefined : (v as unknown as Prisma.InputJsonValue);

const isTenantPreview = async (tenantId: string) => {
  const t = await prisma.tenant.findUnique({ where: { id: tenantId }, select: { status: true } });
  return t?.status === 'preview';
};

const PREVIEW_MAX_ACTIVE_CHAMPIONSHIPS = 1;

export const championshipService = {
  async create(tenantId: string, input: CreateChampionshipInput) {
    if (await isTenantPreview(tenantId)) {
      const activeCount = await prisma.championship.count({
        where: { tenantId, deletedAt: null, status: { in: ['draft', 'active'] } },
      });
      if (activeCount >= PREVIEW_MAX_ACTIVE_CHAMPIONSHIPS) {
        throw new PreviewLimitedError('Mais de 1 campeonato ativo');
      }
    }

    const preset = getPreset(input.sportType);
    const rulesConfig = { ...(preset?.rulesConfig ?? {}), ...(input.rulesConfig ?? {}) };

    const created = await championshipRepository.create(tenantId, {
      tenantId,
      name: input.name,
      sportType: input.sportType,
      startDate: input.startDate ?? null,
      endDate: input.endDate ?? null,
      rulesConfig: toJson(rulesConfig),
      status: 'draft',
    });
    return toChampionshipResponse(created);
  },

  async list(tenantId: string, query: ListQuery) {
    const { items, total } = await championshipRepository.list(tenantId, query);
    return {
      items: items.map(toChampionshipResponse),
      meta: {
        page: query.page,
        pageSize: query.pageSize,
        total,
        totalPages: Math.ceil(total / query.pageSize),
      },
    };
  },

  async getById(tenantId: string, id: string) {
    const c = await championshipRepository.findById(id, tenantId);
    if (!c) throw new NotFoundError('Campeonato');
    return toChampionshipResponse(c);
  },

  async update(tenantId: string, id: string, input: UpdateChampionshipInput) {
    await this.getById(tenantId, id);
    const data: Prisma.ChampionshipUncheckedUpdateInput = {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
      ...(input.startDate !== undefined ? { startDate: input.startDate } : {}),
      ...(input.endDate !== undefined ? { endDate: input.endDate } : {}),
      ...(input.rulesConfig !== undefined ? { rulesConfig: toJson(input.rulesConfig)! } : {}),
    };
    const updated = await championshipRepository.update(id, tenantId, data);
    return toChampionshipResponse(updated);
  },

  async remove(tenantId: string, id: string) {
    await this.getById(tenantId, id);
    await championshipRepository.softDelete(id, tenantId);
  },
};
