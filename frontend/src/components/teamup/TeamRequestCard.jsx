import { useState, useEffect } from 'react';
import { Phone, Users, User, Calendar, Sparkles, CheckCircle2, ShieldAlert, Lock } from 'lucide-react';
import CountdownTimer from './CountdownTimer';
import PinVerifyBox from './PinVerifyBox';

const TeamRequestCard = ({
  post,
  onInterested,
  onVerifyPin,
  onRemovePost,
  isAuthenticated,
  currentUserId,
}) => {
  const [loading, setLoading] = useState(false);
  const [localStatus, setLocalStatus] = useState(post.my_interest_status);
  const [localLockedUntil, setLocalLockedUntil] = useState(post.my_locked_until);
  const [localMobile, setLocalMobile] = useState(post.creator_mobile);
  const [localMembersNeeded, setLocalMembersNeeded] = useState(post.members_needed);

  const isCreator = currentUserId && post.creator_email === currentUserId.email;

  // Auto-remove card from Explore Board 30s after officially joining
  useEffect(() => {
    if (localStatus === 'accepted' && onRemovePost) {
      const timer = setTimeout(() => {
        onRemovePost(post.id);
      }, 30000);
      return () => clearTimeout(timer);
    }
  }, [localStatus, post.id, onRemovePost]);

  const handleInterestedClick = async () => {
    setLoading(true);
    try {
      const res = await onInterested(post.id);
      if (res) {
        setLocalStatus('in_process');
        setLocalLockedUntil(res.locked_until);
        if (res.creator_mobile) setLocalMobile(res.creator_mobile);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPinSubmit = async (pin, onError) => {
    setLoading(true);
    try {
      const res = await onVerifyPin(post.id, pin);
      if (res) {
        setLocalStatus('accepted');
        if (typeof res.members_needed === 'number') {
          setLocalMembersNeeded(res.members_needed);
        }
      }
    } catch (err) {
      const msg = err?.response?.data?.detail || 'Incorrect Invite Code. Try again.';
      onError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleTimerExpired = () => {
    setLocalStatus('timeout');
    setLocalMobile(null);
  };

  const formattedMobile = localMobile
    ? localMobile.startsWith('+')
      ? localMobile
      : `+91 ${localMobile}`
    : '';

  return (
    <div className="bg-[#11161d] border border-gray-800 rounded-xl p-5 hover:border-gray-600 transition-all duration-300 shadow-lg flex flex-col justify-between h-full group">
      <div className="space-y-4">
        {/* Header Badges */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {post.mode === 'need_members' ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#00d084]/10 text-[#00d084] border border-[#00d084]/30 uppercase tracking-wider">
                <Users className="w-3.5 h-3.5" /> Seeking Members
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/30 uppercase tracking-wider">
                <User className="w-3.5 h-3.5" /> Solo Builder
              </span>
            )}
            <span className="text-xs text-gray-400 font-medium flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-gray-500" />
              {post.event_name}
            </span>
          </div>

          {post.mode === 'need_members' && (
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-800 text-gray-300">
              {localMembersNeeded} {localMembersNeeded === 1 ? 'Slot' : 'Slots'} Open
            </span>
          )}
        </div>

        {/* Creator Info Header */}
        <div className="pt-2 border-b border-gray-800/80 pb-4">
          <h3 className="text-xl font-bold text-white mt-1 group-hover:text-[#00d084] transition-colors leading-tight">
            {post.creator_full_name}
          </h3>
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-400 font-mono mt-1.5">
            {post.creator_course && <span>{post.creator_course}</span>}
            {post.creator_branch && <span>• {post.creator_branch}</span>}
            {post.creator_academic_year && <span className="text-[#00d084]">• {post.creator_academic_year}</span>}
          </div>
        </div>

        {/* Requirements & Target Filters (Pill Badges) */}
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="px-3 py-1 bg-gray-800 text-gray-300 text-xs font-medium rounded-full">
            Target Year: <strong className="text-white font-semibold">{post.target_year_display}</strong>
          </span>
          <span className="px-3 py-1 bg-gray-800 text-gray-300 text-xs font-medium rounded-full">
            Gender: <strong className="text-white font-semibold">{post.gender_display}</strong>
          </span>
        </div>

        {/* Description Message */}
        <p className="text-gray-400 text-sm mt-3 leading-relaxed whitespace-pre-line">
          {post.message}
        </p>
      </div>

      {/* Footer Section */}
      <div className="mt-5 pt-4 border-t border-gray-800">
        {/* State 1: ACCEPTED */}
        {localStatus === 'accepted' ? (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4" /> Officially Joined!
              </span>
              <span className="text-[10px] font-mono text-emerald-400/80">Invite Code Verified</span>
            </div>
            {localMobile && (
              <div className="flex items-center justify-between text-sm text-white bg-black/40 px-3.5 py-2 rounded-lg border border-emerald-500/20 mt-1">
                <span className="text-[#00d084] font-bold tracking-wide flex items-center gap-1.5">
                  <Phone className="w-4 h-4" /> {formattedMobile}
                </span>
                <a
                  href={`tel:${localMobile}`}
                  className="px-3 py-1 rounded-lg bg-[#00d084] text-black text-xs font-bold hover:bg-white transition-all"
                >
                  Call Now
                </a>
              </div>
            )}
            <p className="text-[10px] font-mono text-emerald-400/60 text-right pt-0.5">
              ⏱ Card auto-removes from board in 30s
            </p>
          </div>
        ) : localStatus === 'in_process' ? (
          /* State 3: IN_PROCESS (4-hour Lock Active) */
          <div className="space-y-3">
            <div className="flex items-center justify-between bg-amber-500/10 p-3 rounded-xl border border-amber-500/20">
              <div className="flex items-center gap-2 text-xs font-medium text-amber-300">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Active Slot Lock</span>
              </div>
              <CountdownTimer lockedUntil={localLockedUntil} onExpired={handleTimerExpired} />
            </div>

            {/* Revealing Creator Phone Number */}
            {localMobile ? (
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#00d084]/10 border border-[#00d084]/30">
                <div className="text-[#00d084] font-bold text-sm tracking-wide flex items-center gap-1.5">
                  <Phone className="w-4 h-4" />
                  <span>{formattedMobile}</span>
                </div>
                <a
                  href={`tel:${localMobile}`}
                  className="px-3 py-1 rounded-lg bg-[#00d084] text-black text-xs font-bold hover:bg-white transition-all"
                >
                  Call Now
                </a>
              </div>
            ) : (
              <p className="text-xs text-amber-300/80 font-mono">
                📞 Call/WhatsApp the creator offline to request their 4-digit Invite Code!
              </p>
            )}

            {/* Invite Code Entry Box */}
            <PinVerifyBox onVerify={handleVerifyPinSubmit} loading={loading} />
          </div>
        ) : localStatus === 'timeout' ? (
          /* State 5: TIMED OUT */
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-red-400 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4" /> Lock Expired
              </span>
              <button
                onClick={handleInterestedClick}
                disabled={loading}
                className="px-3 py-1.5 rounded-lg bg-red-500/20 text-red-300 border border-red-500/30 text-xs font-bold hover:bg-red-500/30 transition-all"
              >
                Re-Lock Slot
              </button>
            </div>
            <p className="text-xs text-gray-400">
              The 4-hour lock expired before the Invite Code was entered. Click Re-Lock to try again.
            </p>
          </div>
        ) : isCreator ? (
          /* State 1: Own Post (What the creator sees) */
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-gray-500" /> Hidden from you
            </span>
            <button
              disabled
              className="bg-gray-800 text-gray-500 px-4 py-2 rounded-lg text-sm font-semibold cursor-not-allowed"
            >
              👤 This is your post
            </button>
          </div>
        ) : (
          /* State 2: Default (What other users see before clicking) */
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-gray-500" /> Mobile hidden
            </span>

            <button
              onClick={handleInterestedClick}
              disabled={loading}
              className="bg-[#00d084] text-black font-semibold px-4 py-2 rounded-lg text-sm hover:bg-green-400 transition-all flex items-center gap-1.5 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  <span>Locking...</span>
                </>
              ) : (
                <>
                  <span>✋ I'm Interested</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamRequestCard;
