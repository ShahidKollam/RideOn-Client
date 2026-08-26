const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api/v1/admin';

export async function apiRequest(path, options = {}) {
  const token = localStorage.getItem('rideon-token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  // Avoid redirect loop on login/me endpoints
  const isAuthRoute = path.startsWith('/auth/');

  if (res.status === 401 && !isAuthRoute) {
    localStorage.removeItem('rideon-token');
    localStorage.removeItem('rideon-admin');
    localStorage.removeItem('rideon-permissions');
    if (!window.location.pathname.startsWith('/login')) {
      window.location.href = '/login';
    }
    const err = new Error('Unauthorized');
    err.status = 401;
    throw err;
  }

  if (res.status === 403) {
    const err = new Error('Forbidden');
    err.status = 403;
    throw err;
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const err = new Error(data.message || 'Request failed');
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

export const api = {
  get: (path, opts) => apiRequest(path, { ...opts, method: 'GET' }),
  post: (path, body, opts) =>
    apiRequest(path, { ...opts, method: 'POST', body: JSON.stringify(body ?? {}) }),
  patch: (path, body, opts) =>
    apiRequest(path, { ...opts, method: 'PATCH', body: JSON.stringify(body ?? {}) }),
  put: (path, body, opts) =>
    apiRequest(path, { ...opts, method: 'PUT', body: JSON.stringify(body ?? {}) }),
  delete: (path, opts) => apiRequest(path, { ...opts, method: 'DELETE' }),
};
