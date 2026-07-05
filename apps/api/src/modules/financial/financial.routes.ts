import { Router } from 'express';
import { financialController } from './financial.controller.js';

const router = Router();

router.get('/transactions', (req, res, next) => financialController.list(req, res).catch(next));
router.post('/transactions', (req, res, next) => financialController.create(req, res).catch(next));
router.patch('/transactions/:id', (req, res, next) => financialController.update(req, res).catch(next));
router.delete('/transactions/:id', (req, res, next) => financialController.remove(req, res).catch(next));
router.get('/summary', (req, res, next) => financialController.summary(req, res).catch(next));

export { router as financialRoutes };
