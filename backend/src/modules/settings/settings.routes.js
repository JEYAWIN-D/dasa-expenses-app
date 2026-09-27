import { Router } from 'express';
import * as settingsController from './settings.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { authorizeRoles } from '../../middleware/rbac.middleware.js';
import { validateBody } from '../../middleware/validate.middleware.js';
import { signaturePinLimiter } from '../../middleware/security.middleware.js';
import {
  updateCompanySchema,
  updatePinSchema,
  updateTemplateSchema,
  updateNumberingSchema,
  createUserSchema,
  updateUserSchema,
  createAssetSchema,
} from './settings.validation.js';

const router = Router();

// Public company branding (logo, name, tagline for login screen & public preview)
// Excludes internal banking, PAN, GST, and private metadata
router.get('/company/public', settingsController.getPublicCompany);

router.use(authenticate);

// Company Profile (Full internal details restricted to authorized staff)
router.get('/company', settingsController.getCompany);
router.put('/company', authorizeRoles('SUPER_ADMIN', 'ADMIN'), validateBody(updateCompanySchema), settingsController.updateCompany);

// Company Logos & Seals Asset Management
router.get('/assets', settingsController.listAssets);
router.post('/assets', authorizeRoles('SUPER_ADMIN', 'ADMIN'), validateBody(createAssetSchema), settingsController.addAsset);
router.put('/assets/:id/primary', authorizeRoles('SUPER_ADMIN', 'ADMIN'), settingsController.setPrimaryAsset);
router.delete('/assets/:id', authorizeRoles('SUPER_ADMIN', 'ADMIN'), settingsController.deleteAsset);

// Digital Signature PIN (Strictly rate-limited against brute force attacks)
router.post('/change-pin', authorizeRoles('SUPER_ADMIN', 'ADMIN'), signaturePinLimiter, validateBody(updatePinSchema), settingsController.changePin);

// Document Templates
router.get('/templates', settingsController.getTemplates);
router.put('/templates/:id', authorizeRoles('SUPER_ADMIN', 'ADMIN'), validateBody(updateTemplateSchema), settingsController.updateTemplate);

// Numbering configuration
router.get('/numbering', settingsController.getNumbering);
router.put('/numbering/:id', authorizeRoles('SUPER_ADMIN', 'ADMIN'), validateBody(updateNumberingSchema), settingsController.updateNumbering);

// Audit logs (Protected security logs accessible strictly by Super Admin and Admin)
router.get('/audit-logs', authorizeRoles('SUPER_ADMIN', 'ADMIN'), settingsController.getAuditLogs);

// Users / Staff management
router.get('/users', authorizeRoles('SUPER_ADMIN', 'ADMIN'), settingsController.getUsers);
router.post('/users', authorizeRoles('SUPER_ADMIN', 'ADMIN'), validateBody(createUserSchema), settingsController.createUser);
router.put('/users/:id', authorizeRoles('SUPER_ADMIN', 'ADMIN'), validateBody(updateUserSchema), settingsController.updateUser);
router.delete('/users/:id', authorizeRoles('SUPER_ADMIN', 'ADMIN'), settingsController.deleteUser);

export default router;
