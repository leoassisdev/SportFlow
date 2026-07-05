import type { Request, Response } from 'express';
import { UnauthorizedError } from '../../shared/errors.js';
import { createExportSchema } from './export.schema.js';
import { exportService } from './export.service.js';

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

export const exportController = {
  async create(req: Request, res: Response) {
    const input = createExportSchema.parse(req.body);
    const job = await exportService.enqueue(tenantOf(req), input);
    res.status(202).json(job);
  },

  async status(req: Request, res: Response) {
    const job = await exportService.status(tenantOf(req), requireId(req));
    res.json(job);
  },

  async list(req: Request, res: Response) {
    const items = await exportService.list(tenantOf(req), requireChampionshipId(req));
    res.json({ items });
  },
};
