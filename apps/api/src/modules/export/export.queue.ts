import { Queue, QueueEvents, type ConnectionOptions } from 'bullmq';
import { redis } from '../../config/redis.js';

// BullMQ empacota versão própria de ioredis. Passamos nosso cliente via cast
// (funciona em runtime; TS reclama por causa de instancias de tipo distintas).
export const bullConnection = redis as unknown as ConnectionOptions;

export const EXPORT_QUEUE = 'export-jobs';

export const exportQueue = new Queue(EXPORT_QUEUE, { connection: bullConnection });
export const exportQueueEvents = new QueueEvents(EXPORT_QUEUE, { connection: bullConnection });

export interface ExportJobPayload {
  exportJobId: string;
  tenantId: string;
  championshipId: string;
  format: 'pdf' | 'csv';
  modules: Array<'results' | 'financial' | 'participants'>;
}
