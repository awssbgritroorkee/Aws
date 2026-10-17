import { useState } from 'react';
import { createBuilderProfile } from '../services/api';

// ─────────────────────────────────────────────────────────────────────────────
// Field config
// ─────────────────────────────────────────────────────────────────────────────
const COURSES = ['B.Tech', 'BCA', 'MCA', 'BBA', 'Others'];
const BRANCHES = [
  'Computer Science and Engineering',
  'Electronics and Communication Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Electrical Engineering',
  'Information Technology',
  'Others / N/A',
];
const SECTIONS  = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];
const YEARS     = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────
const Label = ({ children, required }) => (
  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">
    {children}
    {required && <span className="text-red-500 ml-1">*</span>}
  </label>
);

const inputCls = `w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3
  text-white text-sm placeholder-gray-600 outline-none
  focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30
  transition-all duration-200`;

const Field = ({ label, required, error, children }) => (
  <div>
    <Label required={required}>{label}</Label>
    {children}
    {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
  </div>
);

const Input = ({ error, ...props }) => (
  <input
    className={`${inputCls} ${error ? 'border-red-500/60' : ''}`}
    {...props}
  />
);

const Select = ({ error, children, ...props }) => (
  <select
    className={`${inputCls} ${error ? 'border-red-500/60' : ''} cursor-pointer`}
    {...props}
  >
    {children}
  </select>
);

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────
/**
 * BuilderProfileForm
 * ─────────────────────────────────────────────────────────────────────────────
 * Shown when an authenticated student has no BuilderProfile yet.
 * On successful submission, calls onSuccess(profileData) so the parent
 * (StudentDashboard) can unmount the form and reveal the full dashboard.
 *
 * Props:
 *   userEmail  — locked Google email shown read-only
 *   onSuccess  — callback(profileData) called after 201 response
 */
const BuilderProfileForm = ({ userEmail = '', onSuccess }) => {
  const [form, setForm] = useState({
    full_name:     '',
    roll_number:   '',
    mobile_number: '',
    course:        '',
    branch:        '',
    section:       '',
    academic_year: '',
  });
  const [errors,     setErrors]     = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError,   setApiError]   = useState('');

  const set = (key) => (e) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const validate = () => {
    const errs = {};
    if (!form.full_name.trim())     errs.full_name     = 'Full name is required.';
    if (!form.roll_number.trim())   errs.roll_number   = 'Roll number is required.';
    if (!form.mobile_number.trim()) errs.mobile_number = 'Mobile number is required.';
    else if (!/^\d{10}$/.test(form.mobile_number.trim()))
      errs.mobile_number = 'Enter a valid 10-digit number.';
    if (!form.course)        errs.course        = 'Select your course.';
    if (!form.section)       errs.section       = 'Select your section.';
    if (!form.academic_year) errs.academic_year = 'Select your year.';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setApiError('');
    setSubmitting(true);

    try {
      const { data } = await createBuilderProfile(form);
      if (typeof onSuccess === 'function') onSuccess(data);
    } catch (err) {
      const detail = err.response?.data;
      if (detail && typeof detail === 'object') {
        // Map field-level errors from the backend
        const mapped = {};
        Object.entries(detail).forEach(([k, v]) => {
          mapped[k] = Array.isArray(v) ? v.join(' ') : String(v);
        });
        setErrors(mapped);
      } else {
        setApiError('Something went wrong. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-6 pb-20 px-4 md:px-8">
      <div className="max-w-2xl mx-auto">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl
                          bg-emerald-500/10 border border-emerald-500/30 mb-5 text-3xl">
            🚀
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight">
            Create Your{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-400">
              Builder Profile
            </span>
          </h1>
          <p className="text-gray-400 mt-3 text-sm leading-relaxed max-w-lg mx-auto">
            Complete this one-time form to activate your gamification dashboard — XP, Streaks,
            Levels, and the Campus Leaderboard.
          </p>
        </div>

        {/* ── What you unlock banner ──────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { icon: '🌟', label: 'XP Tracking',    sub: 'Earn points daily' },
            { icon: '🔥', label: 'Streaks',         sub: '+20 XP at 5-day' },
            { icon: '🏆', label: 'Leaderboard',     sub: 'Campus ranking'   },
          ].map(({ icon, label, sub }) => (
            <div key={label}
              className="text-center p-3 rounded-xl bg-white/[0.03] border border-white/[0.07]">
              <div className="text-xl mb-1">{icon}</div>
              <p className="text-xs font-bold text-white">{label}</p>
              <p className="text-[10px] text-gray-500 mt-0.5">{sub}</p>
            </div>
          ))}
        </div>

        {/* ── Form card ──────────────────────────────────────────────────── */}
        <form onSubmit={handleSubmit}
          className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 md:p-8 space-y-5">

          {/* Account email (locked) */}
          <Field label="Google Account">
            <Input
              type="text"
              value={userEmail}
              readOnly
              className={`${inputCls} text-gray-500 cursor-not-allowed`}
            />
            <p className="mt-1 text-[11px] text-gray-600">
              🔒 Your profile is linked to this Google account.
            </p>
          </Field>

          {/* Full Name */}
          <Field label="Full Name" required error={errors.full_name}>
            <Input
              type="text"
              placeholder="e.g. Rahul Sharma"
              value={form.full_name}
              onChange={set('full_name')}
              error={errors.full_name}
            />
          </Field>

          {/* Roll Number + Mobile (2 cols) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Roll Number" required error={errors.roll_number}>
              <Input
                type="text"
                placeholder="e.g. 2300000"
                value={form.roll_number}
                onChange={set('roll_number')}
                error={errors.roll_number}
              />
            </Field>
            <Field label="Mobile Number" required error={errors.mobile_number}>
              <Input
                type="tel"
                placeholder="10-digit number"
                value={form.mobile_number}
                onChange={set('mobile_number')}
                maxLength={10}
                error={errors.mobile_number}
              />
            </Field>
          </div>

          {/* Course + Academic Year (2 cols) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Course" required error={errors.course}>
              <Select value={form.course} onChange={set('course')} error={errors.course}>
                <option value="">Select course…</option>
                {COURSES.map((c) => <option key={c} value={c}>{c}</option>)}
              </Select>
            </Field>
            <Field label="Academic Year" required error={errors.academic_year}>
              <Select value={form.academic_year} onChange={set('academic_year')} error={errors.academic_year}>
                <option value="">Select year…</option>
                {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
              </Select>
            </Field>
          </div>

          {/* Branch + Section (2 cols) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Branch / Specialisation" error={errors.branch}>
              <Select value={form.branch} onChange={set('branch')}>
                <option value="">Select branch… (optional)</option>
                {BRANCHES.map((b) => <option key={b} value={b}>{b}</option>)}
              </Select>
            </Field>
            <Field label="Section" required error={errors.section}>
              <Select value={form.section} onChange={set('section')} error={errors.section}>
                <option value="">Select section…</option>
                {SECTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </Select>
            </Field>
          </div>

          {/* API-level error */}
          {apiError && (
            <div className="rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-3">
              <p className="text-red-400 text-sm">{apiError}</p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600
                       text-black font-black text-sm tracking-wide
                       hover:brightness-110 active:scale-[0.99]
                       disabled:opacity-50 disabled:cursor-not-allowed
                       transition-all duration-200 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Creating Profile…
              </>
            ) : (
              '🚀 Activate Builder Profile'
            )}
          </button>

          <p className="text-center text-[11px] text-gray-600">
            This information is used exclusively for AWS SBG events and certifications.
          </p>
        </form>
      </div>
    </div>
  );
};

export default BuilderProfileForm;
