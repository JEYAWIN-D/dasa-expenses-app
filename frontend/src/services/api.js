const BASE_URL = '/api';

export async function request(endpoint, options = {}) {
  const token = localStorage.getItem('bizfinance_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
    config.body = JSON.stringify(options.body);
  }

  let response;
  try {
    response = await fetch(`${BASE_URL}${endpoint}`, config);
  } catch (networkError) {
    throw new Error('Network error. Unable to reach backend server.');
  }

  // Handle Unauthorized 401
  if (response.status === 401 && !endpoint.includes('/auth/login')) {
    localStorage.removeItem('bizfinance_token');
    localStorage.removeItem('bizfinance_user');
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMsg = data?.message || `Request failed with status ${response.status}`;
    const err = new Error(errorMsg);
    err.status = response.status;
    err.errors = data?.errors;
    throw err;
  }

  return data;
}

export const api = {
  get: (url, params = {}) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        searchParams.append(key, val);
      }
    });
    const queryString = searchParams.toString();
    const finalUrl = queryString ? `${url}?${queryString}` : url;
    return request(finalUrl, { method: 'GET' });
  },
  post: (url, body = {}) => request(url, { method: 'POST', body }),
  put: (url, body = {}) => request(url, { method: 'PUT', body }),
  patch: (url, body = {}) => request(url, { method: 'PATCH', body }),
  delete: (url) => request(url, { method: 'DELETE' }),
};
