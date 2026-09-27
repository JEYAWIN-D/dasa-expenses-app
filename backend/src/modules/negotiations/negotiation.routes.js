import { Router } from 'express';
import * as negotiationController from './negotiation.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { validateBody } from '../../middleware/validate.middleware.js';
import { addNegotiationSchema } from './negotiation.validation.js';

const router = Router();

router.use(authenticate);

router.get('/:quotationId', negotiationController.getNegotiations);
router.post('/', validateBody(addNegotiationSchema), negotiationController.addRound);

export default router;
