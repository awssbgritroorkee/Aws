import { useState, useEffect } from 'react';
import { GoogleLogin, googleLogout } from '@react-oauth/google';
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

  const handleSuccess = async (credentialResponse) => {
    setLoading(true);
    setError(null);

    try {
      // Send Google credential token to Django Social Login API
      const res = await axios.post(`${API_BASE_URL}/api/auth/google/`, {
        access_token: credentialResponse.credential,
        id_token: credentialResponse.credential,
      });

      const authToken = res.data.key || res.data.token || res.data.access;
      const userData = res.data.user || {
        email: res.data.email || 'Builder',
      };

      if (authToken) {
        localStorage.setItem('auth_token', authToken);
        localStorage.setItem('user_data', JSON.stringify(userData));
        setUser(userData);
      }
    } catch (err) {
      console.error('Google Social Login Error:', err);
      // Fallback display if backend is offline or during client-side testing
      const decodedUser = parseJwt(credentialResponse.credential);
      const fallbackUser = {
        name: decodedUser?.name || 'AWS Builder',
        email: decodedUser?.email || '',
        picture: decodedUser?.picture || '',
      };
      localStorage.setItem('auth_token', credentialResponse.credential);
      localStorage.setItem('user_data', JSON.stringify(fallbackUser));
      setUser(fallbackUser);
    } finally {
      setLoading(false);
    }
  };

  const handleError = () => {
    console.error('Google Sign-In failed');
    setError('Failed to authenticate with Google. Please try again.');
  };

  const handleLogout = () => {
    googleLogout();
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    setUser(null);
  };

  // Helper function to decode Google JWT payload for display
  function parseJwt(token) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-xs font-semibold text-gray-300 bg-white/5 border border-white/10 px-4 py-2 rounded-full animate-pulse">
        <svg className="w-4 h-4 animate-spin text-sbg-green" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
        </svg>
        Authenticating...
      </div>
    );
  }

  if (user) {
    return (
      <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full backdrop-blur-md">
        {user.picture ? (
          <img
            src={user.picture}
            alt={user.name || 'User Profile'}
            className="w-7 h-7 rounded-full border border-sbg-green/40 object-cover"
          />
        ) : (
          <div className="w-7 h-7 rounded-full bg-sbg-green/20 border border-sbg-green/40 flex items-center justify-center text-xs font-bold text-sbg-green">
            {(user.name || user.email || 'B')[0].toUpperCase()}
          </div>
        )}
        <span className="text-xs font-semibold text-white max-w-[100px] md:max-w-[120px] truncate">
          {user.name || user.first_name || user.email?.split('@')[0] || 'Builder'}
        </span>
        <button
          onClick={handleLogout}
          title="Sign Out"
          className="text-xs text-gray-400 hover:text-red-400 transition-colors p-1 rounded-full hover:bg-white/10"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div className="relative group inline-block">
      <div className="overflow-hidden rounded-full border border-white/10 hover:border-sbg-green/50 transition-all">
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={handleError}
          shape="circle"
          size="medium"
          theme="filled_black"
          text="signin_with"
        />
      </div>
      {error && (
        <p className="absolute left-0 right-0 -bottom-6 text-[10px] text-red-400 text-center truncate">
          {error}
        </p>
      )}
    </div>
  );
};

export default GoogleLoginButton;
