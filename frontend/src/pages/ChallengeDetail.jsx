import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ExternalLink, Clock, Trophy, Zap, Calendar, ArrowLeft,
  Shield, Gift, Users, Timer, Star, ChevronRight, Flame,
  Globe, MapPin, Layers, Building2, DollarSign
} from 'lucide-react';
import SmartRegisterButton from '../components/SmartRegisterButton';
import usePageTitle from '../hooks/usePageTitle';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const formatDate = (iso) => {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
};

const formatCountdown = (endIso) => {
  if (!endIso) return null;
  const diff = new Date(endIso) - new Date();
  if (diff <= 0) return null;
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  if (d > 0) return `${d}d ${h}h remaining`;
  if (h > 0) return `${h}h ${m}m remaining`;
  return `${m}m remaining`;
};

/** Status badge styling */
const STATUS_CONFIG = {
  UPCOMING: {
    pill: 'bg-amber-500/15 text-amber-400 border border-amber-500/30 backdrop-blur-sm',
    solid: 'bg-amber-500/90 text-amber-950',
    icon: Clock,
    label: 'Upcoming',
    pulse: false,
  },
  LIVE: {
    pill: 'bg-sbg-green/15 text-sbg-green border border-sbg-green/30 backdrop-blur-sm',
    solid: 'bg-sbg-green/90 text-aws-navy',
    icon: Zap,
    label: 'Live Event',
    pulse: true,
  },
  CONCLUDED: {
    pill: 'bg-gray-500/15 text-gray-400 border border-gray-500/25 backdrop-blur-sm',
    solid: 'bg-gray-700/90 text-gray-200',
    icon: Trophy,
    label: 'Concluded',
    pulse: false,
  },
};

