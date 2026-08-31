import { useState } from 'react';
import { Phone, Users, User, Calendar, MessageSquare, Sparkles, CheckCircle2, ShieldAlert } from 'lucide-react';
import CountdownTimer from './CountdownTimer';
import PinVerifyBox from './PinVerifyBox';

const TeamRequestCard = ({
  post,
  onInterested,
  onVerifyPin,
  isAuthenticated,
  currentUserId,
}) => {
  const [loading, setLoading] = useState(false);
  const [localStatus, setLocalStatus] = useState(post.my_interest_status);
  const [localLockedUntil, setLocalLockedUntil] = useState(post.my_locked_until);
  const [localMobile, setLocalMobile] = useState(post.creator_mobile);
  const [localMembersNeeded, setLocalMembersNeeded] = useState(post.members_needed);

  const isCreator = currentUserId && post.creator_email === currentUserId.email;

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

  return (
    <div className="p-6 md:p-7 rounded-3xl bg-[#10151c]/90 backdrop-blur-2xl border border-white/10 hover:border-sbg-green/40 transition-all duration-300 flex flex-col justify-between group shadow-xl">
      <div className="space-y-4">
        {/* Header Badges */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {post.mode === 'need_members' ? (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-mono font-bold bg-sbg-green/10 text-sbg-green border border-sbg-green/30 uppercase tracking-wider">
                <Users className="w-3.5 h-3.5" /> Seeking Members
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-mono font-bold bg-sky-500/10 text-sky-400 border border-sky-500/30 uppercase tracking-wider">
                <User className="w-3.5 h-3.5" /> Solo Builder
              </span>
            )}
            <span className="text-xs font-mono text-gray-400 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {post.event_name}
            </span>
          </div>

          {post.mode === 'need_members' && (
            <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-white/5 border border-white/10 text-gray-300">
              {localMembersNeeded} {localMembersNeeded === 1 ? 'Slot' : 'Slots'} Open
            </span>
          )}
        </div>

        {/* Creator Info Header */}
        <div className="pt-2 border-b border-white/8 pb-4">
          <h3 className="text-lg font-bold text-white group-hover:text-sbg-green transition-colors leading-tight">
            {post.creator_full_name}
          </h3>
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-400 font-mono mt-1">
            {post.creator_course && <span>{post.creator_course}</span>}
            {post.creator_branch && <span>• {post.creator_branch}</span>}
            {post.creator_academic_year && <span className="text-sbg-green/90">• {post.creator_academic_year}</span>}
          </div>
        </div>

        {/* Requirements & Target Filters */}
        <div className="flex flex-wrap gap-2 text-xs font-mono">
          <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-gray-300">
            Target Year: <strong className="text-white">{post.target_year_display}</strong>
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-gray-300">
            Gender: <strong className="text-white">{post.gender_display}</strong>
          </span>
        </div>

        {/* Description Message */}
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
          <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">
            {post.message}
          </p>
        </div>
      </div>

      {/* Dynamic Interaction & Contact Section */}
      <div className="pt-5 mt-5 border-t border-white/10 space-y-4">

        {/* Dynamic State: ACCEPTED */}
        {localStatus === 'accepted' ? (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4" /> Officially Joined!
              </span>
              <span className="text-[10px] font-mono text-emerald-400/80">Invite Code Verified</span>
            </div>
            {localMobile && (
              <div className="flex items-center gap-2 text-sm font-mono text-white bg-black/30 px-3 py-2 rounded-xl border border-emerald-500/20">
                <Phone className="w-4 h-4 text-emerald-400" />
                <span>Contact: <strong>{localMobile}</strong></span>
              </div>
            )}
          </div>
        ) : localStatus === 'in_process' ? (
          /* Dynamic State: IN_PROCESS (4-hour Lock Active) */
          <div className="space-y-3">
            <div className="flex items-center justify-between bg-amber-500/5 p-3 rounded-2xl border border-amber-500/20">
              <div className="flex items-center gap-2 text-xs font-mono text-amber-300">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Active Slot Lock</span>
              </div>
              <CountdownTimer lockedUntil={localLockedUntil} onExpired={handleTimerExpired} />
            </div>

            {/* Revealing Creator Phone Number */}
            {localMobile ? (
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-sbg-green/10 border border-sbg-green/30 text-sbg-green">
                <div className="flex items-center gap-2 text-sm font-mono font-bold">
                  <Phone className="w-4 h-4" />
                  <span>Creator Mobile: {localMobile}</span>
                </div>
                <a
                  href={`tel:${localMobile}`}
                  className="px-3 py-1 rounded-xl bg-sbg-green text-aws-navy text-xs font-bold hover:bg-white transition-all"
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
          /* Dynamic State: TIMED OUT */
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-red-400 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4" /> Lock Expired
              </span>
              <button
                onClick={handleInterestedClick}
                disabled={loading}
                className="px-3 py-1.5 rounded-xl bg-red-500/20 text-red-300 border border-red-500/30 text-xs font-bold hover:bg-red-500/30 transition-all"
              >
                Re-Lock Slot
              </button>
            </div>
            <p className="text-xs text-gray-400">
              The 4-hour lock expired before the Invite Code was entered. Click Re-Lock to try again.
            </p>
          </div>
        ) : (
          /* Dynamic State: DEFAULT (Not Interested yet) */
          <div className="flex items-center justify-between">
            <div className="text-[11px] font-mono text-gray-400">
              {post.creator_mobile ? (
                <span className="text-sbg-green flex items-center gap-1">
                  <Phone className="w-3 h-3" /> Mobile Revealed
                </span>
              ) : (
                <span className="text-gray-500 flex items-center gap-1">
                  🔒 Mobile Hidden until Interested
                </span>
              )}
            </div>

            <button
              onClick={handleInterestedClick}
              disabled={loading || isCreator}
              className={`px-5 py-2.5 rounded-full text-xs font-bold font-mono transition-all duration-200 flex items-center gap-1.5 ${
                isCreator
                  ? 'bg-white/5 text-gray-500 border border-white/10 cursor-not-allowed'
                  : 'bg-sbg-green text-aws-navy hover:bg-white shadow-lg shadow-sbg-green/10'
              }`}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 border-2 border-aws-navy/30 border-t-aws-navy rounded-full animate-spin" />
                  Locking...
                </span>
              ) : isCreator ? (
                'Your Post'
              ) : (
                <>
                  Interested <Sparkles className="w-3.5 h-3.5" />
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
