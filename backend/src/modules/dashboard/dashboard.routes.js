import { Router } from 'express';
import * as dashboardController from './dashboard.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { requireTenant } from '../../middleware/tenant.middleware.js';

const router = Router();

router.use(authenticate);
router.use(requireTenant);

router.get('/', dashboardController.getDashboard);

export default router;
