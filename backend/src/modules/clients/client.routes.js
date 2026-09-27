import { Router } from 'express';
import * as clientController from './client.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { validateBody } from '../../middleware/validate.middleware.js';
import { createClientSchema, updateClientSchema } from './client.validation.js';

const router = Router();

router.use(authenticate);

router.get('/', clientController.listClients);
router.get('/search', clientController.quickSearchClients);
router.get('/:id', clientController.getClient);
router.post('/', validateBody(createClientSchema), clientController.createClient);
router.put('/:id', validateBody(updateClientSchema), clientController.updateClient);
router.delete('/:id', clientController.deleteClient);

export default router;
