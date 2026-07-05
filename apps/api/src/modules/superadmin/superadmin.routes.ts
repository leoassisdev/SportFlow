import { Router } from 'express';
import { campaignRoutes } from '../campaign/campaign.routes.js';
import { superadminController } from './superadmin.controller.js';

const router = Router();

router.get('/metrics', (req, res, next) => superadminController.metrics(req, res).catch(next));
router.get('/tenants', (req, res, next) => superadminController.listTenants(req, res).catch(next));
router.get('/tenants/:id', (req, res, next) => superadminController.getTenant(req, res).catch(next));
router.get('/leads', (req, res, next) => superadminController.listLeads(req, res).catch(next));
router.get('/audit-logs', (req, res, next) => superadminController.listAuditLogs(req, res).catch(next));
router.post('/licenses', (req, res, next) => superadminController.createLicense(req, res).catch(next));

router.use('/campaigns', campaignRoutes);

export { router as superadminRoutes };
