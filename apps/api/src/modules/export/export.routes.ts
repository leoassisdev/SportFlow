import { Router } from 'express';
import { exportController } from './export.controller.js';

const router = Router();

router.get('/', (req, res, next) => exportController.list(req, res).catch(next));
router.post('/', (req, res, next) => exportController.create(req, res).catch(next));
router.get('/:id', (req, res, next) => exportController.status(req, res).catch(next));

export { router as exportRoutes };
