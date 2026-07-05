import type { CookieOptions, Request, Response } from 'express';
import { env } from '../../config/env.js';
import { UnauthorizedError } from '../../shared/errors.js';
import { authService } from './auth.service.js';
import { loginSchema, registerSchema } from './auth.schema.js';

const isProd = env.NODE_ENV === 'production';

const accessCookie: CookieOptions = {
  httpOnly: true,
  sameSite: 'strict',
  secure: isProd,
  path: '/',
  maxAge: 15 * 60 * 1000,
};

const refreshCookie: CookieOptions = {
  httpOnly: true,
  sameSite: 'strict',
  secure: isProd,
  path: '/api/v1/auth/refresh',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export const authController = {
  async register(req: Request, res: Response) {
    const input = registerSchema.parse(req.body);
    const { user, accessToken, refreshToken } = await authService.register(input, {
      ipAddress: req.ip ?? null,
      userAgent: req.headers['user-agent'] ?? null,
    });
    res.cookie('access_token', accessToken, accessCookie);
    res.cookie('refresh_token', refreshToken, refreshCookie);
    return res.status(201).json({ user });
  },

  async login(req: Request, res: Response) {
    const input = loginSchema.parse(req.body);
    const { user, accessToken, refreshToken } = await authService.login(input);
    res.cookie('access_token', accessToken, accessCookie);
    res.cookie('refresh_token', refreshToken, refreshCookie);
    return res.json({ user });
  },

  async refresh(req: Request, res: Response) {
    const token = req.cookies?.refresh_token as string | undefined;
    if (!token) throw new UnauthorizedError('Refresh token ausente');
    const { accessToken, refreshToken } = await authService.refresh(token);
    res.cookie('access_token', accessToken, accessCookie);
    res.cookie('refresh_token', refreshToken, refreshCookie);
    return res.json({ ok: true });
  },

  async logout(_req: Request, res: Response) {
    res.clearCookie('access_token', { path: '/' });
    res.clearCookie('refresh_token', { path: '/api/v1/auth/refresh' });
    return res.json({ ok: true });
  },
};
