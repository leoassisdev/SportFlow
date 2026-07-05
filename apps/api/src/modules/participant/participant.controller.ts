import type { Request, Response } from 'express';
import { UnauthorizedError } from '../../shared/errors.js';
import { createParticipantSchema, updateParticipantSchema } from './participant.schema.js';
import { participantService } from './participant.service.js';

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

export const participantController = {
  async create(req: Request, res: Response) {
    const input = createParticipantSchema.parse(req.body);
    const result = await participantService.create(tenantOf(req), input);
    res.status(201).json(result);
  },

  async list(req: Request, res: Response) {
    const raw = req.query.championshipId;
    const championshipId = Array.isArray(raw) ? raw[0] : raw;
    if (!championshipId || typeof championshipId !== 'string') {
      throw new UnauthorizedError('championshipId obrigatório');
    }
    const result = await participantService.list(tenantOf(req), championshipId);
    res.json({ items: result });
  },

  async update(req: Request, res: Response) {
    const input = updateParticipantSchema.parse(req.body);
    const result = await participantService.update(tenantOf(req), requireId(req), input);
    res.json(result);
  },

  async remove(req: Request, res: Response) {
    await participantService.remove(tenantOf(req), requireId(req));
    res.status(204).send();
  },
};
