import { useState, useEffect, useRef } from 'react';
import { User, Mail, Briefcase, Tag, AlignLeft, Link2, Star, Save, Camera, AlertCircle, CheckCircle2, Lock } from 'lucide-react';
import { getMyProfile, updateMyProfile } from '../services/api';
import usePageTitle from '../hooks/usePageTitle';

// ── Field wrapper ─────────────────────────────────────────────────────────────
const Field = ({ label, icon: Icon, children, hint }) => (
  <div>
    <label className="flex items-center gap-1.5 text-xs font-mono font-semibold text-gray-400 uppercase tracking-wide mb-2">
      <Icon className="w-3.5 h-3.5 text-sbg-green flex-shrink-0" />
      <span>{label}</span>
    </label>
    {children}
    {hint && <p className="mt-1 text-[10px] text-gray-600 font-mono">{hint}</p>}
  </div>
);

const inputClass =
  'w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-gray-600 outline-none focus:border-sbg-green focus:ring-1 focus:ring-sbg-green/30 transition-all font-sans disabled:opacity-40 disabled:cursor-not-allowed';

// ── Read-only badge ───────────────────────────────────────────────────────────
const ReadOnlyChip = ({ label }) => (
  <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-gray-500">
    <Lock className="w-2.5 h-2.5" /> {label}
  </span>
);

