import * as paymentService from './payment.service.js';
import { apiSuccess, apiPaginated, apiError } from '../../utils/response.js';

export async function listPayments(req, res) {
  try {
    const page = parseInt(req.query.page || '1', 10);
    const limit = parseInt(req.query.limit || '10', 10);
    const search = req.query.search || '';
    const paymentMode = req.query.paymentMode || '';
    const clientId = req.query.clientId || '';
    const invoiceId = req.query.invoiceId || '';

    const result = await paymentService.getPaymentsList({ page, limit, search, paymentMode, clientId, invoiceId });
    return apiPaginated(res, result.payments, {
      total: result.total,
      page: result.page,
      limit: result.limit,
    });
  } catch (error) {
    return apiError(res, error.message, 500);
  }
}

export async function getPayment(req, res) {
  try {
    const payment = await paymentService.getPaymentById(req.params.id);
    return apiSuccess(res, payment, 'Payment receipt retrieved successfully');
  } catch (error) {
    return apiError(res, error.message, 404);
  }
}

export async function createPayment(req, res) {
  try {
    const payment = await paymentService.recordPayment(req.body, req.user);
    return apiSuccess(res, payment, 'Payment recorded successfully', 201);
  } catch (error) {
    return apiError(res, error.message, 400);
  }
}

export async function signPayment(req, res) {
  try {
    const payment = await paymentService.signPayment(req.params.id, req.body.pin, req.user);
    return apiSuccess(res, payment, 'Payment receipt digitally signed successfully');
  } catch (error) {
    return apiError(res, error.message, 400);
  }
}

export async function unsignPayment(req, res) {
  try {
    const payment = await paymentService.unsignPayment(req.params.id, req.user);
    return apiSuccess(res, payment, 'Digital signature removed from payment successfully');
  } catch (error) {
    return apiError(res, error.message, 400);
  }
}
