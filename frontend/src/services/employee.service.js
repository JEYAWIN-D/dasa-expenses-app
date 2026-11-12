import api from './api.js';

export const employeeService = {
  // Get paginated employee list with filters & metrics
  getEmployees: async (params = {}) => {
    return api.get('/employees', params);
  },

  // Get metrics summary
  getSummary: async () => {
    return api.get('/employees/summary');
  },

  // Get single employee details
  getEmployeeById: async (id, unmasked = false) => {
    return api.get(`/employees/${id}`, { unmasked });
  },

  // Onboard new candidate / create employee
  createEmployee: async (data) => {
    return api.post('/employees', data);
  },

  // Update employee profile
  updateEmployee: async (id, data) => {
    return api.put(`/employees/${id}`, data);
  },

  // Submit KYC document
  submitKyc: async (employeeId, docData) => {
    return api.post(`/employees/${employeeId}/kyc`, docData);
  },

  // Verify KYC document (Approve or Reject with reason)
  verifyKyc: async (employeeId, docId, statusData) => {
    return api.post(`/employees/${employeeId}/kyc/${docId}/verify`, statusData);
  },

  // Allocate IT Hardware Asset
  allocateAsset: async (employeeId, assetData) => {
    return api.post(`/employees/${employeeId}/assets`, assetData);
  },

  // Return IT Asset
  returnAsset: async (employeeId, assetId, returnData) => {
    return api.post(`/employees/${employeeId}/assets/${assetId}/return`, returnData);
  },

  // Update BGV Stage Check
  updateBgv: async (employeeId, bgvData) => {
    return api.post(`/employees/${employeeId}/bgv`, bgvData);
  },

  // Probation Review & Confirmation
  updateProbation: async (employeeId, reviewData) => {
    return api.post(`/employees/${employeeId}/probation`, reviewData);
  },

  // Generate HR Legal Document
  generateDocument: async (employeeId, documentType, options = {}) => {
    return api.post(`/employees/${employeeId}/documents/generate`, {
      documentType,
      ...options,
    });
  },

  // Calculate live CTC breakdown
  calculateCtc: async (annualCtc) => {
    return api.post('/employees/calculate-ctc', { annualCtc });
  },
};

export default employeeService;
