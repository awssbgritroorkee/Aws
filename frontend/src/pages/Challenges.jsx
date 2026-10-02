import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Clock, Trophy, Zap, Calendar, ChevronRight, Flame,
  Share2, Check, Globe, Layers, DollarSign,
  Building2, LayoutGrid, Cpu, BookOpen,
} from 'lucide-react';
import SmartRegisterButton from '../components/SmartRegisterButton';
import usePageTitle from '../hooks/usePageTitle';
import { useToast } from '../components/ui/Toast';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
const isActive = (c) => new Date(c.end_time) > new Date();

const slugify = (text) => {
  if (!text) return '';
  return text.toString().toLowerCase().trim()
    .replace(/\s+/g, '-').replace(/[^\w\-]+/g, '').replace(/\-\-+/g, '-');
};

const formatDate = (iso) => {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

const formatCountdown = (endIso) => {
  const diff = new Date(endIso) - new Date();
  if (diff <= 0) return null;
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  if (d > 0) return `${d}d ${h}h left`;
  if (h > 0) return `${h}h ${m}m left`;
  return `${m}m left`;
};

// ─────────────────────────────────────────────────────────────────────────────
// Event type config — dynamic badge styles per event_type
// ─────────────────────────────────────────────────────────────────────────────
const EVENT_TYPE_CONFIG = {
  sprint: {
    badge: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/25',
    icon:  Cpu,
    label: 'Internal Sprint',
  },
  hackathon: {
    badge: 'bg-purple-500/20 text-purple-400 border border-purple-500/25',
    icon:  Globe,
    label: 'Global Hackathon',
  },
  workshop: {
    badge: 'bg-blue-500/20 text-blue-400 border border-blue-500/25',
    icon:  BookOpen,
    label: 'Workshop',
  },
  event: {
    badge: 'bg-blue-500/20 text-blue-400 border border-blue-500/25',
    icon:  Layers,
    label: 'Online Event',
  },
};

const getTypeCfg = (eventType) =>
  EVENT_TYPE_CONFIG[eventType] || EVENT_TYPE_CONFIG.sprint;

// ─────────────────────────────────────────────────────────────────────────────
// Status badge
// ─────────────────────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  UPCOMING:  { pill: 'bg-amber-500/15 text-amber-400 border border-amber-500/30', icon: Clock,   label: 'Upcoming',  pulse: false },
  LIVE:      { pill: 'bg-sbg-green/15 text-sbg-green border border-sbg-green/30',  icon: Zap,    label: 'Live',      pulse: true  },
  CONCLUDED: { pill: 'bg-gray-500/15 text-gray-400 border border-gray-500/25',     icon: Trophy, label: 'Concluded', pulse: false },
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.CONCLUDED;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-black uppercase tracking-wider ${cfg.pill}`}>
      {cfg.pulse ? (
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sbg-green opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-sbg-green" />
        </span>
      ) : <Icon className="w-3.5 h-3.5" />}
      {cfg.label}
    </span>
  );
};

const EventTypeBadge = ({ eventType }) => {
  const cfg = getTypeCfg(eventType);
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold ${cfg.badge}`}>
      <Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Skeleton loaders
// ─────────────────────────────────────────────────────────────────────────────
const SpotlightSkeleton = () => (
  <div className="animate-pulse rounded-3xl overflow-hidden border border-white/10 bg-white/5 h-80 w-full" />
);

