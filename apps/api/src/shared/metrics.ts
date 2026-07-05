import type { NextFunction, Request, Response } from 'express';
import client from 'prom-client';

const register = new client.Registry();
register.setDefaultLabels({ app: 'sportflow-api' });
client.collectDefaultMetrics({ register });

export const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duracao das requisicoes HTTP',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 2, 5],
  registers: [register],
});

export const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total de requisicoes HTTP',
  labelNames: ['method', 'route', 'status'],
  registers: [register],
});

export const activeWsConnections = new client.Gauge({
  name: 'active_websocket_connections',
  help: 'Conexoes Socket.io ativas',
  registers: [register],
});

export const bullJobsTotal = new client.Counter({
  name: 'bull_jobs_total',
  help: 'Total de jobs Bull processados',
  labelNames: ['queue', 'status'],
  registers: [register],
});

export const metricsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.route?.path ?? req.path.replace(/\/[a-f0-9-]{20,}/g, '/:id');
    const labels = { method: req.method, route, status: String(res.statusCode) };
    httpRequestDuration.observe(labels, duration);
    httpRequestsTotal.inc(labels);
  });
  next();
};

export const metricsHandler = async (_req: Request, res: Response) => {
  res.setHeader('Content-Type', register.contentType);
  res.send(await register.metrics());
};
