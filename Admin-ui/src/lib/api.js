const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api/v1/admin';

const STORAGE_TOKEN = 'rideon-token';
const STORAGE_ADMIN = 'rideon-admin';
const STORAGE_PERMS = 'rideon-permissions';

let refreshPromise = null;

function clearAuthStorage() {
  localStorage.removeItem(STORAGE_TOKEN);
  localStorage.removeItem(STORAGE_ADMIN);
  localStorage.removeItem(STORAGE_PERMS);
}

function redirectToLogin() {
  clearAuthStorage();
  if (!window.location.pathname.startsWith('/login')) {
    window.location.href = '/login';
  }
}

/**
 * Refresh access token using HttpOnly adminRefreshToken cookie.
 * Single-flight: concurrent 401s share one refresh call.
 */
async function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const res = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const err = new Error(data.message || 'Session expired');
        err.status = res.status;
        throw err;
      }
      const payload = data.data || data;
      const token = payload.accessToken || payload.token;
      if (!token) throw Object.assign(new Error('No access token in refresh response'), { status: 401 });

      localStorage.setItem(STORAGE_TOKEN, token);
      if (payload.admin) {
        localStorage.setItem(STORAGE_ADMIN, JSON.stringify(payload.admin));
        const perms = payload.admin.permissions || payload.permissions;
        if (Array.isArray(perms)) {
          localStorage.setItem(STORAGE_PERMS, JSON.stringify(perms));
        }
      }
      return token;
    })().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

export async function apiRequest(path, options = {}, _retried = false) {
  const token = localStorage.getItem(STORAGE_TOKEN);
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  const isAuthRoute =
    path.startsWith('/auth/login') ||
    path.startsWith('/auth/refresh') ||
    path.startsWith('/auth/logout');

  // Access token expired → refresh once and retry
  if (res.status === 401 && !isAuthRoute && !_retried) {
    try {
      await refreshAccessToken();
      return apiRequest(path, options, true);
    } catch {
      redirectToLogin();
      const err = new Error('Unauthorized');
      err.status = 401;
      throw err;
    }
  }

  if (res.status === 401 && !isAuthRoute) {
    redirectToLogin();
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