const CardSkeleton = () => (
  <div className="animate-pulse flex flex-col rounded-2xl overflow-hidden border border-white/10 bg-white/5">
    <div className="w-full h-44 bg-white/10" />
    <div className="p-5 space-y-3">
      <div className="h-3 bg-white/10 rounded w-1/3" />
      <div className="h-5 bg-white/10 rounded w-3/4" />
      <div className="h-3 bg-white/10 rounded w-full" />
      <div className="h-3 bg-white/10 rounded w-2/3" />
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Countdown chip
// ─────────────────────────────────────────────────────────────────────────────
const Countdown = ({ endTime }) => {
  const [label, setLabel] = useState(() => formatCountdown(endTime));
  useEffect(() => {
    const id = setInterval(() => setLabel(formatCountdown(endTime)), 60000);
    return () => clearInterval(id);
  }, [endTime]);
  if (!label) return null;
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-amber-400 bg-amber-400/10 border border-amber-400/25 px-3 py-1 rounded-full">
      <Flame className="w-3.5 h-3.5" />{label}
    </span>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Spotlight card (featured / live event)
// ─────────────────────────────────────────────────────────────────────────────
const SpotlightCard = ({ challenge, onShare, isCopied }) => {
  const navigate = useNavigate();
  return (
    <div
      id={`challenge-spotlight-${challenge.id}`}
      onClick={() => navigate(`/challenges/${challenge.slug || challenge.id}`)}
      className="relative overflow-hidden rounded-3xl border border-white/15 backdrop-blur-xl group transition-all duration-500 cursor-pointer hover:border-sbg-green/40"
      style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(0,208,132,0.05) 50%, rgba(255,255,255,0.03) 100%)',
        boxShadow: '0 0 80px rgba(0,208,132,0.08), inset 0 1px 0 rgba(255,255,255,0.1)',
      }}
    >
      <div aria-hidden="true" className="absolute -top-32 -right-32 w-80 h-80 bg-sbg-green/10 rounded-full blur-[80px] pointer-events-none" />
      <div className="relative z-10 flex flex-col lg:flex-row gap-0">
        {/* Image */}
        <div className="lg:w-2/5 h-56 lg:h-auto flex-shrink-0 overflow-hidden">
          {challenge.image ? (
            <img src={challenge.image} alt={challenge.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-3" style={{ background: 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)' }}>
              <Trophy className="w-14 h-14 text-sbg-green opacity-60" />
              <span className="text-xs font-mono font-bold text-sbg-green/60 uppercase tracking-widest">AWS SBG</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-8 lg:p-10 flex flex-col justify-between">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={challenge.status} />
              <EventTypeBadge eventType={challenge.event_type} />
              <Countdown endTime={challenge.end_time} />
            </div>
            <button
              id={`share-btn-spotlight-${challenge.id}`}
              onClick={(e) => onShare(e, challenge)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono font-medium text-gray-300 bg-white/5 border border-white/10 hover:text-sbg-green hover:border-sbg-green/30 hover:bg-sbg-green/10 transition-all duration-200"
            >
              {isCopied ? <Check className="w-3.5 h-3.5 text-sbg-green" /> : <Share2 className="w-3.5 h-3.5" />}
              {isCopied ? 'Copied!' : 'Share'}
            </button>
          </div>

          <div className="flex-1">
            {/* Organizer */}
            {challenge.organizer && (
              <p className="text-xs font-mono text-gray-400 mb-2 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-purple-400" />
                Hosted by <span className="text-purple-300 font-bold">{challenge.organizer}</span>
              </p>
            )}
            <h2 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight mb-3 group-hover:text-sbg-green transition-colors duration-300">
              {challenge.title}
            </h2>
            <p className="text-gray-300 text-base leading-relaxed line-clamp-3 max-w-xl">
              {challenge.short_description || challenge.description}
            </p>
          </div>

          <div className="mt-8 pt-5 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-5 text-xs font-mono text-gray-400">
              <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-sbg-green" />Starts: {formatDate(challenge.start_time)}</span>
              <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-amber-400" />Ends: {formatDate(challenge.end_time)}</span>
              {challenge.total_prize_pool && (
                <span className="flex items-center gap-1.5 text-green-400 font-bold">
                  <DollarSign className="w-3.5 h-3.5" />{challenge.total_prize_pool}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <SmartRegisterButton
                challengeId={challenge.id}
                challengeSlug={challenge.slug}
                isExternal={Boolean(challenge.external_link || challenge.event_type === 'hackathon' || challenge.event_type === 'workshop')}
                externalUrl={challenge.external_link || challenge.registration_link}
              />
              <span className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full font-bold text-xs bg-white/10 text-white hover:bg-white/20 transition-all duration-200">
                Details <ChevronRight className="w-4 h-4" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Unified challenge card
// ─────────────────────────────────────────────────────────────────────────────
const ChallengeCard = ({ challenge, onShare, isCopied }) => {
  const navigate = useNavigate();
  const typeCfg = getTypeCfg(challenge.event_type);
  const TypeIcon = typeCfg.icon;
  const isHackathon = challenge.event_type === 'hackathon';

  return (
    <div
      id={`challenge-card-${challenge.id}`}
      onClick={() => navigate(`/challenges/${challenge.slug || challenge.id}`)}
      className={`flex flex-col bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden
        ${isHackathon ? 'hover:border-purple-500/30 hover:shadow-purple-900/20' : 'hover:border-white/30'}
        hover:-translate-y-1 hover:shadow-xl hover:shadow-black/30 transition-all duration-300 group cursor-pointer`}
    >
      {/* Cover image */}
      <div className="w-full h-44 overflow-hidden flex-shrink-0"
        style={{ background: `linear-gradient(135deg, ${isHackathon ? '#1a0533, #2d1060, #0f2027' : '#0f2027, #203a43, #2c5364'})` }}
      >
        {challenge.image ? (
          <img
            src={challenge.image}
            alt={challenge.title}
            className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2">
            <TypeIcon className={`w-10 h-10 opacity-40 ${isHackathon ? 'text-purple-400' : 'text-sbg-green'}`} />
            <span className="text-xs font-mono text-gray-600 uppercase tracking-widest">AWS SBG</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-grow">
        {/* Top row: status + event type badge + share button */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={challenge.status} />
            <EventTypeBadge eventType={challenge.event_type} />
          </div>
          <button
            id={`share-btn-card-${challenge.id}`}
            onClick={(e) => onShare(e, challenge)}
            className="inline-flex items-center gap-1.5 p-1.5 px-2.5 rounded-full text-xs font-mono text-gray-400 hover:text-sbg-green hover:bg-sbg-green/10 border border-white/5 hover:border-sbg-green/20 transition-all duration-200 flex-shrink-0"
          >
            {isCopied ? <Check className="w-3.5 h-3.5 text-sbg-green" /> : <Share2 className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Organizer */}
        {challenge.organizer && (
          <p className="text-[11px] font-mono text-gray-500 mb-1.5 flex items-center gap-1">
            <Building2 className="w-3 h-3 text-purple-400" />
            Hosted by <span className="text-purple-300 font-semibold ml-0.5">{challenge.organizer}</span>
          </p>
        )}

        {/* Title */}
        <h3 className={`text-xl font-bold text-white mt-1 mb-2 leading-tight transition-colors duration-200 line-clamp-2
          ${isHackathon ? 'group-hover:text-purple-300' : 'group-hover:text-sbg-green'}`}>
          {challenge.title}
        </h3>

        {/* Short description */}
        <p className="text-gray-400 text-sm line-clamp-2 leading-relaxed flex-grow">
          {challenge.short_description || challenge.description}
        </p>

        {/* Footer */}
        <div className="mt-auto pt-4 border-t border-white/10">
          {challenge.total_prize_pool && (
            <div className="flex items-center gap-1.5 mb-2">
              <DollarSign className="w-3.5 h-3.5 text-green-400" />
              <span className="text-green-400 font-bold text-sm font-mono">{challenge.total_prize_pool}</span>
              <span className="text-gray-500 text-xs">prize pool</span>
            </div>
          )}
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-mono text-gray-500 flex items-center gap-1">
              <Calendar className="w-3 h-3" />{formatDate(challenge.end_time)}
            </span>
            <span className={`inline-flex items-center gap-1 text-xs font-mono font-semibold transition-colors
              ${isHackathon ? 'text-purple-400 group-hover:text-white' : 'text-sbg-green group-hover:text-white'}`}>
              View Details <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main Page Component
// ─────────────────────────────────────────────────────────────────────────────
const Challenges = () => {
  usePageTitle(
    'Builder Hub',
    'Internal sprints, global hackathons & workshops — all in one feed for RIT builders. AWS SBG RIT.'
  );

  const { showToast, ToastContainer } = useToast();
  const [searchParams] = useSearchParams();
  const challengeParam = searchParams.get('challenge') || searchParams.get('challengeId');

  // Single data source
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [copiedId, setCopiedId]     = useState(null);

  // Ticker for auto countdown refresh
  const [tick, setTick] = useState(0);
  const intervalRef     = useRef(null);
  useEffect(() => {
    intervalRef.current = setInterval(() => setTick((t) => t + 1), 60000);
    return () => clearInterval(intervalRef.current);
  }, []);

  // Fetch all challenges
  const fetchChallenges = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/challenges/`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setChallenges(Array.isArray(data) ? data : (data.results || []));
    } catch (err) {
      console.error('Challenges fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchChallenges(); }, [fetchChallenges]);

  // Share handler
  const handleShare = useCallback((e, challengeObj) => {
    e.stopPropagation();
    e.preventDefault();
    const slug = challengeObj.slug || slugify(challengeObj.title) || challengeObj.id;
    const link = `${window.location.origin}/challenges?challenge=${encodeURIComponent(slug)}`;
    navigator.clipboard.writeText(link).then(() => {
      showToast('Challenge link copied! 📋', 'success');
      setCopiedId(challengeObj.id);
      setTimeout(() => setCopiedId(null), 2500);
    }).catch(() => showToast('Copy this link: ' + link, 'success'));
  }, [showToast]);

  // Spotlight card selection (active or target event)
  const activeEvents = challenges.filter((c) => isActive(c));
  let spotlight = null;
  if (challengeParam && challenges.length > 0) {
    const target = decodeURIComponent(challengeParam).toLowerCase().trim();
    spotlight = challenges.find(c =>
      c.slug === target || slugify(c.title) === target || c.id?.toString() === target
    ) || null;
  }
  if (!spotlight && activeEvents.length > 0) {
    spotlight = [...activeEvents].sort((a, b) => new Date(a.end_time) - new Date(b.end_time))[0];
  }

  // Deep-link scroll effect
  useEffect(() => {
    if (challengeParam && spotlight) {
      const timer = setTimeout(() => {
        const el = document.getElementById(`challenge-spotlight-${spotlight.id}`)
          || document.getElementById(`challenge-card-${spotlight.id}`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [challengeParam, spotlight]);

  // Unified Feed: exclude spotlight item if spotlight is displayed
  const gridItems = challenges.filter(c => !spotlight || c.id !== spotlight.id);

  return (
    <div className="relative min-h-screen bg-transparent pt-28 pb-24 px-6 overflow-hidden">
      {/* Background atmosphere */}
      <div
        aria-hidden="true"
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full blur-[140px] -z-10 pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(0,208,132,0.06) 0%, transparent 70%)' }}
      />
      <div
        aria-hidden="true"
        className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full blur-[120px] -z-10 pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.05) 0%, transparent 70%)' }}
      />

      <div className="relative z-10 max-w-5xl mx-auto">

        {/* Hero Section */}
        <header className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-sm font-mono tracking-widest text-gray-300 uppercase mb-6 shadow-md">
            <span className="w-2 h-2 rounded-full bg-sbg-green animate-pulse" />
            <span>AWS SBG · RIT Roorkee</span>
          </div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.08] mb-5">
            Build.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sbg-green to-teal-400">
              Innovate.
            </span>{' '}
            Deploy.
          </h1>
          <p className="text-gray-400 text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed">
            Internal sprints, global hackathons and workshops — all in one unified feed.
          </p>
        </header>

        {/* Loading State */}
        {loading && (
          <div className="space-y-6">
            <SpotlightSkeleton />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
              {[1, 2, 3, 4].map((i) => <CardSkeleton key={i} />)}
            </div>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="text-center py-20 px-6 rounded-3xl border border-red-500/20 bg-red-500/5 max-w-md mx-auto">
            <p className="text-red-400 font-medium text-lg">Unable to load events.</p>
            <p className="text-xs text-gray-500 mt-2 font-mono">{error}</p>
            <button onClick={fetchChallenges} className="mt-5 px-5 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-gray-300 hover:text-white transition-all">
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && challenges.length === 0 && (
          <div className="text-center py-20 px-6 rounded-3xl border border-white/10 bg-white/[0.03] max-w-md mx-auto">
            <Trophy className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-300 font-medium text-lg">No events posted yet.</p>
            <p className="text-sm text-gray-500 mt-2">Check back soon — something epic is coming.</p>
          </div>
        )}

        {/* Unified Events Feed */}
        {!loading && !error && challenges.length > 0 && (
          <>
            {/* Spotlight Card */}
            {spotlight && (
              <section aria-label="Active challenge spotlight" className="mb-14">
                <div className="flex items-center gap-3 mb-5">
                  <span className="h-px flex-1 bg-gradient-to-r from-transparent to-white/10" />
                  <span className="text-xs font-mono font-bold text-sbg-green uppercase tracking-widest flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5" /> Featured Spotlight
                  </span>
                  <span className="h-px flex-1 bg-gradient-to-l from-transparent to-white/10" />
                </div>
                <SpotlightCard challenge={spotlight} onShare={handleShare} isCopied={copiedId === spotlight.id} />
              </section>
            )}

            {/* Main Events Feed Grid */}
            {gridItems.length > 0 && (
              <>
                <div className="flex items-center gap-3 mb-6">
                  <span className="h-px flex-1 bg-gradient-to-r from-transparent to-white/10" />
                  <span className="text-xs font-mono font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                    <LayoutGrid className="w-3.5 h-3.5" /> All Events Feed
                  </span>
                  <span className="h-px flex-1 bg-gradient-to-l from-transparent to-white/10" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {gridItems.map((c) => (
                    <ChallengeCard
                      key={c.id}
                      challenge={c}
                      onShare={handleShare}
                      isCopied={copiedId === c.id}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        )}

        <span aria-hidden="true" data-tick={tick} className="hidden" />
      </div>

      <ToastContainer />
    </div>
  );
};

export default Challenges;
