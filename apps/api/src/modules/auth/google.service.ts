import { randomBytes } from 'node:crypto';
import { prisma } from '../../config/database.js';
import { getGoogleClient, GOOGLE_SCOPES } from '../../config/google.js';
import { generateSlug } from '../../shared/crypto.js';
import { UnauthorizedError } from '../../shared/errors.js';
import { logger } from '../../shared/logger.js';

export interface GoogleProfile {
  googleId: string;
  email: string;
  name: string;
  picture?: string;
  emailVerified: boolean;
}

const generateState = () => randomBytes(24).toString('hex');

/**
 * Retorna URL de authorization + state para o cliente redirecionar.
 * O state deve ser guardado em cookie assinado / signed session e
 * conferido no callback (CSRF).
 */
export const googleAuthUrl = () => {
  const client = getGoogleClient();
  const state = generateState();
  const url = client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: GOOGLE_SCOPES,
    state,
  });
  return { url, state };
};

/**
 * Troca o code por tokens, verifica id_token e devolve perfil normalizado.
 */
export const exchangeCode = async (code: string): Promise<GoogleProfile> => {
  const client = getGoogleClient();
  const { tokens } = await client.getToken(code);
  if (!tokens.id_token) throw new UnauthorizedError('id_token ausente');
  const ticket = await client.verifyIdToken({
    idToken: tokens.id_token,
    audience: (await import('../../config/env.js')).env.GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  if (!payload || !payload.sub || !payload.email) {
    throw new UnauthorizedError('Perfil Google inválido');
  }
  return {
    googleId: payload.sub,
    email: payload.email.toLowerCase(),
    name: payload.name ?? payload.email.split('@')[0]!,
    picture: payload.picture,
    emailVerified: payload.email_verified ?? false,
  };
};

/**
 * Loga ou cria usuario a partir do perfil Google.
 * - Se já existe user com esse googleId: retorna
 * - Se já existe user com o mesmo email: linka (grava googleId)
 * - Senao: cria Tenant preview + User owner ligado ao Google
 */
export const upsertGoogleUser = async (profile: GoogleProfile) => {
  if (!profile.emailVerified) {
    logger.warn({ email: profile.email }, 'Google user com email não verificado');
  }

  const byGoogleId = await prisma.user.findUnique({
    where: { googleId: profile.googleId },
    include: { tenant: true },
  });
  if (byGoogleId) return { user: byGoogleId, created: false };

  const byEmail = await prisma.user.findFirst({
    where: { email: profile.email, deletedAt: null },
    include: { tenant: true },
  });
  if (byEmail) {
    const linked = await prisma.user.update({
      where: { id: byEmail.id },
      data: {
        googleId: profile.googleId,
        avatarUrl: profile.picture ?? byEmail.avatarUrl,
      },
      include: { tenant: true },
    });
    return { user: linked, created: false };
  }

  // Cria tenant preview + user
  const created = await prisma.$transaction(async (tx) => {
    const tenant = await tx.tenant.create({
      data: {
        slug: generateSlug(profile.name),
        name: `${profile.name} - Espaco`,
        email: profile.email,
        status: 'preview',
      },
    });
    const user = await tx.user.create({
      data: {
        tenantId: tenant.id,
        email: profile.email,
        name: profile.name,
        role: 'owner',
        googleId: profile.googleId,
        avatarUrl: profile.picture ?? null,
      },
      include: { tenant: true },
    });
    return user;
  });

  return { user: created, created: true };
};
