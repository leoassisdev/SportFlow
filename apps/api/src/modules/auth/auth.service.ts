import { prisma } from '../../config/database.js';
import { ConflictError, UnauthorizedError } from '../../shared/errors.js';
import { comparePassword, generateSlug, hashPassword } from '../../shared/crypto.js';
import { consentService } from '../consent/consent.service.js';
import { authRepository } from './auth.repository.js';
import { createAccessToken, createRefreshToken, verifyRefreshToken } from './auth.factory.js';
import { toUserResponse } from './auth.mapper.js';
import type { LoginInput, RegisterInput } from './auth.schema.js';

interface RegisterContext {
  ipAddress?: string | null;
  userAgent?: string | null;
}

export const authService = {
  async register(input: RegisterInput, ctx: RegisterContext = {}) {
    const existing = await authRepository.findUserByEmail(input.email);
    if (existing) throw new ConflictError('Email ja cadastrado');

    const passwordHash = await hashPassword(input.password);
    const user = await authRepository.createTenantWithOwner({
      tenantSlug: generateSlug(input.organizationName),
      tenantName: input.organizationName,
      email: input.email,
      whatsapp: input.whatsapp,
      passwordHash,
      userName: input.name,
    });

    await authRepository.createLead({
      tenantId: user.tenantId,
      name: input.name,
      email: input.email,
      whatsapp: input.whatsapp,
      sport: input.sport,
      optInEmail: input.acceptEmailMarketing,
      optInWhatsapp: input.acceptWhatsappMarketing,
    });

    // Aplica opt-in no User desde o registro.
    await prisma.user.update({
      where: { id: user.id },
      data: {
        optInEmail: input.acceptEmailMarketing,
        optInWhatsapp: input.acceptWhatsappMarketing,
      },
    });

    // Registra consents imutaveis
    const baseCtx = { userId: user.id, tenantId: user.tenantId, ipAddress: ctx.ipAddress, userAgent: ctx.userAgent };
    await consentService.record('privacy_policy', true, baseCtx);
    await consentService.record('email_marketing', input.acceptEmailMarketing, baseCtx);
    await consentService.record('whatsapp_marketing', input.acceptWhatsappMarketing, baseCtx);

    const full = await authRepository.findUserByEmail(input.email);
    if (!full) throw new UnauthorizedError();

    const tokens = this.issueTokens({
      sub: full.id,
      tenantId: full.tenantId,
      role: full.role,
    });
    return { user: toUserResponse(full), ...tokens };
  },

  async login(input: LoginInput) {
    const user = await authRepository.findUserByEmail(input.email);
    if (!user) throw new UnauthorizedError('Credenciais invalidas');
    if (!user.passwordHash) {
      throw new UnauthorizedError('Esta conta usa login Google — clique em "Entrar com Google"');
    }
    const ok = await comparePassword(input.password, user.passwordHash);
    if (!ok) throw new UnauthorizedError('Credenciais invalidas');
    await authRepository.touchLastLogin(user.id);
    const tokens = this.issueTokens({
      sub: user.id,
      tenantId: user.tenantId,
      role: user.role,
    });
    return { user: toUserResponse(user), ...tokens };
  },

  async refresh(refreshToken: string) {
    try {
      const payload = verifyRefreshToken(refreshToken);
      const tokens = this.issueTokens({
        sub: payload.sub,
        tenantId: payload.tenantId,
        role: payload.role,
      });
      return tokens;
    } catch {
      throw new UnauthorizedError('Refresh token invalido');
    }
  },

  issueTokens(payload: { sub: string; tenantId: string; role: 'superadmin' | 'owner' | 'member' }) {
    return {
      accessToken: createAccessToken(payload),
      refreshToken: createRefreshToken(payload),
    };
  },
};
