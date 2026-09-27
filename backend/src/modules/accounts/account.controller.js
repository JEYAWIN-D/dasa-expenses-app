import * as accountService from './account.service.js';
import { apiSuccess, apiError } from '../../utils/response.js';

export async function getAccounts(req, res) {
  try {
    const data = await accountService.getAccountsSummary();
    return apiSuccess(res, data, 'Accounts summary retrieved');
  } catch (error) {
    return apiError(res, error.message, 500);
  }
}

export async function createAccount(req, res) {
  try {
    const account = await accountService.createAccount(req.body, req.user);
    return apiSuccess(res, account, 'Account created successfully', 201);
  } catch (error) {
    return apiError(res, error.message, 400);
  }
}

export async function updateAccount(req, res) {
  try {
    const account = await accountService.updateAccount(req.params.id, req.body, req.user);
    return apiSuccess(res, account, 'Account updated successfully');
  } catch (error) {
    return apiError(res, error.message, 400);
  }
}

export async function transferFunds(req, res) {
  try {
    const result = await accountService.transferBetweenAccounts(req.body, req.user);
    return apiSuccess(res, result, 'Funds transferred successfully');
  } catch (error) {
    return apiError(res, error.message, 400);
  }
}

export async function getAccountTransactions(req, res) {
  try {
    const page = parseInt(req.query.page || '1', 10);
    const limit = parseInt(req.query.limit || '20', 10);
    const result = await accountService.getAccountTransactions(req.params.id, { page, limit });
    return apiSuccess(res, result, 'Account transactions retrieved');
  } catch (error) {
    return apiError(res, error.message, 500);
  }
}
