import { Router } from 'express';
import { participantController } from './participant.controller.js';

const router = Router();

router.get('/', (req, res, next) => participantController.list(req, res).catch(next));
router.post('/', (req, res, next) => participantController.create(req, res).catch(next));
router.patch('/:id', (req, res, next) => participantController.update(req, res).catch(next));
router.delete('/:id', (req, res, next) => participantController.remove(req, res).catch(next));

export { router as participantRoutes };
