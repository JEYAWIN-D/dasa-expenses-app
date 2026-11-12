import * as employeeService from './employee.service.js';
import { apiSuccess, apiPaginated, apiError } from '../../utils/response.js';

export async function listEmployees(req, res) {
  try {
    const page = parseInt(req.query.page || '1', 10);
    const limit = parseInt(req.query.limit || '20', 10);
    const search = req.query.search || '';
    const status = req.query.status || '';
    const department = req.query.department || '';
    const verificationStatus = req.query.verificationStatus || '';

    const result = await employeeService.getEmployeesList({
      page,
      limit,
      search,
      status,
      department,
      verificationStatus,
    });

    return apiPaginated(
      res,
      result.employees,
      {
        total: result.total,
        page: result.page,
        limit: result.limit,
      },
      'Employees list retrieved successfully',
      { metrics: result.metrics }
    );
  } catch (error) {
    return apiError(res, error.message, 500);
  }
}

export async function getEmployeeSummary(req, res) {
  try {
    const result = await employeeService.getEmployeesList({ page: 1, limit: 1 });
    return apiSuccess(res, result.metrics, 'Employee metrics summary retrieved successfully');
  } catch (error) {
    return apiError(res, error.message, 500);
  }
}

export async function getEmployee(req, res) {
  try {
    const unmasked = req.query.unmasked === 'true';
    const employee = await employeeService.getEmployeeById(req.params.id, { unmasked });
    return apiSuccess(res, employee, 'Employee profile retrieved successfully');
  } catch (error) {
    return apiError(res, error.message, 404);
  }
}

export async function createEmployee(req, res) {
  try {
    const employee = await employeeService.createEmployee(req.body, req.user);
    return apiSuccess(res, employee, 'Employee onboarded successfully', 201);
  } catch (error) {
    return apiError(res, error.message, 400);
  }
}

export async function updateEmployee(req, res) {
  try {
    const employee = await employeeService.updateEmployee(req.params.id, req.body, req.user);
    return apiSuccess(res, employee, 'Employee profile updated successfully');
  } catch (error) {
    return apiError(res, error.message, 400);
  }
}

export async function submitKyc(req, res) {
  try {
    const doc = await employeeService.submitKycDocument(req.params.id, req.body, req.user);
    return apiSuccess(res, doc, 'KYC document submitted successfully', 201);
  } catch (error) {
    return apiError(res, error.message, 400);
  }
}

export async function verifyKyc(req, res) {
  try {
    const { status, rejectionReason } = req.body;
    if (!['VERIFIED', 'REJECTED'].includes(status)) {
      return apiError(res, 'Verification status must be VERIFIED or REJECTED.', 400);
    }
    const result = await employeeService.verifyKycDocument(
      req.params.id,
      req.params.docId,
      { status, rejectionReason },
      req.user
    );
    return apiSuccess(res, result, `Document has been marked as ${status}`);
  } catch (error) {
    return apiError(res, error.message, 400);
  }
}

export async function allocateAsset(req, res) {
  try {
    const asset = await employeeService.allocateAsset(req.params.id, req.body, req.user);
    return apiSuccess(res, asset, 'IT asset allocated successfully', 201);
  } catch (error) {
    return apiError(res, error.message, 400);
  }
}

export async function returnAsset(req, res) {
  try {
    const asset = await employeeService.returnAsset(req.params.id, req.params.assetId, req.body, req.user);
    return apiSuccess(res, asset, 'IT asset return recorded successfully');
  } catch (error) {
    return apiError(res, error.message, 400);
  }
}

export async function updateBgv(req, res) {
  try {
    const bgv = await employeeService.updateBgvStatus(req.params.id, req.body, req.user);
    return apiSuccess(res, bgv, 'BGV status updated successfully');
  } catch (error) {
    return apiError(res, error.message, 400);
  }
}

export async function updateProbation(req, res) {
  try {
    const emp = await employeeService.updateProbationReview(req.params.id, req.body, req.user);
    return apiSuccess(res, emp, 'Probation review recorded successfully');
  } catch (error) {
    return apiError(res, error.message, 400);
  }
}

export async function generateDocument(req, res) {
  try {
    const { documentType, issueDate } = req.body;
    if (!documentType) {
      return apiError(res, 'documentType is required (e.g. APPOINTMENT_LETTER, NDA_IP_AGREEMENT, SALARY_ANNEXURE, RELIEVING_LETTER, CODE_OF_CONDUCT, APPRAISAL_LETTER)', 400);
    }
    const generated = await employeeService.generateLegalDocument(
      req.params.id,
      documentType,
      { issueDate },
      req.user
    );
    return apiSuccess(res, generated, `${generated.title} generated successfully`, 201);
  } catch (error) {
    return apiError(res, error.message, 400);
  }
}

export async function calculateSalaryBreakdown(req, res) {
  try {
    const annualCtc = parseFloat(req.query.annualCtc || req.body.annualCtc || 0);
    const breakdown = employeeService.calculateSalaryBreakup(annualCtc);
    return apiSuccess(res, breakdown, 'CTC breakdown calculated successfully');
  } catch (error) {
    return apiError(res, error.message, 400);
  }
}
