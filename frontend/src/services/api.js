const BASE_URL = '/api';

export async function request(endpoint, options = {}) {
  const isPlatform = endpoint.startsWith('/platform') || window.location.pathname.startsWith('/platform-admin');
  const token = isPlatform
    ? (localStorage.getItem('dasa_platform_token') || localStorage.getItem('bizfinance_token'))
    : localStorage.getItem('bizfinance_token');

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
    if (isPlatform) {
      localStorage.removeItem('dasa_platform_token');
      localStorage.removeItem('dasa_platform_user');
      if (window.location.pathname !== '/platform-admin/login') {
        window.location.href = '/platform-admin/login';
      }
    } else {
      localStorage.removeItem('bizfinance_token');
      localStorage.removeItem('bizfinance_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
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
  get: async (url, params = {}) => {
    const searchParams = new URLSearchParams();
    const p = params?.params || params;
    Object.entries(p).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        searchParams.append(key, val);
      }
    });
    const queryString = searchParams.toString();
    const finalUrl = queryString ? `${url}?${queryString}` : url;
    const res = await request(finalUrl, { method: 'GET' });
    return { data: res, ...res };
  },
  post: async (url, body = {}) => {
    const res = await request(url, { method: 'POST', body });
    return { data: res, ...res };
  },
  put: async (url, body = {}) => {
    const res = await request(url, { method: 'PUT', body });
    return { data: res, ...res };
  },
  patch: async (url, body = {}) => {
    const res = await request(url, { method: 'PATCH', body });
    return { data: res, ...res };
  },
  delete: async (url) => {
    const res = await request(url, { method: 'DELETE' });
    return { data: res, ...res };
  },
};

export default api;
