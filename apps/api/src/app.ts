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
import { consentRoutes } from './modules/consent/consent.routes.js';
import { exportRoutes } from './modules/export/export.routes.js';
import { financialRoutes } from './modules/financial/financial.routes.js';
import { licenseRoutes } from './modules/license/license.routes.js';
import { stripeWebhookRoutes } from './modules/license/stripe.webhook.js';
import { liveRoutes } from './modules/live/live.routes.js';
import { matchRoutes } from './modules/match/match.routes.js';
import { participantRoutes } from './modules/participant/participant.routes.js';
import { superadminRoutes } from './modules/superadmin/superadmin.routes.js';
import { logger } from './shared/logger.js';
import { metricsHandler, metricsMiddleware } from './shared/metrics.js';

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
  app.use(metricsMiddleware);

  // Healthcheck e metrics (públicos)
  app.get('/metrics', (req, res) => metricsHandler(req, res).catch(() => res.status(500).end()));
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

  // Rotas públicas
  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/live', liveRoutes);
  app.use('/api/v1/webhooks', stripeWebhookRoutes);

  // Middleware chain (rotas protegidas)
  app.use(authMiddleware);
  app.use(tenantMiddleware);
  app.use(globalRateLimit);
  app.use(licenseMiddleware);
  app.use(auditMiddleware);

  app.use('/api/v1/championships', championshipRoutes);
  app.use('/api/v1/participants', participantRoutes);
  app.use('/api/v1/matches', matchRoutes);
  app.use('/api/v1/financial', financialRoutes);
  app.use('/api/v1/export-jobs', exportRoutes);
  app.use('/api/v1/licenses', licenseRoutes);
  app.use('/api/v1/consents', consentRoutes);

  // SuperAdmin
  app.use('/superadmin', superadminMiddleware, superadminRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
