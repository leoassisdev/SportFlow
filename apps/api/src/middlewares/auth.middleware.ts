import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { UnauthorizedError } from '../shared/errors.js';

export interface AuthPayload {
  sub: string;
  tenantId: string;
  role: 'superadmin' | 'owner' | 'member';
  iat?: number;
  exp?: number;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

export const authMiddleware = (req: Request, _res: Response, next: NextFunction) => {
  const token = req.cookies?.access_token as string | undefined;
  if (!token) return next(new UnauthorizedError('Token ausente'));
  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as AuthPayload;
    req.user = payload;
    next();
  } catch {
    next(new UnauthorizedError('Token invalido ou expirado'));
  }
};
