import { Router } from 'express';
import * as accountController from './account.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { authorizeRoles } from '../../middleware/rbac.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/', accountController.getAccounts);
router.post('/', authorizeRoles('SUPER_ADMIN', 'ADMIN', 'FINANCE'), accountController.createAccount);
router.put('/:id', authorizeRoles('SUPER_ADMIN', 'ADMIN', 'FINANCE'), accountController.updateAccount);
router.post('/transfer', authorizeRoles('SUPER_ADMIN', 'ADMIN', 'FINANCE'), accountController.transferFunds);
router.get('/:id/transactions', accountController.getAccountTransactions);

export default router;
