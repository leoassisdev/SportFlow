import { prisma } from '../../config/database.js';
import type { Prisma, User } from '@prisma/client';

export const authRepository = {
  findUserByEmail: (email: string) =>
    prisma.user.findFirst({
      where: { email, deletedAt: null },
      include: { tenant: true },
    }),

  createTenantWithOwner: (data: {
    tenantSlug: string;
    tenantName: string;
    email: string;
    whatsapp?: string;
    passwordHash: string;
    userName: string;
  }): Promise<User> =>
    prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: {
          slug: data.tenantSlug,
          name: data.tenantName,
          email: data.email,
          whatsapp: data.whatsapp ?? null,
          status: 'preview',
        },
      });
      const user = await tx.user.create({
        data: {
          tenantId: tenant.id,
          email: data.email,
          passwordHash: data.passwordHash,
          name: data.userName,
          role: 'owner',
        },
      });
      return user;
    }),

  createLead: (data: Prisma.LeadUncheckedCreateInput) => prisma.lead.create({ data }),

  touchLastLogin: (userId: string) =>
    prisma.user.update({ where: { id: userId }, data: { lastLogin: new Date() } }),
};
