import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

/**
 * FeatureFlagsContext — global feature-flag state for the AWS SBG platform.
 *
 * Shape (all default to `true` so nothing breaks while loading):
 *   flags: {
 *     is_challenges_active : bool,
 *     is_teamup_active      : bool,
 *     is_dashboard_active   : bool,
 *     is_volunteers_active  : bool,
 *   }
 *   loading: bool  — true during the initial fetch
 *
 * Usage:
 *   import { useFeatureFlags } from '../context/FeatureFlagsContext';
 *   const { flags } = useFeatureFlags();
 *   if (!flags.is_challenges_active) return <FeatureDisabled />;
 */

// ── Defaults (all ON) — used before the API responds ─────────────────────────
const DEFAULT_FLAGS = {
  is_challenges_active: true,
  is_teamup_active:     true,
  is_dashboard_active:  true,
  is_volunteers_active: true,
};

const FeatureFlagsContext = createContext({ flags: DEFAULT_FLAGS, loading: true });

export const FeatureFlagsProvider = ({ children }) => {
  const [flags,   setFlags]   = useState(DEFAULT_FLAGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    api.get('/api/settings/feature-flags/')
      .then(({ data }) => {
        if (!cancelled) setFlags({ ...DEFAULT_FLAGS, ...data });
      })
      .catch(() => {
        // On network error keep defaults (all ON) so the site stays usable
        console.warn('[FeatureFlags] Could not fetch flags — keeping defaults (all ON).');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, []);

  return (
    <FeatureFlagsContext.Provider value={{ flags, loading }}>
      {children}
    </FeatureFlagsContext.Provider>
  );
};

/**
 * useFeatureFlags — convenience hook.
 * Must be called inside <FeatureFlagsProvider>.
 */
export const useFeatureFlags = () => useContext(FeatureFlagsContext);

export default FeatureFlagsContext;
