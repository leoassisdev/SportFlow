import { Router } from 'express';
import { championshipController } from './championship.controller.js';

const router = Router();

router.get('/', (req, res, next) => championshipController.list(req, res).catch(next));
router.post('/', (req, res, next) => championshipController.create(req, res).catch(next));
router.get('/:id', (req, res, next) => championshipController.get(req, res).catch(next));
router.patch('/:id', (req, res, next) => championshipController.update(req, res).catch(next));
router.delete('/:id', (req, res, next) => championshipController.remove(req, res).catch(next));

export { router as championshipRoutes };
