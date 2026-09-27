export function apiSuccess(res, data = null, message = 'Success', statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
}

export function apiPaginated(res, items = [], pagination = {}, message = 'Data retrieved successfully', extra = {}) {
  return res.status(200).json({
    success: true,
    message,
    data: items,
    pagination: {
      total: pagination.total || 0,
      page: pagination.page || 1,
      limit: pagination.limit || 10,
      totalPages: pagination.limit ? Math.ceil((pagination.total || 0) / pagination.limit) : 1,
    },
    meta: extra,
  });
}

export function apiError(res, message = 'An error occurred', statusCode = 500, errors = null) {
  return res.status(statusCode).json({
    success: false,
    message,
    ...(errors && { errors }),
  });
}
