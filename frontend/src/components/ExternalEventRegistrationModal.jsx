import { useState, useEffect, useCallback } from 'react';
import { Globe, X, Lock, ExternalLink } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getBuilderProfile, registerForChallenge } from '../services/api';

// ─────────────────────────────────────────────────────────────────────────────
// Reusable sub-components (scoped to this modal)
// ─────────────────────────────────────────────────────────────────────────────

/** Renders a labelled locked field with a "Locked" badge */
const LockedField = ({ id, label, value, placeholder = '—' }) => (
  <div className="flex flex-col gap-1.5">
    <label
      htmlFor={id}
      className="text-[10px] font-semibold text-gray-400 tracking-[0.12em] uppercase flex items-center gap-1.5"
    >
      {label}
      <span className="inline-flex items-center gap-0.5 text-[9px] font-mono text-sbg-green/70 bg-sbg-green/10 border border-sbg-green/20 px-1.5 py-0.5 rounded-full">
        <Lock className="w-2 h-2" />
        Locked
      </span>
    </label>
    <input
      id={id}
      type="text"
      value={value || ''}
      readOnly
      disabled
      aria-label={label}
      placeholder={placeholder}
      className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-sm text-gray-300 cursor-not-allowed select-none placeholder-gray-600 font-mono tracking-wide"
    />
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

/**
 * ExternalEventRegistrationModal
 *
 * Props:
 *   challenge   — { id, title, registration_link, external_link }
 *   onClose     — () => void  — called to dismiss the modal
 *   onSuccess   — () => void  — called after successful local registration
 *                               (parent should set isRegistered = true)
 */
const ExternalEventRegistrationModal = ({ challenge, onClose, onSuccess }) => {
  const { user, context } = useAuth();

  const [profile, setProfile]         = useState(null);
  const [autofilling, setAutofilling] = useState(true);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');
  const [isSuccess, setIsSuccess]     = useState(false);

  // ── Derive the outbound URL (external_link preferred, fallback registration_link) ──
  const externalUrl = challenge?.external_link || challenge?.registration_link || '';

  // ── Autofill on mount — fetch BuilderProfile ───────────────────────────────
  useEffect(() => {
    let cancelled = false;

    const fetchProfile = async () => {
      try {
        const res     = await getBuilderProfile();
        const data    = res.data || res;
        if (!cancelled) setProfile(data);
      } catch {
        // silently fall back — profile stays null, fields show empty
      } finally {
        if (!cancelled) setAutofilling(false);
      }
    };

    fetchProfile();
    return () => { cancelled = true; };
  }, []);

  // ── Derived display values ────────────────────────────────────────────────
  const emailDisplay = context?.email || user?.email || '';
  const fullName     = profile?.full_name
    || (context?.first_name ? `${context.first_name} ${context.last_name || ''}`.trim() : '')
    || user?.name
    || '';
  const course       = profile?.course        || '';
  const branch       = profile?.branch        || '';
  const section      = profile?.section       || '';
  const rollNumber   = profile?.roll_number   || '';
  const mobile       = profile?.mobile_number || '';
  const academicYear = profile?.academic_year || '';

  // ── Submit handler ────────────────────────────────────────────────────────
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await registerForChallenge(challenge.id);

      // 1. Notify parent to flip the SmartRegisterButton to "registered" state
      onSuccess();

      // 2. Show success screen inside modal
      setIsSuccess(true);

      // 3. Auto-open the official external registration link in a new tab
      if (externalUrl) {
        window.open(externalUrl, '_blank', 'noopener,noreferrer');
      }
    } catch (err) {
      const detail = err?.response?.data?.detail || '';
      const status = err?.response?.status;

      // Treat "already registered" as success — still redirect
      if (status === 400 && detail.toLowerCase().includes('already registered')) {
        onSuccess();
        setIsSuccess(true);
        if (externalUrl) window.open(externalUrl, '_blank', 'noopener,noreferrer');
        return;
      }

      // Fair-play block or closed registration — surface readable message
      if (status === 403) {
        setError(`🚫 ${detail || 'You are not eligible to register for this event.'}`);
      } else if (status === 400) {
        setError(detail || 'Registration is closed for this event.');
      } else {
        setError(detail || 'Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, [challenge.id, externalUrl, onSuccess]);

  // ── Close on backdrop click ────────────────────────────────────────────────
  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="ext-reg-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={handleBackdrop}
    >
      {/* ── Backdrop ── */}
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
        aria-hidden="true"
        style={{ animation: 'extFadeIn 0.2s ease' }}
      />

      {/* ── Panel ── */}
      <div
        className="relative z-10 w-full max-w-lg bg-[#0d1117]/96 border border-white/10 rounded-3xl shadow-2xl overflow-hidden"
        style={{ animation: 'extSlideUp 0.28s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
      >
        {/* Top gradient accent */}
        <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-emerald-500/70 to-transparent" />

        {/* ── Header ── */}
        <div className="px-7 pt-6 pb-5 border-b border-white/[0.08]">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[10px] font-mono font-bold tracking-[0.22em] text-emerald-400 uppercase mb-1.5 flex items-center gap-1.5">
                <Globe className="w-3 h-3" />
                Event Registration
              </p>
              <h2
                id="ext-reg-modal-title"
                className="text-lg font-bold text-white leading-tight truncate"
              >
                {challenge.title}
              </h2>
              <p className="text-[11px] text-gray-500 mt-1 font-mono">
                Your profile data is locked and will be submitted as-is.
              </p>
            </div>
            <button
              id="ext-reg-modal-close"
              onClick={onClose}
              aria-label="Close registration modal"
              className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-150"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Body / Success screen swap ── */}
        {isSuccess ? (

          /* ── SUCCESS SCREEN ─────────────────────────────────────────────── */
          <div
            className="px-7 py-10 flex flex-col items-center text-center"
            style={{ animation: 'extSlideUp 0.3s cubic-bezier(0.34,1.56,0.64,1)' }}
          >
            {/* Animated success ring */}
            <div className="relative w-20 h-20 mb-6">
              <div className="absolute inset-0 rounded-full bg-emerald-500/10 border border-emerald-500/30 animate-pulse" />
              <div className="w-20 h-20 rounded-full bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center">
                <svg className="w-9 h-9 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>

            <p className="text-[10px] font-mono font-bold tracking-[0.2em] text-emerald-400 uppercase mb-2">
              You&apos;re In!
            </p>
            <h3 className="text-2xl font-bold text-white mb-3">
              Registration Successful 🎉
            </h3>
            <p className="text-sm text-gray-400 leading-relaxed max-w-sm mb-8">
              Your registration has been saved locally. The official event page
              has been opened in a new tab — complete your RSVP there to secure your spot.
            </p>

            {/* Re-open official link if tab was blocked */}
            {externalUrl && (
              <a
                id="ext-reg-official-link"
                href={externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={onClose}
                className="inline-flex items-center justify-center gap-2 w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-3 text-sm rounded-xl transition-colors duration-200"
              >
                <ExternalLink className="w-4 h-4" />
                Open Official Registration Page
              </a>
            )}

            <button
              onClick={onClose}
              className="mt-3 text-xs text-gray-500 hover:text-gray-300 transition-colors"
            >
              Close this window
            </button>
          </div>

        ) : (

          /* ── FORM ───────────────────────────────────────────────────────── */
          <>
            {/* Body */}
            <div className="px-7 py-6 overflow-y-auto max-h-[65vh]">

              {/* Loading skeleton */}
              {autofilling ? (
                <div className="flex items-center justify-center gap-3 py-10 text-gray-400 text-sm">
                  <svg className="w-4 h-4 animate-spin text-emerald-400" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Loading your profile…
                </div>
              ) : (
                <form id="ext-event-registration-form" onSubmit={handleSubmit} noValidate>
                  {/* Info banner */}
                  <div className="mb-5 px-4 py-3 rounded-xl bg-amber-500/[0.08] border border-amber-500/20 flex items-start gap-3">
                    <Lock className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-300/80 leading-relaxed">
                      Your profile data is pre-filled and locked. To update it, visit{' '}
                      <a
                        href="/dashboard/profile"
                        className="underline underline-offset-2 text-amber-300 hover:text-amber-200 transition-colors"
                        onClick={onClose}
                      >
                        Builder Profile
                      </a>{' '}
                      before registering.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-5">

                    {/* Email */}
                    <LockedField
                      id="ext-reg-email"
                      label="Email Address"
                      value={emailDisplay}
                      placeholder="Not available"
                    />

                    {/* Full Name */}
                    <LockedField
                      id="ext-reg-fullname"
                      label="Full Name"
                      value={fullName}
                      placeholder="Update in Builder Profile"
                    />

                    {/* Course + Branch */}
                    <div className="grid grid-cols-2 gap-4">
                      <LockedField
                        id="ext-reg-course"
                        label="Course"
                        value={course}
                        placeholder="Not set"
                      />
                      <LockedField
                        id="ext-reg-branch"
                        label="Branch"
                        value={branch}
                        placeholder="Not set"
                      />
                    </div>

                    {/* Section + Roll Number */}
                    <div className="grid grid-cols-2 gap-4">
                      <LockedField
                        id="ext-reg-section"
                        label="Section"
                        value={section}
                        placeholder="Not set"
                      />
                      <LockedField
                        id="ext-reg-roll"
                        label="Roll Number"
                        value={rollNumber}
                        placeholder="Not set"
                      />
                    </div>

                    {/* Mobile + Academic Year */}
                    <div className="grid grid-cols-2 gap-4">
                      <LockedField
                        id="ext-reg-mobile"
                        label="Mobile Number"
                        value={mobile}
                        placeholder="Not set"
                      />
                      <LockedField
                        id="ext-reg-academic-year"
                        label="Academic Year"
                        value={academicYear}
                        placeholder="Not set"
                      />
                    </div>

                  </div>

                  {/* Inline error */}
                  {error && (
                    <div
                      role="alert"
                      className="mt-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/25 text-xs text-red-300 leading-relaxed"
                    >
                      {error}
                    </div>
                  )}
                </form>
              )}
            </div>

            {/* Footer */}
            <div className="px-7 pb-6 pt-4 border-t border-white/[0.08] flex items-center justify-between gap-4">
              <p className="text-[10px] text-gray-500 leading-relaxed max-w-[190px]">
                Submitting will also open the official event page in a new tab.
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  id="ext-reg-cancel-btn"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-400 bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-150"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="ext-event-registration-form"
                  id="ext-reg-submit-btn"
                  disabled={loading || autofilling}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 text-black hover:bg-emerald-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-[0_0_16px_rgba(52,211,153,0.3)]"
                >
                  {loading ? (
                    <>
                      <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      Submitting…
                    </>
                  ) : (
                    <>
                      <Globe className="w-3.5 h-3.5" />
                      Register Now →
                    </>
                  )}
                </button>
              </div>
            </div>
          </>
        )}

        {/* Modal animations */}
        <style>{`
          @keyframes extFadeIn {
            from { opacity: 0; } to { opacity: 1; }
          }
          @keyframes extSlideUp {
            from { opacity: 0; transform: translateY(18px) scale(0.97); }
            to   { opacity: 1; transform: translateY(0)     scale(1);    }
          }
        `}</style>
      </div>
    </div>
  );
};

export default ExternalEventRegistrationModal;
