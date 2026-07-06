import { prisma } from '../../config/database.js';
import { generateLiveToken } from '../../shared/crypto.js';
import { ConflictError, NotFoundError } from '../../shared/errors.js';
import { publishMatchEvent } from '../../events/publisher.js';
import type { CreateMatchInput, ScoreUpdateInput, TimerActionInput } from './match.schema.js';

export const matchService = {
  async create(tenantId: string, input: CreateMatchInput) {
    if (input.homeParticipantId === input.awayParticipantId) {
      throw new ConflictError('Casa e fora precisam ser diferentes');
    }
    const championship = await prisma.championship.findFirst({
      where: { id: input.championshipId, tenantId, deletedAt: null },
      select: { id: true },
    });
    if (!championship) throw new NotFoundError('Campeonato');

    return prisma.match.create({
      data: {
        tenantId,
        championshipId: input.championshipId,
        homeParticipantId: input.homeParticipantId,
        awayParticipantId: input.awayParticipantId,
        scheduledAt: input.scheduledAt ?? null,
        liveToken: generateLiveToken(),
        status: 'scheduled',
      },
      include: {
        homeParticipant: { select: { id: true, name: true } },
        awayParticipant: { select: { id: true, name: true } },
      },
    });
  },

  list(tenantId: string, championshipId: string) {
    return prisma.match.findMany({
      where: { tenantId, championshipId },
      include: {
        homeParticipant: { select: { id: true, name: true } },
        awayParticipant: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  async get(tenantId: string, id: string) {
    const match = await prisma.match.findFirst({
      where: { id, tenantId },
      include: {
        championship: { select: { name: true, sportType: true } },
        homeParticipant: { select: { id: true, name: true } },
        awayParticipant: { select: { id: true, name: true } },
      },
    });
    if (!match) throw new NotFoundError('Jogo');
    return match;
  },

  async updateScore(tenantId: string, id: string, userId: string, input: ScoreUpdateInput) {
    const match = await prisma.match.findFirst({
      where: { id, tenantId },
      select: { id: true, liveToken: true, homeParticipantId: true, awayParticipantId: true, homeScore: true, awayScore: true, status: true },
    });
    if (!match) throw new NotFoundError('Jogo');
    if (match.status === 'finished' || match.status === 'cancelled') {
      throw new ConflictError('Jogo já encerrado');
    }
    const isHome = input.participantId === match.homeParticipantId;
    const isAway = input.participantId === match.awayParticipantId;
    if (!isHome && !isAway) throw new ConflictError('Participante não pertence ao jogo');

    const nextHome = isHome ? Math.max(0, match.homeScore + input.delta) : match.homeScore;
    const nextAway = isAway ? Math.max(0, match.awayScore + input.delta) : match.awayScore;

    const [_entry, updated] = await prisma.$transaction([
      prisma.scoreEntry.create({
        data: {
          matchId: id,
          tenantId,
          participantId: input.participantId,
          delta: input.delta,
          scoreData: { home: nextHome, away: nextAway } as unknown as any,
          updatedBy: userId,
        },
      }),
      prisma.match.update({
        where: { id },
        data: {
          homeScore: nextHome,
          awayScore: nextAway,
          status: match.status === 'scheduled' ? 'live' : match.status,
        },
      }),
    ]);

    await publishMatchEvent({
      type: 'score:updated',
      matchId: id,
      liveToken: match.liveToken,
      homeScore: nextHome,
      awayScore: nextAway,
      lastEntry: { participantId: input.participantId, delta: input.delta, at: new Date().toISOString() },
    });

    return updated;
  },

  async updateTimer(tenantId: string, id: string, input: TimerActionInput) {
    const match = await prisma.match.findFirst({
      where: { id, tenantId },
      select: { id: true, liveToken: true, timerSeconds: true, timerRunning: true, timerStartedAt: true },
    });
    if (!match) throw new NotFoundError('Jogo');

    let running = match.timerRunning;
    let seconds = match.timerSeconds;
    let startedAt = match.timerStartedAt;

    if (input.action === 'start') {
      running = true;
      startedAt = new Date();
    } else if (input.action === 'pause') {
      running = false;
      if (match.timerStartedAt) {
        seconds += Math.floor((Date.now() - match.timerStartedAt.getTime()) / 1000);
      }
      startedAt = null;
    } else if (input.action === 'reset') {
      running = false;
      seconds = 0;
      startedAt = null;
    }

    const updated = await prisma.match.update({
      where: { id },
      data: { timerRunning: running, timerSeconds: seconds, timerStartedAt: startedAt },
    });

    await publishMatchEvent({
      type: input.action === 'start' ? 'timer:started' : input.action === 'pause' ? 'timer:paused' : 'timer:reset',
      matchId: id,
      liveToken: match.liveToken,
      running,
      seconds,
      serverTime: new Date().toISOString(),
    });

    return updated;
  },

  async finish(tenantId: string, id: string) {
    const match = await prisma.match.findFirst({
      where: { id, tenantId },
      select: { id: true, liveToken: true, status: true, timerRunning: true, timerSeconds: true, timerStartedAt: true },
    });
    if (!match) throw new NotFoundError('Jogo');
    if (match.status === 'finished' || match.status === 'cancelled') {
      throw new ConflictError('Jogo já encerrado');
    }
    // congela o timer no momento do finish
    let seconds = match.timerSeconds;
    if (match.timerRunning && match.timerStartedAt) {
      seconds += Math.floor((Date.now() - match.timerStartedAt.getTime()) / 1000);
    }
    return prisma.match.update({
      where: { id },
      data: {
        status: 'finished',
        timerRunning: false,
        timerSeconds: seconds,
        timerStartedAt: null,
        finishedAt: new Date(),
      },
    });
  },

  async undoLast(tenantId: string, id: string, userId: string) {
    const match = await prisma.match.findFirst({
      where: { id, tenantId },
      select: { id: true, liveToken: true, homeScore: true, awayScore: true, homeParticipantId: true, awayParticipantId: true, status: true },
    });
    if (!match) throw new NotFoundError('Jogo');
    if (match.status === 'finished' || match.status === 'cancelled') {
      throw new ConflictError('Jogo já encerrado');
    }

    const last = await prisma.scoreEntry.findFirst({
      where: { matchId: id, tenantId },
      orderBy: { createdAt: 'desc' },
    });
    if (!last) throw new NotFoundError('Nenhum lançamento para desfazer');

    const isHome = last.participantId === match.homeParticipantId;
    const nextHome = isHome ? Math.max(0, match.homeScore - last.delta) : match.homeScore;
    const nextAway = !isHome ? Math.max(0, match.awayScore - last.delta) : match.awayScore;

    const [_undo, updated] = await prisma.$transaction([
      prisma.scoreEntry.create({
        data: {
          matchId: id,
          tenantId,
          participantId: last.participantId,
          delta: -last.delta,
          scoreData: { home: nextHome, away: nextAway } as unknown as any,
          updatedBy: userId,
        },
      }),
      prisma.match.update({
        where: { id },
        data: { homeScore: nextHome, awayScore: nextAway },
      }),
    ]);

    await publishMatchEvent({
      type: 'score:updated',
      matchId: id,
      liveToken: match.liveToken,
      homeScore: nextHome,
      awayScore: nextAway,
      lastEntry: { participantId: last.participantId, delta: -last.delta, at: new Date().toISOString() },
    });

    return updated;
  },

  async listScoreHistory(tenantId: string, id: string) {
    return prisma.scoreEntry.findMany({
      where: { matchId: id, tenantId },
      orderBy: { createdAt: 'desc' },
      take: 30,
      include: {
        participant: { select: { id: true, name: true } },
      },
    });
  },
};
