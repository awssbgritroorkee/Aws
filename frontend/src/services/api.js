import axios from 'axios';

const BASE_URL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  'https://aws-swae.onrender.com';

// ── Axios instance ────────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

// ── Request interceptor — attach auth token from localStorage ─────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ── Response interceptor — auto-logout on 401 Unauthorized ───────────────────
// If the backend returns 401 (token deleted, user removed, session expired),
// clear all local auth state and redirect to the root so the user sees the
// login button again without being stuck in a broken authenticated state.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear every piece of auth state
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      localStorage.removeItem('user_context');

      // Force redirect to home — re-triggers GoogleOAuthProvider flow
      if (window.location.pathname !== '/') {
        window.location.href = '/';
      } else {
        // Already on home — reload so React state resets cleanly
        window.location.reload();
      }
    }
    return Promise.reject(error);
  },
);

// ── Auth ──────────────────────────────────────────────────────────────────────
/**
 * Fetch the full user context (permissions, team profile, groups, picture).
 * Requires a valid auth token in localStorage.
 * The 401 interceptor above handles expired/deleted sessions automatically.
 */
export const getUserContext = () => api.get('/api/auth/user-context/');

// ── Ideas ────────────────────────────────────────────────────────────────────
export const getIdeas  = ()     => api.get('/api/ideas/');
export const createIdea = (data) => api.post('/api/ideas/', data);
export const getIdea  = (id)    => api.get(`/api/ideas/${id}/`);

// ── Teams ────────────────────────────────────────────────────────────────────
export const getTeams  = ()     => api.get('/api/teams/');
export const createTeam = (data) => api.post('/api/teams/', data);

// ── Members ──────────────────────────────────────────────────────────────────
export const getMembers = () => api.get('/api/members/');

// ── My Profile (authenticated Team Member) ────────────────────────────────────
/** GET  /api/members/my-profile/ — fetch own TeamMember profile */
export const getMyProfile = () => api.get('/api/members/my-profile/');

/** PATCH /api/members/my-profile/ — update editable profile fields.
 *  Pass a plain object for JSON fields, or a FormData for image uploads. */
export const updateMyProfile = (data) => {
  const isFormData = data instanceof FormData;
  return api.patch('/api/members/my-profile/', data, {
    headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
  });
};

// ── Contact ──────────────────────────────────────────────────────────────────
export const createContactMessage = (data) => api.post('/api/contact/', data);

// ── Event Registration System ─────────────────────────────────────────────────
/**
 * GET /api/student-profile/
 * Fetches the authenticated user's saved academic profile for modal autofill.
 * Returns {} (empty object, status 200) for first-time users — no 404 handling needed.
 */
export const getStudentProfile = () => api.get('/api/student-profile/');

/**
 * POST /api/events/<eventId>/register/
 * Submits an event registration with student profile details.
 * Returns 201 on success, 400 with { detail } for duplicates or closed events.
 */
export const registerForEvent = (eventId, data) =>
  api.post(`/api/events/${eventId}/register/`, data);

export default api;
