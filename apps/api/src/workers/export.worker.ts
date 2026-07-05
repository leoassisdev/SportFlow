import { Worker } from 'bullmq';
import { prisma } from '../config/database.js';
import { bullConnection, EXPORT_QUEUE, type ExportJobPayload } from '../modules/export/export.queue.js';
import { logger } from '../shared/logger.js';

// MVP placeholder: nao gera PDF/CSV real ainda. Marca job como completed com
// URL fake apos 2s. Sera substituido por Puppeteer + fast-csv + Azure Blob upload.
export const createExportWorker = () =>
  new Worker<ExportJobPayload>(
    EXPORT_QUEUE,
    async (job) => {
      const { exportJobId, format } = job.data;
      logger.info({ jobId: exportJobId }, 'export worker: processando');
      await prisma.exportJob.update({
        where: { id: exportJobId },
        data: { status: 'processing' },
      });
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const url = `https://sportflow-exports.blob.core.windows.net/mock/${exportJobId}.${format}`;
      await prisma.exportJob.update({
        where: { id: exportJobId },
        data: { status: 'completed', fileUrl: url, completedAt: new Date() },
      });
      logger.info({ jobId: exportJobId, url }, 'export worker: concluido');
    },
    { connection: bullConnection },
  );
