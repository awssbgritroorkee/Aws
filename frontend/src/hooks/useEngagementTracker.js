import { useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

/**
 * useEngagementTracker
 * ──────────────────────────────────────────────────────────────────────────
 * Global "5-second rule" engagement tracker hook.
 *
 * Behaviour
 * ─────────
 * 1. Runs on every page the user visits (must be called from App.jsx or a
 *    layout-level component so it persists across route changes).
 * 2. When an authenticated user has been on the page for exactly 5 seconds,
 *    fires POST /api/gamification/daily-visit/.
 * 3. If the backend returns streak_updated: true, calls onStreakUpdated(data)
 *    so the parent can show a toast.
 * 4. The call is idempotent — the backend ignores repeat calls on the same day,
 *    and the hook uses a session-level ref to fire at most once per page session.
 *
 * Usage (in App.jsx / a global layout wrapper)
 * ────────────────────────────────────────────
 *   import useEngagementTracker from './hooks/useEngagementTracker';
 *
 *   // Inside your component:
 *   useEngagementTracker({ onStreakUpdated: (data) => setGlobalToast(data) });
 *
 * Props
 * ─────
 * onStreakUpdated(data)  — callback fired when streak_updated === true.
 *                          data shape: { message, milestone_hit, bonus_xp, profile, ... }
 * delayMs               — milliseconds to wait before firing (default: 5000).
 */
const useEngagementTracker = ({ onStreakUpdated, delayMs = 5000 } = {}) => {
  const { user, loading: authLoading } = useAuth();

  // Prevent firing more than once per browser session (not per-route — use a
  // module-level variable so even React StrictMode double-effect doesn't double-fire).
  const firedRef = useRef(false);

  useEffect(() => {
    // Don't do anything until auth resolves, or if not logged in, or already fired.
    if (authLoading || !user || firedRef.current) return;

    const timerId = setTimeout(async () => {
      // Double-check still logged in when timer fires (tab might have been idle)
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      firedRef.current = true; // mark before the request so StrictMode re-run is no-op

      try {
        const { data } = await api.post('/api/gamification/daily-visit/');

        if (data.streak_updated && typeof onStreakUpdated === 'function') {
          onStreakUpdated(data);
        }
      } catch (err) {
        // Silent fail — engagement tracking must never disrupt UX
        console.warn('[EngagementTracker] daily-visit call failed silently:', err?.response?.status);
      }
    }, delayMs);

    return () => clearTimeout(timerId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user]);
};

export default useEngagementTracker;
