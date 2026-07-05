import type { Request, Response } from 'express';
import { UnauthorizedError } from '../../shared/errors.js';
import { createTransactionSchema, updateTransactionSchema } from './financial.schema.js';
import { financialService } from './financial.service.js';

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

const requireChampionshipId = (req: Request): string => {
  const raw = req.query.championshipId;
  const v = Array.isArray(raw) ? raw[0] : raw;
  if (!v || typeof v !== 'string') throw new UnauthorizedError('championshipId obrigatorio');
  return v;
};

export const financialController = {
  async create(req: Request, res: Response) {
    const input = createTransactionSchema.parse(req.body);
    const result = await financialService.create(tenantOf(req), input);
    res.status(201).json(result);
  },

  async list(req: Request, res: Response) {
    const items = await financialService.list(tenantOf(req), requireChampionshipId(req));
    res.json({ items });
  },

  async summary(req: Request, res: Response) {
    const result = await financialService.summary(tenantOf(req), requireChampionshipId(req));
    res.json(result);
  },

  async update(req: Request, res: Response) {
    const input = updateTransactionSchema.parse(req.body);
    const result = await financialService.update(tenantOf(req), requireId(req), input);
    res.json(result);
  },

  async remove(req: Request, res: Response) {
    await financialService.remove(tenantOf(req), requireId(req));
    res.status(204).send();
  },
};
