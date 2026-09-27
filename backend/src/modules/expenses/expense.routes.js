import { Router } from 'express';
import * as expenseController from './expense.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { authorizeRoles } from '../../middleware/rbac.middleware.js';
import { validateBody } from '../../middleware/validate.middleware.js';
import { createExpenseSchema, updateExpenseSchema } from './expense.validation.js';

const router = Router();

router.use(authenticate);

router.get('/cashflow', expenseController.getCashflow);
router.get('/', expenseController.listExpenses);
router.get('/:id', expenseController.getExpense);
router.post('/', validateBody(createExpenseSchema), expenseController.createExpense);
router.put('/:id', validateBody(updateExpenseSchema), expenseController.updateExpense);
router.patch('/:id/approve', authorizeRoles('SUPER_ADMIN', 'ADMIN', 'FINANCE', 'MANAGER'), expenseController.approveExpense);
router.post('/:id/reimburse', authorizeRoles('SUPER_ADMIN', 'ADMIN', 'FINANCE'), expenseController.reimburseExpense);
router.delete('/:id', authorizeRoles('SUPER_ADMIN', 'ADMIN', 'FINANCE'), expenseController.deleteExpense);

export default router;
