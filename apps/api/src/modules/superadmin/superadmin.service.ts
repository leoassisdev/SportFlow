import { prisma } from '../../config/database.js';
import { NotFoundError } from '../../shared/errors.js';

export const superadminService = {
  async listTenants(query: { q?: string; status?: string; page: number; pageSize: number }) {
    const where = {
      ...(query.q ? { name: { contains: query.q, mode: 'insensitive' as const } } : {}),
      ...(query.status ? { status: query.status as any } : {}),
    };
    const [items, total] = await Promise.all([
      prisma.tenant.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
        include: {
          _count: { select: { users: true, championships: true } },
          licenses: { orderBy: { createdAt: 'desc' }, take: 1 },
        },
      }),
      prisma.tenant.count({ where }),
    ]);
    return { items, total, meta: { page: query.page, pageSize: query.pageSize, total, totalPages: Math.ceil(total / query.pageSize) } };
  },

  async getTenant(id: string) {
    const tenant = await prisma.tenant.findUnique({
      where: { id },
      include: {
        users: { select: { id: true, name: true, email: true, role: true, lastLogin: true } },
        licenses: { orderBy: { createdAt: 'desc' } },
        championships: { orderBy: { createdAt: 'desc' }, take: 10 },
      },
    });
    if (!tenant) throw new NotFoundError('Tenant');
    return tenant;
  },

  async metrics() {
    const [tenants, active, preview, expired, leadsThisMonth, championshipsThisMonth] = await Promise.all([
      prisma.tenant.count(),
      prisma.tenant.count({ where: { status: 'active' } }),
      prisma.tenant.count({ where: { status: 'preview' } }),
      prisma.tenant.count({ where: { status: 'expired' } }),
      prisma.lead.count({ where: { createdAt: { gte: startOfMonth() } } }),
      prisma.championship.count({ where: { createdAt: { gte: startOfMonth() } } }),
    ]);

    const activeLicenses = await prisma.license.findMany({
      where: { status: 'active' },
      select: { priceBrl: true, durationDays: true },
    });
    const mrr = activeLicenses.reduce((sum, l) => {
      const monthly = (Number(l.priceBrl.toString()) / l.durationDays) * 30;
      return sum + monthly;
    }, 0);

    return {
      tenants: { total: tenants, active, preview, expired },
      leadsThisMonth,
      championshipsThisMonth,
      mrrBrl: Math.round(mrr),
    };
  },

  async listLeads(query: { page: number; pageSize: number }) {
    const [items, total] = await Promise.all([
      prisma.lead.findMany({
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      prisma.lead.count(),
    ]);
    return { items, total };
  },

  async listAuditLogs(query: { tenantId?: string; action?: string; page: number; pageSize: number }) {
    const where = {
      ...(query.tenantId ? { tenantId: query.tenantId } : {}),
      ...(query.action ? { action: { contains: query.action, mode: 'insensitive' as const } } : {}),
    };
    const [items, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      prisma.auditLog.count({ where }),
    ]);
    return { items, total };
  },
};

function startOfMonth() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
