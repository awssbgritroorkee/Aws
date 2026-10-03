import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyRegistrations, submitChallengeProject } from '../services/api';
import {
  Calendar,
  ExternalLink,
  Clock,
  Sparkles,
  Send,
  X,
  AlertCircle,
  PlusCircle,
  FolderGit2,
  Compass,
  FileCheck2,
  GitBranch,
  Globe,
  HardDrive
} from 'lucide-react';

// ── Submission type configuration map ─────────────────────────────────────────
const SUBMISSION_CONFIG = {
  github: {
    label: '🔗 GitHub Repository',
    placeholder: 'Paste GitHub Repo URL (e.g. https://github.com/user/repo)',
    icon: GitBranch,
    helpText: 'Link to the public GitHub repository for your submission.',
  },
  drive: {
    label: '📁 Drive Link (Make sure it\'s public!)',
    placeholder: 'Paste Public Google Drive Link',
    icon: HardDrive,
    helpText: 'Link must be set to "Anyone with the link can view".',
  },
  live_url: {
    label: '🌐 Live Project URL',
    placeholder: 'Paste Live URL (e.g., https://my-app.vercel.app)',
    icon: Globe,
    helpText: 'Link to your live deployed project (Vercel, Render, Netlify, etc.).',
  },
  official: {
    label: '🔗 Official Platform Submission',
    placeholder: 'Paste Devpost, Unstop, or Taikai Submission URL',
    icon: ExternalLink,
    helpText: 'Direct link to your project submission page on the hackathon platform.',
  },
};

const getSubmissionConfig = (type) => SUBMISSION_CONFIG[type] || SUBMISSION_CONFIG.github;

