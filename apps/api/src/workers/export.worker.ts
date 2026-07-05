import { Worker } from 'bullmq';
import { prisma } from '../config/database.js';
import { buildCsv } from '../modules/export/export.csv.js';
import { loadExportData } from '../modules/export/export.data.js';
import { buildPdfHtml } from '../modules/export/export.pdf.js';
import { bullConnection, EXPORT_QUEUE, type ExportJobPayload } from '../modules/export/export.queue.js';
import { uploadExport } from '../modules/export/export.storage.js';
import { logger } from '../shared/logger.js';

// Worker real MVP: usa fast-csv pra CSV e HTML template pra PDF (Puppeteer
// entra em Fase 5.1). Faz upload no Azure Blob se configurado, senao fallback
// local em /tmp/sportflow-exports.
export const createExportWorker = () =>
  new Worker<ExportJobPayload>(
    EXPORT_QUEUE,
    async (job) => {
      const { exportJobId, tenantId, championshipId, format, modules } = job.data;
      logger.info({ jobId: exportJobId, format, modules }, 'export worker: iniciando');

      await prisma.exportJob.update({
        where: { id: exportJobId },
        data: { status: 'processing' },
      });

      try {
        const data = await loadExportData(tenantId, championshipId);

        let buffer: Buffer;
        let filename: string;
        let contentType: string;

        if (format === 'csv') {
          buffer = await buildCsv(data, modules);
          filename = `${exportJobId}.csv`;
          contentType = 'text/csv; charset=utf-8';
        } else {
          buffer = buildPdfHtml(data, modules);
          filename = `${exportJobId}.pdf.html`;
          contentType = 'text/html; charset=utf-8';
        }

        const { url, storage } = await uploadExport(buffer, filename, contentType);
        await prisma.exportJob.update({
          where: { id: exportJobId },
          data: { status: 'completed', fileUrl: url, completedAt: new Date() },
        });
        logger.info({ jobId: exportJobId, url, storage }, 'export worker: concluido');
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        await prisma.exportJob.update({
          where: { id: exportJobId },
          data: { status: 'failed', errorMessage: msg },
        });
        logger.error({ jobId: exportJobId, err }, 'export worker: falhou');
        throw err;
      }
    },
    { connection: bullConnection },
  );
