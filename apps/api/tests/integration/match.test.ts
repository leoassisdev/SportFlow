import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import { prisma } from '../../src/config/database.js';
import { buildApp } from '../../src/app.js';

const app = buildApp();

describe('match flow', () => {
  let cookies = '';
  let championshipId = '';
  let homeId = '';
  let awayId = '';
  let matchId = '';

  beforeAll(async () => {
    const { cleanTenantsByPrefix, cleanLeadsByEmail } = await import('../helpers/cleanup.js');
    await cleanTenantsByPrefix('mtc-');
    await cleanLeadsByEmail(['mtc@test.com']);

    const r = await request(app).post('/api/v1/auth/register').send({
      name: 'MTC Owner',
      email: 'mtc@test.com',
      password: 'Senha123',
      whatsapp: '11 90000-7000',
      sport: 'futebol',
      organizationName: 'MTC Liga',
      acceptPrivacy: true,
      acceptEmailMarketing: false,
      acceptWhatsappMarketing: false,
    });
    expect(r.status).toBe(201);
    cookies = (r.headers['set-cookie'] as unknown as string[]).join('; ');

    const user = await prisma.user.findFirst({ where: { email: 'mtc@test.com' } });
    if (!user) throw new Error();
    await prisma.tenant.update({ where: { id: user.tenantId }, data: { status: 'active' } });

    const champ = await request(app)
      .post('/api/v1/championships')
      .set('Cookie', cookies)
      .send({ name: 'MTC-Torneio', sportType: 'futebol' });
    championshipId = champ.body.id;

    const p1 = await request(app)
      .post('/api/v1/participants')
      .set('Cookie', cookies)
      .send({ championshipId, name: 'Time A' });
    homeId = p1.body.id;

    const p2 = await request(app)
      .post('/api/v1/participants')
      .set('Cookie', cookies)
      .send({ championshipId, name: 'Time B' });
    awayId = p2.body.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('cria match entre 2 participantes', async () => {
    const r = await request(app)
      .post('/api/v1/matches')
      .set('Cookie', cookies)
      .send({ championshipId, homeParticipantId: homeId, awayParticipantId: awayId });
    expect(r.status).toBe(201);
    expect(r.body.liveToken).toBeTruthy();
    matchId = r.body.id;
  });

  it('rejeita match com mesmo participante casa e fora (409)', async () => {
    const r = await request(app)
      .post('/api/v1/matches')
      .set('Cookie', cookies)
      .send({ championshipId, homeParticipantId: homeId, awayParticipantId: homeId });
    expect(r.status).toBe(409);
  });

  it('score update: +1 casa muda status para live e persiste', async () => {
    const r = await request(app)
      .patch(`/api/v1/matches/${matchId}/score`)
      .set('Cookie', cookies)
      .send({ participantId: homeId, delta: 1 });
    expect(r.status).toBe(200);
    expect(r.body.homeScore).toBe(1);
    expect(r.body.status).toBe('live');
  });

  it('score nao fica negativo (Math.max 0)', async () => {
    const r = await request(app)
      .patch(`/api/v1/matches/${matchId}/score`)
      .set('Cookie', cookies)
      .send({ participantId: awayId, delta: -5 });
    expect(r.status).toBe(200);
    expect(r.body.awayScore).toBe(0);
  });

  it('timer start acumula seconds no server-side', async () => {
    const r = await request(app)
      .patch(`/api/v1/matches/${matchId}/timer`)
      .set('Cookie', cookies)
      .send({ action: 'start' });
    expect(r.status).toBe(200);
    expect(r.body.timerRunning).toBe(true);
    expect(r.body.timerStartedAt).toBeTruthy();
  });

  it('rota /live/:token retorna dados publicos', async () => {
    const match = await prisma.match.findUnique({ where: { id: matchId } });
    if (!match) throw new Error();
    const r = await request(app).get(`/api/v1/live/${match.liveToken}`);
    expect(r.status).toBe(200);
    expect(r.body.match.homeScore).toBeGreaterThanOrEqual(0);
    expect(r.body.match.homeParticipant.name).toBe('Time A');
    expect(r.body.match.awayParticipant.name).toBe('Time B');
  });
});
