import { Router } from 'express';
import * as reportController from './report.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/sales', reportController.getSalesReport);
router.get('/revenue', reportController.getRevenueReport);
router.get('/expenses', reportController.getExpensesReport);
router.get('/clients', reportController.getClientBalances);
router.get('/projects', reportController.getProjectsFinancialReport);
router.get('/gst', reportController.getGstTaxReport);
router.get('/payments', reportController.getPaymentsCollectedReport);

export default router;