// ─────────────────────────────────────────────────────────────────────────────
const ProfileUpdate = () => {
  usePageTitle('My Profile', 'Update your AWS SBG team member profile.');

  const [profile, setProfile]   = useState(null);
  const [form, setForm]         = useState({});
  const [status, setStatus]     = useState('loading'); // loading|idle|saving|success|error|unauthorized
  const [errorMsg, setErrorMsg] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const fileRef = useRef(null);

  // ── Fetch own profile on mount ────────────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      setStatus('unauthorized');
      return;
    }

    getMyProfile()
      .then(({ data }) => {
        setProfile(data);
        setForm({
          name:      data.name      || '',
          role:      data.role      || '',
          badge:     data.badge     || '',
          tagline:   data.tagline   || '',
          bio:       data.bio       || '',
          linkedin:  data.linkedin  || '',
          instagram: data.instagram || '',
          skills:    Array.isArray(data.skills) ? data.skills.join(', ') : '',
        });
        setStatus('idle');
      })
      .catch((err) => {
        if (err.response?.status === 403) {
          setStatus('unauthorized');
        } else {
          setStatus('error');
          setErrorMsg('Could not load your profile. Please try again.');
        }
      });
  }, []);

  // ── File input → preview ──────────────────────────────────────────────────
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImagePreview(URL.createObjectURL(file));
    setForm((p) => ({ ...p, _imageFile: file }));
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('saving');
    setErrorMsg('');

    try {
      // Build payload — use FormData if there's a new image file
      let payload;
      const { _imageFile, skills, ...rest } = form;

      // Convert comma-separated skills back to array
      const skillsArray = skills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      if (_imageFile) {
        payload = new FormData();
        Object.entries(rest).forEach(([k, v]) => payload.append(k, v));
        payload.append('skills', JSON.stringify(skillsArray));
        payload.append('image', _imageFile);
      } else {
        payload = { ...rest, skills: skillsArray };
      }

      const { data } = await updateMyProfile(payload);
      setProfile(data);
      setStatus('success');
      // Reset success banner after 3 s
      setTimeout(() => setStatus('idle'), 3000);
    } catch (err) {
      setErrorMsg(
        err.response?.data?.detail ||
        Object.values(err.response?.data || {}).flat().join(' ') ||
        'Save failed. Please try again.',
      );
      setStatus('error');
    }
  };

  const set = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }));

  // ─── Render states ────────────────────────────────────────────────────────

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-gray-400">
          <svg className="w-8 h-8 animate-spin text-sbg-green" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          <p className="text-sm font-mono">Loading your profile…</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthorized') {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-md text-center space-y-4 p-8 rounded-2xl bg-white/5 border border-white/10">
          <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6 text-red-400" />
          </div>
          <h1 className="text-xl font-bold text-white">Access Restricted</h1>
          <p className="text-sm text-gray-400 leading-relaxed">
            You need to be a verified <span className="text-sbg-green font-semibold">Team Member</span> to access this page.
            <br /><br />
            If you believe this is an error, ask a superadmin to link your account to a Team Member profile in the admin panel.
          </p>
          <a
            href="/"
            className="inline-flex items-center gap-2 mt-2 px-6 py-2.5 rounded-full bg-sbg-green text-aws-navy text-sm font-bold hover:bg-white transition-colors"
          >
            Go Home
          </a>
        </div>
      </div>
    );
  }

  const avatarSrc = imagePreview || profile?.image_url || null;
  const initials  = (form.name || '?')[0].toUpperCase();

  return (
    <div className="relative min-h-screen bg-transparent pt-28 pb-20 px-6">
      {/* Background glow */}
      <div
        aria-hidden="true"
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-sbg-green/5 rounded-full blur-[120px] -z-10 pointer-events-none"
      />

      <div className="max-w-3xl mx-auto space-y-10">

        {/* ── Header ── */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-xs font-mono tracking-widest text-gray-400 uppercase mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-sbg-green" />
            Team Member Portal
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-3">
            My{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sbg-green to-teal-400">
              Profile
            </span>
          </h1>
          <p className="text-gray-400 text-sm md:text-base max-w-lg mx-auto">
            Update your public-facing profile shown on the team page.
          </p>
        </div>

        {/* ── Status banners ── */}
        {status === 'success' && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-sbg-green/10 border border-sbg-green/30 text-sbg-green text-sm font-medium">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            Profile saved successfully!
          </div>
        )}
        {status === 'error' && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-medium">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">

          {/* ── Avatar card ── */}
          <div className="p-6 rounded-2xl bg-[#10151c]/90 backdrop-blur-2xl border border-white/10 flex items-center gap-6">
            <div className="relative flex-shrink-0">
              {avatarSrc ? (
                <img
                  src={avatarSrc}
                  alt="Profile"
                  className="w-20 h-20 rounded-full object-cover border-2 border-sbg-green/40"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-sbg-green/15 border-2 border-sbg-green/30 flex items-center justify-center text-3xl font-bold text-sbg-green">
                  {initials}
                </div>
              )}
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-sbg-green flex items-center justify-center text-aws-navy hover:bg-white transition-colors shadow-lg"
                title="Change photo"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
            </div>
            <div className="min-w-0">
              <p className="text-white font-semibold text-base truncate">{form.name || '—'}</p>
              <p className="text-gray-400 text-sm truncate">{form.role || '—'}</p>
              <div className="flex gap-2 mt-2 flex-wrap">
                {profile?.is_lead && <ReadOnlyChip label="Lead" />}
                <ReadOnlyChip label={`Priority #${profile?.priority_order ?? '—'}`} />
              </div>
            </div>
          </div>

          {/* ── Identity ── */}
          <div className="p-6 rounded-2xl bg-[#10151c]/90 backdrop-blur-2xl border border-white/10 space-y-5">
            <h2 className="text-sm font-mono font-bold text-gray-300 uppercase tracking-widest">Identity</h2>

            <div className="grid sm:grid-cols-2 gap-5">
              <Field label="Display Name *" icon={User}>
                <input
                  id="profile-name"
                  type="text"
                  required
                  value={form.name}
                  onChange={set('name')}
                  placeholder="Your full name"
                  className={inputClass}
                />
              </Field>

              <Field label="Role / Title *" icon={Briefcase}>
                <input
                  id="profile-role"
                  type="text"
                  required
                  value={form.role}
                  onChange={set('role')}
                  placeholder="e.g. Cloud Engineer"
                  className={inputClass}
                />
              </Field>
            </div>

            <Field label="Badge" icon={Star} hint='e.g. "⭐ Advisor" or "Group Lead" — short label shown on the team card.'>
              <input
                id="profile-badge"
                type="text"
                value={form.badge}
                onChange={set('badge')}
                placeholder="⭐ Advisor"
                className={inputClass}
              />
            </Field>

            <Field label="Tagline" icon={Tag} hint="One-liner shown under your name on the team page.">
              <input
                id="profile-tagline"
                type="text"
                value={form.tagline}
                onChange={set('tagline')}
                placeholder="Building the future, one cloud at a time."
                className={inputClass}
              />
            </Field>

            <Field label="Bio" icon={AlignLeft}>
              <textarea
                id="profile-bio"
                rows={4}
                value={form.bio}
                onChange={set('bio')}
                placeholder="Tell the community about yourself…"
                className={`${inputClass} resize-none`}
              />
            </Field>
          </div>

          {/* ── Skills ── */}
          <div className="p-6 rounded-2xl bg-[#10151c]/90 backdrop-blur-2xl border border-white/10 space-y-5">
            <h2 className="text-sm font-mono font-bold text-gray-300 uppercase tracking-widest">Skills</h2>
            <Field label="Skills" icon={Star} hint="Comma-separated list — e.g. AWS, React, Python, Docker">
              <input
                id="profile-skills"
                type="text"
                value={form.skills}
                onChange={set('skills')}
                placeholder="AWS, React, Python, Docker"
                className={inputClass}
              />
            </Field>
          </div>

          {/* ── Social Links ── */}
          <div className="p-6 rounded-2xl bg-[#10151c]/90 backdrop-blur-2xl border border-white/10 space-y-5">
            <h2 className="text-sm font-mono font-bold text-gray-300 uppercase tracking-widest">Social Links</h2>

            <Field label="LinkedIn URL" icon={Link2}>
              <input
                id="profile-linkedin"
                type="url"
                value={form.linkedin}
                onChange={set('linkedin')}
                placeholder="https://linkedin.com/in/yourhandle"
                className={inputClass}
              />
            </Field>

            <Field label="Instagram URL" icon={Link2}>
              <input
                id="profile-instagram"
                type="url"
                value={form.instagram}
                onChange={set('instagram')}
                placeholder="https://instagram.com/yourhandle"
                className={inputClass}
              />
            </Field>
          </div>

          {/* ── Save ── */}
          <button
            id="profile-save-btn"
            type="submit"
            disabled={status === 'saving'}
            className="w-full py-3.5 rounded-full text-sm font-bold bg-sbg-green text-aws-navy hover:bg-white transition-all duration-200 shadow-lg active:scale-95 disabled:opacity-50 inline-flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            {status === 'saving' ? 'Saving…' : 'Save Profile'}
          </button>

        </form>
      </div>
    </div>
  );
};

export default ProfileUpdate;
