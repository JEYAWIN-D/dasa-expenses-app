import { ENV } from '../config/env.js';
import { apiError } from '../utils/response.js';

export function errorHandler(err, req, res, next) {
  // CORS policy rejection
  if (err.message && err.message.includes('Blocked by CORS policy')) {
    return apiError(res, err.message, 403);
  }

  // Prisma unique constraint violation (P2002)
  if (err.code === 'P2002') {
    const target = err.meta?.target ? `Duplicate field: ${Array.isArray(err.meta.target) ? err.meta.target.join(', ') : err.meta.target}` : 'Record with unique field already exists';
    return apiError(res, target, 409);
  }

  // Prisma record not found (P2025)
  if (err.code === 'P2025') {
    return apiError(res, 'Requested resource was not found.', 404);
  }

  // Safe logging without leaking internal query or DB structure
  console.error(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - Error:`, err.message || err);

  const statusCode = err.statusCode || (err.status && typeof err.status === 'number' ? err.status : 500);
  const message = statusCode === 500 && ENV.NODE_ENV === 'production'
    ? 'Internal Server Error'
    : err.message || 'An unexpected error occurred';

  return apiError(res, message, statusCode);
}

export function notFoundHandler(req, res) {
  return apiError(res, `Route not found: ${req.method} ${req.originalUrl}`, 404);
}
