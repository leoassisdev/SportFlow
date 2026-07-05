import type { Request, Response } from 'express';
import { z } from 'zod';
import { UnauthorizedError } from '../../shared/errors.js';
import { createCampaignSchema, updateCampaignSchema } from './campaign.schema.js';
import { campaignService } from './campaign.service.js';

const pageSchema = z.object({
  status: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

const requireId = (req: Request): string => {
  const raw = req.params.id;
  const id = Array.isArray(raw) ? raw[0] : raw;
  if (!id) throw new UnauthorizedError('id ausente');
  return String(id);
};

export const campaignController = {
  async create(req: Request, res: Response) {
    const userId = req.user?.sub;
    if (!userId) throw new UnauthorizedError();
    const input = createCampaignSchema.parse(req.body);
    const c = await campaignService.create(userId, input);
    res.status(201).json(c);
  },

  async list(req: Request, res: Response) {
    const query = pageSchema.parse(req.query);
    res.json(await campaignService.list(query));
  },

  async get(req: Request, res: Response) {
    res.json(await campaignService.get(requireId(req)));
  },

  async update(req: Request, res: Response) {
    const input = updateCampaignSchema.parse(req.body);
    res.json(await campaignService.update(requireId(req), input));
  },

  async send(req: Request, res: Response) {
    res.status(202).json(await campaignService.enqueueSend(requireId(req)));
  },

  async remove(req: Request, res: Response) {
    await campaignService.remove(requireId(req));
    res.status(204).send();
  },
};
