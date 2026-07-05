import { Router, type CookieOptions, type Request, type Response } from 'express';
import { env } from '../../config/env.js';
import { googleAvailable } from '../../config/google.js';
import { UnauthorizedError } from '../../shared/errors.js';
import { logger } from '../../shared/logger.js';
import { consentService } from '../consent/consent.service.js';
import { authService } from './auth.service.js';
import { exchangeCode, googleAuthUrl, upsertGoogleUser } from './google.service.js';

const router = Router();

const isProd = env.NODE_ENV === 'production';
const stateCookie: CookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: isProd,
  path: '/api/v1/auth/google',
  maxAge: 10 * 60 * 1000,
};
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

router.get('/', (_req: Request, res: Response) => {
  if (!googleAvailable()) {
    return res.status(503).json({
      error: { code: 'GOOGLE_DISABLED', message: 'Login Google não configurado' },
    });
  }
  const { url, state } = googleAuthUrl();
  res.cookie('google_oauth_state', state, stateCookie);
  res.redirect(url);
});

router.get('/callback', async (req: Request, res: Response) => {
  if (!googleAvailable()) {
    return res.status(503).send('Login Google não configurado');
  }

  const raw = req.query.code;
  const code = Array.isArray(raw) ? raw[0] : raw;
  const stateReq = Array.isArray(req.query.state) ? req.query.state[0] : req.query.state;
  const stateCookieVal = req.cookies?.google_oauth_state as string | undefined;

  if (!code || typeof code !== 'string') {
    return res.redirect(`${env.WEB_URL}/login?error=google_no_code`);
  }
  if (!stateCookieVal || stateCookieVal !== stateReq) {
    logger.warn('google callback: state mismatch');
    return res.redirect(`${env.WEB_URL}/login?error=google_state`);
  }

  try {
    const profile = await exchangeCode(code);
    const { user, created } = await upsertGoogleUser(profile);
    // Novo usuario Google: registra aceite da política de privacidade
    // (obrigatório pra completar login). Opt-in de marketing fica em false até
    // o usuario marcar no /onboarding.
    if (created) {
      await consentService.record('privacy_policy', true, {
        userId: user.id,
        tenantId: user.tenantId,
        ipAddress: req.ip ?? null,
        userAgent: req.headers['user-agent'] ?? null,
      });
    }
    const tokens = authService.issueTokens({
      sub: user.id,
      tenantId: user.tenantId,
      role: user.role,
    });
    res.cookie('access_token', tokens.accessToken, accessCookie);
    res.cookie('refresh_token', tokens.refreshToken, refreshCookie);
    res.clearCookie('google_oauth_state', { path: '/api/v1/auth/google' });
    // Novo usuario Google: manda para completar cadastro (whatsapp, esporte)
    const target = created ? '/onboarding' : '/dashboard';
    return res.redirect(`${env.WEB_URL}${target}`);
  } catch (err) {
    logger.warn({ err }, 'google callback falhou');
    if (err instanceof UnauthorizedError) {
      return res.redirect(`${env.WEB_URL}/login?error=google_unauthorized`);
    }
    return res.redirect(`${env.WEB_URL}/login?error=google_failed`);
  }
});

export { router as googleAuthRoutes };
