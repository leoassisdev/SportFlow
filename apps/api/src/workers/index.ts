import { createCampaignWorker } from './campaign.worker.js';
import { createExportWorker } from './export.worker.js';
import { createLicenseWorker } from './license.worker.js';
import { logger } from '../shared/logger.js';

const workers = [createExportWorker(), createLicenseWorker(), createCampaignWorker()];

const shutdown = async () => {
  logger.info('encerrando workers');
  await Promise.all(workers.map((w) => w.close()));
  process.exit(0);
};

process.on('SIGTERM', () => void shutdown());
process.on('SIGINT', () => void shutdown());

logger.info({ count: workers.length }, 'SportFlow workers online');
