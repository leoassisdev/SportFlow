import type { Request, Response } from 'express';
import { UnauthorizedError } from '../../shared/errors.js';
import { consentService } from './consent.service.js';
import { upsertConsentSchema } from './consent.schema.js';

export const consentController = {
  async mine(req: Request, res: Response) {
    const userId = req.user?.sub;
    if (!userId) throw new UnauthorizedError();
    res.json(await consentService.listByUser(userId));
  },

  async upsert(req: Request, res: Response) {
    const userId = req.user?.sub;
    const tenantId = req.user?.tenantId;
    if (!userId || !tenantId) throw new UnauthorizedError();
    const input = upsertConsentSchema.parse(req.body);
    await consentService.record(input.kind, input.accepted, {
      userId,
      tenantId,
      ipAddress: req.ip ?? null,
      userAgent: req.headers['user-agent'] ?? null,
    });
    const optIns = await consentService.syncUserOptIns(userId);
    res.json({ ok: true, ...optIns });
  },
};
