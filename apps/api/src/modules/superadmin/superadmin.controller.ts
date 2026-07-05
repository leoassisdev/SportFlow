import type { Request, Response } from 'express';
import { z } from 'zod';
import { UnauthorizedError } from '../../shared/errors.js';
import { licenseService } from '../license/license.service.js';
import { createLicenseSchema } from '../license/license.schema.js';
import { superadminService } from './superadmin.service.js';

const pageSchema = z.object({
  q: z.string().optional(),
  status: z.string().optional(),
  action: z.string().optional(),
  tenantId: z.string().uuid().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

const requireId = (req: Request): string => {
  const raw = req.params.id;
  const id = Array.isArray(raw) ? raw[0] : raw;
  if (!id) throw new UnauthorizedError('id ausente');
  return String(id);
};

export const superadminController = {
  async metrics(_req: Request, res: Response) {
    res.json(await superadminService.metrics());
  },

  async listTenants(req: Request, res: Response) {
    const query = pageSchema.parse(req.query);
    res.json(await superadminService.listTenants(query));
  },

  async getTenant(req: Request, res: Response) {
    res.json(await superadminService.getTenant(requireId(req)));
  },

  async listLeads(req: Request, res: Response) {
    const { page, pageSize } = pageSchema.parse(req.query);
    res.json(await superadminService.listLeads({ page, pageSize }));
  },

  async listAuditLogs(req: Request, res: Response) {
    const q = pageSchema.parse(req.query);
    res.json(await superadminService.listAuditLogs(q));
  },

  async createLicense(req: Request, res: Response) {
    const input = createLicenseSchema.parse(req.body);
    const result = await licenseService.create(input);
    res.status(201).json(result);
  },
};
