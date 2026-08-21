import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// ── Ideas ────────────────────────────────────────────────────
export const getIdeas = () => api.get('/api/ideas/');
export const createIdea = (data) => api.post('/api/ideas/', data);
export const getIdea = (id) => api.get(`/api/ideas/${id}/`);

// ── Teams ────────────────────────────────────────────────────
export const getTeams = () => api.get('/api/teams/');
export const createTeam = (data) => api.post('/api/teams/', data);

// ── Members ──────────────────────────────────────────────────
export const getMembers = () => api.get('/api/members/');

export default api;
