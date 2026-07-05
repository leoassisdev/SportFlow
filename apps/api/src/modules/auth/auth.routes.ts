import { Router } from 'express';
import { authRateLimit } from '../../middlewares/rateLimit.middleware.js';
import { authController } from './auth.controller.js';

const router = Router();

router.post('/register', authRateLimit, (req, res, next) =>
  authController.register(req, res).catch(next),
);
router.post('/login', authRateLimit, (req, res, next) =>
  authController.login(req, res).catch(next),
);
router.post('/refresh', (req, res, next) => authController.refresh(req, res).catch(next));
router.post('/logout', (req, res, next) => authController.logout(req, res).catch(next));

export { router as authRoutes };
