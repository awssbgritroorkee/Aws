import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { getStudentProfile, registerForEvent } from '../services/api';

// ── Cascading dropdown data ───────────────────────────────────────────────────
const COURSE_BRANCH_MAP = {
  'B.Tech': [
    'Civil Engineering',
    'Computer Science and Engineering',
    'Computer Science and Engineering (AI and ML)',
    'Electrical Engineering',
    'Electronics and Communication Engineering',
    'Mechanical Engineering',
  ],
  'BCA': ['Bachelor of Computer Application'],
  'MCA': ['Master in Computer Application'],
};

const COURSES = Object.keys(COURSE_BRANCH_MAP);
const SECTIONS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];

const EMPTY_FORM = {
  full_name:     '',
  course:        '',
  branch:        '',
  section:       '',
  roll_number:   '',
  mobile_number: '',
  academic_year: '',
};

// ── Styled input helper ───────────────────────────────────────────────────────
const InputField = ({ id, label, required, children }) => (
  <div className="flex flex-col gap-1.5">
    <label htmlFor={id} className="text-xs font-semibold text-gray-400 tracking-wide uppercase">
      {label}{required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
    {children}
  </div>
);

const inputClass =
  'w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-gray-500 ' +
  'focus:outline-none focus:border-sbg-green/60 focus:bg-white/8 transition-all duration-200';

const disabledInputClass =
  'w-full px-3.5 py-2.5 rounded-xl bg-white/3 border border-white/5 text-sm text-gray-400 cursor-not-allowed select-none';

const selectClass =
  'w-full px-3.5 py-2.5 rounded-xl bg-[#0d1117] border border-white/10 text-sm text-white ' +
  'focus:outline-none focus:border-sbg-green/60 transition-all duration-200 appearance-none cursor-pointer';

// ─────────────────────────────────────────────────────────────────────────────

const EventRegistrationModal = ({ event, onClose, onSuccess, onError }) => {
  const { user, context } = useAuth();
  const [form, setForm]     = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [autofilling, setAutofilling] = useState(true);

  // Branches available based on selected course
  const availableBranches = form.course ? (COURSE_BRANCH_MAP[form.course] || []) : [];

  // ── Autofill on mount ───────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    const fetchProfile = async () => {
      const defaultName = (context?.first_name ? `${context.first_name} ${context.last_name || ''}`.trim() : user?.name) || '';
      try {
        const { data } = await getStudentProfile();
        if (!cancelled && data && Object.keys(data).length > 0) {
          setForm({
            full_name:     data.full_name     || defaultName,
            course:        data.course        || '',
            branch:        data.branch        || '',
            section:       data.section       || '',
            roll_number:   data.roll_number   || '',
            mobile_number: data.mobile_number || '',
            academic_year: data.academic_year || '',
          });
        } else if (!cancelled) {
          setForm((prev) => ({ ...prev, full_name: defaultName }));
        }
      } catch {
        if (!cancelled) setForm((prev) => ({ ...prev, full_name: defaultName }));
      } finally {
        if (!cancelled) setAutofilling(false);
      }
    };

    fetchProfile();
    return () => { cancelled = true; };
  }, [user, context]);

  // ── Form handlers ───────────────────────────────────────────────────────────
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const next = { ...prev, [name]: value };
      // Clear branch when course changes
      if (name === 'course') next.branch = '';
      return next;
    });
  }, []);

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await registerForEvent(event.id, form);
      if (event.registration_link) {
        onSuccess('Registration Successful! 🎉 Redirecting to Meetup…');
        setTimeout(() => {
          window.open(event.registration_link, '_blank', 'noopener,noreferrer');
          onClose();
        }, 1500);
      } else {
        onSuccess('Registration Successful! 🎉');
        onClose();
      }
    } catch (err) {
      let msg = 'Something went wrong. Please try again.';
      if (err?.response?.data) {
        const data = err.response.data;
        if (data.detail) {
          msg = data.detail;
        } else if (data.non_field_errors?.[0]) {
          msg = data.non_field_errors[0];
        } else {
          const firstKey = Object.keys(data)[0];
          if (firstKey && Array.isArray(data[firstKey])) {
            msg = `${firstKey.replace('_', ' ').toUpperCase()}: ${data[firstKey][0]}`;
          } else if (firstKey && typeof data[firstKey] === 'string') {
            msg = `${firstKey.replace('_', ' ').toUpperCase()}: ${data[firstKey]}`;
          }
        }
      }
      onError(msg);
    } finally {
      setLoading(false);
    }
  };

  // ── Trap focus — close on backdrop click ────────────────────────────────────
  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const emailDisplay = context?.email || user?.email || '';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="reg-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={handleBackdrop}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        aria-hidden="true"
        style={{ animation: 'fadeIn 0.2s ease' }}
      />

      {/* Panel */}
      <div
        className="relative z-10 w-full max-w-lg bg-[#0d1117]/95 border border-white/10 rounded-3xl shadow-2xl overflow-hidden"
        style={{ animation: 'modalSlideUp 0.25s cubic-bezier(0.34,1.56,0.64,1)' }}
      >
        {/* Top gradient accent */}
        <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-sbg-green/60 to-transparent" />

        {/* Header */}
        <div className="px-7 pt-7 pb-5 border-b border-white/8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-mono font-bold tracking-[0.2em] text-sbg-green uppercase mb-1.5">
                Event Registration
              </p>
              <h2 id="reg-modal-title" className="text-xl font-bold text-white leading-tight">
                {event.title}
              </h2>
              <p className="text-xs text-gray-500 mt-1 font-mono">
                {event.date ? new Date(event.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : ''}
              </p>
            </div>
            <button
              id="reg-modal-close"
              onClick={onClose}
              aria-label="Close registration modal"
              className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all text-base"
            >
              ×
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-7 py-6 overflow-y-auto max-h-[65vh]">
          {autofilling ? (
            <div className="flex items-center gap-3 py-8 justify-center text-gray-400 text-sm">
              <svg className="w-4 h-4 animate-spin text-sbg-green" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Loading your profile…
            </div>
          ) : (
            <form id="event-registration-form" onSubmit={handleSubmit} noValidate>
              <div className="grid grid-cols-1 gap-5">

                {/* Email — locked */}
                <InputField id="reg-email" label="Email Address">
                  <div className="relative">
                    <input
                      id="reg-email"
                      type="email"
                      value={emailDisplay}
                      readOnly
                      disabled
                      className={disabledInputClass}
                      aria-describedby="reg-email-note"
                    />
                    <span
                      id="reg-email-note"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-sbg-green/70 bg-sbg-green/10 border border-sbg-green/20 px-2 py-0.5 rounded-full"
                    >
                      Locked
                    </span>
                  </div>
                </InputField>

                {/* Full Name — editable */}
                <InputField id="reg-full-name" label="Full Name" required>
                  <input
                    id="reg-full-name"
                    name="full_name"
                    type="text"
                    value={form.full_name}
                    onChange={handleChange}
                    required
                    placeholder="Enter your full name"
                    className={inputClass}
                  />
                </InputField>



                {/* Course + Branch — cascading */}
                <div className="grid grid-cols-2 gap-4">
                  <InputField id="reg-course" label="Course" required>
                    <div className="relative">
                      <select
                        id="reg-course"
                        name="course"
                        value={form.course}
                        onChange={handleChange}
                        required
                        className={selectClass}
                      >
                        <option value="" disabled>Select course</option>
                        {COURSES.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                      <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </div>
                  </InputField>

                  <InputField id="reg-branch" label="Branch" required>
                    <div className="relative">
                      <select
                        id="reg-branch"
                        name="branch"
                        value={form.branch}
                        onChange={handleChange}
                        required
                        disabled={!form.course}
                        className={`${selectClass} ${!form.course ? 'opacity-40 cursor-not-allowed' : ''}`}
                      >
                        <option value="" disabled>
                          {form.course ? 'Select branch' : 'Select course first'}
                        </option>
                        {availableBranches.map((b) => (
                          <option key={b} value={b}>{b}</option>
                        ))}
                      </select>
                      <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </div>
                  </InputField>
                </div>

                {/* Section + Roll Number */}
                <div className="grid grid-cols-2 gap-4">
                  <InputField id="reg-section" label="Section" required>
                    <div className="relative">
                      <select
                        id="reg-section"
                        name="section"
                        value={form.section}
                        onChange={handleChange}
                        required
                        className={selectClass}
                      >
                        <option value="" disabled>Select section</option>
                        {SECTIONS.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                      <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </div>
                  </InputField>

                  <InputField id="reg-roll" label="Roll Number" required>
                    <input
                      id="reg-roll"
                      name="roll_number"
                      type="text"
                      value={form.roll_number}
                      onChange={handleChange}
                      required
                      placeholder="Enter your roll number"
                      className={inputClass}
                    />
                  </InputField>
                </div>

                {/* Mobile */}
                <InputField id="reg-mobile" label="Mobile Number" required>
                  <input
                    id="reg-mobile"
                    name="mobile_number"
                    type="tel"
                    value={form.mobile_number}
                    onChange={handleChange}
                    required
                    placeholder="10-digit mobile number"
                    pattern="[6-9][0-9]{9}"
                    maxLength={10}
                    className={inputClass}
                  />
                </InputField>

                {/* Academic Year */}
                <InputField id="reg-academic-year" label="Academic Year" required>
                  <div className="relative">
                    <select
                      id="reg-academic-year"
                      name="academic_year"
                      value={form.academic_year}
                      onChange={handleChange}
                      required
                      className={selectClass}
                    >
                      <option value="" disabled>Select academic year</option>
                      <option value="1st">1st Year</option>
                      <option value="2nd">2nd Year</option>
                      <option value="3rd">3rd Year</option>
                      <option value="4th">4th Year</option>
                    </select>
                    <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                </InputField>

              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="px-7 pb-7 pt-4 border-t border-white/8 flex items-center justify-between gap-4">
          <p className="text-[10px] text-gray-500 leading-relaxed max-w-[200px]">
            Your details will be saved for future event registrations.
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              id="reg-cancel-btn"
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-400 bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="event-registration-form"
              id="reg-submit-btn"
              disabled={loading || autofilling}
              className="px-6 py-2.5 rounded-xl text-xs font-bold bg-sbg-green text-aws-navy hover:bg-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Submitting…
                </>
              ) : 'Register Now →'}
            </button>
          </div>
        </div>

        {/* Animations */}
        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; } to { opacity: 1; }
          }
          @keyframes modalSlideUp {
            from { opacity: 0; transform: translateY(20px) scale(0.97); }
            to   { opacity: 1; transform: translateY(0)    scale(1); }
          }
        `}</style>
      </div>
    </div>
  );
};

export default EventRegistrationModal;
