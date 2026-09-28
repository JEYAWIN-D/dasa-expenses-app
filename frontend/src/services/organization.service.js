import api from './api.js';

export const orgApi = {
  // Current Workspace Context
  getCurrentOrg: () => api.get('/org/current'),
  updateCurrentOrg: (data) => api.put('/org/current', data),

  // Team & Staff Members
  getTeamMembers: () => api.get('/org/members'),
  inviteMember: (data) => api.post('/org/invitations', data),
  createDirectMember: (data) => api.post('/org/members/direct', data),
  updateMemberStatus: (id, status) => api.patch(`/org/members/${id}/status`, { status }),
  updateMemberDob: (id, dob) => api.patch(`/org/members/${id}/dob`, { dob }),
  removeMember: (id) => api.delete(`/org/members/${id}`),

  // Roles & Granular Permissions
  getRoles: () => api.get('/org/roles'),
  createCustomRole: (data) => api.post('/org/roles', data),
  updateRole: (id, data) => api.put(`/org/roles/${id}`, data),
  deleteRole: (id) => api.delete(`/org/roles/${id}`),
  clearAllRoles: () => api.delete('/org/roles/all'),

  // Subscription & Resource Entitlements
  getSubscriptionBilling: () => api.get('/org/subscription'),

  // Cloud Storage & Tenant Documents
  getStorageOverview: () => api.get('/org/storage'),
  getDocuments: (params) => api.get('/org/documents', { params }),
  uploadDocument: (data) => api.post('/org/documents', data),
  deleteDocument: (id) => api.delete(`/org/documents/${id}`),

  // Financial Ledger & Journals
  getJournalEntries: (params) => api.get('/org/journals', { params }),
  reverseJournalEntry: (id, data) => api.post(`/org/journals/reverse/${id}`, data),

  // Workspace Security Center
  getSecurityOverview: () => api.get('/org/security'),
  updateSecuritySettings: (data) => api.post('/org/security/settings', data),
  revokeSession: (id) => api.delete(`/org/security/sessions/${id}`),
};

export const organizationService = {
  ...orgApi,
  getCurrentOrg: async () => (await api.get('/org/current')).data,
  getMembers: async () => (await api.get('/org/members')).data,
  inviteMember: async (data) => (await api.post('/org/invitations', data)).data,
  getRoles: async () => (await api.get('/org/roles')).data,
  createRole: async (data) => (await api.post('/org/roles', data)).data,
  createDirectMember: async (data) => (await api.post('/org/members/direct', data)).data,
  deleteRole: async (id) => (await api.delete(`/org/roles/${id}`)).data,
  clearAllRoles: async () => (await api.delete('/org/roles/all')).data,
  getStorageOverview: async () => (await api.get('/org/storage')).data,
  getDocuments: async (params) => (await api.get('/org/documents', { params })).data,
  uploadDocument: async (data) => (await api.post('/org/documents', data)).data,
  getJournals: async (params) => (await api.get('/org/journals', { params })).data,
  reverseJournal: async (id, data) => (await api.post(`/org/journals/reverse/${id}`, data)).data,
  getSecurity: async () => (await api.get('/org/security')).data,
};

export default orgApi;
