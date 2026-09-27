import { ENV } from '../config/env.js';
import { apiError } from '../utils/response.js';

export function errorHandler(err, req, res, next) {
  console.error('Unhandled Application Error:', err);

  // Prisma unique constraint violation (P2002)
  if (err.code === 'P2002') {
    const target = err.meta?.target ? `Duplicate field: ${err.meta.target}` : 'Record with unique field already exists';
    return apiError(res, target, 409);
  }

  // Prisma record not found (P2025)
  if (err.code === 'P2025') {
    return apiError(res, 'Requested resource was not found.', 404);
  }

  const statusCode = err.statusCode || 500;
  const message = statusCode === 500 && ENV.NODE_ENV === 'production'
    ? 'Internal Server Error'
    : err.message || 'An unexpected error occurred';

  return apiError(res, message, statusCode);
}

export function notFoundHandler(req, res) {
  return apiError(res, `Route not found: ${req.method} ${req.originalUrl}`, 404);
}
