import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import { prisma } from '../../src/config/database.js';
import { buildApp } from '../../src/app.js';

const app = buildApp();

describe('financial flow', () => {
  let cookiesPreview = '';
  let cookiesActive = '';
  let championshipId = '';

  beforeAll(async () => {
    const { cleanTenantsByPrefix, cleanLeadsByEmail } = await import('../helpers/cleanup.js');
    await cleanTenantsByPrefix('fin-');
    await cleanLeadsByEmail(['finprev@test.com', 'finact@test.com']);

    // Owner preview (default apos register)
    const rP = await request(app).post('/api/v1/auth/register').send({
      name: 'FIN Preview',
      email: 'finprev@test.com',
      password: 'Senha123',
      whatsapp: '11 90000-6001',
      sport: 'futebol',
      organizationName: 'FIN-Preview',
      acceptPrivacy: true,
      acceptEmailMarketing: false,
      acceptWhatsappMarketing: false,
    });
    expect(rP.status).toBe(201);
    cookiesPreview = (rP.headers['set-cookie'] as unknown as string[]).join('; ');

    // Owner com licenca ativa
    const rA = await request(app).post('/api/v1/auth/register').send({
      name: 'FIN Active',
      email: 'finact@test.com',
      password: 'Senha123',
      whatsapp: '11 90000-6002',
      sport: 'futebol',
      organizationName: 'FIN-Active',
      acceptPrivacy: true,
      acceptEmailMarketing: false,
      acceptWhatsappMarketing: false,
    });
    expect(rA.status).toBe(201);
    cookiesActive = (rA.headers['set-cookie'] as unknown as string[]).join('; ');

    const userA = await prisma.user.findFirst({ where: { email: 'finact@test.com' } });
    if (!userA) throw new Error('user not created');
    await prisma.tenant.update({ where: { id: userA.tenantId }, data: { status: 'active' } });

    const champ = await request(app)
      .post('/api/v1/championships')
      .set('Cookie', cookiesActive)
      .send({ name: 'FIN-Test Torneio', sportType: 'futebol' });
    expect(champ.status).toBe(201);
    championshipId = champ.body.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('tenant preview bloqueado no financeiro (403 PREVIEW_LIMITED)', async () => {
    const previewUser = await prisma.user.findFirst({ where: { email: 'finprev@test.com' } });
    if (!previewUser) throw new Error();
    const previewChamp = await prisma.championship.create({
      data: {
        tenantId: previewUser.tenantId,
        name: 'FIN-Preview Torneio',
        sportType: 'futebol',
        status: 'draft',
      },
    });

    const r = await request(app)
      .post('/api/v1/financial/transactions')
      .set('Cookie', cookiesPreview)
      .send({
        championshipId: previewChamp.id,
        type: 'income',
        category: 'Inscrição',
        amount: 100,
        description: 'FIN-preview-test',
        transactionDate: new Date().toISOString(),
      });
    expect(r.status).toBe(403);
    expect(r.body.error.code).toBe('PREVIEW_LIMITED');
  });

  it('tenant ativo: cria transacao e summary confere', async () => {
    const create = await request(app)
      .post('/api/v1/financial/transactions')
      .set('Cookie', cookiesActive)
      .send({
        championshipId,
        type: 'income',
        category: 'Patrocínio',
        amount: 1500,
        description: 'FIN-active-test-1',
        sponsorName: 'Empresa X',
        transactionDate: new Date().toISOString(),
      });
    expect(create.status).toBe(201);

    const summary = await request(app)
      .get('/api/v1/financial/summary')
      .query({ championshipId })
      .set('Cookie', cookiesActive);
    expect(summary.status).toBe(200);
    expect(summary.body.income).toBe(1500);
    expect(summary.body.balance).toBe(1500);
    expect(summary.body.sponsors).toContain('Empresa X');
  });

  it('cross-tenant: preview NAO ve financial do active', async () => {
    const r = await request(app)
      .get('/api/v1/financial/transactions')
      .query({ championshipId })
      .set('Cookie', cookiesPreview);
    // Preview e bloqueado no proprio guard, mas mesmo passando esse guard,
    // RLS impediria ver dados do tenant active.
    expect(r.status).toBe(403);
    expect(r.body.error.code).toBe('PREVIEW_LIMITED');
  });
});
