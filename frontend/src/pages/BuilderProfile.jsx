import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getBuilderProfile, updateBuilderProfile } from '../services/api';
import {
  User,
  Mail,
  GraduationCap,
  BookOpen,
  Calendar,
  Hash,
  Sparkles,
  Save,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

const COURSE_OPTIONS = [
  'B.Tech',
  'BCA',
  'MCA',
  'M.Tech',
  'B.Sc',
  'B.Com',
  'BBA',
  'MBA',
  'Other'
];

const BRANCH_OPTIONS = [
  'Computer Science & Engineering',
  'Computer Science & Engg (AI/ML)',
  'Electronics & Comm. Engineering',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Information Technology',
  'Master of Computer Applications',
  'Other'
];

const YEAR_OPTIONS = [
  { value: '1st', label: '1st Year' },
  { value: '2nd', label: '2nd Year' },
  { value: '3rd', label: '3rd Year' },
  { value: '4th', label: '4th Year' }
];

const BuilderProfile = () => {
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    course: 'B.Tech',
    branch: 'Computer Science & Engineering',
    current_year: '3rd',
    roll_number: '',
    section: 'A'
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null); // { type: 'success' | 'error', text }

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const { data } = await getBuilderProfile();
        setFormData({
          course: data.course || 'B.Tech',
          branch: data.branch || 'Computer Science & Engineering',
          current_year: data.current_year || data.academic_year || '3rd',
          roll_number: data.roll_number || '',
          section: data.section || ''
        });
      } catch (err) {
        console.error('Failed to load profile details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      await updateBuilderProfile({
        course: formData.course,
        branch: formData.branch,
        current_year: formData.current_year,
        academic_year: formData.current_year,
        roll_number: formData.roll_number.trim(),
        section: formData.section.trim()
      });

      setMessage({
        type: 'success',
        text: 'Profile Updated Successfully! Your details will autofill for event RSVPs.'
      });

      setTimeout(() => setMessage(null), 5000);
    } catch (err) {
      console.error('Failed to update profile:', err);
      setMessage({
        type: 'error',
        text: err.response?.data?.detail || 'Failed to update profile. Please try again.'
      });
    } finally {
      setSaving(false);
    }
  };

  const displayName = user?.name || user?.email?.split('@')[0] || 'Builder';
  const displayEmail = user?.email || '';

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="h-8 w-48 bg-white/5 rounded-lg animate-pulse" />
        <div className="h-96 rounded-2xl bg-white/[0.03] border border-white/10 animate-pulse p-6" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-16">
      {/* Page Header */}
      <div className="border-b border-white/10 pb-6">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 px-2.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
            Student Dashboard
          </span>
        </div>
        <h1 className="text-3xl font-black text-white mt-2 flex items-center gap-3">
          <span>My Builder Profile</span>
          <Sparkles className="w-5 h-5 text-emerald-400" />
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Keep your academic details updated for one-click challenge registrations and official certificates.
        </p>
      </div>

      {/* Notification Toast */}
      {message && (
        <div
          className={`p-4 rounded-2xl border flex items-center gap-3 animate-fade-in ${
            message.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-red-500/10 border-red-500/30 text-red-300'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
          )}
          <span className="text-sm font-semibold">{message.text}</span>
        </div>
      )}

      {/* Profile Form Card */}
      <div className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-6 md:p-8 space-y-6 shadow-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Read-only User Identity Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-emerald-400" />
                Full Name (Google Auth)
              </label>
              <input
                type="text"
                disabled
                value={displayName}
                className="w-full px-4 py-3 rounded-xl bg-[#0a0a0a]/60 border border-white/10 text-gray-400 text-sm cursor-not-allowed select-none font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-emerald-400" />
                Email Address (Google Auth)
              </label>
              <input
                type="email"
                disabled
                value={displayEmail}
                className="w-full px-4 py-3 rounded-xl bg-[#0a0a0a]/60 border border-white/10 text-gray-400 text-sm cursor-not-allowed select-none font-mono"
              />
            </div>
          </div>

          <div className="h-px bg-white/5" />

          {/* Editable Academic Details Section */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-400 mb-4 flex items-center gap-2">
              <GraduationCap className="w-4 h-4" />
              Academic Credentials
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Course */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-gray-400" />
                  Course / Degree *
                </label>
                <select
                  name="course"
                  value={formData.course}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-[#0a0a0a] border border-white/10 text-white text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                >
                  {COURSE_OPTIONS.map((c) => (
                    <option key={c} value={c} className="bg-[#0a0a0a] text-white">
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Branch */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2 flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-gray-400" />
                  Branch / Department *
                </label>
                <select
                  name="branch"
                  value={formData.branch}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-[#0a0a0a] border border-white/10 text-white text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                >
                  {BRANCH_OPTIONS.map((b) => (
                    <option key={b} value={b} className="bg-[#0a0a0a] text-white">
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              {/* Academic Year */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-gray-400" />
                  Current Year *
                </label>
                <select
                  name="current_year"
                  value={formData.current_year}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-[#0a0a0a] border border-white/10 text-white text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                >
                  {YEAR_OPTIONS.map((y) => (
                    <option key={y.value} value={y.value} className="bg-[#0a0a0a] text-white">
                      {y.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Roll Number */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2 flex items-center gap-1.5">
                  <Hash className="w-3.5 h-3.5 text-gray-400" />
                  University Roll Number *
                </label>
                <input
                  type="text"
                  name="roll_number"
                  required
                  placeholder="e.g. 2100101"
                  value={formData.roll_number}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl bg-[#0a0a0a] border border-white/10 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-mono"
                />
              </div>

              {/* Section */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-gray-400" />
                  Section (Optional)
                </label>
                <input
                  type="text"
                  name="section"
                  placeholder="e.g. A"
                  value={formData.section}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl bg-[#0a0a0a] border border-white/10 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all uppercase"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-sm shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all flex items-center gap-2"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Profile</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BuilderProfile;
