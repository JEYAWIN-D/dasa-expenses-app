import * as reportService from './report.service.js';
import { apiSuccess, apiError } from '../../utils/response.js';

export async function getSalesReport(req, res) {
  try {
    const { startDate, endDate } = req.query;
    const report = await reportService.getSalesReport({ startDate, endDate });
    return apiSuccess(res, report, 'Sales report generated');
  } catch (error) {
    return apiError(res, error.message, 500);
  }
}

export async function getRevenueReport(req, res) {
  try {
    const year = parseInt(req.query.year || new Date().getFullYear(), 10);
    const report = await reportService.getRevenueReport({ year });
    return apiSuccess(res, report, 'Revenue report generated');
  } catch (error) {
    return apiError(res, error.message, 500);
  }
}

export async function getExpensesReport(req, res) {
  try {
    const { startDate, endDate } = req.query;
    const report = await reportService.getExpensesReport({ startDate, endDate });
    return apiSuccess(res, report, 'Expenses report generated');
  } catch (error) {
    return apiError(res, error.message, 500);
  }
}

export async function getClientBalances(req, res) {
  try {
    const report = await reportService.getClientBalancesReport();
    return apiSuccess(res, report, 'Client balances report generated');
  } catch (error) {
    return apiError(res, error.message, 500);
  }
}

export async function getProjectsFinancialReport(req, res) {
  try {
    const { status, clientId, startDate, endDate } = req.query;
    const report = await reportService.getProjectsFinancialReport({ status, clientId, startDate, endDate });
    return apiSuccess(res, report, 'Projects financial report generated');
  } catch (error) {
    return apiError(res, error.message, 500);
  }
}

export async function getGstTaxReport(req, res) {
  try {
    const { startDate, endDate, clientId } = req.query;
    const report = await reportService.getGstTaxReport({ startDate, endDate, clientId });
    return apiSuccess(res, report, 'GST tax report generated');
  } catch (error) {
    return apiError(res, error.message, 500);
  }
}

export async function getPaymentsCollectedReport(req, res) {
  try {
    const { startDate, endDate, paymentMode, clientId, projectId } = req.query;
    const report = await reportService.getPaymentsCollectedReport({ startDate, endDate, paymentMode, clientId, projectId });
    return apiSuccess(res, report, 'Payments collected report generated');
  } catch (error) {
    return apiError(res, error.message, 500);
  }
}
