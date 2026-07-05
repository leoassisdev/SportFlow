import type { User, Tenant } from '@prisma/client';

export const toUserResponse = (user: User & { tenant?: Tenant }) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  tenantId: user.tenantId,
  tenant: user.tenant
    ? {
        id: user.tenant.id,
        slug: user.tenant.slug,
        name: user.tenant.name,
        status: user.tenant.status,
      }
    : undefined,
});
