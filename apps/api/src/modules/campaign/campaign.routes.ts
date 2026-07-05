import { Router } from 'express';
import { campaignController } from './campaign.controller.js';

const router = Router();

router.get('/', (req, res, next) => campaignController.list(req, res).catch(next));
router.post('/', (req, res, next) => campaignController.create(req, res).catch(next));
router.get('/:id', (req, res, next) => campaignController.get(req, res).catch(next));
router.patch('/:id', (req, res, next) => campaignController.update(req, res).catch(next));
router.post('/:id/send', (req, res, next) => campaignController.send(req, res).catch(next));
router.delete('/:id', (req, res, next) => campaignController.remove(req, res).catch(next));

export { router as campaignRoutes };
