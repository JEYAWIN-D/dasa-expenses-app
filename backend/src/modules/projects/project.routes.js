import { Router } from 'express';
import * as projectController from './project.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { authorizeRoles } from '../../middleware/rbac.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/', projectController.listProjects);
router.post('/', authorizeRoles('SUPER_ADMIN', 'ADMIN', 'MANAGER', 'SALES'), projectController.createProject);
router.post('/convert-quotation/:quotationId', authorizeRoles('SUPER_ADMIN', 'ADMIN', 'MANAGER', 'SALES'), projectController.convertQuotation);
router.get('/:id', projectController.getProject);
router.put('/:id', authorizeRoles('SUPER_ADMIN', 'ADMIN', 'MANAGER', 'FINANCE'), projectController.updateProject);

// Milestones
router.post('/:id/milestones', authorizeRoles('SUPER_ADMIN', 'ADMIN', 'MANAGER'), projectController.addMilestone);
router.put('/:id/milestones/:milestoneId', authorizeRoles('SUPER_ADMIN', 'ADMIN', 'MANAGER', 'FINANCE'), projectController.updateMilestone);
router.delete('/:id/milestones/:milestoneId', authorizeRoles('SUPER_ADMIN', 'ADMIN', 'MANAGER'), projectController.deleteMilestone);

// Handover & Verification
router.post('/:id/handover', authorizeRoles('SUPER_ADMIN', 'ADMIN', 'MANAGER', 'FINANCE'), projectController.handoverProject);

// Official Documents (Letter & Receipt Generation)
router.get('/:id/documents/:docType', projectController.getDocumentData);

export default router;
