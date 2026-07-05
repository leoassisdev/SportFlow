import type { NextFunction, Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { prisma } from '../config/database.js';
import { UnauthorizedError } from '../shared/errors.js';

export const tenantMiddleware = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const user = req.user;
    if (!user) return next(new UnauthorizedError());

    await prisma.$executeRaw(
      Prisma.sql`SELECT set_config('app.current_tenant_id', ${user.tenantId}, true)`,
    );

    if (user.role === 'superadmin') {
      await prisma.$executeRaw(
        Prisma.sql`SELECT set_config('app.is_superadmin', 'true', true)`,
      );
    } else {
      await prisma.$executeRaw(
        Prisma.sql`SELECT set_config('app.is_superadmin', 'false', true)`,
      );
    }

    next();
  } catch (err) {
    next(err);
  }
};
