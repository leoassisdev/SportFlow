import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('sportflow2026@#', 12);

  const superadminTenant = await prisma.tenant.upsert({
    where: { slug: 'flowcore-admin' },
    update: {},
    create: {
      slug: 'flowcore-admin',
      name: 'FlowCore Admin',
      email: 'admin@sportflow.com.br',
      status: 'active',
    },
  });

  await prisma.user.upsert({
    where: { email_tenantId: { email: 'leo@sportflow.com.br', tenantId: superadminTenant.id } },
    update: {},
    create: {
      tenantId: superadminTenant.id,
      email: 'leo@sportflow.com.br',
      passwordHash,
      name: 'Leonardo (SuperAdmin)',
      role: 'superadmin',
    },
  });

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
    where: { email_tenantId: { email: 'organizador@ligadobairro.com', tenantId: demoTenant.id } },
    update: {},
    create: {
      tenantId: demoTenant.id,
      email: 'organizador@ligadobairro.com',
      passwordHash,
      name: 'Organizador Demo',
      role: 'owner',
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
