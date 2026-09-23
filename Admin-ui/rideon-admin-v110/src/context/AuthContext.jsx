import {
  createContext,
  useContext,
  useMemo,
  useState,
  useCallback,
  useEffect,
} from 'react';
import { api } from '../lib/api';

const AuthContext = createContext(null);

const STORAGE_TOKEN = 'rideon-token';
const STORAGE_ADMIN = 'rideon-admin';
const STORAGE_PERMS = 'rideon-permissions';

/** Normalize admin payload so nested objects (role, campus, etc.) never break React render */
function normalizeAdmin(raw) {
  if (!raw || typeof raw !== 'object') return raw;
  const role =
    typeof raw.role === 'string'
      ? raw.role
      : raw.role?.name || raw.roleName || raw.role?.title || null;
  const name =
    typeof raw.name === 'string'
      ? raw.name
      : raw.name?.name || raw.fullName || raw.email || 'Admin';
  return {
    ...raw,
    name,
    role: role || 'Admin',
    roleId: raw.role?.id || raw.roleId || null,
    avatarInitials:
      raw.avatarInitials ||
      (typeof name === 'string'
        ? name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .slice(0, 2)
            .toUpperCase()
        : 'AD'),
  };
}

function loadStored() {
  try {
    const token = localStorage.getItem(STORAGE_TOKEN);
    const adminRaw = localStorage.getItem(STORAGE_ADMIN);
    const permsRaw = localStorage.getItem(STORAGE_PERMS);
    const parsedAdmin = adminRaw ? JSON.parse(adminRaw) : null;
    return {
      token: token || null,
      admin: parsedAdmin ? normalizeAdmin(parsedAdmin) : null,
      permissions: permsRaw ? JSON.parse(permsRaw) : [],
    };
  } catch {
    return { token: null, admin: null, permissions: [] };
  }
}

function persist(token, admin, permissions) {
  if (token) localStorage.setItem(STORAGE_TOKEN, token);
  else localStorage.removeItem(STORAGE_TOKEN);
  if (admin) localStorage.setItem(STORAGE_ADMIN, JSON.stringify(admin));
  else localStorage.removeItem(STORAGE_ADMIN);
  if (permissions?.length)
    localStorage.setItem(STORAGE_PERMS, JSON.stringify(permissions));
  else localStorage.removeItem(STORAGE_PERMS);
}

export function AuthProvider({ children }) {
  const stored = loadStored();
  const [admin, setAdmin] = useState(stored.admin);
  const [accessToken, setAccessToken] = useState(stored.token);
  const [permissions, setPermissions] = useState(stored.permissions);
  const [bootstrapping, setBootstrapping] = useState(!!stored.token);

  const isAuthenticated = Boolean(accessToken && admin);

  const clearSession = useCallback(() => {
    setAdmin(null);
    setAccessToken(null);
    setPermissions([]);
    persist(null, null, []);
  }, []);

  // Restore / validate session on startup
  useEffect(() => {
    let cancelled = false;
    async function validate() {
      if (!stored.token) {
        setBootstrapping(false);
        return;
      }
      try {
        const res = await api.get('/auth/me');
        if (cancelled) return;
        const data = res.data || res;
        const nextAdmin = normalizeAdmin(data.admin || data.user || data);
        const nextPerms =
          data.permissions ||
          nextAdmin.permissions ||
          stored.permissions ||
          [];
        const token = localStorage.getItem(STORAGE_TOKEN) || stored.token;
        setAdmin(nextAdmin);
        setAccessToken(token);
        setPermissions(Array.isArray(nextPerms) ? nextPerms : []);
        persist(token, nextAdmin, nextPerms);
      } catch (err) {
        // api layer already attempts refresh on 401; if still 401, clear session
        if (!cancelled && err?.status === 401) {
          clearSession();
        }
        // keep existing stored data on network errors so offline refresh still works
      } finally {
        if (!cancelled) setBootstrapping(false);
      }
    }
    validate();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const data = res.data || res;
    const token = data.accessToken || data.token;
    const nextAdmin = normalizeAdmin(data.admin || data.user || data);
    const nextPerms = data.permissions || nextAdmin.permissions || [];

    if (!token) {
      throw new Error(res.message || 'Login failed — no token returned');
    }

    setAccessToken(token);
    setAdmin(nextAdmin);
    setPermissions(Array.isArray(nextPerms) ? nextPerms : []);
    persist(token, nextAdmin, nextPerms);
    return { success: true, admin: nextAdmin };
  }, []);

  const logout = useCallback(async () => {
    try {
      if (accessToken) {
        await api.post('/auth/logout', {});
      }
    } catch {
      // ignore logout API errors
    } finally {
      clearSession();
    }
  }, [accessToken, clearSession]);

  const hasPermission = useCallback(
    (perm) => {
      if (!perm) return true;
      if (!permissions || permissions.length === 0) {
        // If no permissions list but we have a SUPER_ADMIN role, allow all
        // (backend remains the real authority)
        const role = admin?.role;
        const roleName = typeof role === 'string' ? role : role?.name;
        if (roleName === 'SUPER_ADMIN' || roleName === 'SUPERADMIN') return true;
        return false;
      }
      if (permissions.includes('*') || permissions.includes('admin.*')) return true;
      return permissions.includes(perm);
    },
    [permissions, admin]
  );

  const value = useMemo(
    () => ({
      admin,
      accessToken,
      permissions,
      isAuthenticated,
      bootstrapping,
      login,
      logout,
      hasPermission,
      clearSession,
      setAdmin,
      setAccessToken,
      setPermissions,
    }),
    [
      admin,
      accessToken,
      permissions,
      isAuthenticated,
      bootstrapping,
      login,
      logout,
      hasPermission,
      clearSession,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
