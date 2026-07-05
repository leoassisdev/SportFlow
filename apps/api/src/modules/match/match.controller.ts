import type { Request, Response } from 'express';
import { UnauthorizedError } from '../../shared/errors.js';
import { createMatchSchema, scoreUpdateSchema, timerActionSchema } from './match.schema.js';
import { matchService } from './match.service.js';

const tenantOf = (req: Request) => {
  const t = req.user?.tenantId;
  if (!t) throw new UnauthorizedError();
  return t;
};

const requireId = (req: Request): string => {
  const raw = req.params.id;
  const id = Array.isArray(raw) ? raw[0] : raw;
  if (!id) throw new UnauthorizedError('id ausente');
  return String(id);
};

export const matchController = {
  async create(req: Request, res: Response) {
    const input = createMatchSchema.parse(req.body);
    const result = await matchService.create(tenantOf(req), input);
    res.status(201).json(result);
  },

  async list(req: Request, res: Response) {
    const raw = req.query.championshipId;
    const championshipId = Array.isArray(raw) ? raw[0] : raw;
    if (!championshipId || typeof championshipId !== 'string') {
      throw new UnauthorizedError('championshipId obrigatório');
    }
    const items = await matchService.list(tenantOf(req), championshipId);
    res.json({ items });
  },

  async get(req: Request, res: Response) {
    const match = await matchService.get(tenantOf(req), requireId(req));
    res.json(match);
  },

  async updateScore(req: Request, res: Response) {
    const input = scoreUpdateSchema.parse(req.body);
    const userId = req.user?.sub;
    if (!userId) throw new UnauthorizedError();
    const updated = await matchService.updateScore(tenantOf(req), requireId(req), userId, input);
    res.json(updated);
  },

  async updateTimer(req: Request, res: Response) {
    const input = timerActionSchema.parse(req.body);
    const updated = await matchService.updateTimer(tenantOf(req), requireId(req), input);
    res.json(updated);
  },
};
