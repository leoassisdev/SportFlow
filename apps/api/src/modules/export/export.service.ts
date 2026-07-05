import { prisma } from '../../config/database.js';
import { NotFoundError, PreviewLimitedError } from '../../shared/errors.js';
import { exportQueue, EXPORT_QUEUE, type ExportJobPayload } from './export.queue.js';
import type { CreateExportInput } from './export.schema.js';

const isTenantPreview = async (tenantId: string) => {
  const t = await prisma.tenant.findUnique({ where: { id: tenantId }, select: { status: true } });
  return t?.status === 'preview';
};

export const exportService = {
  async enqueue(tenantId: string, input: CreateExportInput) {
    if (await isTenantPreview(tenantId)) throw new PreviewLimitedError('Exportacao');
    const championship = await prisma.championship.findFirst({
      where: { id: input.championshipId, tenantId, deletedAt: null },
      select: { id: true },
    });
    if (!championship) throw new NotFoundError('Campeonato');

    const job = await prisma.exportJob.create({
      data: {
        tenantId,
        championshipId: input.championshipId,
        format: input.format,
        modules: input.modules as unknown as any,
        status: 'pending',
      },
    });

    const payload: ExportJobPayload = {
      exportJobId: job.id,
      tenantId,
      championshipId: input.championshipId,
      format: input.format,
      modules: input.modules,
    };
    await exportQueue.add(EXPORT_QUEUE, payload, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 5_000 },
      removeOnComplete: 100,
      removeOnFail: 500,
    });

    return job;
  },

  async status(tenantId: string, id: string) {
    const job = await prisma.exportJob.findFirst({ where: { id, tenantId } });
    if (!job) throw new NotFoundError('Job');
    return job;
  },

  async list(tenantId: string, championshipId: string) {
    return prisma.exportJob.findMany({
      where: { tenantId, championshipId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  },
};