const MyRegistrations = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Submit Modal state
  const [selectedReg, setSelectedReg] = useState(null);
  const [proofUrl, setProofUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [toastType, setToastType] = useState('pending'); // 'success' | 'pending'

  const fetchRegistrations = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMyRegistrations();
      setRegistrations(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      console.error('Failed to fetch registrations:', err);
      setError('Could not load your registrations. Please check your network connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const openSubmitModal = (reg) => {
    setSelectedReg(reg);
    setProofUrl(reg.proof_link || reg.project_link || '');
    setSubmitError(null);
  };

  const closeSubmitModal = () => {
    setSelectedReg(null);
    setProofUrl('');
    setSubmitError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!proofUrl.trim()) {
      setSubmitError('Please enter a valid URL.');
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await submitChallengeProject(selectedReg.challenge, proofUrl.trim());

      const toastText = res.detail || (res.auto_approved
        ? '✅ Project verified and approved! +50 XP added.'
        : '⏳ Proof submitted! Your registration is now under review.');

      // ── Optimistic local state update — runs for BOTH paths ───────────────
      // Auto-approved (GitHub):             flip to 'approved' immediately.
      // Manual review (drive/official/url): flip to 'pending_approval' so the
      // amber "⏳ Under Review" badge appears instantly without waiting for the
      // async refetch to complete.
      setRegistrations((prev) =>
        prev.map((r) =>
          r.id === selectedReg.id
            ? {
                ...r,
                status:       res.auto_approved ? 'approved' : 'pending_approval',
                proof_link:   proofUrl.trim(),
                project_link: proofUrl.trim(),
              }
            : r
        )
      );

      setToastMessage(toastText);
      // ── Colour the toast differently for auto-approvals ──────────────────
      setToastType(res.auto_approved ? 'success' : 'pending');

      closeSubmitModal();

      // Always refetch to sync server-side fields (submitted_at, xp, etc.)
      fetchRegistrations();
      setTimeout(() => setToastMessage(null), 7000);
    } catch (err) {
      console.error('Submission error:', err);
      // Propagate the exact backend validation message into the modal error area
      setSubmitError(
        err.response?.data?.detail ||
          err.response?.data?.proof_link?.[0] ||
          err.response?.data?.project_link?.[0] ||
          'Failed to submit. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const isChallengeEnded = (reg) => {
    if (!reg.challenge_end_time) return reg.challenge_status === 'CONCLUDED';
    return new Date(reg.challenge_end_time) < new Date();
  };

  const getStatusBadge = (reg) => {
    const ended = isChallengeEnded(reg);

    if (reg.status === 'pending_approval') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
          <span>⏳</span> Under Review
        </span>
      );
    }
    if (reg.status === 'approved') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
          <span>✅</span> Approved &amp; XP Rewarded
        </span>
      );
    }
    if (reg.status === 'rejected') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/30">
          <span>❌</span> Rejected - Invalid Proof
        </span>
      );
    }
    if (ended) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gray-500/10 text-gray-400 border border-gray-500/30">
          <span>⏰</span> Deadline Passed
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-sky-500/10 text-sky-400 border border-sky-500/30">
        <Clock className="w-3.5 h-3.5" />
        Registered
      </span>
    );
  };

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto">
        <div className="h-8 w-64 bg-white/5 rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 rounded-2xl bg-white/[0.03] border border-white/10 animate-pulse p-5 space-y-4">
              <div className="h-32 bg-white/5 rounded-xl" />
              <div className="h-6 w-3/4 bg-white/5 rounded" />
              <div className="h-4 w-1/2 bg-white/5 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── Modal — submission type config for currently selected registration ────
  const modalConfig = selectedReg
    ? getSubmissionConfig(selectedReg.challenge_submission_type)
    : null;

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 animate-bounce">
          <div className={`px-5 py-4 rounded-2xl shadow-2xl backdrop-blur-xl flex items-center gap-3 border ${
            toastType === 'success'
              ? 'bg-gradient-to-r from-emerald-900/90 to-emerald-800/90 border-emerald-400/40 text-emerald-200'
              : 'bg-gradient-to-r from-amber-900/90 to-amber-800/90 border-amber-400/40 text-amber-200'
          }`}>
            <Sparkles className={`w-5 h-5 flex-shrink-0 ${
              toastType === 'success' ? 'text-emerald-300' : 'text-amber-300'
            }`} />
            <span className="text-sm font-semibold">{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 px-2.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
              Student Dashboard
            </span>
          </div>
          <h1 className="text-3xl font-black text-white mt-2 flex items-center gap-3">
            <span>My Event Registrations</span>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-white/10 text-gray-300">
              {registrations.length}
            </span>
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Track your RSVPs, submit proof of registration, and claim +50 Builder XP upon admin approval.
          </p>
        </div>
        <Link
          to="/challenges"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all hover:scale-105 shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Explore More Events</span>
        </Link>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && registrations.length === 0 && !error && (
        <div className="rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-xl p-12 text-center max-w-xl mx-auto my-12 space-y-5">
          <div className="w-20 h-20 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-4xl mx-auto">
            🚀
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">No Registrations Yet</h3>
            <p className="text-gray-400 text-sm mt-1">
              You haven't RSVP'd for any external events. Join an active event now to start building your streak &amp; earning XP!
            </p>
          </div>
          <Link
            to="/challenges"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all"
          >
            <Compass className="w-4 h-4" />
            <span>Browse Events</span>
          </Link>
        </div>
      )}

      {/* Registrations Cards Grid */}
      {registrations.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {registrations.map((reg) => {
            const ended = isChallengeEnded(reg);
            const proofLink = reg.proof_link || reg.project_link;
            const submCfg = getSubmissionConfig(reg.challenge_submission_type);

            return (
              <div
                key={reg.id}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/20 transition-all duration-300 flex flex-col justify-between"
              >
                {/* Banner */}
                <div className="relative h-40 overflow-hidden bg-gradient-to-br from-gray-900 to-black">
                  {reg.challenge_image ? (
                    <img
                      src={reg.challenge_image}
                      alt={reg.challenge_title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-emerald-900/40 via-purple-900/30 to-black flex items-center justify-center">
                      <FolderGit2 className="w-12 h-12 text-emerald-500/40" />
                    </div>
                  )}
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-[11px] font-bold text-white uppercase tracking-wider border border-white/10">
                      {reg.challenge_event_type || 'Event'}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3">{getStatusBadge(reg)}</div>
                </div>

                {/* Card Body */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="font-bold text-lg text-white group-hover:text-emerald-400 transition-colors line-clamp-1">
                      {reg.challenge_title}
                    </h3>
                    <div className="mt-2 space-y-1 text-xs text-gray-400">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-gray-500" />
                        <span>Starts: {formatDate(reg.challenge_start_time)}</span>
                      </div>
                      {reg.challenge_end_time && (
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-gray-500" />
                          <span>Deadline: {formatDate(reg.challenge_end_time)}</span>
                        </div>
                      )}
                    </div>

                    {/* Submission type chip */}
                    <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-[11px] text-gray-400 font-medium">
                      <submCfg.icon className="w-3 h-3" />
                      <span>{submCfg.label.replace(/^[^\s]+\s/, '')}</span>
                    </div>
                  </div>

                  {/* Submitted proof link */}
                  {proofLink && (
                    <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-xs">
                      <p className="text-gray-500 font-semibold text-[10px] uppercase tracking-wider">
                        Submitted Link:
                      </p>
                      <a
                        href={proofLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-400 hover:underline flex items-center gap-1 mt-0.5 truncate font-mono text-[11px]"
                      >
                        <FileCheck2 className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="truncate">{proofLink}</span>
                        <ExternalLink className="w-3 h-3 flex-shrink-0 ml-auto" />
                      </a>
                    </div>
                  )}

                  {/* Card Actions */}
                  <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                    <Link
                      to={reg.challenge_slug ? `/challenges/${reg.challenge_slug}` : '/challenges'}
                      className="text-xs text-gray-400 hover:text-white transition-colors flex items-center gap-1 font-medium"
                    >
                      <span>View Details</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>

                    {/* Submit button — only for registered & before deadline */}
                    {reg.status === 'registered' && !ended && (
                      <button
                        onClick={() => openSubmitModal(reg)}
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all flex items-center gap-1.5"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Submit Proof</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Submit Proof Modal ───────────────────────────────────────────────── */}
      {selectedReg && modalConfig && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md" onClick={closeSubmitModal} />

          {/* Modal */}
          <div className="relative z-10 w-full max-w-lg rounded-3xl border border-white/20 bg-[#0a0a0a] p-6 md:p-8 shadow-2xl space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <FileCheck2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Submit Registration Proof</h3>
                  <p className="text-xs text-gray-400 truncate max-w-xs">{selectedReg.challenge_title}</p>
                </div>
              </div>
              <button
                onClick={closeSubmitModal}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Workflow callout */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-amber-300">Manual Verification — +50 XP on Approval</p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Once our team verifies your submission, +50 XP will be added to your Builder profile. Make sure your link is publicly accessible.
                </p>
              </div>
            </div>

            {/* ⚠️ Anti-cheat warning — GitHub type only */}
            {selectedReg.challenge_submission_type === 'github' && (
              <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/50 text-orange-400 text-sm flex items-start gap-2">
                <span className="text-base flex-shrink-0">⚠️</span>
                <span>
                  <strong>Anti-Cheat Rule:</strong> Your repository's{' '}
                  <code className="bg-orange-500/20 px-1 rounded text-orange-300">README.md</code> MUST include the tag{' '}
                  <strong className="text-orange-300">#AWSSBG-RIT-2026</strong>. Projects without this tag will be automatically rejected.
                </span>
              </div>
            )}

            {/* ℹ️ Official platform info — official type only */}
            {selectedReg.challenge_submission_type === 'official' && (
              <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/50 text-blue-400 text-sm flex items-start gap-2">
                <span className="text-base flex-shrink-0">ℹ️</span>
                <span>
                  <strong>Verification Rule:</strong> Please provide the exact URL to your project submission on the hosting platform (Devpost/Unstop/Taikai). Admins will verify your team members and submission timestamp directly on their portal.
                </span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
                  {modalConfig.label} *
                </label>
                <input
                  type="url"
                  required
                  placeholder={modalConfig.placeholder}
                  value={proofUrl}
                  onChange={(e) => setProofUrl(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-emerald-500 transition-colors font-mono"
                />
                {/* Helper text */}
                <p className="text-[11px] text-gray-500 mt-1.5">{modalConfig.helpText}</p>
              </div>

              {/* Dynamic admin-set submission instructions */}
              {selectedReg.challenge_submission_instructions && (
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 text-gray-400 text-xs leading-relaxed">
                  <p className="font-bold text-gray-300 text-[11px] uppercase tracking-wider mb-1">
                    📋 Submission Instructions
                  </p>
                  {selectedReg.challenge_submission_instructions}
                </div>
              )}

              {submitError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{submitError}</span>
                </div>
              )}

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={closeSubmitModal}
                  className="px-5 py-2.5 rounded-xl border border-white/10 text-gray-300 hover:text-white text-xs font-bold hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Submit Proof</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyRegistrations;
