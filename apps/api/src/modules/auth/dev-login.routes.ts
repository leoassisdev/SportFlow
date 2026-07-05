import { Router, type CookieOptions, type Request, type Response } from 'express';
import { prisma } from '../../config/database.js';
import { env } from '../../config/env.js';
import { authService } from './auth.service.js';

const router = Router();

/**
 * Endpoint dev-only pra fazer auto-login sem precisar do formulário.
 * Bloqueado se NODE_ENV !== 'development'.
 *
 * Uso: GET /api/v1/auth/dev-login?email=leo@dev.local&next=/superadmin
 */
router.get('/', async (req: Request, res: Response) => {
  if (env.NODE_ENV !== 'development') {
    return res.status(404).send('Not found');
  }

  const rawEmail = req.query.email;
  const email = (Array.isArray(rawEmail) ? rawEmail[0] : rawEmail) as string | undefined;
  const rawNext = req.query.next;
  const next = (Array.isArray(rawNext) ? rawNext[0] : rawNext) as string | undefined;

  const targetEmail = email ?? 'leo@dev.local';
  const user = await prisma.user.findFirst({
    where: { email: targetEmail, deletedAt: null },
    include: { tenant: true },
  });
  if (!user) {
    return res.status(404).send(`Usuário ${targetEmail} não encontrado. Rode 'npm run db:seed'.`);
  }

  const { accessToken, refreshToken } = authService.issueTokens({
    sub: user.id,
    tenantId: user.tenantId,
    role: user.role,
  });

  const accessCookie: CookieOptions = {
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
    path: '/',
    maxAge: 15 * 60 * 1000,
  };
  const refreshCookie: CookieOptions = {
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
    path: '/api/v1/auth/refresh',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };

  res.cookie('access_token', accessToken, accessCookie);
  res.cookie('refresh_token', refreshToken, refreshCookie);

  const target = next && next.startsWith('/') ? next : user.role === 'superadmin' ? '/superadmin' : '/dashboard';
  return res.redirect(`${env.WEB_URL}${target}`);
});

export { router as devLoginRoutes };
