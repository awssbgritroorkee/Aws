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

// ── Defaults (all OFF) — prevents restricted links from flickering before API responds ───
const DEFAULT_FLAGS = {
  is_challenges_active: false,
  is_teamup_active:     false,
  is_dashboard_active:  false,
  is_volunteers_active: false,
};

const STORAGE_KEY = 'feature_flags';

const getInitialFlags = () => {
  try {
    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached) {
      return { ...DEFAULT_FLAGS, ...JSON.parse(cached) };
    }
  } catch (err) {
    console.warn('[FeatureFlags] Error reading localStorage:', err);
  }
  return DEFAULT_FLAGS;
};

const FeatureFlagsContext = createContext({
  flags: DEFAULT_FLAGS,
  isLoadingFlags: true,
  loading: true,
});

export const FeatureFlagsProvider = ({ children }) => {
  const [flags, setFlags] = useState(getInitialFlags);
  const [isLoadingFlags, setIsLoadingFlags] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === null;
    } catch {
      return true;
    }
  });

  useEffect(() => {
    let cancelled = false;

    api.get('/api/settings/feature-flags/')
      .then(({ data }) => {
        if (!cancelled) {
          const merged = { ...DEFAULT_FLAGS, ...data };
          setFlags(merged);
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
          } catch (err) {
            console.warn('[FeatureFlags] Failed to cache flags to localStorage:', err);
          }
        }
      })
      .catch(() => {
        console.warn('[FeatureFlags] Could not fetch flags — using cached/defaults (all OFF).');
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoadingFlags(false);
        }
      });

    return () => { cancelled = true; };
  }, []);

  return (
    <FeatureFlagsContext.Provider value={{ flags, isLoadingFlags, loading: isLoadingFlags }}>
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
