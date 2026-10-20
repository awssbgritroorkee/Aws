import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

// ─────────────────────────────────────────────────────────────────────────────
// Icon helpers
// ─────────────────────────────────────────────────────────────────────────────
const LockIcon = () => (
  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const ArrowRight = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

// ─────────────────────────────────────────────────────────────────────────────
// Shared primitives
// ─────────────────────────────────────────────────────────────────────────────

/** Consistent h-12 input height used across text, select, tel, number inputs.
 *  bg-[#0c1018] is repeated explicitly so the browser autofill override CSS
 *  in index.css targets the same colour and prevents the white-flash bug. */
const inputBase =
  'w-full h-12 bg-[#0c1018] border border-white/[0.08] rounded-xl px-4 text-white text-sm ' +
  'placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 focus:ring-2 ' +
  'focus:ring-emerald-500/20 transition-all duration-200 appearance-none ' +
  '[&:-webkit-autofill]:!bg-[#0c1018] [&:-webkit-autofill]:![box-shadow:0_0_0_30px_#0c1018_inset] ' +
  '[&:-webkit-autofill]:![-webkit-text-fill-color:white]';

const FieldLabel = ({ children, required }) => (
  <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2">
    {children}
    {required && <span className="text-red-500 ml-1">*</span>}
  </label>
);

const FieldError = ({ msg }) =>
  msg ? (
    <p className="mt-1.5 text-[11px] text-red-400 font-medium flex items-center gap-1">
      <span>⚠</span> {msg}
    </p>
  ) : null;

// ─────────────────────────────────────────────────────────────────────────────
// Section divider card header
// ─────────────────────────────────────────────────────────────────────────────
const SectionHeader = ({ icon, step, title, subtitle }) => (
  <div className="flex items-center gap-4 mb-7 pb-5 border-b border-white/[0.06]">
    <div className="relative flex-shrink-0">
      <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-600/30 to-teal-600/20
                      border border-emerald-500/25 flex items-center justify-center text-xl">
        {icon}
      </div>
      <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#0c1018] border border-white/10
                      flex items-center justify-center text-[10px] font-black text-emerald-400">
        {step}
      </div>
    </div>
    <div>
      <h3 className="text-base font-bold text-white tracking-tight">{title}</h3>
      {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Radio pill group  (used for gender, accommodation, yes/no)
// ─────────────────────────────────────────────────────────────────────────────
const RadioGroup = ({ name, options, value, onChange, error }) => (
  <div>
    <div className="flex flex-wrap gap-2.5">
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <label
            key={opt.value}
            className={`flex items-center gap-2.5 h-12 px-5 rounded-xl border cursor-pointer
                        select-none transition-all duration-150 text-sm font-medium ${
                          active
                            ? 'border-emerald-500/60 bg-emerald-500/10 text-emerald-300 shadow-sm shadow-emerald-900/40'
                            : 'border-white/[0.08] bg-[#0c1018] text-gray-400 hover:border-white/20 hover:text-gray-200'
                        }`}
          >
            <input
              type="radio"
              name={name}
              value={opt.value}
              checked={active}
              onChange={() => onChange(opt.value)}
              className="sr-only"
            />
            <span className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
              active ? 'border-emerald-400 bg-emerald-400' : 'border-gray-600'
            }`}>
              {active && <span className="w-1.5 h-1.5 rounded-full bg-[#0c1018]" />}
            </span>
            {opt.label}
          </label>
        );
      })}
    </div>
    <FieldError msg={error} />
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Success state
// ─────────────────────────────────────────────────────────────────────────────
const SuccessState = () => (
  <div className="min-h-screen bg-[#050810] flex items-center justify-center px-4">
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2
                      w-[600px] h-[600px] rounded-full bg-emerald-500/[0.04] blur-3xl" />
    </div>
    <div className="relative max-w-md w-full text-center space-y-7">
      {/* Ring animation */}
      <div className="relative mx-auto w-28 h-28">
        <div className="absolute inset-0 rounded-full border-2 border-emerald-500/20 animate-ping" />
        <div className="absolute inset-0 rounded-full border border-emerald-500/30" />
        <div className="w-full h-full rounded-full bg-emerald-500/10 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/50
                          flex items-center justify-center text-emerald-400">
            <CheckIcon />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h1 className="text-3xl font-extrabold text-white">Application Submitted!</h1>
        <p className="text-gray-400 text-sm leading-relaxed max-w-xs mx-auto">
          Your volunteer application has been received. The AWS SBG team will review it
          and update your status soon.
        </p>
      </div>

      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full
                      bg-yellow-500/10 border border-yellow-500/25 text-yellow-300 text-sm font-semibold">
        <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
        Status: Under Review
      </div>

      <div className="flex justify-center pt-1">
        <Link
          to="/"
          className="flex items-center justify-center gap-2 px-8 py-3 rounded-xl
                     bg-emerald-500 text-black font-bold text-sm hover:bg-emerald-400
                     transition-all duration-200"
        >
          Back to Home <ArrowRight />
        </Link>
      </div>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Auth gate
// ─────────────────────────────────────────────────────────────────────────────
const AuthGate = () => (
  <div className="min-h-screen bg-[#050810] flex items-center justify-center px-4">
    <div className="max-w-sm w-full text-center space-y-5">
      <div className="mx-auto w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20
                      flex items-center justify-center text-3xl">🔐</div>
      <div className="space-y-2">
        <h2 className="text-2xl font-extrabold text-white">Sign In Required</h2>
        <p className="text-gray-400 text-sm">
          Sign in with your Google account to apply for a volunteer position.
        </p>
      </div>
      <Link
        to="/"
        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl
                   bg-emerald-500 text-black font-bold text-sm hover:bg-emerald-400 transition-all"
      >
        Go to Home & Sign In
      </Link>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Already applied state
// ─────────────────────────────────────────────────────────────────────────────
const AlreadyAppliedState = ({ status }) => {
  const MAP = {
    Pending:  { bg: 'bg-yellow-500/10', border: 'border-yellow-500/25', text: 'text-yellow-300', dot: 'bg-yellow-400 animate-pulse', label: 'Under Review'  },
    Accepted: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/25', text: 'text-emerald-300', dot: 'bg-emerald-400', label: 'Accepted 🎉'  },
    Rejected: { bg: 'bg-red-500/10', border: 'border-red-500/25', text: 'text-red-300', dot: 'bg-red-400', label: 'Not Selected'  },
  };
  const cfg = MAP[status] || MAP.Pending;
  return (
    <div className="min-h-screen bg-[#050810] flex items-center justify-center px-4">
      <div className="max-w-sm w-full text-center space-y-5">
        <div className="text-5xl">📋</div>
        <h2 className="text-2xl font-extrabold text-white">Already Applied</h2>
        <p className="text-gray-400 text-sm">
          You've already submitted a volunteer application. Your current status:
        </p>
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border font-semibold text-sm ${cfg.bg} ${cfg.border} ${cfg.text}`}>
          <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
          {cfg.label}
        </div>
        <Link
          to="/"
          className="block px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white
                     font-semibold text-sm hover:bg-white/10 transition-all"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────────────────────────────────────
const VolunteerApply = () => {
  const { user, loading: authLoading } = useAuth();

  const [checkingStatus, setCheckingStatus] = useState(true);
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const [existingStatus, setExistingStatus] = useState(null);
  const [submitted,      setSubmitted]      = useState(false);
  const [submitting,     setSubmitting]     = useState(false);
  const [serverError,    setServerError]    = useState('');

  const [form, setForm] = useState({
    full_name: '', gender: '', mobile_number: '', accommodation: '',
    course: '', branch: '', section: '', academic_year: '', roll_number: '',
    skills: '', motivation: '', other_club_member: '',
  });
  const [terms, setTerms] = useState({
    term1: false,
    term2: false,
    term3: false,
  });
  const [errors, setErrors] = useState({});

  const allTermsAgreed = terms.term1 && terms.term2 && terms.term3;

  // Check existing application
  useEffect(() => {
    if (authLoading) return;
    if (!user) { setCheckingStatus(false); return; }
    api.get('/api/auth/volunteer/status/')
      .then(({ data }) => {
        if (data.applied) { setAlreadyApplied(true); setExistingStatus(data.status); }
      })
      .catch(() => {})
      .finally(() => setCheckingStatus(false));
  }, [authLoading, user]);

  const set = (key) => (e) => {
    const val = typeof e === 'string' ? e : e.target.value;
    setForm((f) => ({ ...f, [key]: val }));
    if (errors[key]) setErrors((err) => ({ ...err, [key]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.full_name.trim())   e.full_name      = 'Full name is required.';
    if (!form.gender)             e.gender         = 'Please select a gender.';
    if (!/^\d{10}$/.test(form.mobile_number.replace(/[\s-]/g, '')))
                                  e.mobile_number  = 'Enter a valid 10-digit mobile number.';
    if (!form.accommodation)      e.accommodation  = 'Please select an option.';
    if (!form.course)             e.course         = 'Please select a course.';
    if (!form.section)            e.section        = 'Please select a section.';
    if (!form.academic_year)      e.academic_year  = 'Please select your year.';
    if (!form.roll_number || !/^\d+$/.test(form.roll_number.toString().trim()))
                                  e.roll_number    = 'Enter a valid roll number.';
    if (!form.skills.trim())      e.skills         = 'Please describe your skills.';
    if (!form.motivation.trim())  e.motivation     = 'Please share your motivation.';
    if (!form.other_club_member)  e.other_club_member = 'Please select an option.';
    if (!allTermsAgreed)          e.terms          = 'You must agree to all terms and commitments before submitting.';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    const v = validate();
    if (Object.keys(v).length > 0) {
      setErrors(v);
      setTimeout(() => document.querySelector('[data-error="true"]')
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50);
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/api/auth/volunteer/apply/', {
        ...form,
        roll_number:       form.roll_number.toString().trim(),
        other_club_member: form.other_club_member === 'yes',
      });
      setSubmitted(true);
    } catch (err) {
      const data = err.response?.data;
      if (data && typeof data === 'object') {
        const mapped = {};
        Object.entries(data).forEach(([k, v]) => { mapped[k] = Array.isArray(v) ? v[0] : v; });
        setErrors(mapped);
        setServerError(data.non_field_errors?.[0] || 'Please fix the errors below.');
      } else {
        setServerError('Something went wrong. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // ── Guards ─────────────────────────────────────────────────────────────────
  if (authLoading || checkingStatus) {
    return (
      <div className="min-h-screen bg-[#050810] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin" />
      </div>
    );
  }
  if (!user)          return <AuthGate />;
  if (submitted)      return <SuccessState />;
  if (alreadyApplied) return <AlreadyAppliedState status={existingStatus} />;

  // ── Form ───────────────────────────────────────────────────────────────────
  return (
    <div className="bg-transparent text-white pt-28 pb-12 px-4">

      {/* ── Ambient background ─────────────────────────────────────────────── */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden>
        <div className="absolute -top-60 left-1/3 w-[700px] h-[700px] rounded-full
                        bg-emerald-950/60 blur-3xl opacity-70" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full
                        bg-blue-950/40 blur-3xl" />
      </div>

      <div className="relative max-w-5xl mx-auto">

        {/* ══════════════════════════════════════════════════════════════════
            HERO HEADER  — matches Team page style
        ══════════════════════════════════════════════════════════════════ */}
        <div className="text-center max-w-4xl mx-auto mb-12">

          {/* Pill badge — same markup as Team page */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border
                          border-white/10 bg-white/5 text-sm font-mono tracking-widest
                          text-gray-300 uppercase mb-6 shadow-md">
            <span className="w-2 h-2 rounded-full bg-green-400" />
            <span>EVENT VOLUNTEERS</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mt-6">Become a <span className="text-green-400">Volunteer</span></h1>

          <p className="text-gray-400 text-lg md:text-xl mt-4 max-w-2xl mx-auto">Don't just witness the movement—be the reason it moves forward. Step beyond the sidelines and become the force that brings innovation to life.</p>
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            FORM CARD
        ══════════════════════════════════════════════════════════════════ */}
        <form
          onSubmit={handleSubmit}
          noValidate
          className="relative rounded-3xl border border-white/[0.07]
                     bg-white/[0.02] backdrop-blur-2xl overflow-hidden"
        >
          {/* Top accent line */}
          <div className="absolute inset-x-0 top-0 h-[2px]
                          bg-gradient-to-r from-transparent via-emerald-500/70 to-transparent" />

          <div className="p-8 md:p-10 space-y-10">

            {/* ── Server error banner ────────────────────────────────────── */}
            {serverError && (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/[0.08] border border-red-500/25">
                <span className="text-red-400 text-lg leading-none mt-0.5">⚠️</span>
                <p className="text-red-300 text-sm font-medium">{serverError}</p>
              </div>
            )}

            {/* ── Locked email — full width ──────────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-1 md:col-span-2">
                <FieldLabel>Email Address</FieldLabel>
                <div className="relative">
                  <input
                    type="email"
                    value={user?.email || ''}
                    readOnly
                    id="volunteer-email-field"
                    className={`${inputBase} pr-28 opacity-70 cursor-not-allowed bg-white/[0.02]`}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2
                                  flex items-center gap-1.5 px-2.5 py-1 rounded-lg
                                  bg-emerald-500/10 border border-emerald-500/25
                                  text-emerald-400 text-[11px] font-bold select-none">
                    <LockIcon />
                    Locked
                  </div>
                </div>
                <p className="mt-1.5 text-[11px] text-gray-600">
                  Tied to your Google SSO account — cannot be edited.
                </p>
              </div>
            </div>

            {/* ════════════════════════════════════════════════════════════
                SECTION 1 — Personal Information
            ════════════════════════════════════════════════════════════ */}
            <div>
              <SectionHeader
                icon="👤" step="1"
                title="Personal Information"
                subtitle="Your basic identification details"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Full Name */}
                <div data-error={!!errors.full_name || undefined}>
                  <FieldLabel required>Full Name</FieldLabel>
                  <input
                    type="text"
                    value={form.full_name}
                    onChange={set('full_name')}
                    placeholder="Enter your full name"
                    id="volunteer-full-name"
                    className={`${inputBase} ${errors.full_name ? 'border-red-500/40 focus:border-red-500/60' : ''}`}
                  />
                  <FieldError msg={errors.full_name} />
                </div>

                {/* Gender */}
                <div data-error={!!errors.gender || undefined}>
                  <FieldLabel required>Gender</FieldLabel>
                  <RadioGroup
                    name="gender"
                    options={[{ value: 'Male', label: 'Male' }, { value: 'Female', label: 'Female' }]}
                    value={form.gender}
                    onChange={set('gender')}
                    error={errors.gender}
                  />
                </div>

                {/* Mobile */}
                <div data-error={!!errors.mobile_number || undefined}>
                  <FieldLabel required>Mobile Number</FieldLabel>
                  <input
                    type="tel"
                    value={form.mobile_number}
                    onChange={set('mobile_number')}
                    placeholder="10-digit number"
                    maxLength={10}
                    id="volunteer-mobile"
                    className={`${inputBase} ${errors.mobile_number ? 'border-red-500/40 focus:border-red-500/60' : ''}`}
                  />
                  <FieldError msg={errors.mobile_number} />
                </div>

                {/* Accommodation */}
                <div data-error={!!errors.accommodation || undefined}>
                  <FieldLabel required>Accommodation</FieldLabel>
                  <RadioGroup
                    name="accommodation"
                    options={[
                      { value: 'Hostler',     label: 'Hostler' },
                      { value: 'Day Scholar', label: 'Day Scholar' },
                    ]}
                    value={form.accommodation}
                    onChange={set('accommodation')}
                    error={errors.accommodation}
                  />
                </div>

              </div>
            </div>

            {/* ════════════════════════════════════════════════════════════
                SECTION 2 — Academic Information
            ════════════════════════════════════════════════════════════ */}
            <div>
              <SectionHeader
                icon="🎓" step="2"
                title="Academic Information"
                subtitle="Your current course and class details"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Course */}
                <div data-error={!!errors.course || undefined}>
                  <FieldLabel required>Course</FieldLabel>
                  <select
                    value={form.course}
                    onChange={set('course')}
                    id="volunteer-course"
                    className={`${inputBase} ${errors.course ? 'border-red-500/40' : ''}`}
                    style={{ backgroundImage: 'none' }}
                  >
                    <option value="" disabled className="bg-[#0c1018]">Select course…</option>
                    {['B.Tech', 'BCA', 'MCA', 'BBA', 'Others'].map((c) => (
                      <option key={c} value={c} className="bg-[#0c1018]">{c}</option>
                    ))}
                  </select>
                  <FieldError msg={errors.course} />
                </div>

                {/* Branch */}
                <div>
                  <FieldLabel>Branch <span className="text-gray-600 normal-case tracking-normal font-normal">(optional)</span></FieldLabel>
                  <input
                    type="text"
                    value={form.branch}
                    onChange={set('branch')}
                    placeholder="e.g. CSE, ECE, IT"
                    id="volunteer-branch"
                    className={inputBase}
                  />
                </div>

                {/* Section */}
                <div data-error={!!errors.section || undefined}>
                  <FieldLabel required>Section</FieldLabel>
                  <select
                    value={form.section}
                    onChange={set('section')}
                    id="volunteer-section"
                    className={`${inputBase} ${errors.section ? 'border-red-500/40' : ''}`}
                    style={{ backgroundImage: 'none' }}
                  >
                    <option value="" disabled className="bg-[#0c1018]">Select section…</option>
                    {['A','B','C','D','E','F','G','H','I'].map((s) => (
                      <option key={s} value={s} className="bg-[#0c1018]">{s}</option>
                    ))}
                  </select>
                  <FieldError msg={errors.section} />
                </div>

                {/* Academic Year */}
                <div data-error={!!errors.academic_year || undefined}>
                  <FieldLabel required>Academic Year</FieldLabel>
                  <select
                    value={form.academic_year}
                    onChange={set('academic_year')}
                    id="volunteer-year"
                    className={`${inputBase} ${errors.academic_year ? 'border-red-500/40' : ''}`}
                    style={{ backgroundImage: 'none' }}
                  >
                    <option value="" disabled className="bg-[#0c1018]">Select year…</option>
                    {['2nd Year', '3rd Year'].map((y) => (
                      <option key={y} value={y} className="bg-[#0c1018]">{y}</option>
                    ))}
                  </select>
                  <FieldError msg={errors.academic_year} />
                </div>

                {/* Roll Number — half width */}
                <div data-error={!!errors.roll_number || undefined}>
                  <FieldLabel required>Roll Number</FieldLabel>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={form.roll_number}
                    onChange={set('roll_number')}
                    placeholder="e.g. 2201234"
                    id="volunteer-roll"
                    className={`${inputBase} ${errors.roll_number ? 'border-red-500/40' : ''}`}
                  />
                  <FieldError msg={errors.roll_number} />
                </div>

              </div>
            </div>

            {/* ════════════════════════════════════════════════════════════
                SECTION 3 — Skills & Community
            ════════════════════════════════════════════════════════════ */}
            <div>
              <SectionHeader
                icon="💡" step="3"
                title="Skills & Community"
                subtitle="Tell us about yourself and why you want to join"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Skills */}
                <div data-error={!!errors.skills || undefined}>
                  <FieldLabel required>Skills</FieldLabel>
                  <textarea
                    rows={3}
                    value={form.skills}
                    onChange={set('skills')}
                    placeholder="Describe your technical and soft skills…"
                    id="volunteer-skills"
                    className={`w-full bg-[#0c1018] border border-white/[0.08] rounded-xl px-4 py-3
                                text-white text-sm placeholder-gray-600 resize-none leading-relaxed
                                focus:outline-none focus:border-emerald-500/50 focus:ring-2
                                focus:ring-emerald-500/20 transition-all duration-200
                                ${errors.skills ? 'border-red-500/40' : ''}`}
                  />
                  <FieldError msg={errors.skills} />
                </div>

                {/* Motivation */}
                <div data-error={!!errors.motivation || undefined}>
                  <FieldLabel required>Why do you want to volunteer with AWS SBG?</FieldLabel>
                  <textarea
                    rows={3}
                    value={form.motivation}
                    onChange={set('motivation')}
                    placeholder="Share your motivation and goals…"
                    id="volunteer-motivation"
                    className={`w-full bg-[#0c1018] border border-white/[0.08] rounded-xl px-4 py-3
                                text-white text-sm placeholder-gray-600 resize-none leading-relaxed
                                focus:outline-none focus:border-emerald-500/50 focus:ring-2
                                focus:ring-emerald-500/20 transition-all duration-200
                                ${errors.motivation ? 'border-red-500/40' : ''}`}
                  />
                  <FieldError msg={errors.motivation} />
                </div>

                {/* Other club member */}
                <div className="col-span-1 md:col-span-2" data-error={!!errors.other_club_member || undefined}>
                  <FieldLabel required>Are you a member of any other club or community at RIT?</FieldLabel>
                  <RadioGroup
                    name="other_club_member"
                    options={[{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }]}
                    value={form.other_club_member}
                    onChange={set('other_club_member')}
                    error={errors.other_club_member}
                  />
                </div>

              </div>
            </div>

            {/* ════════════════════════════════════════════════════════════
                SECTION 4 — Terms & Commitments
            ════════════════════════════════════════════════════════════ */}
            <div data-error={!!errors.terms || undefined}>
              <SectionHeader
                icon="📜" step="4"
                title="Terms & Commitments *"
                subtitle="Please read carefully and agree to all conditions below to submit your application"
              />

              <div className="space-y-3.5">
                {/* Checkbox 1 */}
                <label className="flex items-start gap-3.5 p-4 rounded-xl bg-[#0c1018] border border-white/[0.08] hover:border-emerald-500/30 cursor-pointer transition-all duration-150">
                  <input
                    type="checkbox"
                    required
                    checked={terms.term1}
                    onChange={(e) => {
                      setTerms((t) => ({ ...t, term1: e.target.checked }));
                      if (errors.terms) setErrors((prev) => ({ ...prev, terms: '' }));
                    }}
                    className="mt-0.5 w-4 h-4 rounded border-gray-600 bg-[#0c1018] text-emerald-500 accent-emerald-500 focus:ring-emerald-500/20 cursor-pointer flex-shrink-0"
                  />
                  <span className="text-gray-300 text-sm leading-relaxed select-none">
                    I commit to being fully available and attending all mandatory team meetings or calls scheduled up to November 28th, 2026.
                  </span>
                </label>

                {/* Checkbox 2 */}
                <label className="flex items-start gap-3.5 p-4 rounded-xl bg-[#0c1018] border border-white/[0.08] hover:border-emerald-500/30 cursor-pointer transition-all duration-150">
                  <input
                    type="checkbox"
                    required
                    checked={terms.term2}
                    onChange={(e) => {
                      setTerms((t) => ({ ...t, term2: e.target.checked }));
                      if (errors.terms) setErrors((prev) => ({ ...prev, terms: '' }));
                    }}
                    className="mt-0.5 w-4 h-4 rounded border-gray-600 bg-[#0c1018] text-emerald-500 accent-emerald-500 focus:ring-emerald-500/20 cursor-pointer flex-shrink-0"
                  />
                  <span className="text-gray-300 text-sm leading-relaxed select-none">
                    I understand that any breach of discipline, misbehavior, or failure to follow instructions during the event will result in immediate termination from the volunteer team.
                  </span>
                </label>

                {/* Checkbox 3 */}
                <label className="flex items-start gap-3.5 p-4 rounded-xl bg-[#0c1018] border border-white/[0.08] hover:border-emerald-500/30 cursor-pointer transition-all duration-150">
                  <input
                    type="checkbox"
                    required
                    checked={terms.term3}
                    onChange={(e) => {
                      setTerms((t) => ({ ...t, term3: e.target.checked }));
                      if (errors.terms) setErrors((prev) => ({ ...prev, terms: '' }));
                    }}
                    className="mt-0.5 w-4 h-4 rounded border-gray-600 bg-[#0c1018] text-emerald-500 accent-emerald-500 focus:ring-emerald-500/20 cursor-pointer flex-shrink-0"
                  />
                  <span className="text-gray-300 text-sm leading-relaxed select-none">
                    I agree to take full responsibility for the tasks assigned to me and will maintain the professional reputation of AWS SBG RIT.
                  </span>
                </label>
              </div>

              <FieldError msg={errors.terms} />
            </div>

            {/* ── Divider ─────────────────────────────────────────────────── */}
            <div className="h-px bg-white/[0.05]" />

            {/* ── Submit ──────────────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <button
                type="submit"
                id="volunteer-submit-btn"
                disabled={submitting || !allTermsAgreed}
                className="flex-1 sm:flex-none sm:min-w-[220px] h-12 px-8 rounded-xl
                           bg-gradient-to-r from-emerald-500 to-teal-500
                           text-black font-extrabold text-sm tracking-wide
                           hover:from-emerald-400 hover:to-teal-400
                           disabled:opacity-40 disabled:cursor-not-allowed
                           transition-all duration-200 shadow-lg shadow-emerald-900/30
                           active:scale-[0.98] flex items-center justify-center gap-2.5"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                    Submitting…
                  </>
                ) : (
                  <>Submit Application <ArrowRight /></>
                )}
              </button>

              <p className="text-xs text-gray-400 leading-relaxed">
                Each Google account may only submit <strong className="text-gray-300">one application</strong>.
                Your email is locked to this submission.
              </p>
            </div>

          </div>{/* /inner padding */}

          {/* Bottom accent line */}
          <div className="absolute inset-x-0 bottom-0 h-px
                          bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </form>

      </div>{/* /max-w-5xl */}
    </div>
  );
};

export default VolunteerApply;
