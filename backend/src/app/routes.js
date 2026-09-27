import { Router } from 'express';
import authRoutes from '../modules/auth/auth.routes.js';
import clientRoutes from '../modules/clients/client.routes.js';
import quotationRoutes from '../modules/quotations/quotation.routes.js';
import negotiationRoutes from '../modules/negotiations/negotiation.routes.js';
import invoiceRoutes from '../modules/invoices/invoice.routes.js';
import paymentRoutes from '../modules/payments/payment.routes.js';
import expenseRoutes from '../modules/expenses/expense.routes.js';
import vendorRoutes from '../modules/vendors/vendor.routes.js';
import dashboardRoutes from '../modules/dashboard/dashboard.routes.js';
import reportRoutes from '../modules/reports/report.routes.js';
import settingsRoutes from '../modules/settings/settings.routes.js';
import projectRoutes from '../modules/projects/project.routes.js';
import accountRoutes from '../modules/accounts/account.routes.js';
import leadRoutes from '../modules/leads/leads.routes.js';

const router = Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Quotation, Billing & Business Finance API',
  });
});

// Modular route mounting
router.use('/auth', authRoutes);
router.use('/clients', clientRoutes);
router.use('/quotations', quotationRoutes);
router.use('/projects', projectRoutes);
router.use('/accounts', accountRoutes);
router.use('/negotiations', negotiationRoutes);
router.use('/invoices', invoiceRoutes);
router.use('/payments', paymentRoutes);
router.use('/expenses', expenseRoutes);
router.use('/vendors', vendorRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/reports', reportRoutes);
router.use('/settings', settingsRoutes);
router.use('/leads', leadRoutes);

export default router;

