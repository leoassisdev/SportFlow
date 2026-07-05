import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'node:crypto';

const prisma = new PrismaClient();

const LEO_ADMIN_EMAIL = process.env.SEED_LEO_EMAIL ?? 'leo@dev.local';
const LEO_ADMIN_PASSWORD = process.env.SEED_LEO_PASSWORD ?? 'leo2026!@';
const DEMO_OWNER_EMAIL = process.env.SEED_DEMO_EMAIL ?? 'organizador@ligadobairro.com';
const DEMO_OWNER_PASSWORD = process.env.SEED_DEMO_PASSWORD ?? 'sportflow2026@#';

const liveToken = () => randomBytes(16).toString('hex');

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
  console.log(`SuperAdmin: ${LEO_ADMIN_EMAIL} / ${LEO_ADMIN_PASSWORD}`);

  // Tenant Demo (owner comum) com licença ativa
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
    },
  });
  console.log(`Owner demo: ${DEMO_OWNER_EMAIL} / ${DEMO_OWNER_PASSWORD}`);

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

  // Campeonato demo: Interbairros 2026 (Futebol) com 4 times e 2 jogos
  const championship = await prisma.championship.upsert({
    where: { id: '00000000-0000-0000-0000-000000000010' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000010',
      tenantId: demoTenant.id,
      name: 'Interbairros 2026',
      sportType: 'futebol',
      status: 'active',
      startDate: new Date(),
      endDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      rulesConfig: {
        periods: 2,
        periodDuration: 45,
        allowExtraTime: false,
        allowShootout: false,
      },
    },
  });

  const TEAMS = [
    { id: '00000000-0000-0000-0000-000000000101', name: 'Bairro Alto' },
    { id: '00000000-0000-0000-0000-000000000102', name: 'Vila Norte' },
    { id: '00000000-0000-0000-0000-000000000103', name: 'Centro FC' },
    { id: '00000000-0000-0000-0000-000000000104', name: 'FC Aurora' },
  ];

  for (const t of TEAMS) {
    await prisma.participant.upsert({
      where: { id: t.id },
      update: {},
      create: {
        id: t.id,
        tenantId: demoTenant.id,
        championshipId: championship.id,
        name: t.name,
        category: 'Grupo A',
      },
    });
  }

  // Match ao vivo (Bairro Alto 3 x 1 Vila Norte)
  await prisma.match.upsert({
    where: { id: '00000000-0000-0000-0000-000000000201' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000201',
      tenantId: demoTenant.id,
      championshipId: championship.id,
      homeParticipantId: TEAMS[0]!.id,
      awayParticipantId: TEAMS[1]!.id,
      status: 'live',
      scheduledAt: new Date(),
      liveToken: liveToken(),
      timerSeconds: 42 * 60 + 18,
      timerRunning: true,
      timerStartedAt: new Date(Date.now() - 42 * 60 * 1000),
      homeScore: 3,
      awayScore: 1,
    },
  });

  // Match agendado
  await prisma.match.upsert({
    where: { id: '00000000-0000-0000-0000-000000000202' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000202',
      tenantId: demoTenant.id,
      championshipId: championship.id,
      homeParticipantId: TEAMS[2]!.id,
      awayParticipantId: TEAMS[3]!.id,
      status: 'scheduled',
      scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      liveToken: liveToken(),
    },
  });

  // Transacoes financeiras
  const txs = [
    { id: '00000000-0000-0000-0000-000000000301', type: 'income' as const, category: 'Inscrição', amount: '400.00', description: 'Time Bairro Alto', sponsor: null, date: -4 },
    { id: '00000000-0000-0000-0000-000000000302', type: 'income' as const, category: 'Patrocínio', amount: '1500.00', description: 'Padaria Central', sponsor: 'Padaria Central', date: -3 },
    { id: '00000000-0000-0000-0000-000000000303', type: 'expense' as const, category: 'Arbitragem', amount: '280.00', description: 'Árbitro Silva', sponsor: null, date: -2 },
    { id: '00000000-0000-0000-0000-000000000304', type: 'expense' as const, category: 'Aluguel', amount: '600.00', description: 'Quadra municipal', sponsor: null, date: -1 },
  ];
  for (const t of txs) {
    await prisma.financialTransaction.upsert({
      where: { id: t.id },
      update: {},
      create: {
        id: t.id,
        tenantId: demoTenant.id,
        championshipId: championship.id,
        type: t.type,
        category: t.category,
        amount: t.amount,
        description: t.description,
        sponsorName: t.sponsor,
        transactionDate: new Date(Date.now() + t.date * 24 * 60 * 60 * 1000),
      },
    });
  }

  // Leads pra SuperAdmin ver funil
  const leads = [
    { name: 'Rodrigo Nunes', email: 'rodrigo@zonasul.com', whatsapp: '11 90000-1234', sport: 'futebol' },
    { name: 'Camila Alves', email: 'camila@voleiescolar.com', whatsapp: '11 90000-4321', sport: 'volei' },
    { name: 'Fabio Skate', email: 'fabio@skatecrew.com', whatsapp: '11 90000-9876', sport: 'skate' },
  ];
  for (const l of leads) {
    const existing = await prisma.lead.findFirst({ where: { email: l.email } });
    if (!existing) {
      await prisma.lead.create({
        data: {
          name: l.name,
          email: l.email,
          whatsapp: l.whatsapp,
          sport: l.sport,
          optInEmail: true,
          optInWhatsapp: false,
        },
      });
    }
  }

  console.log('Campeonato demo: Interbairros 2026 (Bairro Alto 3x1 Vila Norte AO VIVO)');
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
