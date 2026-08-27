import { useState, useEffect, useRef, useCallback } from 'react';
import { useGoogleLogin, googleLogout } from '@react-oauth/google';
import axios from 'axios';
import { getUserContext } from '../services/api';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// ── SSO bridge URL builder ────────────────────────────────────────────────────
// Builds a URL to the Admin SSO endpoint, passing the current auth token so
// the backend can establish a session cookie and redirect into the admin panel.
const ssoUrl = (nextAdminPath = '/admin/') => {
  const token = localStorage.getItem('auth_token') || '';
  const base  = import.meta.env.VITE_API_URL ||
                import.meta.env.VITE_API_BASE_URL ||
                'https://aws-swae.onrender.com';
  const next  = encodeURIComponent(nextAdminPath);
  return `${base}/api/auth/admin-sso/?token=${token}&next=${next}`;
};

// ── Admin dashboard path helpers ─────────────────────────────────────────────
// Access is now gated purely on is_staff / is_superuser (set in Django Admin)
// so ANY group a superadmin creates will automatically grant dashboard access.
// Group names are still displayed as info badges in the dropdown header.
const ADMIN_DASHBOARD_PATH  = '/admin/';
const EVENTS_DASHBOARD_PATH = '/admin/events/event/';
const GALLERY_DASHBOARD_PATH = '/admin/gallery/galleryalbum/';

// ── Small icon helpers ────────────────────────────────────────────────────────
const IconUser = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
  </svg>
);

const IconShield = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const IconLogout = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

const IconExternal = () => (
  <svg className="w-3 h-3 opacity-50" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);

// ── Dropdown item components ──────────────────────────────────────────────────
const DropdownLink = ({ href, icon, label, highlight }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 group/item ${
      highlight
        ? 'text-amber-400 hover:bg-amber-400/10 hover:text-amber-300'
        : 'text-gray-300 hover:bg-white/8 hover:text-white'
    }`}
  >
    <span className="flex-shrink-0 opacity-70 group-hover/item:opacity-100 transition-opacity">
      {icon}
    </span>
    <span className="flex-1">{label}</span>
    <IconExternal />
  </a>
);

const DropdownButton = ({ onClick, icon, label, danger }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 group/item ${
      danger
        ? 'text-red-400 hover:bg-red-400/10 hover:text-red-300'
        : 'text-gray-300 hover:bg-white/8 hover:text-white'
    }`}
  >
    <span className="flex-shrink-0 opacity-70 group-hover/item:opacity-100 transition-opacity">
      {icon}
    </span>
    <span>{label}</span>
  </button>
);

