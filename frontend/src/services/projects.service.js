import { api } from './api.js';

export const projectsService = {
  getProjects: (params = {}) => api.get('/projects', params),
  getProjectById: (id) => api.get(`/projects/${id}`),
  createProject: (data) => api.post('/projects', data),
  convertQuotation: (quotationId, data = {}) => api.post(`/projects/convert-quotation/${quotationId}`, data),
  updateProject: (id, data) => api.put(`/projects/${id}`, data),
  deleteProject: (id) => api.delete(`/projects/${id}`),
  
  // Milestones
  addMilestone: (projectId, data) => api.post(`/projects/${projectId}/milestones`, data),
  updateMilestone: (projectId, milestoneId, data) => api.put(`/projects/${projectId}/milestones/${milestoneId}`, data),
  deleteMilestone: (projectId, milestoneId) => api.delete(`/projects/${projectId}/milestones/${milestoneId}`),

  // Handover Verification & Clearance
  verifyAndHandover: (projectId, data) => api.post(`/projects/${projectId}/handover`, data),

  // Official Documents & Letters Generation
  getDocumentData: (projectId, docType, params = {}) => api.get(`/projects/${projectId}/documents/${docType}`, params),
};
