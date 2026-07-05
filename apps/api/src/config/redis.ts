import { Redis } from 'ioredis';
import { env } from './env.js';

export const redis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
  enableReadyCheck: true,
});

redis.on('error', (err: Error) => {
  // pino logger avaliable in shared/logger; import lazy to avoid cycles
  console.error('[redis] error', err.message);
});

export const createPubSubClient = () => new Redis(env.REDIS_URL);
