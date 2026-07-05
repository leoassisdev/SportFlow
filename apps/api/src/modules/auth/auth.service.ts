import { ConflictError, UnauthorizedError } from '../../shared/errors.js';
import { comparePassword, generateSlug, hashPassword } from '../../shared/crypto.js';
import { authRepository } from './auth.repository.js';
import { createAccessToken, createRefreshToken, verifyRefreshToken } from './auth.factory.js';
import { toUserResponse } from './auth.mapper.js';
import type { LoginInput, RegisterInput } from './auth.schema.js';

export const authService = {
  async register(input: RegisterInput) {
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
    });

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
