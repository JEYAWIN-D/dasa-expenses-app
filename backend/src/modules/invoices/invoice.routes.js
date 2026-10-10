import { Router } from 'express';
import * as invoiceController from './invoice.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { validateBody } from '../../middleware/validate.middleware.js';
import { signaturePinLimiter } from '../../middleware/security.middleware.js';
import { createInvoiceSchema, signInvoiceSchema } from './invoice.validation.js';

const router = Router();

router.use(authenticate);

router.get('/reminders', invoiceController.getReminders);
router.get('/', invoiceController.listInvoices);
router.get('/:id', invoiceController.getInvoice);
router.post('/', validateBody(createInvoiceSchema), invoiceController.createInvoice);
router.post('/:id/sign', signaturePinLimiter, validateBody(signInvoiceSchema), invoiceController.signInvoice);
router.post('/:id/unsign', invoiceController.unsignInvoice);
router.delete('/:id', invoiceController.deleteInvoice);

export default router;
