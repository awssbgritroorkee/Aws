import { useState, useEffect, useCallback } from 'react';

/**
 * GlobalStreakToast
 * ─────────────────────────────────────────────────────────────────────────────
 * Shown site-wide (from App.jsx) when the 5-second engagement tracker fires
 * and the backend confirms streak_updated: true.
 *
 * Props
 * ─────
 * data      — the response object from POST /api/gamification/daily-visit/
 *             { message, milestone_hit, bonus_xp, milestone_streak, profile }
 * onClose() — called when the toast dismisses (auto or manual)
 */
const GlobalStreakToast = ({ data, onClose }) => {
  const isMilestone = data?.milestone_hit;
  const bonusXP     = data?.bonus_xp ?? 5;
  const streak      = data?.profile?.current_streak ?? 1;

  useEffect(() => {
    const t = setTimeout(onClose, isMilestone ? 8000 : 5500);
    return () => clearTimeout(t);
  }, [onClose, isMilestone]);

  return (
    <div className="fixed top-20 right-4 z-[9999] animate-streak-toast" style={{ maxWidth: 340 }}>
      <div
        className={`relative overflow-hidden rounded-2xl p-5 shadow-2xl backdrop-blur-xl border
          ${isMilestone
            ? 'bg-gradient-to-br from-yellow-900/90 to-orange-900/80 border-yellow-500/40 shadow-yellow-900/50'
            : 'bg-gradient-to-br from-emerald-900/90 to-slate-900/90 border-emerald-500/30 shadow-emerald-900/40'
          }`}
      >
        {/* Top accent strip */}
        <div
          className={`absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent to-transparent
            ${isMilestone ? 'via-yellow-400' : 'via-emerald-400'}`}
        />

        <div className="flex items-start gap-3">
          {/* Icon */}
          <span className="text-3xl leading-none flex-shrink-0">
            {isMilestone ? '🏆' : '🔥'}
          </span>

          {/* Body */}
          <div className="flex-1 min-w-0">
            <p className={`font-black text-sm uppercase tracking-wide
              ${isMilestone ? 'text-yellow-300' : 'text-emerald-300'}`}>
              {isMilestone ? `${streak}-Day Milestone!` : 'Daily Streak Updated!'}
            </p>
            <p className="text-white/90 text-sm mt-0.5 leading-snug">
              {data?.message || `You've been active today. +${bonusXP} XP awarded!`}
            </p>

            {/* XP badges */}
            <div className="flex items-center gap-2 mt-2.5 flex-wrap">
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full
                ${isMilestone ? 'bg-yellow-400/20 text-yellow-200' : 'bg-emerald-400/20 text-emerald-200'}`}>
                +{bonusXP} XP
              </span>
              {streak > 1 && (
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-orange-400/20 text-orange-200">
                  🔥 {streak}-day streak
                </span>
              )}
              {isMilestone && (
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-purple-400/20 text-purple-200">
                  🎁 Milestone bonus!
                </span>
              )}
            </div>
          </div>

          {/* Close */}
          <button
            onClick={onClose}
            className="text-white/40 hover:text-white transition-colors ml-1 flex-shrink-0 mt-0.5"
            aria-label="Dismiss notification"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      {/* Animation keyframes */}
      <style>{`
        @keyframes streak-toast-in {
          from { transform: translateX(110%); opacity: 0; }
          to   { transform: translateX(0);   opacity: 1; }
        }
        .animate-streak-toast {
          animation: streak-toast-in 0.45s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
      `}</style>
    </div>
  );
};

/**
 * useGlobalStreakToast
 * ─────────────────────────────────────────────────────────────────────────────
 * Manages the toast state. Returns { toastData, showToast, hideToast }.
 * Call showToast(data) from useEngagementTracker's onStreakUpdated callback.
 */
export const useGlobalStreakToast = () => {
  const [toastData, setToastData] = useState(null);
  const showToast = useCallback((data) => setToastData(data), []);
  const hideToast = useCallback(() => setToastData(null), []);
  return { toastData, showToast, hideToast };
};

export default GlobalStreakToast;
