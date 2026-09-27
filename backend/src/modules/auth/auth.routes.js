import { Router } from 'express';
import { login, getMe, logout, checkSetup, initialSetup } from './auth.controller.js';
import { validateBody } from '../../middleware/validate.middleware.js';
import { authLimiter } from '../../middleware/security.middleware.js';
import { loginSchema, initialSetupSchema } from './auth.validation.js';
import { authenticate } from '../../middleware/auth.middleware.js';

const router = Router();

router.get('/setup-status', checkSetup);
router.post('/initial-setup', authLimiter, validateBody(initialSetupSchema), initialSetup);
router.post('/login', authLimiter, validateBody(loginSchema), login);
router.get('/me', authenticate, getMe);
router.post('/logout', authenticate, logout);

export default router;

