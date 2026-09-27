import { apiError } from '../utils/response.js';

export function validateBody(schema) {
  return (req, res, next) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err) {
      if (err.errors) {
        const errorDetails = err.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        }));
        return apiError(res, 'Validation error', 400, errorDetails);
      }
      return apiError(res, 'Invalid request data', 400);
    }
  };
}

export function validateQuery(schema) {
  return (req, res, next) => {
    try {
      req.query = schema.parse(req.query);
      next();
    } catch (err) {
      if (err.errors) {
        const errorDetails = err.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        }));
        return apiError(res, 'Query parameter validation error', 400, errorDetails);
      }
      return apiError(res, 'Invalid query parameters', 400);
    }
  };
}
