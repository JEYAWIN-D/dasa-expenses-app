import api from './api.js';

export const platformApi = {
  // Authentication
  login: (credentials) => api.post('/platform/auth/login', credentials),
  getMe: () => api.get('/platform/auth/me'),

  // Dashboard Overview
  getOverview: () => api.get('/platform/dashboard/overview'),

  // Organizations
  listOrganizations: (params) => api.get('/platform/organizations', { params }),
  getOrganizationDetails: (id) => api.get(`/platform/organizations/${id}`),
  updateOrganizationStatus: (id, data) => api.patch(`/platform/organizations/${id}/status`, data),
  updateSubscription: (id, data) => api.post(`/platform/organizations/${id}/subscription`, data),
  grantOverride: (id, data) => api.post(`/platform/organizations/${id}/overrides`, data),

  // Subscription Plans
  getPlans: () => api.get('/platform/subscriptions/plans'),
  updatePlan: (id, data) => api.put(`/platform/subscriptions/plans/${id}`, data),

  // Demo Requests
  getDemoRequests: (params) => api.get('/platform/demo-requests', { params }),
  updateDemoRequest: (id, data) => api.patch(`/platform/demo-requests/${id}`, data),
  convertDemoToOrg: (id, data) => api.post(`/platform/demo-requests/${id}/convert`, data),

  // Security Operations Center (SOC)
  getSocEvents: (params) => api.get('/platform/security/soc', { params }),
  resolveSocEvent: (id, data) => api.patch(`/platform/security/events/${id}`, data),

  // Audit Logs & System Health
  getAuditLogs: (params) => api.get('/platform/audit-logs', { params }),
  getSystemHealth: () => api.get('/platform/system-health'),
};

export const platformService = {
  ...platformApi,
  login: async (credentials) => (await api.post('/platform/auth/login', credentials)).data,
  getMe: async () => (await api.get('/platform/auth/me')).data,
  getOverview: async () => (await api.get('/platform/dashboard/overview')).data,
  listOrganizations: async (params) => (await api.get('/platform/organizations', { params })).data,
  getOrganizationDetails: async (id) => (await api.get(`/platform/organizations/${id}`)).data,
  updateOrganizationStatus: async (id, data) => (await api.patch(`/platform/organizations/${id}/status`, data)).data,
  updateSubscription: async (id, data) => (await api.post(`/platform/organizations/${id}/subscription`, data)).data,
  grantOverride: async (id, data) => (await api.post(`/platform/organizations/${id}/overrides`, data)).data,
  getPlans: async () => (await api.get('/platform/subscriptions/plans')).data,
  updatePlan: async (id, data) => (await api.put(`/platform/subscriptions/plans/${id}`, data)).data,
  getDemoRequests: async () => (await api.get('/platform/demo-requests')).data,
  convertDemoRequest: async (id, data) => (await api.post(`/platform/demo-requests/${id}/convert`, data)).data,
  getSecurityEvents: async () => (await api.get('/platform/security/soc')).data,
  updateSecurityEvent: async (id, data) => (await api.patch(`/platform/security/events/${id}`, data)).data,
  getAuditLogs: async () => (await api.get('/platform/audit-logs')).data,
  getSystemHealth: async () => (await api.get('/platform/system-health')).data,
};

export default platformApi;
