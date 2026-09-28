import jwt from 'jsonwebtoken';
import { ENV } from '../config/env.js';
import { prisma } from '../config/prisma.js';
import { apiError } from '../utils/response.js';

/**
 * Authentication Middleware for DASA TECH Platform Administration
 * Enforces a strict separate authentication boundary for platform staff.
 */
export async function authenticatePlatform(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return apiError(res, 'Platform Admin authorization token required.', 401);
    }

    const token = authHeader.split(' ')[1];

    let decoded;
    try {
      decoded = jwt.verify(token, ENV.JWT_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return apiError(res, 'Platform session expired. Please re-authenticate.', 401);
      }
      return apiError(res, 'Invalid platform authentication token.', 401);
    }

    // Verify user is in PlatformUser table and active
    const platformUser = await prisma.platformUser.findUnique({
      where: { id: decoded.userId || decoded.platformUserId },
    });

    if (!platformUser || platformUser.status !== 'ACTIVE') {
      return apiError(res, 'Access Denied: Unrecognized or inactive Platform Administrator account.', 403);
    }

    req.platformUser = platformUser;
    req.isPlatformUser = true;
    next();
  } catch (error) {
    console.error('Platform authentication failure:', error);
    return apiError(res, 'Platform authentication check failed.', 500);
  }
}

/**
 * Role-Based Access Control for Platform Staff
 * @param  {...string} allowedRoles - PLATFORM_OWNER, PLATFORM_ADMIN, FINANCE_ADMIN, SUPPORT_ADMIN, SECURITY_ADMIN, INFRA_ADMIN, READONLY_AUDITOR
 */
export function requirePlatformRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.platformUser) {
      return apiError(res, 'Platform authorization required.', 401);
    }

    // PLATFORM_OWNER has global access to all platform functions
    if (req.platformUser.platformRole === 'PLATFORM_OWNER') {
      return next();
    }

    if (!allowedRoles.includes(req.platformUser.platformRole)) {
      return apiError(
        res,
        `Access Denied: Platform role '${req.platformUser.platformRole}' is not authorized for this operation.`,
        403
      );
    }

    next();
  };
}
