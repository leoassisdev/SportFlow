import { Router } from 'express';
import { matchController } from './match.controller.js';

const router = Router();

router.get('/', (req, res, next) => matchController.list(req, res).catch(next));
router.post('/', (req, res, next) => matchController.create(req, res).catch(next));
router.get('/:id', (req, res, next) => matchController.get(req, res).catch(next));
router.patch('/:id/score', (req, res, next) => matchController.updateScore(req, res).catch(next));
router.patch('/:id/timer', (req, res, next) => matchController.updateTimer(req, res).catch(next));

export { router as matchRoutes };