/** Event Type styling */
const EVENT_TYPE_BADGES = {
  sprint: { label: 'Internal Sprint', bg: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30', icon: Zap },
  hackathon: { label: 'Global Hackathon', bg: 'bg-amber-500/15 text-amber-400 border border-amber-500/30', icon: Trophy },
  workshop: { label: 'Workshop / Bootcamp', bg: 'bg-blue-500/15 text-blue-400 border border-blue-500/30', icon: Layers },
  event: { label: 'Online Event', bg: 'bg-purple-500/15 text-purple-400 border border-purple-500/30', icon: Globe },
};

const StatusBadge = ({ status, variant = 'pill', className = '' }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.CONCLUDED;
  const Icon = cfg.icon;
  const base = variant === 'solid' ? cfg.solid : cfg.pill;

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-black shadow-lg ${base} ${className}`}>
      {cfg.pulse && (
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sbg-green opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-sbg-green" />
        </span>
      )}
      {!cfg.pulse && <Icon className="w-3.5 h-3.5" />}
      {cfg.label}
    </span>
  );
};

const EventTypeBadge = ({ eventType, className = '' }) => {
  const cfg = EVENT_TYPE_BADGES[eventType] || EVENT_TYPE_BADGES.sprint;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold backdrop-blur-sm ${cfg.bg} ${className}`}>
      <Icon className="w-3.5 h-3.5" />
      {cfg.label}
    </span>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

const PageSkeleton = () => (
  <div className="animate-pulse space-y-8">
    <div className="h-48 lg:h-64 rounded-3xl bg-white/5 w-full" />
    <div className="space-y-4 max-w-3xl">
      <div className="h-4 bg-white/10 rounded w-1/4" />
      <div className="h-10 bg-white/10 rounded w-3/4" />
      <div className="h-4 bg-white/10 rounded w-full" />
      <div className="h-4 bg-white/10 rounded w-5/6" />
    </div>
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 border-y border-white/10 py-6">
      {[1, 2, 3].map(i => <div key={i} className="h-20 bg-white/5 rounded-xl" />)}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-12">
      <div className="space-y-4">
        {[1, 2, 3].map(i => <div key={i} className="h-24 bg-white/5 rounded-xl" />)}
      </div>
      <div className="space-y-4">
        {[1, 2].map(i => <div key={i} className="h-24 bg-white/5 rounded-xl" />)}
      </div>
    </div>
  </div>
);

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="flex items-center gap-3.5 p-4 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 hover:border-white/20 transition-all duration-200">
    <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${color}`}>
      <Icon className="w-4.5 h-4.5" />
    </div>
    <div className="min-w-0">
      <p className="text-[11px] font-mono text-gray-400 uppercase tracking-wider">{label}</p>
      <p className="text-sm font-bold text-white truncate mt-0.5">{value}</p>
    </div>
  </div>
);

const RuleCard = ({ rule, index }) => (
  <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-5 mb-4 hover:bg-white/10 transition-colors flex items-start gap-4">
    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-sbg-green/10 border border-sbg-green/20 flex items-center justify-center text-xs font-mono font-black text-sbg-green mt-0.5">
      {String(index + 1).padStart(2, '0')}
    </div>
    <div className="min-w-0 flex-1">
      <h4 className="text-sm font-bold text-white mb-1.5 leading-snug">
        {rule.title}
      </h4>
      <p className="text-xs text-gray-300 leading-relaxed">{rule.description}</p>
    </div>
  </div>
);

const RewardCard = ({ reward, index }) => {
  const rankBadges = ['🥇', '🥈', '🥉'];
  return (
    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-5 mb-4 hover:bg-white/10 transition-colors">
      <div className="flex items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-3">
          <span className="text-lg">{rankBadges[index] || '🏆'}</span>
          <h4 className="text-sm font-bold text-white leading-snug">{reward.title}</h4>
        </div>
        {reward.prize_value && (
          <span className="text-xs font-mono font-black px-2.5 py-1 rounded-full bg-sbg-green/10 text-sbg-green border border-sbg-green/20 flex-shrink-0">
            {reward.prize_value}
          </span>
        )}
      </div>
      <p className="text-xs text-gray-300 leading-relaxed">{reward.description}</p>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

const ChallengeDetail = () => {
  const { slug } = useParams();

  const [challenge, setChallenge] = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);

  usePageTitle(
    challenge ? challenge.title : 'Challenge & Events',
    challenge
      ? (challenge.short_description || challenge.description?.slice(0, 155))
      : 'AWS SBG RIT Challenge & Event Details'
  );

  const fetchChallenge = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API_BASE_URL}/api/challenges/${slug}/`);
      if (res.status === 404) throw new Error('challenge_not_found');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setChallenge(data);
    } catch (err) {
      console.error('ChallengeDetail fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => { fetchChallenge(); }, [fetchChallenge]);

  const status     = challenge?.status || 'CONCLUDED';
  const isLive     = status === 'LIVE';
  const countdown  = challenge ? formatCountdown(challenge.end_time) : null;
  const targetLink = challenge?.external_link || challenge?.registration_link;
  const isExternal = Boolean(challenge?.external_link || challenge?.event_type === 'hackathon' || challenge?.event_type === 'workshop');

  // Dynamic stats grid cards
  const stats = challenge ? [
    challenge.total_prize_pool && { icon: DollarSign, label: 'Prize Pool',  value: challenge.total_prize_pool, color: 'bg-amber-500/10 text-amber-400' },
    challenge.organizer        && { icon: Building2,  label: 'Organizer',   value: challenge.organizer,        color: 'bg-purple-500/10 text-purple-400' },
    challenge.mode             && { icon: Globe,      label: 'Mode',        value: challenge.mode,             color: 'bg-emerald-500/10 text-emerald-400' },
    challenge.duration         && { icon: Timer,      label: 'Duration',    value: challenge.duration,         color: 'bg-sbg-green/10 text-sbg-green' },
    challenge.max_seats        && { icon: Users,      label: 'Max Seats',   value: challenge.max_seats,        color: 'bg-blue-500/10 text-blue-400' },
    challenge.judging_type     && { icon: Shield,     label: 'Judging',     value: challenge.judging_type,     color: 'bg-indigo-500/10 text-indigo-400' },
  ].filter(Boolean) : [];

  return (
    <div className="relative flex-grow flex flex-col min-h-[calc(100vh-5rem)] bg-[#050505] text-white pt-24 pb-16 overflow-hidden">
      {/* Background atmosphere */}
      <div
        aria-hidden="true"
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full blur-[160px] -z-10 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(0,208,132,0.06) 0%, transparent 65%)' }}
      />
      <div
        aria-hidden="true"
        className="absolute bottom-40 left-0 w-[500px] h-[400px] rounded-full blur-[120px] -z-10 pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.05) 0%, transparent 70%)' }}
      />

      {/* Main Container Flow */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8 pb-16 flex-grow flex flex-col w-full">

        {/* Back navigation */}
        <Link
          to="/challenges"
          className="inline-flex items-center gap-2 text-sm font-mono text-gray-400 hover:text-sbg-green transition-colors duration-200 mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
          Back to Challenges & Events
        </Link>

        {/* Loading Skeleton */}
        {loading && <PageSkeleton />}

        {/* Challenge Not Found Error */}
        {!loading && error === 'challenge_not_found' && (
          <div className="text-center py-24 px-6 rounded-3xl border border-white/10 bg-white/[0.03]">
            <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-5" />
            <h2 className="text-2xl font-bold text-white mb-3">Event Not Found</h2>
            <p className="text-gray-400 mb-8">The event <code className="text-sbg-green font-mono bg-sbg-green/10 px-2 py-0.5 rounded">{slug}</code> doesn't exist or may have been removed.</p>
            <Link
              to="/challenges"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-sbg-green text-aws-navy font-bold text-sm hover:bg-white transition-colors"
            >
              View All Events <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* Generic Error */}
        {!loading && error && error !== 'challenge_not_found' && (
          <div className="text-center py-20 px-6 rounded-3xl border border-red-500/20 bg-red-500/5">
            <p className="text-red-400 font-medium text-lg">Failed to load event details.</p>
            <p className="text-xs text-gray-500 mt-2 font-mono">{error}</p>
            <button
              onClick={fetchChallenge}
              className="mt-6 px-5 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-gray-300 hover:text-white hover:border-white/20 transition-all"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Main Content Article */}
        {!loading && !error && challenge && (
          <article>

            {/* 1. Hero Poster Banner */}
            <div className="w-full h-48 lg:h-64 rounded-3xl overflow-hidden border border-white/10 mb-8 relative group">
              {challenge.image ? (
                <img
                  src={challenge.image}
                  alt={challenge.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              ) : (
                <div
                  className="w-full h-full flex flex-col items-center justify-center gap-4"
                  style={{ background: 'linear-gradient(135deg, #0a0f1a 0%, #0f2027 40%, #1a3a4a 80%, #0a1628 100%)' }}
                >
                  <Trophy className="w-20 h-20 text-sbg-green opacity-40" />
                  <span className="text-xs font-mono font-bold text-sbg-green/40 uppercase tracking-[0.3em]">
                    AWS SBG Challenge & Events
                  </span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1a]/85 via-transparent to-transparent" />
              <div className="absolute bottom-5 left-5 flex items-center gap-2 flex-wrap">
                <EventTypeBadge eventType={challenge.event_type} />
                <StatusBadge status={status} variant="solid" />
                {countdown && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold text-amber-300 bg-amber-400/20 border border-amber-400/30 backdrop-blur-sm">
                    <Flame className="w-3.5 h-3.5" /> {countdown}
                  </span>
                )}
              </div>
            </div>

            {/* 2. Header, Dates & Main Description */}
            <div className="mb-8">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <EventTypeBadge eventType={challenge.event_type} />
                    {challenge.organizer && (
                      <span className="text-xs font-mono text-gray-400 flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-purple-400" /> Organized by <strong className="text-white">{challenge.organizer}</strong>
                      </span>
                    )}
                  </div>

                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
                    {challenge.title}
                  </h1>
                </div>

                {/* Relocated Registration Button */}
                <div className="flex-shrink-0 pt-1 md:pt-0">
                  <SmartRegisterButton
                    challengeId={challenge.id}
                    challengeSlug={challenge.slug}
                    isExternal={isExternal}
                    externalUrl={targetLink}
                    challenge={challenge}
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 mb-6">
                <StatusBadge status={status} variant="pill" />
                <span className="flex items-center gap-1.5 text-xs font-mono text-gray-400">
                  <Calendar className="w-3.5 h-3.5 text-sbg-green" />
                  Starts: {formatDate(challenge.start_time)}
                </span>
                <span className="flex items-center gap-1.5 text-xs font-mono text-gray-400">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  Ends: {formatDate(challenge.end_time)}
                </span>
              </div>

              {/* Short Description Teaser */}
              {challenge.short_description && (
                <p className="text-gray-300 text-lg leading-relaxed mb-6 font-medium">
                  {challenge.short_description}
                </p>
              )}

              {/* Rich Text Description */}
              {(challenge.description || challenge.long_description) && (
                <div className="mt-8 mb-12 text-gray-300 leading-relaxed space-y-4">
                  <div 
                    dangerouslySetInnerHTML={{ __html: challenge.long_description || challenge.description }} 
                    className="html-content-container challenge-rich-content prose prose-invert max-w-none"
                  />
                </div>
              )}

              {/* 3. Stats Grid Alignment */}
              {stats.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-8 border-y border-white/10 py-6">
                  {stats.map((stat) => (
                    <StatCard key={stat.label} {...stat} />
                  ))}
                </div>
              )}
            </div>

            {/* 4. Strict 2-Column Rules & Rewards */}
            {(challenge.rules?.length > 0 || challenge.rewards?.length > 0) && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-12">

                {/* Left Column — Rules */}
                {challenge.rules?.length > 0 && (
                  <section aria-label="Rules & Guidelines">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2.5 text-left">
                      <Shield className="w-5 h-5 text-sbg-green" />
                      Rules & Blueprint
                    </h3>
                    <div>
                      {[...challenge.rules]
                        .sort((a, b) => a.order - b.order)
                        .map((rule, idx) => (
                          <RuleCard key={rule.id} rule={rule} index={idx} />
                        ))}
                    </div>
                  </section>
                )}

                {/* Right Column — Rewards */}
                {challenge.rewards?.length > 0 && (
                  <section aria-label="Rewards & Bounty Pool">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2.5 text-left">
                      <Gift className="w-5 h-5 text-purple-400" />
                      Rewards & Bounty Pool
                    </h3>
                    <div>
                      {[...challenge.rewards]
                        .sort((a, b) => a.order - b.order)
                        .map((reward, idx) => (
                          <RewardCard key={reward.id} reward={reward} index={idx} />
                        ))}
                    </div>
                  </section>
                )}
              </div>
            )}

            {/* TL;DR teaser card if available */}
            {challenge.short_description && challenge.long_description && (
              <div className="mt-12 p-6 rounded-2xl bg-sbg-green/[0.04] border border-sbg-green/15 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-4 h-4 text-sbg-green" />
                  <span className="text-xs font-mono font-bold text-sbg-green uppercase tracking-widest">TL;DR Summary</span>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed">{challenge.short_description}</p>
              </div>
            )}

          </article>
        )}
      </div>
    </div>
  );
};

export default ChallengeDetail;
