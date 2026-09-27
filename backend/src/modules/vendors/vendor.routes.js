import { Router } from 'express';
import * as vendorController from './vendor.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { validateBody } from '../../middleware/validate.middleware.js';
import { createVendorSchema, updateVendorSchema } from './vendor.validation.js';

const router = Router();

router.use(authenticate);

router.get('/', vendorController.listVendors);
router.get('/search', vendorController.quickSearchVendors);
router.get('/:id', vendorController.getVendor);
router.post('/', validateBody(createVendorSchema), vendorController.createVendor);
router.put('/:id', validateBody(updateVendorSchema), vendorController.updateVendor);
router.delete('/:id', vendorController.deleteVendor);

export default router;
