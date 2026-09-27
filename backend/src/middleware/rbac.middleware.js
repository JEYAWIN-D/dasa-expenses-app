import { apiError } from '../utils/response.js';

/**
 * Middleware factory for Role-Based Access Control
 * @param {string[]} allowedRoles - List of permitted roles
 */
export function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return apiError(res, 'Unauthorized. Please login.', 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      return apiError(
        res,
        `Access denied. Role '${req.user.role}' is not authorized for this resource.`,
        403
      );
    }

    next();
  };
}
