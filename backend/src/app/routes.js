import { Router } from 'express';
import { exec } from 'child_process';
import authRoutes from '../modules/auth/auth.routes.js';
import platformRoutes from '../modules/platform/platform.routes.js';
import orgRoutes from '../modules/organization/organization.routes.js';
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
import employeeRoutes from '../modules/employees/employee.routes.js';

const router = Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'DASA EXPENCES SaaS Platform API',
    edition: 'Enterprise Multi-Tenant SaaS Edition',
  });
});

// Continuous Deployment Webhook Endpoint (Auto-Deploy on Git Push)
router.all('/deploy-webhook', (req, res) => {
  const token = req.headers['x-deploy-token'] || req.query.token || (req.body && req.body.token);
  const expectedToken = process.env.DEPLOY_SECRET || 'dasa_tech_secure_auto_deploy_2026';

  if (!token || token !== expectedToken) {
    return res.status(401).json({ success: false, message: 'Unauthorized deployment request' });
  }

  res.json({ success: true, message: 'Deployment triggered in background' });

  exec('/usr/local/bin/deploy-dasa-expense', (error, stdout, stderr) => {
    if (error) {
      console.error('Deployment webhook error:', error);
    } else {
      console.log('Deployment webhook succeeded:\n', stdout);
    }
  });
});

// 1. DASA TECH Platform Administration (/api/platform/*)
router.use('/platform', platformRoutes);

// 2. Customer Organization Workspaces (/api/org/*)
router.use('/org', orgRoutes);

// 3. Core Tenant Business Modules
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
router.use('/employees', employeeRoutes);

export default router;


