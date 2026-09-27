import * as negotiationService from './negotiation.service.js';
import { apiSuccess, apiError } from '../../utils/response.js';

export async function getNegotiations(req, res) {
  try {
    const list = await negotiationService.getNegotiationsByQuotation(req.params.quotationId);
    return apiSuccess(res, list, 'Negotiation history retrieved');
  } catch (error) {
    return apiError(res, error.message, 500);
  }
}

export async function addRound(req, res) {
  try {
    const result = await negotiationService.addNegotiationRound(req.body, req.user);
    return apiSuccess(res, result, 'Negotiation round recorded successfully', 201);
  } catch (error) {
    return apiError(res, error.message, 400);
  }
}
