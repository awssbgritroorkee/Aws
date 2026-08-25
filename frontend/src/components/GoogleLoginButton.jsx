import { useState, useEffect } from 'react';
import { useGoogleLogin, googleLogout } from '@react-oauth/google';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const GoogleLoginButton = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load saved session on initial render
  useEffect(() => {
    const savedUser = localStorage.getItem('user_data');
    const savedToken = localStorage.getItem('auth_token');
    if (savedUser && savedToken) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('user_data');
        localStorage.removeItem('auth_token');
      }
    }
  }, []);

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      setError(null);

      try {
        const accessToken = tokenResponse.access_token;
        
        // 1. Fetch user info from Google
        let profile = null;
        try {
          const profileRes = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          profile = profileRes.data;
        } catch (e) {
          console.warn('Could not fetch userinfo directly from Google API:', e);
        }

        // 2. Post token to Django backend Google Social Login endpoint
        const res = await axios.post(`${API_BASE_URL}/api/auth/google/`, {
          access_token: accessToken,
        });

        const authToken = res.data.key || res.data.token || res.data.access || accessToken;
        const userData = res.data.user || {
          name: profile?.name || profile?.given_name || 'Builder',
          email: profile?.email || '',
          picture: profile?.picture || '',
        };

        localStorage.setItem('auth_token', authToken);
        localStorage.setItem('user_data', JSON.stringify(userData));
        setUser(userData);
        console.log('Google Social Login successful:', userData);
      } catch (err) {
        console.error('Google Auth Backend Verification Error:', err);
        setError('Login failed. Please try again.');
      } finally {
        setLoading(false);
      }
    },
    onError: (errorResponse) => {
      console.error('Google Sign-In failed:', errorResponse);
      setError('Google Sign-In failed.');
    },
  });

  const handleLogout = () => {
    googleLogout();
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    setUser(null);
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-xs font-semibold text-gray-300 bg-white/5 border border-white/10 px-4 py-2 rounded-full animate-pulse">
        <svg className="w-3.5 h-3.5 animate-spin text-sbg-green" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
        </svg>
        <span>Logging in...</span>
      </div>
    );
  }

  if (user) {
    return (
      <div className="flex items-center gap-2.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full backdrop-blur-md">
        {user.picture ? (
          <img
            src={user.picture}
            alt={user.name || 'User Profile'}
            className="w-6 h-6 rounded-full border border-sbg-green/40 object-cover"
          />
        ) : (
          <div className="w-6 h-6 rounded-full bg-sbg-green/20 border border-sbg-green/40 flex items-center justify-center text-[10px] font-bold text-sbg-green">
            {(user.name || user.email || 'B')[0].toUpperCase()}
          </div>
        )}
        <span className="text-xs font-semibold text-white max-w-[100px] truncate">
          {user.name || user.email?.split('@')[0] || 'Builder'}
        </span>
        <button
          onClick={handleLogout}
          title="Sign Out"
          className="text-xs text-gray-400 hover:text-red-400 transition-colors p-1 rounded-full hover:bg-white/10"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div className="relative group inline-block">
      <button
        onClick={() => login()}
        type="button"
        className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white font-medium text-xs md:text-sm px-4 py-2 rounded-full border border-white/10 hover:border-sbg-green/40 transition-all duration-200 shadow-sm group"
      >
        <svg className="w-4 h-4 flex-shrink-0 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
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
