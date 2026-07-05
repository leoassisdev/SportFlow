import { Queue, Worker } from 'bullmq';
import { bullConnection } from '../modules/export/export.queue.js';
import { licenseService } from '../modules/license/license.service.js';
import { logger } from '../shared/logger.js';

const LICENSE_QUEUE = 'license-check';

const queue = new Queue(LICENSE_QUEUE, { connection: bullConnection });

// Repeat job: verifica licencas vencidas de hora em hora.
void queue.add(
  'expire-check',
  {},
  {
    repeat: { pattern: '0 * * * *' },
    jobId: 'license-expire-check',
  },
);

export const createLicenseWorker = () =>
  new Worker(
    LICENSE_QUEUE,
    async () => {
      const { expired } = await licenseService.expireOverdue();
      if (expired > 0) logger.info({ expired }, 'license worker: licencas expiradas');
    },
    { connection: bullConnection },
  );
