import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Credenciais dev vem de env vars (com fallback pra facilitar). Rotacionar
// em prod. Ver docs/COFRE.md e .cofre/admins.md
const LEO_ADMIN_EMAIL = process.env.SEED_LEO_EMAIL ?? 'leo@dev';
const LEO_ADMIN_PASSWORD = process.env.SEED_LEO_PASSWORD ?? 'leo2026!@';
const DEMO_OWNER_EMAIL = process.env.SEED_DEMO_EMAIL ?? 'organizador@ligadobairro.com';
const DEMO_OWNER_PASSWORD = process.env.SEED_DEMO_PASSWORD ?? 'sportflow2026@#';

async function main() {
  const [leoHash, demoHash] = await Promise.all([
    bcrypt.hash(LEO_ADMIN_PASSWORD, 12),
    bcrypt.hash(DEMO_OWNER_PASSWORD, 12),
  ]);

  // SuperAdmin FlowCore (Leo)
  const superadminTenant = await prisma.tenant.upsert({
    where: { slug: 'flowcore-admin' },
    update: {},
    create: {
      slug: 'flowcore-admin',
      name: 'FlowCore Admin',
      email: LEO_ADMIN_EMAIL,
      status: 'active',
    },
  });

  await prisma.user.upsert({
    where: { email_tenantId: { email: LEO_ADMIN_EMAIL, tenantId: superadminTenant.id } },
    update: { passwordHash: leoHash, role: 'superadmin' },
    create: {
      tenantId: superadminTenant.id,
      email: LEO_ADMIN_EMAIL,
      passwordHash: leoHash,
      name: 'Leonardo (SuperAdmin)',
      role: 'superadmin',
    },
  });

  console.log(`SuperAdmin: ${LEO_ADMIN_EMAIL}`);

  // Tenant Demo (para testar login como owner comum)
  const demoTenant = await prisma.tenant.upsert({
    where: { slug: 'liga-do-bairro-demo' },
    update: {},
    create: {
      slug: 'liga-do-bairro-demo',
      name: 'Liga do Bairro (Demo)',
      email: 'contato@ligadobairro.com',
      whatsapp: '+55 11 90000-0000',
      status: 'active',
    },
  });

  await prisma.user.upsert({
    where: { email_tenantId: { email: DEMO_OWNER_EMAIL, tenantId: demoTenant.id } },
    update: { passwordHash: demoHash },
    create: {
      tenantId: demoTenant.id,
      email: DEMO_OWNER_EMAIL,
      passwordHash: demoHash,
      name: 'Organizador Demo',
      role: 'owner',
      optInEmail: false,
      optInWhatsapp: false,
    },
  });

  await prisma.license.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      tenantId: demoTenant.id,
      startsAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      durationDays: 30,
      priceBrl: '500.00',
      status: 'active',
    },
  });

  console.log(`Owner demo: ${DEMO_OWNER_EMAIL}`);
  console.log('seed OK');
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
