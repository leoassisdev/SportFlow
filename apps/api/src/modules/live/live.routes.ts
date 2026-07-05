import { Router, type Request, type Response } from 'express';
import { prisma } from '../../config/database.js';

const router = Router();

router.get('/:token', async (req: Request, res: Response) => {
  const raw = req.params.token;
  const token = Array.isArray(raw) ? raw[0] : raw;
  if (!token) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Placar nao encontrado' } });

  const match = await prisma.match.findFirst({
    where: { liveToken: String(token) },
    include: {
      championship: { include: { tenant: { select: { status: true } } } },
      homeParticipant: { select: { name: true } },
      awayParticipant: { select: { name: true } },
    },
  });

  if (!match) {
    return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Placar nao encontrado' } });
  }

  return res.json({
    championship: {
      name: match.championship.name,
      sportType: match.championship.sportType,
    },
    match: {
      status: match.status,
      homeScore: match.homeScore,
      awayScore: match.awayScore,
      timerSeconds: match.timerSeconds,
      timerRunning: match.timerRunning,
      homeParticipant: { name: match.homeParticipant.name },
      awayParticipant: { name: match.awayParticipant.name },
    },
    isPreview: match.championship.tenant.status === 'preview',
  });
});

export { router as liveRoutes };
