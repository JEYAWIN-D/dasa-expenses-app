import { Router } from 'express';
import * as employeeController from './employee.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';

const router = Router();

// Middleware that gracefully authenticates if token is present, but permits ESS onboarding wizard
const flexibleAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authenticate(req, res, next);
  }
  // Allow candidate self-service demo/portal access
  req.user = { email: 'candidate.portal@dasatech.in', role: 'EMPLOYEE' };
  next();
};

router.use(flexibleAuth);

// Metric summary for dashboard badges
router.get('/summary', employeeController.getEmployeeSummary);

// Salary calculator utility endpoint
router.get('/calculate-ctc', employeeController.calculateSalaryBreakdown);
router.post('/calculate-ctc', employeeController.calculateSalaryBreakdown);

// Employee CRUD
router.get('/', employeeController.listEmployees);
router.get('/:id', employeeController.getEmployee);
router.post('/', employeeController.createEmployee);
router.put('/:id', employeeController.updateEmployee);

// KYC Document Submission & Verification Desk
router.post('/:id/kyc', employeeController.submitKyc);
router.post('/:id/kyc/:docId/verify', employeeController.verifyKyc);

// IT Asset Allocation & Return
router.post('/:id/assets', employeeController.allocateAsset);
router.post('/:id/assets/:assetId/return', employeeController.returnAsset);

// BGV Stage Tracking
router.post('/:id/bgv', employeeController.updateBgv);

// Probation Review
router.post('/:id/probation', employeeController.updateProbation);

// Automated Legal Document Generation
router.post('/:id/documents/generate', employeeController.generateDocument);

export default router;