// ─────────────────────────────────────────────────────────────────────────────
const GoogleLoginButton = () => {
  const [user, setUser]           = useState(null);      // raw auth data (name, email, picture)
  const [context, setContext]     = useState(null);      // rich context from /api/auth/user-context/
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // ── Fetch permission context from backend ───────────────────────────────────
  // Declared BEFORE the restore-session useEffect that calls it, so the const
  // is fully initialised before the effect closure references it.
  const fetchUserContext = useCallback(async () => {
    try {
      const cached = localStorage.getItem('user_context');
      if (cached) setContext(JSON.parse(cached));  // show cached while fetching

      const { data } = await getUserContext();
      setContext(data);
      localStorage.setItem('user_context', JSON.stringify(data));

      // Back-fill picture from context if missing from base user data
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
      // Other errors: silently degrade — basic profile still shows
      console.warn('[UserContext] Could not fetch permissions:', err?.response?.status);
    }
  }, []);

  // ── Restore session on mount ────────────────────────────────────────────────
  useEffect(() => {
    const savedUser  = localStorage.getItem('user_data');
    const savedToken = localStorage.getItem('auth_token');

    if (savedUser && savedToken) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('user_data');
        localStorage.removeItem('auth_token');
        return;
      }
      // Refresh context from backend (validates token too — 401 triggers auto-logout)
      fetchUserContext();
    }
  // fetchUserContext is stable (useCallback with [] deps) — safe to omit from deps
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Close dropdown on outside click ────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ── Google OAuth login flow ─────────────────────────────────────────────────
  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      setError(null);
      try {
        const accessToken = tokenResponse.access_token;

        // 1. Fetch Google profile picture / display name
        let profile = null;
        try {
          const profileRes = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          profile = profileRes.data;
        } catch (e) {
          console.warn('Could not fetch userinfo from Google:', e);
        }

        // 2. Exchange token with Django backend
        const res = await axios.post(`${API_BASE_URL}/api/auth/google/`, {
          access_token: accessToken,
        });

        const authToken = res.data.key || res.data.token || res.data.access || accessToken;
        const userData = {
          name:    res.data.user?.first_name || profile?.given_name || profile?.name || 'Builder',
          email:   res.data.user?.email      || profile?.email  || '',
          picture: profile?.picture          || '',
        };

        localStorage.setItem('auth_token', authToken);
        localStorage.setItem('user_data',  JSON.stringify(userData));
        setUser(userData);

        // 3. Immediately fetch rich permission context
        await fetchUserContext();
      } catch (err) {
        console.error('Google Auth Backend Error:', err);
        setError('Login failed. Please try again.');
      } finally {
        setLoading(false);
      }
    },
    onError: (err) => {
      console.error('Google Sign-In failed:', err);
      setError('Google Sign-In failed.');
    },
  });

  // ── Logout ──────────────────────────────────────────────────────────────────
  const handleLogout = () => {
    googleLogout();
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    localStorage.removeItem('user_context');
    setUser(null);
    setContext(null);
    setDropdownOpen(false);
  };

  // ── Loading state ───────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center gap-2 text-xs font-semibold text-gray-300 bg-white/5 border border-white/10 px-4 py-2 rounded-full animate-pulse">
        <svg className="w-3.5 h-3.5 animate-spin text-sbg-green" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
        <span>Signing in…</span>
      </div>
    );
  }

  // ── Authenticated — avatar + dynamic dropdown ───────────────────────────────
  if (user) {
    const displayName  = user.name || user.email?.split('@')[0] || 'Builder';
    const avatarLetter = displayName[0].toUpperCase();
    const isStaff      = context?.is_staff      ?? false;
    const isSuper      = context?.is_superuser  ?? false;
    const isTeamMember = context?.is_team_member ?? false;
    const groups       = context?.groups         ?? [];

    // Any staff or superuser gets admin dashboard access
    // Group membership is shown as info badges only — no longer gates UI
    const hasAdminAccess = isStaff || isSuper;

    return (
      <div className="relative" ref={dropdownRef}>
        {/* ── Avatar pill button ── */}
        <button
          id="user-dropdown-trigger"
          onClick={() => setDropdownOpen((v) => !v)}
          aria-haspopup="true"
          aria-expanded={dropdownOpen}
          className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-sbg-green/30 px-3 py-1.5 rounded-full transition-all duration-200 group"
        >
          {user.picture ? (
            <img
              src={user.picture}
              alt={displayName}
              className="w-6 h-6 rounded-full border border-sbg-green/40 object-cover"
            />
          ) : (
            <div className="w-6 h-6 rounded-full bg-sbg-green/20 border border-sbg-green/40 flex items-center justify-center text-[10px] font-bold text-sbg-green">
              {avatarLetter}
            </div>
          )}
          <span className="text-xs font-semibold text-white max-w-[90px] truncate">
            {displayName}
          </span>
          {/* Chevron */}
          <svg
            className={`w-3 h-3 text-gray-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
            fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        {/* ── Dropdown panel ── */}
        {dropdownOpen && (
          <div
            id="user-dropdown-menu"
            className="absolute right-0 mt-2 w-60 rounded-2xl shadow-2xl z-50 overflow-hidden"
            style={{
              background: 'rgba(18, 24, 32, 0.97)',
              border: '1px solid rgba(255,255,255,0.09)',
              backdropFilter: 'blur(20px)',
              animation: 'fadeSlideDown 0.15s ease-out',
            }}
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-white/8">
              <div className="flex items-center gap-2.5">
                {user.picture ? (
                  <img src={user.picture} alt={displayName}
                    className="w-8 h-8 rounded-full border border-sbg-green/40 object-cover flex-shrink-0" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-sbg-green/20 border border-sbg-green/40 flex items-center justify-center text-sm font-bold text-sbg-green flex-shrink-0">
                    {avatarLetter}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-white truncate">{displayName}</p>
                  <p className="text-[10px] text-gray-400 truncate">{user.email}</p>
                </div>
              </div>
              {/* Role badges */}
              <div className="flex flex-wrap gap-1 mt-2">
                {isSuper && (
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-400/15 text-amber-400 border border-amber-400/20">
                    ⚡ Superuser
                  </span>
                )}
                {isTeamMember && !isSuper && (
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-sbg-green/15 text-sbg-green border border-sbg-green/20">
                    ✦ Team Member
                  </span>
                )}
                {groups.map((g) => (
                  <span key={g} className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-white/8 text-gray-400 border border-white/10">
                    {g}
                  </span>
                ))}
              </div>
            </div>

            {/* ── Menu items ── */}
            <div className="p-2 flex flex-col gap-0.5">

              {/* My Profile — only for verified team members */}
              {isTeamMember && (
                <DropdownButton
                  icon={<IconUser />}
                  label="My Profile"
                  onClick={() => {
                    setDropdownOpen(false);
                    window.location.href = '/profile';
                  }}
                />
              )}

              {/* Admin Dashboard — shown for is_staff OR is_superuser */}
              {hasAdminAccess && (
                <DropdownLink
                  href={ssoUrl(ADMIN_DASHBOARD_PATH)}
                  icon={<IconShield />}
                  label={isSuper ? 'Superuser Dashboard' : 'Admin Dashboard'}
                  highlight={isSuper}
                />
              )}

              {/* Quick-access shortcuts for staff (non-super) */}
              {isStaff && !isSuper && (
                <>
                  <DropdownLink
                    href={ssoUrl(EVENTS_DASHBOARD_PATH)}
                    icon={
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <rect x="3" y="4" width="18" height="18" rx="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                    }
                    label="Events"
                  />
                  <DropdownLink
                    href={ssoUrl(GALLERY_DASHBOARD_PATH)}
                    icon={
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                      </svg>
                    }
                    label="Gallery"
                  />
                </>
              )}

              {/* Divider — only render when there is admin/profile content above */}
              {(isTeamMember || hasAdminAccess) && (
                <div className="my-1 border-t border-white/8" />
              )}

              {/* Logout */}
              <DropdownButton
                icon={<IconLogout />}
                label="Sign Out"
                danger
                onClick={handleLogout}
              />
            </div>
          </div>
        )}

        {/* Animation — kept in the authenticated branch so it's mounted whenever
            the dropdown exists. Moving it here fixes the bug where it was
            rendered in the logged-out branch and therefore missing at runtime. */}
        <style>{`
          @keyframes fadeSlideDown {
            from { opacity: 0; transform: translateY(-6px) scale(0.98); }
            to   { opacity: 1; transform: translateY(0)   scale(1); }
          }
        `}</style>
      </div>
    );
  }

  // ── Unauthenticated — Google Sign-In button ─────────────────────────────────
  return (
    <div className="relative group inline-block">
      <button
        id="google-login-btn"
        onClick={() => login()}
        type="button"
        className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white font-medium text-xs md:text-sm px-4 py-2 rounded-full border border-white/10 hover:border-sbg-green/40 transition-all duration-200 shadow-sm group"
      >
        {/* Google G icon */}
        <svg className="w-4 h-4 flex-shrink-0 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
        </svg>
        <span>Google Login</span>
      </button>
      {error && (
        <p className="absolute left-0 right-0 -bottom-5 text-[10px] text-red-400 text-center truncate">
          {error}
        </p>
      )}
    </div>
  );
};

export default GoogleLoginButton;
