import { Router } from 'express';
import * as paymentController from './payment.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { validateBody } from '../../middleware/validate.middleware.js';
import { signaturePinLimiter } from '../../middleware/security.middleware.js';
import { recordPaymentSchema, signPaymentSchema } from './payment.validation.js';

const router = Router();

router.use(authenticate);

router.get('/', paymentController.listPayments);
router.get('/:id', paymentController.getPayment);
router.post('/', validateBody(recordPaymentSchema), paymentController.createPayment);
router.post('/:id/sign', signaturePinLimiter, validateBody(signPaymentSchema), paymentController.signPayment);

export default router;
