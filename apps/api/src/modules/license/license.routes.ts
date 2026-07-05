import { Router } from 'express';
import { licenseController } from './license.controller.js';

const router = Router();

router.get('/mine', (req, res, next) => licenseController.listByTenant(req, res).catch(next));

export { router as licenseRoutes };
