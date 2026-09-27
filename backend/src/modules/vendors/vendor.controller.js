import * as vendorService from './vendor.service.js';
import { apiSuccess, apiPaginated, apiError } from '../../utils/response.js';

export async function listVendors(req, res) {
  try {
    const page = parseInt(req.query.page || '1', 10);
    const limit = parseInt(req.query.limit || '10', 10);
    const search = req.query.search || '';
    const status = req.query.status || '';

    const result = await vendorService.getVendorsList({ page, limit, search, status });
    return apiPaginated(res, result.vendors, {
      total: result.total,
      page: result.page,
      limit: result.limit,
    });
  } catch (error) {
    return apiError(res, error.message, 500);
  }
}

export async function quickSearchVendors(req, res) {
  try {
    const query = req.query.q || '';
    const vendors = await vendorService.searchVendorsQuick(query);
    return apiSuccess(res, vendors, 'Vendors retrieved');
  } catch (error) {
    return apiError(res, error.message, 500);
  }
}

export async function getVendor(req, res) {
  try {
    const vendor = await vendorService.getVendorById(req.params.id);
    return apiSuccess(res, vendor, 'Vendor details retrieved');
  } catch (error) {
    return apiError(res, error.message, 404);
  }
}

export async function createVendor(req, res) {
  try {
    const vendor = await vendorService.createVendor(req.body, req.user);
    return apiSuccess(res, vendor, 'Vendor created successfully', 201);
  } catch (error) {
    return apiError(res, error.message, 400);
  }
}

export async function updateVendor(req, res) {
  try {
    const vendor = await vendorService.updateVendor(req.params.id, req.body, req.user);
    return apiSuccess(res, vendor, 'Vendor updated successfully');
  } catch (error) {
    return apiError(res, error.message, 400);
  }
}

export async function deleteVendor(req, res) {
  try {
    const result = await vendorService.deleteVendor(req.params.id, req.user);
    return apiSuccess(res, result, 'Vendor deleted successfully');
  } catch (error) {
    return apiError(res, error.message, 400);
  }
}
