import * as invoiceService from './invoice.service.js';
import { apiSuccess, apiPaginated, apiError } from '../../utils/response.js';

export async function listInvoices(req, res) {
  try {
    const page = parseInt(req.query.page || '1', 10);
    const limit = parseInt(req.query.limit || '10', 10);
    const search = req.query.search || '';
    const status = req.query.status || '';
    const clientId = req.query.clientId || '';

    const result = await invoiceService.getInvoicesList({ page, limit, search, status, clientId });
    return apiPaginated(res, result.invoices, {
      total: result.total,
      page: result.page,
      limit: result.limit,
    });
  } catch (error) {
    return apiError(res, error.message, 500);
  }
}

export async function getInvoice(req, res) {
  try {
    const invoice = await invoiceService.getInvoiceById(req.params.id);
    return apiSuccess(res, invoice, 'Invoice retrieved successfully');
  } catch (error) {
    return apiError(res, error.message, 404);
  }
}

export async function createInvoice(req, res) {
  try {
    const invoice = await invoiceService.createInvoice(req.body, req.user);
    return apiSuccess(res, invoice, 'Invoice created successfully', 201);
  } catch (error) {
    return apiError(res, error.message, 400);
  }
}

export async function signInvoice(req, res) {
  try {
    const invoice = await invoiceService.signInvoice(req.params.id, req.body.pin, req.user);
    return apiSuccess(res, invoice, 'Invoice digitally signed successfully');
  } catch (error) {
    return apiError(res, error.message, 400);
  }
}

export async function unsignInvoice(req, res) {
  try {
    const invoice = await invoiceService.unsignInvoice(req.params.id, req.user);
    return apiSuccess(res, invoice, 'Digital signature removed from invoice successfully');
  } catch (error) {
    return apiError(res, error.message, 400);
  }
}

export async function getReminders(req, res) {
  try {
    const summary = await invoiceService.getPaymentRemindersSummary();
    return apiSuccess(res, summary, 'Payment reminders summary fetched');
  } catch (error) {
    return apiError(res, error.message, 500);
  }
}

export async function deleteInvoice(req, res) {
  try {
    const result = await invoiceService.deleteInvoice(req.params.id, req.user);
    return apiSuccess(res, result, 'Invoice deleted successfully');
  } catch (error) {
    return apiError(res, error.message, 400);
  }
}
