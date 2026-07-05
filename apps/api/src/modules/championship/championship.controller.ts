import type { Request, Response } from 'express';
import { UnauthorizedError } from '../../shared/errors.js';
import { championshipService } from './championship.service.js';
import {
  createChampionshipSchema,
  listQuerySchema,
  updateChampionshipSchema,
} from './championship.schema.js';

const requireTenant = (req: Request) => {
  const tenantId = req.user?.tenantId;
  if (!tenantId) throw new UnauthorizedError();
  return tenantId;
};

const requireId = (req: Request): string => {
  const raw = req.params.id;
  const id = Array.isArray(raw) ? raw[0] : raw;
  if (!id) throw new UnauthorizedError('id ausente');
  return String(id);
};

export const championshipController = {
  async create(req: Request, res: Response) {
    const tenantId = requireTenant(req);
    const input = createChampionshipSchema.parse(req.body);
    const result = await championshipService.create(tenantId, input);
    res.status(201).json(result);
  },

  async list(req: Request, res: Response) {
    const tenantId = requireTenant(req);
    const query = listQuerySchema.parse(req.query);
    const result = await championshipService.list(tenantId, query);
    res.json(result);
  },

  async get(req: Request, res: Response) {
    const result = await championshipService.getById(requireTenant(req), requireId(req));
    res.json(result);
  },

  async update(req: Request, res: Response) {
    const input = updateChampionshipSchema.parse(req.body);
    const result = await championshipService.update(requireTenant(req), requireId(req), input);
    res.json(result);
  },

  async remove(req: Request, res: Response) {
    await championshipService.remove(requireTenant(req), requireId(req));
    res.status(204).send();
  },
};
