import { Router } from 'express';
import * as quotationController from './quotation.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { validateBody } from '../../middleware/validate.middleware.js';
import { signaturePinLimiter } from '../../middleware/security.middleware.js';
import {
  createQuotationSchema,
  updateQuotationSchema,
  reviseQuotationSchema,
  signDocumentSchema,
  updateStatusSchema,
} from './quotation.validation.js';

const router = Router();

router.use(authenticate);

router.get('/', quotationController.listQuotations);
router.get('/:id', quotationController.getQuotation);
router.post('/', validateBody(createQuotationSchema), quotationController.createQuotation);
router.post('/:id/revise', validateBody(reviseQuotationSchema), quotationController.reviseQuotation);
router.patch('/:id/status', validateBody(updateStatusSchema), quotationController.updateStatus);
router.post('/:id/sign', signaturePinLimiter, validateBody(signDocumentSchema), quotationController.signQuotation);
router.post('/:id/convert-to-invoice', quotationController.convertToInvoice);
router.delete('/:id', quotationController.deleteQuotation);

export default router;
