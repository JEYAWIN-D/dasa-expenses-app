import { api } from './api.js';

export const accountsService = {
  getAccounts: () => api.get('/accounts'),
  createAccount: (data) => api.post('/accounts', data),
  updateAccount: (id, data) => api.put(`/accounts/${id}`, data),
  transferFunds: (data) => api.post('/accounts/transfer', data),
  getAccountTransactions: (id, params = {}) => api.get(`/accounts/${id}/transactions`, params),
};
