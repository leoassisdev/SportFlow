import { test, expect, request as pwRequest } from '@playwright/test';

const API = process.env.E2E_API_URL ?? 'http://localhost:3001';

/**
 * Fluxo fim-a-fim: registra owner novo, cria campeonato via API (RN-014
 * sportType imutavel), adiciona 2 participantes, cria match, incrementa
 * placar, verifica que /live reflete o placar em tempo real.
 *
 * Faz setup por API (mais rápido/estável que UI) e depois valida a UI.
 */
test('E2E: novo tenant → placar reflete no /live publico', async ({ page }) => {
  const stamp = Date.now();
  const email = `e2e-${stamp}@test.local`;
  const ctx = await pwRequest.newContext({ baseURL: API });

  // 1. Register (owner novo em preview mode)
  const reg = await ctx.post('/api/v1/auth/register', {
    data: {
      name: `E2E ${stamp}`,
      email,
      password: 'Senha123',
      whatsapp: '11 90000-8888',
      sport: 'futebol',
      organizationName: `E2E-${stamp}`,
      acceptPrivacy: true,
      acceptEmailMarketing: false,
      acceptWhatsappMarketing: false,
    },
  });
  expect(reg.status()).toBe(201);

  // 2. Move o tenant pra active (bypass preview limits)
  //    Em produção seria via Stripe webhook; aqui simulo via dev-login como
  //    superadmin e uso o endpoint de licensa. Pra simplificar, uso Prisma
  //    diretamente via SQL — mas Playwright não tem isso. Solução: rodar
  //    tudo como owner preview (max 1 champ + 3 participantes é suficiente).

  // 3. Criar campeonato
  const champ = await ctx.post('/api/v1/championships', {
    data: { name: `E2E-Torneio-${stamp}`, sportType: 'futebol' },
  });
  expect(champ.status()).toBe(201);
  const championshipId = (await champ.json()).id;

  // 4. Adicionar 2 participantes
  const p1 = await ctx.post('/api/v1/participants', {
    data: { championshipId, name: 'Time E2E A' },
  });
  expect(p1.status()).toBe(201);
  const homeId = (await p1.json()).id;

  const p2 = await ctx.post('/api/v1/participants', {
    data: { championshipId, name: 'Time E2E B' },
  });
  expect(p2.status()).toBe(201);
  const awayId = (await p2.json()).id;

  // 5. Criar match
  const match = await ctx.post('/api/v1/matches', {
    data: { championshipId, homeParticipantId: homeId, awayParticipantId: awayId },
  });
  expect(match.status()).toBe(201);
  const matchData = await match.json();
  const matchId = matchData.id;
  const liveToken = matchData.liveToken;

  // 6. Abre /live/{token} no browser e confirma placar inicial 0×0
  await page.goto(`/live/${liveToken}`);
  const scores = page.locator('p.font-display.font-black.leading-none');
  await expect(scores).toHaveCount(2);
  await expect(scores.first()).toHaveText('0');
  await expect(scores.last()).toHaveText('0');

  // 7. Backend: incrementa placar do time A (+1)
  const scoreUp = await ctx.patch(`/api/v1/matches/${matchId}/score`, {
    data: { participantId: homeId, delta: 1 },
  });
  expect(scoreUp.status()).toBe(200);

  // 8. Browser deve refletir o novo placar via Socket.io broadcast (< 5s)
  await expect(scores.first()).toHaveText('1', { timeout: 5000 });

  // 9. Score de novo pra confirmar continuidade
  await ctx.patch(`/api/v1/matches/${matchId}/score`, {
    data: { participantId: homeId, delta: 1 },
  });
  await expect(scores.first()).toHaveText('2', { timeout: 5000 });

  // 10. Score no time B
  await ctx.patch(`/api/v1/matches/${matchId}/score`, {
    data: { participantId: awayId, delta: 1 },
  });
  await expect(scores.last()).toHaveText('1', { timeout: 5000 });

  // 11. Undo → time B volta pra 0
  await ctx.post(`/api/v1/matches/${matchId}/score/undo`);
  await expect(scores.last()).toHaveText('0', { timeout: 5000 });

  // 12. Finalizar match
  const finish = await ctx.post(`/api/v1/matches/${matchId}/finish`);
  expect(finish.status()).toBe(200);
  const finishedData = await finish.json();
  expect(finishedData.status).toBe('finished');

  await ctx.dispose();
});
