import { Router } from 'express';
import { consentController } from './consent.controller.js';

const router = Router();

router.get('/mine', (req, res, next) => consentController.mine(req, res).catch(next));
router.post('/', (req, res, next) => consentController.upsert(req, res).catch(next));

export { router as consentRoutes };
