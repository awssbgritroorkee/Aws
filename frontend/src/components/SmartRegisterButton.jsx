import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getBuilderProfile, registerForChallenge, getMyRegistrations } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Zap, CheckCircle2, ArrowRight, ExternalLink, Send } from 'lucide-react';
import ExternalEventRegistrationModal from './ExternalEventRegistrationModal';

const SmartRegisterButton = ({ challengeId, challengeSlug, isExternal, externalUrl, challenge, className = '' }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [registering, setRegistering]   = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [showModal, setShowModal]       = useState(false);
  const [toast, setToast]               = useState(null); // { type: 'warning' | 'success' | 'info' | 'error', text }

  // ── Check if already registered on mount ────────────────────────────────
  useEffect(() => {
    if (!user || isExternal) return;
    let isMounted = true;
    const checkRegistrationStatus = async () => {
      try {
        const regs = await getMyRegistrations();
        const list = Array.isArray(regs) ? regs : regs.results || [];
        const found = list.some(
          (r) => r.challenge === challengeId || (challengeSlug && r.challenge_slug === challengeSlug)
        );
        if (found && isMounted) {
          setIsRegistered(true);
        }
      } catch {
        // Silent fail if unauthenticated or network error
      }
    };
    checkRegistrationStatus();
    return () => { isMounted = false; };
  }, [user, challengeId, challengeSlug, isExternal]);

  // ── Also check external registrations on mount ───────────────────────────
  useEffect(() => {
    if (!user || !isExternal) return;
    let isMounted = true;
    const checkExternalRegistration = async () => {
      try {
        const regs = await getMyRegistrations();
        const list = Array.isArray(regs) ? regs : regs.results || [];
        const found = list.some(
          (r) => r.challenge === challengeId || (challengeSlug && r.challenge_slug === challengeSlug)
        );
        if (found && isMounted) {
          setIsRegistered(true);
        }
      } catch {
        // Silent fail
      }
    };
    checkExternalRegistration();
    return () => { isMounted = false; };
  }, [user, challengeId, challengeSlug, isExternal]);

  const showToast = (type, text) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 5000);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    // 1. Unauthenticated guard
    if (!user) {
      showToast('warning', '⚠️ Please sign in with Google to register for challenges.');
      return;
    }

    // 2. External event → open the registration modal instead of direct redirect
    if (isExternal) {
      setShowModal(true);
      return;
    }

    // ── Internal challenge registration flow (unchanged) ─────────────────────
    setRegistering(true);

    try {
      // Fetch current profile data
      const res     = await getBuilderProfile();
      const profile = res.data || res;

      const rollNumber = (profile.roll_number || '').trim();
      const course     = (profile.course     || '').trim();
      const branch     = (profile.branch     || '').trim();

      // Condition A (Incomplete Profile): Stop & redirect to /dashboard/profile
      if (!rollNumber || !course || !branch) {
        showToast('warning', '⚠️ Please complete your Builder Profile (Roll Number, Course) to register for events.');
        setTimeout(() => {
          navigate('/dashboard/profile');
        }, 1200);
        setRegistering(false);
        return;
      }

      // Condition B (Complete Profile): Proceed with registration
      await registerForChallenge(challengeId);
      setIsRegistered(true);
      showToast('success', '🎉 Successfully Registered! Check your dashboard.');

    } catch (err) {
      console.error('Registration error:', err);
      const detail = err.response?.data?.detail || '';
      if (err.response?.status === 400 && detail.toLowerCase().includes('already registered')) {
        setIsRegistered(true);
        showToast('info', 'ℹ️ You are already registered for this event. View in Dashboard!');
      } else if (err.response?.status === 403) {
        showToast('warning', `⚠️ ${detail}`);
      } else {
        showToast('error', detail || 'Registration failed. Please try again.');
      }
    } finally {
      setRegistering(false);
    }
  };

  // ── Modal success callback — fired when local registration is confirmed ───
  const handleModalSuccess = () => {
    setIsRegistered(true);
    setShowModal(false);
  };

  // ── Toast UI ──────────────────────────────────────────────────────────────
  const renderToast = () => {
    if (!toast) return null;
    const typeStyles = {
      warning: 'bg-amber-950/90 border-amber-500/40 text-amber-200',
      success: 'bg-emerald-950/90 border-emerald-400/40 text-emerald-200',
      info:    'bg-blue-950/90 border-blue-400/40 text-blue-200',
      error:   'bg-red-950/90 border-red-500/40 text-red-200',
    };
    return (
      <div className="fixed top-6 right-6 z-50 animate-bounce">
        <div
          className={`px-5 py-4 rounded-2xl border shadow-2xl backdrop-blur-xl flex items-center gap-3 text-sm font-semibold max-w-md ${
            typeStyles[toast.type] || typeStyles.info
          }`}
        >
          <span>{toast.text}</span>
        </div>
      </div>
    );
  };

  // ── Registered state — Official website + "Submit Project" CTA ────────────
  if (isRegistered) {
    return (
      <>
        {renderToast()}

        <div className="flex flex-wrap items-center gap-4">
          {/* External event: keep existing "Now register on Official website" button visible */}
          {isExternal ? (
            <button
              id="ext-official-register-btn"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (externalUrl) window.open(externalUrl, '_blank', 'noopener,noreferrer');
              }}
              className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-full font-bold text-sm bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20 hover:text-emerald-200 transition-all duration-200 ${className}`}
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>🌐 Now register on Official website</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-60" />
            </button>
          ) : null}

          {/* Conditional "Submit Project" button (redirects to /dashboard/registrations) */}
          <Link
            to="/dashboard/registrations"
            onClick={(e) => e.stopPropagation()}
            className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-full font-bold text-sm bg-sbg-green hover:bg-white text-aws-navy shadow-[0_0_20px_rgba(0,208,132,0.3)] hover:scale-105 transition-all duration-200 ${className}`}
          >
            <Send className="w-4 h-4 text-aws-navy" />
            <span>Submit Project</span>
            <ArrowRight className="w-4 h-4 text-aws-navy" />
          </Link>
        </div>
      </>
    );
  }

  // ── Default state — Register button ──────────────────────────────────────
  return (
    <>
      {renderToast()}

      <button
        onClick={handleRegister}
        disabled={registering}
        className={`inline-flex items-center justify-center gap-2.5 px-6 py-2.5 rounded-full font-bold text-sm bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:scale-105 transition-all duration-200 ${className}`}
      >
        {registering ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span>Verifying Profile...</span>
          </>
        ) : (
          <>
            <Zap className="w-4 h-4" />
            <span>Register</span>
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>

      {/* External event registration modal */}
      {showModal && isExternal && (
        <ExternalEventRegistrationModal
          challenge={challenge || { id: challengeId, title: '', registration_link: externalUrl }}
          onClose={() => setShowModal(false)}
          onSuccess={handleModalSuccess}
        />
      )}
    </>
  );
};

export default SmartRegisterButton;
