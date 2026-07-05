import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { type Express } from 'express';
import helmet from 'helmet';
import { pinoHttp } from 'pino-http';
import { env } from './config/env.js';
import { authMiddleware } from './middlewares/auth.middleware.js';
import { auditMiddleware } from './middlewares/audit.middleware.js';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware.js';
import { licenseMiddleware } from './middlewares/license.middleware.js';
import { globalRateLimit } from './middlewares/rateLimit.middleware.js';
import { superadminMiddleware } from './middlewares/superadmin.middleware.js';
import { tenantMiddleware } from './middlewares/tenant.middleware.js';
import { authRoutes } from './modules/auth/auth.routes.js';
import { championshipRoutes } from './modules/championship/championship.routes.js';
import { listPresets } from './modules/championship/sport-presets.js';
import { participantRoutes } from './modules/participant/participant.routes.js';
import { logger } from './shared/logger.js';

export const buildApp = (): Express => {
  const app = express();

  app.set('trust proxy', 1);

  app.use(
    cors({
      origin: env.CORS_ORIGINS,
      credentials: true,
    }),
  );
  app.use(helmet({ crossOriginResourcePolicy: false }));
  app.use(compression());
  app.use(cookieParser());
  app.use(express.json({ limit: '1mb' }));
  app.use(pinoHttp({ logger }));

  // Healthcheck e metrics (publicos)
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'sportflow-api',
      env: env.NODE_ENV,
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  });

  app.get('/api/v1/sports', (_req, res) => {
    res.json({ sports: listPresets() });
  });

  // Rotas publicas
  app.use('/api/v1/auth', authRoutes);

  // TODO Fase 3+: /api/v1/live, /api/v1/webhooks

  // Middleware chain (rotas protegidas)
  app.use(authMiddleware);
  app.use(tenantMiddleware);
  app.use(globalRateLimit);
  app.use(licenseMiddleware);
  app.use(auditMiddleware);

  app.use('/api/v1/championships', championshipRoutes);
  app.use('/api/v1/participants', participantRoutes);
  // TODO Fase 3+: matches, scoreboard, financial, export

  // SuperAdmin
  app.use('/superadmin', superadminMiddleware, (_req, res) => {
    res.json({ ok: true, hint: 'SuperAdmin routes serao registradas na Fase 7' });
  });

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
