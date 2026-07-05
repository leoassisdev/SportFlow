import type { Request, Response } from 'express';
import { prisma } from '../../config/database.js';
import { UnauthorizedError } from '../../shared/errors.js';
import { createLicenseSchema } from './license.schema.js';
import { licenseService } from './license.service.js';

export const licenseController = {
  async create(req: Request, res: Response) {
    if (req.user?.role !== 'superadmin') throw new UnauthorizedError('Requer SuperAdmin');
    const input = createLicenseSchema.parse(req.body);
    const result = await licenseService.create(input);
    res.status(201).json(result);
  },

  async listByTenant(req: Request, res: Response) {
    const tenantId = req.user?.tenantId;
    if (!tenantId) throw new UnauthorizedError();
    const items = await prisma.license.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ items });
  },
};
