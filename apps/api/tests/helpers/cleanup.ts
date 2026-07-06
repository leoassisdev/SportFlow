import { prisma } from '../../src/config/database.js';

/**
 * Remove tenants por slug prefix + toda a cascata (audit_logs, consents,
 * financial, matches, participants, championships, licenses, users, leads).
 * Idempotente pra beforeAll.
 */
export const cleanTenantsByPrefix = async (slugPrefix: string) => {
  const tenants = await prisma.tenant.findMany({
    where: { slug: { startsWith: slugPrefix } },
    select: { id: true },
  });
  const ids = tenants.map((t) => t.id);
  if (ids.length === 0) return;

  await prisma.auditLog.deleteMany({ where: { tenantId: { in: ids } } });
  await prisma.consent.deleteMany({ where: { tenantId: { in: ids } } });
  await prisma.campaignDelivery.deleteMany({ where: { user: { tenantId: { in: ids } } } });
  await prisma.financialTransaction.deleteMany({ where: { tenantId: { in: ids } } });
  await prisma.scoreEntry.deleteMany({ where: { tenantId: { in: ids } } });
  await prisma.match.deleteMany({ where: { tenantId: { in: ids } } });
  await prisma.participant.deleteMany({ where: { tenantId: { in: ids } } });
  await prisma.exportJob.deleteMany({ where: { tenantId: { in: ids } } });
  await prisma.championship.deleteMany({ where: { tenantId: { in: ids } } });
  await prisma.license.deleteMany({ where: { tenantId: { in: ids } } });
  await prisma.user.deleteMany({ where: { tenantId: { in: ids } } });
  await prisma.lead.deleteMany({ where: { tenantId: { in: ids } } });
  await prisma.tenant.deleteMany({ where: { id: { in: ids } } });
};

export const cleanLeadsByEmail = async (emails: string[]) => {
  await prisma.lead.deleteMany({ where: { email: { in: emails } } });
};
