import type { ConsentKind } from '@prisma/client';
import { prisma } from '../../config/database.js';
import { env } from '../../config/env.js';

interface ConsentContext {
  userId?: string;
  leadId?: string;
  tenantId?: string;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export const consentService = {
  /**
   * Grava um consent imutavel. Ao mudar, cria nova linha (não update).
   * Último por (userId, kind) reflete estado atual.
   */
  async record(kind: ConsentKind, accepted: boolean, ctx: ConsentContext) {
    return prisma.consent.create({
      data: {
        userId: ctx.userId ?? null,
        leadId: ctx.leadId ?? null,
        tenantId: ctx.tenantId ?? null,
        kind,
        accepted,
        version: env.PRIVACY_POLICY_VERSION,
        ipAddress: ctx.ipAddress ?? null,
        userAgent: ctx.userAgent ?? null,
      },
    });
  },

  async listByUser(userId: string) {
    const items = await prisma.consent.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    // Reduz para "estado atual" por kind (última linha vence).
    const current = new Map<ConsentKind, { accepted: boolean; version: string; at: Date }>();
    for (const c of items) {
      if (!current.has(c.kind)) {
        current.set(c.kind, { accepted: c.accepted, version: c.version, at: c.createdAt });
      }
    }
    return {
      current: Object.fromEntries(current),
      history: items,
      currentVersion: env.PRIVACY_POLICY_VERSION,
    };
  },

  /**
   * Sincroniza opt-in flags no User com os aceites correspondentes.
   */
  async syncUserOptIns(userId: string) {
    const state = await this.listByUser(userId);
    const optInEmail = state.current.email_marketing?.accepted ?? false;
    const optInWhatsapp = state.current.whatsapp_marketing?.accepted ?? false;
    await prisma.user.update({
      where: { id: userId },
      data: { optInEmail, optInWhatsapp },
    });
    return { optInEmail, optInWhatsapp };
  },
};
