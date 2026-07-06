import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import { prisma } from '../../src/config/database.js';
import { buildApp } from '../../src/app.js';

const app = buildApp();

describe('championship flow', () => {
  let cookies = '';

  beforeAll(async () => {
    const { cleanTenantsByPrefix, cleanLeadsByEmail } = await import('../helpers/cleanup.js');
    await cleanTenantsByPrefix('cht-');
    await cleanLeadsByEmail(['cht@test.com']);

    const r = await request(app).post('/api/v1/auth/register').send({
      name: 'CHT Owner',
      email: 'cht@test.com',
      password: 'Senha123',
      whatsapp: '11 90000-5555',
      sport: 'futebol',
      organizationName: 'CHT Liga',
      acceptPrivacy: true,
      acceptEmailMarketing: false,
      acceptWhatsappMarketing: false,
    });
    expect(r.status).toBe(201);
    cookies = (r.headers['set-cookie'] as unknown as string[]).join('; ');
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('cria campeonato com sport preset aplicado', async () => {
    const r = await request(app)
      .post('/api/v1/championships')
      .set('Cookie', cookies)
      .send({ name: 'CHT-Test Torneio', sportType: 'futebol' });
    expect(r.status).toBe(201);
    expect(r.body.rulesConfig).toMatchObject({ periods: 2, periodDuration: 45 });
  });

  it('lista campeonatos do proprio tenant', async () => {
    const r = await request(app).get('/api/v1/championships').set('Cookie', cookies);
    expect(r.status).toBe(200);
    expect(r.body.items.some((c: { name: string }) => c.name === 'CHT-Test Torneio')).toBe(true);
  });

  it('rejeita esporte invalido (400)', async () => {
    const r = await request(app)
      .post('/api/v1/championships')
      .set('Cookie', cookies)
      .send({ name: 'CHT-Invalido', sportType: 'basquete' });
    expect(r.status).toBe(400);
  });

  it('preview: mais de 1 campeonato ativo retorna 403 PREVIEW_LIMITED', async () => {
    // tenant novo em preview
    await prisma.championship.deleteMany({ where: { name: 'CHT-Second' } });
    const r = await request(app)
      .post('/api/v1/championships')
      .set('Cookie', cookies)
      .send({ name: 'CHT-Second', sportType: 'volei' });
    expect(r.status).toBe(403);
    expect(r.body.error.code).toBe('PREVIEW_LIMITED');
  });
});
