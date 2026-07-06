import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import { prisma } from '../../src/config/database.js';
import { buildApp } from '../../src/app.js';

const app = buildApp();

// Setup: cria 2 tenants + owners e faz login pra cada um.
// Depois cria campeonato com tenant A e tenta acessar como tenant B.

describe('tenant isolation (RN-007)', () => {
  let cookiesA = '';
  let cookiesB = '';
  let championshipAId = '';

  beforeAll(async () => {
    const { cleanTenantsByPrefix, cleanLeadsByEmail } = await import('../helpers/cleanup.js');
    await cleanTenantsByPrefix('iso-');
    await cleanLeadsByEmail(['isoa@test.com', 'isob@test.com']);

    const rA = await request(app).post('/api/v1/auth/register').send({
      name: 'Owner A',
      email: 'isoa@test.com',
      password: 'Senha123',
      whatsapp: '11 90000-1111',
      sport: 'futebol',
      organizationName: 'ISO-A Liga',
      acceptPrivacy: true,
      acceptEmailMarketing: false,
      acceptWhatsappMarketing: false,
    });
    expect(rA.status).toBe(201);
    cookiesA = (rA.headers['set-cookie'] as unknown as string[]).join('; ');

    const rB = await request(app).post('/api/v1/auth/register').send({
      name: 'Owner B',
      email: 'isob@test.com',
      password: 'Senha123',
      whatsapp: '11 90000-2222',
      sport: 'volei',
      organizationName: 'ISO-B Liga',
      acceptPrivacy: true,
      acceptEmailMarketing: false,
      acceptWhatsappMarketing: false,
    });
    expect(rB.status).toBe(201);
    cookiesB = (rB.headers['set-cookie'] as unknown as string[]).join('; ');
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('tenant A cria campeonato com sucesso', async () => {
    const r = await request(app)
      .post('/api/v1/championships')
      .set('Cookie', cookiesA)
      .send({ name: 'ISO-A Torneio', sportType: 'futebol' });
    expect(r.status).toBe(201);
    expect(r.body.name).toBe('ISO-A Torneio');
    championshipAId = r.body.id;
  });

  it('tenant B NAO ve campeonato do tenant A na listagem', async () => {
    const r = await request(app).get('/api/v1/championships').set('Cookie', cookiesB);
    expect(r.status).toBe(200);
    const names = r.body.items.map((c: { name: string }) => c.name);
    expect(names).not.toContain('ISO-A Torneio');
  });

  it('tenant B NAO consegue acessar detalhe do campeonato do tenant A (404)', async () => {
    const r = await request(app)
      .get(`/api/v1/championships/${championshipAId}`)
      .set('Cookie', cookiesB);
    expect(r.status).toBe(404);
  });

  it('tenant A ainda consegue ver o proprio campeonato', async () => {
    const r = await request(app)
      .get(`/api/v1/championships/${championshipAId}`)
      .set('Cookie', cookiesA);
    expect(r.status).toBe(200);
    expect(r.body.id).toBe(championshipAId);
  });

  it('rota protegida sem token retorna 401', async () => {
    const r = await request(app).get('/api/v1/championships');
    expect(r.status).toBe(401);
  });
});
