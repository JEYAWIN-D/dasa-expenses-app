import * as expenseService from './expense.service.js';
import { apiSuccess, apiPaginated, apiError } from '../../utils/response.js';

export async function listExpenses(req, res) {
  try {
    const page = parseInt(req.query.page || '1', 10);
    const limit = parseInt(req.query.limit || '20', 10);
    const search = req.query.search || '';
    const category = req.query.category || '';
    const vendorId = req.query.vendorId || '';
    const projectId = req.query.projectId || '';
    const approvalStatus = req.query.approvalStatus || '';
    const isReimbursable = req.query.isReimbursable || '';
    const startDate = req.query.startDate || '';
    const endDate = req.query.endDate || '';

    const result = await expenseService.getExpensesList({
      page,
      limit,
      search,
      category,
      vendorId,
      projectId,
      approvalStatus,
      isReimbursable,
      startDate,
      endDate,
    });
    return apiPaginated(res, result.expenses, {
      total: result.total,
      page: result.page,
      limit: result.limit,
    }, 'Expenses retrieved', { totalExpenseAmount: result.totalExpenseAmount });
  } catch (error) {
    return apiError(res, error.message, 500);
  }
}

export async function getExpense(req, res) {
  try {
    const expense = await expenseService.getExpenseById(req.params.id);
    return apiSuccess(res, expense, 'Expense details retrieved');
  } catch (error) {
    return apiError(res, error.message, 404);
  }
}

export async function createExpense(req, res) {
  try {
    const expense = await expenseService.createExpense(req.body, req.user);
    return apiSuccess(res, expense, 'Expense recorded successfully', 201);
  } catch (error) {
    return apiError(res, error.message, 400);
  }
}

export async function updateExpense(req, res) {
  try {
    const expense = await expenseService.updateExpense(req.params.id, req.body, req.user);
    return apiSuccess(res, expense, 'Expense updated successfully');
  } catch (error) {
    return apiError(res, error.message, 400);
  }
}

export async function approveExpense(req, res) {
  try {
    const expense = await expenseService.approveExpense(req.params.id, req.user);
    return apiSuccess(res, expense, 'Expense approved successfully');
  } catch (error) {
    return apiError(res, error.message, 400);
  }
}

export async function reimburseExpense(req, res) {
  try {
    const { accountId } = req.body;
    if (!accountId) {
      return apiError(res, 'Payment accountId is required for reimbursement', 400);
    }
    const expense = await expenseService.reimburseExpense(req.params.id, accountId, req.user);
    return apiSuccess(res, expense, 'Expense marked as reimbursed and paid out');
  } catch (error) {
    return apiError(res, error.message, 400);
  }
}

export async function deleteExpense(req, res) {
  try {
    const result = await expenseService.deleteExpense(req.params.id, req.user);
    return apiSuccess(res, result, 'Expense deleted successfully');
  } catch (error) {
    return apiError(res, error.message, 400);
  }
}

export async function getCashflow(req, res) {
  try {
    const { period, startDate, endDate } = req.query;
    const cashflow = await expenseService.getCashflowOverview({ period, startDate, endDate });
    return apiSuccess(res, cashflow, 'Cashflow overview calculated successfully');
  } catch (error) {
    return apiError(res, error.message, 500);
  }
}
