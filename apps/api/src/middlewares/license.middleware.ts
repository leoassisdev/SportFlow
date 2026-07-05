import type { NextFunction, Request, Response } from 'express';
import { prisma } from '../config/database.js';
import { LicenseExpiredError } from '../shared/errors.js';

const BYPASS_PATHS = [
  /^\/api\/v1\/auth\//,
  /^\/api\/v1\/live\//,
  /^\/api\/v1\/webhooks\//,
  /^\/superadmin\//,
  /^\/api\/health$/,
  /^\/metrics$/,
];

export const licenseMiddleware = async (req: Request, _res: Response, next: NextFunction) => {
  if (BYPASS_PATHS.some((rx) => rx.test(req.path))) return next();
  if (req.user?.role === 'superadmin') return next();

  const tenantId = req.user?.tenantId;
  if (!tenantId) return next();

  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: { status: true },
  });

  // Modo preview e permitido, mas com bloqueios pontuais nos serviços.
  if (!tenant || tenant.status === 'expired' || tenant.status === 'suspended') {
    return next(new LicenseExpiredError());
  }

  next();
};
