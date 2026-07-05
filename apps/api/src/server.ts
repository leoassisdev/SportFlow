import { createServer } from 'node:http';
import { buildApp } from './app.js';
import { env } from './config/env.js';
import { logger } from './shared/logger.js';

const app = buildApp();
const server = createServer(app);

const shutdown = (signal: NodeJS.Signals) => {
  logger.info({ signal }, 'encerrando servidor');
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 10_000).unref();
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

server.listen(env.API_PORT, () => {
  logger.info(
    { port: env.API_PORT, env: env.NODE_ENV },
    'SportFlow API online',
  );
});
