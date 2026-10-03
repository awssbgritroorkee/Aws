import { useState, useEffect, useCallback } from 'react';
import { Globe, X, ExternalLink } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getBuilderProfile, updateBuilderProfile, registerForChallenge } from '../services/api';

// ─────────────────────────────────────────────────────────────────────────────
// Reusable editable field
// ─────────────────────────────────────────────────────────────────────────────

const EditableField = ({ id, label, value, onChange, placeholder = '' }) => (
  <div className="flex flex-col gap-1.5">
    <label
      htmlFor={id}
      className="text-[10px] font-semibold text-gray-400 tracking-[0.12em] uppercase"
    >
      {label}
    </label>
    <input
      id={id}
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      aria-label={label}
      className="w-full px-3.5 py-2.5 rounded-xl bg-gray-800 text-white placeholder-gray-400 border border-gray-600 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/30 text-sm transition-colors duration-150"
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

  const [autofilling, setAutofilling] = useState(true);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');
  const [isSuccess, setIsSuccess]     = useState(false);

  // ── Controlled form state (seeded from profile on mount) ──────────────────
  const [formData, setFormData] = useState({
    full_name:     '',
    course:        '',
    branch:        '',
    section:       '',
    roll_number:   '',
    mobile_number: '',
    academic_year: '',
  });

  // ── Derive the outbound URL ────────────────────────────────────────────────
  const externalUrl = challenge?.external_link || challenge?.registration_link || '';

  // ── Email — auth-managed, display only ────────────────────────────────────
  const emailDisplay = context?.email || user?.email || '';

  // ── Autofill on mount — fetch BuilderProfile ───────────────────────────────
  useEffect(() => {
    let cancelled = false;

    const fetchProfile = async () => {
      try {
        const res  = await getBuilderProfile();
        const data = res.data || res;

        if (!cancelled) {
          setFormData({
            full_name:
              data.full_name ||
              (context?.first_name
                ? `${context.first_name} ${context.last_name || ''}`.trim()
                : '') ||
              user?.name ||
              '',
            course:        data.course        || '',
            branch:        data.branch        || '',
            section:       data.section       || '',
            roll_number:   data.roll_number   || '',
            mobile_number: data.mobile_number || '',
            academic_year: data.academic_year || '',
          });
        }
      } catch {
        // Silently fall back — fields stay empty; user can type in manually
        if (!cancelled && (context?.first_name || user?.name)) {
          setFormData(prev => ({
            ...prev,
            full_name:
              (context?.first_name
                ? `${context.first_name} ${context.last_name || ''}`.trim()
                : '') ||
              user?.name ||
              '',
          }));
        }
      } finally {
        if (!cancelled) setAutofilling(false);
      }
    };

    fetchProfile();
    return () => { cancelled = true; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Generic field change handler ──────────────────────────────────────────
  const handleFieldChange = (field) => (e) =>
    setFormData(prev => ({ ...prev, [field]: e.target.value }));

  // ── Submit handler ────────────────────────────────────────────────────────
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 1. Persist any edited profile data
      await updateBuilderProfile(formData);
    } catch (profileErr) {
      // Non-blocking: log and continue — don't block registration
      console.warn('Profile update warning:', profileErr?.response?.data || profileErr.message);
    }

    try {
      // 2. Register locally
      await registerForChallenge(challenge.id);

      // 3. Notify parent + show success + open external link
      onSuccess();
      setIsSuccess(true);
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
  }, [challenge.id, externalUrl, formData, onSuccess]);

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
                Review and confirm your details before registering.
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
                  <div className="grid grid-cols-1 gap-5">

                    {/* Email — display only */}
                    <div className="flex flex-col gap-1.5">
                      <label
                        htmlFor="ext-reg-email"
                        className="text-[10px] font-semibold text-gray-400 tracking-[0.12em] uppercase"
                      >
                        Email Address
                      </label>
                      <input
                        id="ext-reg-email"
                        type="email"
                        value={emailDisplay}
                        readOnly
                        aria-label="Email Address"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-gray-900 text-gray-400 border border-gray-700 text-sm cursor-not-allowed select-none"
                      />
                      <p className="text-[11px] text-gray-500 italic mt-0.5">
                        Any updates made here will automatically save to your Builder Profile.
                      </p>
                    </div>

                    {/* Full Name */}
                    <EditableField
                      id="ext-reg-fullname"
                      label="Full Name"
                      value={formData.full_name}
                      onChange={handleFieldChange('full_name')}
                      placeholder="Enter your full name"
                    />

                    {/* Course + Branch */}
                    <div className="grid grid-cols-2 gap-4">
                      <EditableField
                        id="ext-reg-course"
                        label="Course"
                        value={formData.course}
                        onChange={handleFieldChange('course')}
                        placeholder="e.g. B.Tech"
                      />
                      <EditableField
                        id="ext-reg-branch"
                        label="Branch"
                        value={formData.branch}
                        onChange={handleFieldChange('branch')}
                        placeholder="e.g. CSE"
                      />
                    </div>

                    {/* Section + Roll Number */}
                    <div className="grid grid-cols-2 gap-4">
                      <EditableField
                        id="ext-reg-section"
                        label="Section"
                        value={formData.section}
                        onChange={handleFieldChange('section')}
                        placeholder="e.g. A"
                      />
                      <EditableField
                        id="ext-reg-roll"
                        label="Roll Number"
                        value={formData.roll_number}
                        onChange={handleFieldChange('roll_number')}
                        placeholder="e.g. 22CSE001"
                      />
                    </div>

                    {/* Mobile + Academic Year */}
                    <div className="grid grid-cols-2 gap-4">
                      <EditableField
                        id="ext-reg-mobile"
                        label="Mobile Number"
                        value={formData.mobile_number}
                        onChange={handleFieldChange('mobile_number')}
                        placeholder="10-digit number"
                      />
                      <EditableField
                        id="ext-reg-academic-year"
                        label="Academic Year"
                        value={formData.academic_year}
                        onChange={handleFieldChange('academic_year')}
                        placeholder="e.g. 2nd Year"
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
