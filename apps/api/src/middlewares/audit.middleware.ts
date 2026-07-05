import type { NextFunction, Request, Response } from 'express';
import { prisma } from '../config/database.js';
import { logger } from '../shared/logger.js';

const WRITE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

export const auditMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (!WRITE_METHODS.has(req.method)) return next();

  res.on('finish', () => {
    void (async () => {
      try {
        if (res.statusCode >= 400) return;
        const user = req.user;
        if (!user) return;
        await prisma.auditLog.create({
          data: {
            tenantId: user.tenantId,
            userId: user.sub,
            action: `${req.method} ${req.baseUrl}${req.path}`,
            resource: req.baseUrl.replace(/^\/api\/v\d+\//, ''),
            payload: req.body ?? null,
            ipAddress: req.ip ?? null,
          },
        });
      } catch (err) {
        logger.warn({ err }, 'audit log falhou');
      }
    })();
  });

  next();
};
