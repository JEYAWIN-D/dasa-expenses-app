import { Router } from 'express';
import * as leadController from './leads.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { authorizeRoles } from '../../middleware/rbac.middleware.js';
import { validateBody } from '../../middleware/validate.middleware.js';
import { publicFormLimiter } from '../../middleware/security.middleware.js';
import { demoRequestSchema, updateLeadSchema } from './leads.validation.js';

const router = Router();

// Public endpoint for submitting demo inquiries with DDoS & Spam Rate Limiter
router.post('/demo-request', publicFormLimiter, validateBody(demoRequestSchema), leadController.submitDemoRequest);

// Protected endpoints for internal SaaS administrators & management
router.get('/', authenticate, authorizeRoles('SUPER_ADMIN', 'ADMIN', 'MANAGER'), leadController.listDemoLeads);
router.get('/:id', authenticate, authorizeRoles('SUPER_ADMIN', 'ADMIN', 'MANAGER'), leadController.getDemoLead);
router.patch('/:id', authenticate, authorizeRoles('SUPER_ADMIN', 'ADMIN', 'MANAGER'), validateBody(updateLeadSchema), leadController.updateDemoLead);
router.delete('/:id', authenticate, authorizeRoles('SUPER_ADMIN', 'ADMIN'), leadController.deleteDemoLead);

export default router;

