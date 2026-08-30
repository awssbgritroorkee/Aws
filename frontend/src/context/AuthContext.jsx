import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getUserContext } from '../services/api';

/**
 * AuthContext — centralised auth state shared across the entire app.
 *
 * Shape:
 *   user    : { name, email, picture } | null   (raw Google profile data)
 *   context : { id, email, is_staff, is_superuser, is_team_member, groups, picture } | null
 *   loading : bool  (true during the initial session restore)
 *
 * Methods:
 *   login(userData, authToken)  — called after a successful Google SSO exchange
 *   logout()                    — clears all auth state
 *   refreshContext()            — re-fetches /api/auth/user-context/ from the backend
 */

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [context, setContext] = useState(null);
  const [loading, setLoading] = useState(true);  // true until we finish restoring session

  // ── Refresh rich permission context from backend ──────────────────────────
  const refreshContext = useCallback(async () => {
    try {
      const cached = localStorage.getItem('user_context');
      if (cached) setContext(JSON.parse(cached));

      const { data } = await getUserContext();
      setContext(data);
      localStorage.setItem('user_context', JSON.stringify(data));

      // Back-fill picture if the user object is missing it
      setUser((prev) => {
        if (prev && !prev.picture && data.picture) {
          const updated = { ...prev, picture: data.picture };
          localStorage.setItem('user_data', JSON.stringify(updated));
          return updated;
        }
        return prev;
      });
    } catch (err) {
      // 401 is handled by the Axios interceptor in api.js (auto-logout)
      console.warn('[AuthContext] Could not fetch permissions:', err?.response?.status);
    }
  }, []);

  // ── Login — called by GoogleLoginButton after successful backend exchange ──
  const login = useCallback((userData, authToken) => {
    localStorage.setItem('auth_token', authToken);
    localStorage.setItem('user_data', JSON.stringify(userData));
    setUser(userData);
  }, []);

  // ── Logout — called by GoogleLoginButton's handleLogout ───────────────────
  const logout = useCallback(() => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    localStorage.removeItem('user_context');
    setUser(null);
    setContext(null);
  }, []);

  // ── Restore session from localStorage on initial mount ────────────────────
  useEffect(() => {
    const savedUser  = localStorage.getItem('user_data');
    const savedToken = localStorage.getItem('auth_token');

    if (savedUser && savedToken) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('user_data');
        localStorage.removeItem('auth_token');
        setLoading(false);
        return;
      }
      // Refresh context from backend (401 → interceptor triggers auto-logout)
      refreshContext().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AuthContext.Provider value={{ user, context, loading, login, logout, refreshContext }}>
      {children}
    </AuthContext.Provider>
  );
};

/** Convenience hook — throws if used outside <AuthProvider> */
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
};

export default AuthContext;
