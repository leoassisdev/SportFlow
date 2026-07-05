import { Router } from 'express';
import { authRateLimit } from '../../middlewares/rateLimit.middleware.js';
import { authController } from './auth.controller.js';
import { devLoginRoutes } from './dev-login.routes.js';
import { googleAuthRoutes } from './google.routes.js';

const router = Router();

router.use('/dev-login', devLoginRoutes);
router.use('/google', googleAuthRoutes);

router.post('/register', authRateLimit, (req, res, next) =>
  authController.register(req, res).catch(next),
);
router.post('/login', authRateLimit, (req, res, next) =>
  authController.login(req, res).catch(next),
);
router.post('/refresh', (req, res, next) => authController.refresh(req, res).catch(next));
router.post('/logout', (req, res, next) => authController.logout(req, res).catch(next));

export { router as authRoutes };
