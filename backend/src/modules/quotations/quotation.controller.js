import * as quotationService from './quotation.service.js';
import { apiSuccess, apiPaginated, apiError } from '../../utils/response.js';

export async function listQuotations(req, res) {
  try {
    const page = parseInt(req.query.page || '1', 10);
    const limit = parseInt(req.query.limit || '10', 10);
    const search = req.query.search || '';
    const status = req.query.status || '';
    const clientId = req.query.clientId || '';
    const projectId = req.query.projectId || '';
    const tab = req.query.tab || '';

    const result = await quotationService.getQuotationsList({ page, limit, search, status, clientId, projectId, tab });
    return res.json({
      success: true,
      data: result.quotations,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: Math.ceil(result.total / result.limit),
      },
      counts: result.counts,
      message: 'Quotations retrieved successfully',
    });
  } catch (error) {
    return apiError(res, error.message, 500);
  }
}

export async function getQuotation(req, res) {
  try {
    const quotation = await quotationService.getQuotationById(req.params.id);
    return apiSuccess(res, quotation, 'Quotation retrieved successfully');
  } catch (error) {
    return apiError(res, error.message, 404);
  }
}

export async function createQuotation(req, res) {
  try {
    const quotation = await quotationService.createQuotation(req.body, req.user);
    return apiSuccess(res, quotation, 'Quotation created successfully', 201);
  } catch (error) {
    return apiError(res, error.message, 400);
  }
}

export async function updateQuotation(req, res) {
  try {
    const quotation = await quotationService.updateQuotation(req.params.id, req.body, req.user);
    return apiSuccess(res, quotation, 'Quotation updated successfully');
  } catch (error) {
    return apiError(res, error.message, 400);
  }
}

export async function reviseQuotation(req, res) {
  try {
    const quotation = await quotationService.reviseQuotation(req.params.id, req.body, req.user);
    return apiSuccess(res, quotation, 'Quotation revised successfully');
  } catch (error) {
    return apiError(res, error.message, 400);
  }
}

export async function updateStatus(req, res) {
  try {
    const quotation = await quotationService.updateQuotationStatus(req.params.id, req.body.status, req.user);
    return apiSuccess(res, quotation, 'Quotation status updated');
  } catch (error) {
    return apiError(res, error.message, 400);
  }
}

export async function signQuotation(req, res) {
  try {
    const quotation = await quotationService.signQuotation(req.params.id, req.body.pin, req.user);
    return apiSuccess(res, quotation, 'Quotation digitally signed successfully');
  } catch (error) {
    return apiError(res, error.message, 400);
  }
}

export async function convertToInvoice(req, res) {
  try {
    const invoice = await quotationService.convertQuotationToInvoice(req.params.id, req.user);
    return apiSuccess(res, invoice, 'Quotation successfully converted to invoice', 201);
  } catch (error) {
    return apiError(res, error.message, 400);
  }
}

export async function deleteQuotation(req, res) {
  try {
    const result = await quotationService.deleteQuotation(req.params.id, req.user);
    return apiSuccess(res, result, 'Quotation deleted successfully');
  } catch (error) {
    return apiError(res, error.message, 400);
  }
}
