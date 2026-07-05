import type { NextFunction, Request, Response } from 'express';
import { ForbiddenError, UnauthorizedError } from '../shared/errors.js';

export const superadminMiddleware = (req: Request, _res: Response, next: NextFunction) => {
  if (!req.user) return next(new UnauthorizedError());
  if (req.user.role !== 'superadmin') return next(new ForbiddenError('Requer SuperAdmin'));
  next();
};
