import * as clientService from './client.service.js';
import { apiSuccess, apiPaginated, apiError } from '../../utils/response.js';

export async function listClients(req, res) {
  try {
    const page = parseInt(req.query.page || '1', 10);
    const limit = parseInt(req.query.limit || '10', 10);
    const search = req.query.search || '';
    const status = req.query.status || '';
    const tag = req.query.tag || '';
    const organizationId = req.orgId || null;

    const result = await clientService.getClientsList({ page, limit, search, status, tag, organizationId });
    return apiPaginated(res, result.clients, {
      total: result.total,
      page: result.page,
      limit: result.limit,
    });
  } catch (error) {
    return apiError(res, error.message, 500);
  }
}

export async function quickSearchClients(req, res) {
  try {
    const query = req.query.q || '';
    const organizationId = req.orgId || null;
    const clients = await clientService.searchClientsQuick(query, organizationId);
    return apiSuccess(res, clients, 'Clients fetched');
  } catch (error) {
    return apiError(res, error.message, 500);
  }
}

export async function getClient(req, res) {
  try {
    const organizationId = req.orgId || null;
    const client = await clientService.getClientById(req.params.id, organizationId);
    return apiSuccess(res, client, 'Client details retrieved');
  } catch (error) {
    return apiError(res, error.message, 404);
  }
}

export async function createClient(req, res) {
  try {
    const payload = { ...req.body, organizationId: req.orgId || req.body.organizationId };
    const client = await clientService.createClient(payload, req.user);
    return apiSuccess(res, client, 'Client created successfully', 201);
  } catch (error) {
    return apiError(res, error.message, 400);
  }
}

export async function updateClient(req, res) {
  try {
    const organizationId = req.orgId || null;
    const client = await clientService.updateClient(req.params.id, req.body, req.user, organizationId);
    return apiSuccess(res, client, 'Client updated successfully');
  } catch (error) {
    return apiError(res, error.message, 400);
  }
}

export async function deleteClient(req, res) {
  try {
    const organizationId = req.orgId || null;
    const result = await clientService.deleteClient(req.params.id, req.user, organizationId);
    return apiSuccess(res, result, 'Client deleted successfully');
  } catch (error) {
    return apiError(res, error.message, 400);
  }
}
