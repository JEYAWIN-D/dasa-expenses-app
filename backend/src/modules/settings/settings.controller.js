import * as settingsService from './settings.service.js';
import { apiSuccess, apiPaginated, apiError } from '../../utils/response.js';

export async function getPublicCompany(req, res) {
  try {
    const profile = await settingsService.getPublicCompanyProfile();
    return apiSuccess(res, profile, 'Public company profile fetched');
  } catch (error) {
    return apiError(res, error.message, 500);
  }
}

export async function getCompany(req, res) {
  try {
    const profile = await settingsService.getCompanyProfile();
    return apiSuccess(res, profile, 'Company profile fetched');
  } catch (error) {
    return apiError(res, error.message, 500);
  }
}

export async function updateCompany(req, res) {
  try {
    const profile = await settingsService.updateCompanyProfile(req.body, req.user);
    return apiSuccess(res, profile, 'Company profile updated successfully');
  } catch (error) {
    return apiError(res, error.message, 400);
  }
}

export async function listAssets(req, res) {
  try {
    const type = req.query.type || null;
    const assets = await settingsService.getCompanyAssets(type);
    return apiSuccess(res, assets, 'Assets fetched successfully');
  } catch (error) {
    return apiError(res, error.message, 500);
  }
}

export async function addAsset(req, res) {
  try {
    const asset = await settingsService.createCompanyAsset(req.body, req.user);
    return apiSuccess(res, asset, 'Asset uploaded successfully', 201);
  } catch (error) {
    return apiError(res, error.message, 400);
  }
}

export async function setPrimaryAsset(req, res) {
  try {
    const asset = await settingsService.setPrimaryCompanyAsset(req.params.id, req.user);
    return apiSuccess(res, asset, 'Primary asset updated');
  } catch (error) {
    return apiError(res, error.message, 400);
  }
}

export async function deleteAsset(req, res) {
  try {
    const result = await settingsService.deleteCompanyAsset(req.params.id, req.user);
    return apiSuccess(res, result, 'Asset deleted successfully');
  } catch (error) {
    return apiError(res, error.message, 400);
  }
}

export async function changePin(req, res) {
  try {
    const result = await settingsService.changeSignaturePin(req.body, req.user);
    return apiSuccess(res, result, 'Digital signature PIN changed successfully');
  } catch (error) {
    return apiError(res, error.message, 400);
  }
}

export async function getTemplates(req, res) {
  try {
    const templates = await settingsService.getDocumentTemplates();
    return apiSuccess(res, templates, 'Document templates fetched');
  } catch (error) {
    return apiError(res, error.message, 500);
  }
}

export async function updateTemplate(req, res) {
  try {
    const template = await settingsService.updateDocumentTemplate(req.params.id, req.body, req.user);
    return apiSuccess(res, template, 'Document template updated successfully');
  } catch (error) {
    return apiError(res, error.message, 400);
  }
}

export async function getNumbering(req, res) {
  try {
    const configs = await settingsService.getNumberingConfigs();
    return apiSuccess(res, configs, 'Numbering configurations fetched');
  } catch (error) {
    return apiError(res, error.message, 500);
  }
}

export async function updateNumbering(req, res) {
  try {
    const config = await settingsService.updateNumberingConfig(req.params.id, req.body, req.user);
    return apiSuccess(res, config, 'Numbering configuration updated successfully');
  } catch (error) {
    return apiError(res, error.message, 400);
  }
}

export async function getAuditLogs(req, res) {
  try {
    const page = parseInt(req.query.page || '1', 10);
    const limit = parseInt(req.query.limit || '20', 10);
    const module = req.query.module || '';
    const action = req.query.action || '';

    const result = await settingsService.getAuditLogsList({ page, limit, module, action });
    return apiPaginated(res, result.logs, {
      total: result.total,
      page: result.page,
      limit: result.limit,
    });
  } catch (error) {
    return apiError(res, error.message, 500);
  }
}

export async function getUsers(req, res) {
  try {
    const users = await settingsService.getUsersList();
    return apiSuccess(res, users, 'Users fetched');
  } catch (error) {
    return apiError(res, error.message, 500);
  }
}

export async function createUser(req, res) {
  try {
    const user = await settingsService.createUser(req.body, req.user);
    return apiSuccess(res, user, 'Staff user created successfully', 201);
  } catch (error) {
    return apiError(res, error.message, 400);
  }
}

export async function updateUser(req, res) {
  try {
    const user = await settingsService.updateUser(req.params.id, req.body, req.user);
    return apiSuccess(res, user, 'Staff user updated successfully');
  } catch (error) {
    return apiError(res, error.message, 400);
  }
}

export async function deleteUser(req, res) {
  try {
    const result = await settingsService.deleteUser(req.params.id, req.user);
    return apiSuccess(res, result, 'Staff user deleted successfully');
  } catch (error) {
    return apiError(res, error.message, 400);
  }
}
