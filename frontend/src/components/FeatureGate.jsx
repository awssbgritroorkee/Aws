import { Navigate } from 'react-router-dom';
import { useFeatureFlags } from '../context/FeatureFlagsContext';

// ─────────────────────────────────────────────────────────────────────────────
// "Feature Unavailable" screen — shown on direct URL access when a module is OFF
// ─────────────────────────────────────────────────────────────────────────────
const FeatureDisabledScreen = ({ featureName }) => (
  <div className="min-h-screen bg-transparent flex items-center justify-center px-4">
    {/* Ambient glow */}
    <div
      aria-hidden
      className="fixed top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2
                 w-[500px] h-[500px] rounded-full blur-3xl pointer-events-none"
      style={{ background: 'radial-gradient(ellipse, rgba(239,68,68,0.06) 0%, transparent 70%)' }}
    />

    <div className="relative max-w-md w-full text-center space-y-6">
      {/* Icon */}
      <div className="mx-auto w-20 h-20 rounded-3xl bg-red-500/10 border border-red-500/20
                      flex items-center justify-center text-4xl">
        🔒
      </div>

      {/* Badge */}
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full
                      bg-red-500/10 border border-red-500/20
                      text-red-400 text-xs font-bold uppercase tracking-widest">
        <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
        Feature Unavailable
      </div>

      <div className="space-y-3">
        <h1 className="text-2xl font-extrabold text-white">
          {featureName ? `${featureName} is Disabled` : 'Feature Disabled'}
        </h1>
        <p className="text-gray-400 text-sm leading-relaxed max-w-xs mx-auto">
          This module has been temporarily disabled by the administrators.
          Please check back later or contact the AWS SBG team for more information.
        </p>
      </div>

      {/* Go home */}
      <a
        href="/"
        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl
                   bg-white/5 border border-white/10 text-white font-semibold text-sm
                   hover:bg-white/10 transition-all duration-200"
      >
        ← Back to Home
      </a>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// FeatureGate — wraps a route element and guards it with a feature flag
//
// Usage in App.jsx:
//   <Route
//     path="/challenges"
//     element={
//       <FeatureGate flag="is_challenges_active" name="Challenges">
//         <Challenges />
//       </FeatureGate>
//     }
//   />
//
// Props:
//   flag      — key of the flag in the flags object (e.g. 'is_challenges_active')
//   name      — human-readable module name shown on the disabled screen
//   redirect  — if true, redirect to "/" instead of showing the disabled screen
//   children  — the actual page component to render when the feature is ON
// ─────────────────────────────────────────────────────────────────────────────
const FeatureGate = ({ flag, name, redirect = false, children }) => {
  const { flags, loading } = useFeatureFlags();

  // While flags are loading keep the children mounted (defaults are all ON)
  if (loading) return children;

  const isActive = flags[flag] !== false; // treat undefined as ON (safe default)

  if (!isActive) {
    return redirect ? <Navigate to="/" replace /> : <FeatureDisabledScreen featureName={name} />;
  }

  return children;
};

export default FeatureGate;
