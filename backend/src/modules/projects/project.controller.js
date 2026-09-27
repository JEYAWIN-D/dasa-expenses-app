import * as projectService from './project.service.js';
import { apiSuccess, apiPaginated, apiError } from '../../utils/response.js';

export async function listProjects(req, res) {
  try {
    const page = parseInt(req.query.page || '1', 10);
    const limit = parseInt(req.query.limit || '20', 10);
    const search = req.query.search || '';
    const status = req.query.status || '';
    const clientId = req.query.clientId || '';
    const handoverStatus = req.query.handoverStatus || '';

    const result = await projectService.getProjectsList({ page, limit, search, status, clientId, handoverStatus });
    return apiPaginated(
      res,
      result.projects,
      {
        total: result.total,
        page: result.page,
        limit: result.limit,
      },
      'Projects retrieved successfully',
      { portfolioSummary: result.portfolioSummary }
    );
  } catch (error) {
    return apiError(res, error.message, 500);
  }
}

export async function getProject(req, res) {
  try {
    const project = await projectService.getProjectById(req.params.id);
    return apiSuccess(res, project, 'Project retrieved successfully');
  } catch (error) {
    return apiError(res, error.message, 404);
  }
}

export async function createProject(req, res) {
  try {
    const project = await projectService.createProject(req.body, req.user);
    return apiSuccess(res, project, 'Project created successfully', 201);
  } catch (error) {
    return apiError(res, error.message, 400);
  }
}

export async function convertQuotation(req, res) {
  try {
    const project = await projectService.convertQuotationToProject(req.params.quotationId, req.body, req.user);
    return apiSuccess(res, project, 'Quotation converted to project successfully', 201);
  } catch (error) {
    return apiError(res, error.message, 400);
  }
}

export async function updateProject(req, res) {
  try {
    const project = await projectService.updateProject(req.params.id, req.body, req.user);
    return apiSuccess(res, project, 'Project updated successfully');
  } catch (error) {
    return apiError(res, error.message, 400);
  }
}

export async function addMilestone(req, res) {
  try {
    const milestone = await projectService.addMilestone(req.params.id, req.body, req.user);
    return apiSuccess(res, milestone, 'Milestone added successfully', 201);
  } catch (error) {
    return apiError(res, error.message, 400);
  }
}

export async function updateMilestone(req, res) {
  try {
    const milestone = await projectService.updateMilestone(req.params.milestoneId, req.body, req.user);
    return apiSuccess(res, milestone, 'Milestone updated successfully');
  } catch (error) {
    return apiError(res, error.message, 400);
  }
}

export async function deleteMilestone(req, res) {
  try {
    await projectService.deleteMilestone(req.params.milestoneId);
    return apiSuccess(res, null, 'Milestone deleted successfully');
  } catch (error) {
    return apiError(res, error.message, 400);
  }
}

export async function handoverProject(req, res) {
  try {
    const project = await projectService.verifyAndHandoverProject(req.params.id, req.body, req.user);
    return apiSuccess(res, project, 'Final payment verified and project handover authorized successfully');
  } catch (error) {
    return apiError(res, error.message, 400);
  }
}

export async function getDocumentData(req, res) {
  try {
    const data = await projectService.getProjectDocumentData(req.params.id, req.params.docType, req.query);
    return apiSuccess(res, data, 'Document data generated successfully');
  } catch (error) {
    return apiError(res, error.message, 400);
  }
}
