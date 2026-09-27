import { loginUser, getCurrentUser, getSetupStatus, setupInitialAdmin } from './auth.service.js';
import { apiSuccess, apiError } from '../../utils/response.js';
import { logAudit } from '../../utils/audit.service.js';

export async function login(req, res) {
  try {
    const { email, password, rememberMe } = req.body;
    const ipAddress = req.ip || req.connection?.remoteAddress;

    const result = await loginUser(email, password, rememberMe, ipAddress);
    return apiSuccess(res, result, 'Login successful');
  } catch (error) {
    return apiError(res, error.message, 401);
  }
}

export async function getMe(req, res) {
  try {
    const user = await getCurrentUser(req.user.id);
    return apiSuccess(res, user, 'User profile fetched successfully');
  } catch (error) {
    return apiError(res, error.message, 404);
  }
}

export async function logout(req, res) {
  try {
    if (req.user) {
      await logAudit({
        userId: req.user.id,
        userEmail: req.user.email,
        module: 'AUTH',
        action: 'LOGOUT',
        ipAddress: req.ip || req.connection?.remoteAddress,
        details: `User ${req.user.email} logged out`,
      });
    }
    return apiSuccess(res, null, 'Logged out successfully');
  } catch (error) {
    return apiError(res, 'Logout failed', 500);
  }
}

export async function checkSetup(req, res) {
  try {
    const status = await getSetupStatus();
    return apiSuccess(res, status, 'Setup status fetched');
  } catch (error) {
    return apiError(res, error.message, 500);
  }
}

export async function initialSetup(req, res) {
  try {
    const ipAddress = req.ip || req.connection?.remoteAddress;
    const result = await setupInitialAdmin(req.body, ipAddress);
    return apiSuccess(res, result, result.message, 201);
  } catch (error) {
    return apiError(res, error.message, 400);
  }
}
