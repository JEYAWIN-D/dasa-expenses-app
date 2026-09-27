import * as leadService from './leads.service.js';
import { apiSuccess, apiPaginated, apiError } from '../../utils/response.js';

export async function submitDemoRequest(req, res) {
  try {
    const { fullName, companyName, email, phone } = req.body;
    if (!fullName || !companyName || !email || !phone) {
      return apiError(res, 'Full name, company name, email, and phone number are required', 400);
    }

    const lead = await leadService.createDemoLead(req.body);
    return apiSuccess(res, lead, 'Thank you! Your demo request has been received. Our team at DASA TECH will reach out shortly to schedule your personalized walkthrough.', 201);
  } catch (error) {
    console.error('Error in submitDemoRequest:', error);
    return apiError(res, error.message || 'Failed to submit demo request', 500);
  }
}

export async function listDemoLeads(req, res) {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const { status, search } = req.query;

    const result = await leadService.getDemoLeadsList({ page, limit, status, search });
    return apiPaginated(res, result.leads, { total: result.total, page, limit }, 'Demo leads fetched successfully', {
      countsByStatus: result.countsByStatus,
    });
  } catch (error) {
    console.error('Error in listDemoLeads:', error);
    return apiError(res, error.message || 'Failed to fetch demo leads', 500);
  }
}

export async function getDemoLead(req, res) {
  try {
    const lead = await leadService.getDemoLeadById(req.params.id);
    return apiSuccess(res, lead, 'Demo lead retrieved');
  } catch (error) {
    console.error('Error in getDemoLead:', error);
    return apiError(res, error.message || 'Failed to retrieve lead', 404);
  }
}

export async function updateDemoLead(req, res) {
  try {
    const updated = await leadService.updateDemoLead(req.params.id, req.body, req.user);
    return apiSuccess(res, updated, 'Demo lead updated successfully');
  } catch (error) {
    console.error('Error in updateDemoLead:', error);
    return apiError(res, error.message || 'Failed to update lead', 500);
  }
}

export async function deleteDemoLead(req, res) {
  try {
    await leadService.deleteDemoLead(req.params.id, req.user);
    return apiSuccess(res, null, 'Demo lead removed successfully');
  } catch (error) {
    console.error('Error in deleteDemoLead:', error);
    return apiError(res, error.message || 'Failed to delete lead', 500);
  }
}
