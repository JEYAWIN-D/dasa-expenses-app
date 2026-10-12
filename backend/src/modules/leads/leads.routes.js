import { Router } from 'express';
import * as leadController from './leads.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { requireTenant } from '../../middleware/tenant.middleware.js';
import { authorizeRoles } from '../../middleware/rbac.middleware.js';
import { validateBody } from '../../middleware/validate.middleware.js';
import { publicFormLimiter } from '../../middleware/security.middleware.js';
import { demoRequestSchema, updateLeadSchema } from './leads.validation.js';

const router = Router();

// Public endpoint for submitting demo inquiries with DDoS & Spam Rate Limiter
router.post('/demo-request', publicFormLimiter, validateBody(demoRequestSchema), leadController.submitDemoRequest);

// Protected endpoints for internal SaaS administrators & management
router.use(authenticate);
router.use(requireTenant);

router.get('/', authorizeRoles('SUPER_ADMIN', 'ADMIN', 'MANAGER'), leadController.listDemoLeads);
router.get('/:id', authorizeRoles('SUPER_ADMIN', 'ADMIN', 'MANAGER'), leadController.getDemoLead);
router.patch('/:id', authorizeRoles('SUPER_ADMIN', 'ADMIN', 'MANAGER'), validateBody(updateLeadSchema), leadController.updateDemoLead);
router.delete('/:id', authorizeRoles('SUPER_ADMIN', 'ADMIN'), leadController.deleteDemoLead);

export default router;

