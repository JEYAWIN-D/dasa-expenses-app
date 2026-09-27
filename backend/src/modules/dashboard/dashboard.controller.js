import * as dashboardService from './dashboard.service.js';
import { apiSuccess, apiError } from '../../utils/response.js';

export async function getDashboard(req, res) {
  try {
    const data = await dashboardService.getDashboardMetrics();
    return apiSuccess(res, data, 'Dashboard metrics loaded');
  } catch (error) {
    return apiError(res, error.message, 500);
  }
}
