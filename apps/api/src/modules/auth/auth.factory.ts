import jwt, { type SignOptions } from 'jsonwebtoken';
import { env } from '../../config/env.js';
import type { AuthPayload } from '../../middlewares/auth.middleware.js';

export const createAccessToken = (payload: Omit<AuthPayload, 'iat' | 'exp'>): string =>
  jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN as SignOptions['expiresIn'],
  });

export const createRefreshToken = (payload: Omit<AuthPayload, 'iat' | 'exp'>): string =>
  jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN as SignOptions['expiresIn'],
  });

export const verifyRefreshToken = (token: string): AuthPayload =>
  jwt.verify(token, env.JWT_REFRESH_SECRET) as AuthPayload;
