import rateLimit from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import { redis } from '../config/redis.js';

// rate-limit-redis espera SendCommandFn: (...args: string[]) => Promise<RedisReply>
// ioredis .call retorna Promise<unknown>. Coercao segura.
const sendCommand = ((...args: string[]) =>
  redis.call(args[0]!, ...args.slice(1))) as unknown as (...args: string[]) => Promise<any>;

export const globalRateLimit = rateLimit({
  windowMs: 60 * 1000,
  limit: 100,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  keyGenerator: (req) => {
    const tenantId = req.user?.tenantId ?? 'anon';
    return `${req.ip ?? 'ip'}:${tenantId}`;
  },
  store: new RedisStore({ sendCommand, prefix: 'rl:global:' }),
});

export const authRateLimit = rateLimit({
  windowMs: 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  store: new RedisStore({ sendCommand, prefix: 'rl:auth:' }),
});
