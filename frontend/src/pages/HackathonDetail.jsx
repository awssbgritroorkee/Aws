import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ExternalLink, Clock, Trophy, ArrowLeft, Calendar,
  Globe, MapPin, Layers, DollarSign, Zap, ChevronRight,
  Building2,
} from 'lucide-react';
import usePageTitle from '../hooks/usePageTitle';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
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
  if (d > 0) return `${d}d ${h}h remaining`;
  if (h > 0) return `${h}h ${m}m remaining`;
  return `${m}m remaining`;
};

// ─────────────────────────────────────────────────────────────────────────────
// Status config
// ─────────────────────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  UPCOMING: {
    pill:  'bg-amber-500/15 text-amber-400 border border-amber-500/30 backdrop-blur-sm',
    solid: 'bg-amber-500/90 text-amber-950',
    glow:  'shadow-amber-500/20',
    icon:  Clock,
    label: 'Upcoming',
    pulse: false,
    cta:   'Pre-Register Now',
    ctaBg: 'bg-amber-500 text-amber-950 hover:bg-amber-400',
  },
  LIVE: {
    pill:  'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 backdrop-blur-sm',
    solid: 'bg-emerald-500/90 text-white',
    glow:  'shadow-emerald-500/20',
    icon:  Zap,
    label: 'Live Now',
    pulse: true,
    cta:   'Join Official Hackathon',
    ctaBg: 'bg-emerald-500 text-white hover:bg-emerald-400',
  },
  CONCLUDED: {
    pill:  'bg-gray-500/15 text-gray-400 border border-gray-500/25 backdrop-blur-sm',
    solid: 'bg-gray-700/90 text-gray-200',
    glow:  'shadow-gray-700/10',
    icon:  Trophy,
    label: 'Concluded',
    pulse: false,
    cta:   'View Results & Winners',
    ctaBg: 'bg-gray-600 text-gray-100 hover:bg-gray-500',
  },
};

const StatusBadge = ({ status, variant = 'pill', className = '' }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.CONCLUDED;
  const Icon = cfg.icon;
  const base = variant === 'solid' ? cfg.solid : cfg.pill;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-black shadow-lg ${base} ${className}`}>
      {cfg.pulse ? (
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
        </span>
      ) : (
        <Icon className="w-3.5 h-3.5" />
      )}
      {cfg.label}
    </span>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Skeleton
// ─────────────────────────────────────────────────────────────────────────────
const PageSkeleton = () => (
  <div className="animate-pulse">
    <div className="h-48 lg:h-64 rounded-3xl bg-white/5 w-full mb-8" />
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-4">
        <div className="h-10 bg-white/10 rounded w-3/4" />
        <div className="flex gap-3">
          {[1, 2, 3].map(i => <div key={i} className="h-7 bg-white/10 rounded-full w-24" />)}
        </div>
        <div className="h-px bg-white/10 my-6" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-4 bg-white/10 rounded" style={{ width: `${70 + (i % 3) * 10}%` }} />)}
        </div>
      </div>
      <div className="h-80 bg-white/5 rounded-2xl" />
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Mode icon mapping
// ─────────────────────────────────────────────────────────────────────────────
const MODE_ICON = { 'Online': Globe, 'In-Person': MapPin, 'Hybrid': Layers };

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────
const HackathonDetail = () => {
  const { slug } = useParams();

  const [hackathon, setHackathon] = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);

  usePageTitle(
    hackathon ? hackathon.title : 'Hackathon',
    hackathon
      ? (hackathon.short_description || `${hackathon.title} by ${hackathon.organizer}`)
      : 'Global Hackathon — AWS SBG RIT'
  );

  const fetchHackathon = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API_BASE_URL}/api/hackathons/${slug}/`);
      if (res.status === 404) throw new Error('hackathon_not_found');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setHackathon(data);
    } catch (err) {
      console.error('HackathonDetail fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => { fetchHackathon(); }, [fetchHackathon]);

  const status    = hackathon?.status || 'CONCLUDED';
  const cfg       = STATUS_CONFIG[status] || STATUS_CONFIG.CONCLUDED;
  const ModeIcon  = MODE_ICON[hackathon?.mode] || Globe;
  const countdown = hackathon ? formatCountdown(hackathon.end_date) : null;

  return (
    <div className="relative min-h-screen bg-transparent pt-24 pb-20 overflow-hidden">
      {/* ── Background atmosphere ── */}
      <div
        aria-hidden="true"
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full blur-[160px] -z-10 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(168,85,247,0.06) 0%, transparent 65%)' }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">

        {/* ── Back navigation ── */}
        <Link
          to="/challenges"
          className="inline-flex items-center gap-2 text-sm font-mono text-gray-400 hover:text-purple-400 transition-colors duration-200 mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
          Back to Builder Hub
        </Link>

        {/* ── Loading ── */}
        {loading && <PageSkeleton />}

        {/* ── Not Found ── */}
        {!loading && error === 'hackathon_not_found' && (
          <div className="text-center py-24 px-6 rounded-3xl border border-white/10 bg-white/[0.03]">
            <Globe className="w-16 h-16 text-gray-600 mx-auto mb-5" />
            <h2 className="text-2xl font-bold text-white mb-3">Hackathon Not Found</h2>
            <p className="text-gray-400 mb-8">
              The hackathon <code className="text-purple-400 font-mono bg-purple-400/10 px-2 py-0.5 rounded">{slug}</code> doesn't exist or may have been removed.
            </p>
            <Link
              to="/challenges"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-purple-500 text-white font-bold text-sm hover:bg-purple-400 transition-colors"
            >
              View All Hackathons <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* ── Generic Error ── */}
        {!loading && error && error !== 'hackathon_not_found' && (
          <div className="text-center py-20 px-6 rounded-3xl border border-red-500/20 bg-red-500/5">
            <p className="text-red-400 font-medium text-lg">Failed to load hackathon.</p>
            <p className="text-xs text-gray-500 mt-2 font-mono">{error}</p>
            <button
              onClick={fetchHackathon}
              className="mt-6 px-5 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-gray-300 hover:text-white hover:border-white/20 transition-all"
            >
              Try Again
            </button>
          </div>
        )}

        {/* ── Main Content ── */}
        {!loading && !error && hackathon && (
          <>
            {/* Hero Banner */}
            <div className="w-full h-48 lg:h-[40vh] rounded-3xl overflow-hidden border border-white/10 mb-10 relative group">
              {hackathon.cover_image ? (
                <img
                  src={hackathon.cover_image}
                  alt={hackathon.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              ) : (
                <div
                  className="w-full h-full flex flex-col items-center justify-center gap-4"
                  style={{ background: 'linear-gradient(135deg, #1a0533 0%, #2d1060 40%, #0f2027 80%, #0a1628 100%)' }}
                >
                  <Globe className="w-20 h-20 text-purple-400 opacity-40" />
                  <span className="text-xs font-mono font-bold text-purple-400/40 uppercase tracking-[0.3em]">
                    Global Hackathon
                  </span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1a]/85 via-transparent to-transparent" />
              {/* Status + countdown overlay */}
              <div className="absolute bottom-5 left-5 flex items-center gap-2 flex-wrap">
                <StatusBadge status={status} variant="solid" />
                {countdown && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold text-amber-300 bg-amber-400/20 border border-amber-400/30 backdrop-blur-sm">
                    <Clock className="w-3.5 h-3.5" /> {countdown}
                  </span>
                )}
              </div>
            </div>

            {/* 2-Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

              {/* ── Left Column (Main Content — 2 cols) ── */}
              <div className="lg:col-span-2">
                {/* Title */}
                <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight mb-5">
                  {hackathon.title}
                </h1>

                {/* Meta badges */}
                <div className="flex flex-wrap items-center gap-3 mb-6">
                  <StatusBadge status={status} variant="pill" />
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-purple-500/10 text-purple-300 border border-purple-500/20">
                    <Building2 className="w-3.5 h-3.5" /> {hackathon.organizer}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono text-gray-400 bg-white/5 border border-white/10">
                    <ModeIcon className="w-3.5 h-3.5" /> {hackathon.mode}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs font-mono text-gray-400">
                    <Calendar className="w-3.5 h-3.5 text-purple-400" />
                    {formatDate(hackathon.start_date)} – {formatDate(hackathon.end_date)}
                  </span>
                </div>

                {/* Short description teaser */}
                {hackathon.short_description && !hackathon.long_description && (
                  <p className="mt-4 text-gray-300 leading-relaxed text-[15px] mb-6">
                    {hackathon.short_description}
                  </p>
                )}

                {/* Divider */}
                <div className="h-px bg-white/10 my-6" />

                {/* Long description (TinyMCE HTML) */}
                {hackathon.long_description ? (
                  <div
                    className="challenge-rich-content prose prose-invert max-w-none text-gray-300 leading-relaxed text-[15px]"
                    dangerouslySetInnerHTML={{ __html: hackathon.long_description }}
                  />
                ) : hackathon.short_description ? (
                  <p className="text-gray-300 leading-relaxed text-[15px]">
                    {hackathon.short_description}
                  </p>
                ) : (
                  <p className="text-gray-500 text-sm italic">No description available.</p>
                )}
              </div>

              {/* ── Right Column (Sticky Sidebar — 1 col) ── */}
              <div className="lg:col-span-1">
                <div className="sticky top-24 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 space-y-6">

                  {/* Prize Pool */}
                  {hackathon.total_prize_pool && (
                    <div className="text-center py-4 px-2 rounded-xl bg-green-500/[0.06] border border-green-500/15">
                      <p className="text-xs font-mono text-gray-400 uppercase tracking-widest mb-1">Total Prize Pool</p>
                      <p className="text-4xl font-extrabold text-green-400 leading-none">{hackathon.total_prize_pool}</p>
                    </div>
                  )}

                  {/* Status */}
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <span className="text-xs font-mono text-gray-400 uppercase tracking-wider">Status</span>
                    <StatusBadge status={status} variant="pill" />
                  </div>

                  {/* Organizer */}
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <span className="text-xs font-mono text-gray-400 uppercase tracking-wider">Organizer</span>
                    <span className="text-sm font-bold text-purple-300 font-mono">{hackathon.organizer}</span>
                  </div>

                  {/* Mode */}
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <span className="text-xs font-mono text-gray-400 uppercase tracking-wider">Format</span>
                    <span className="inline-flex items-center gap-1.5 text-sm font-bold text-gray-300">
                      <ModeIcon className="w-4 h-4 text-purple-400" />{hackathon.mode}
                    </span>
                  </div>

                  {/* Timeline */}
                  <div className="space-y-2 border-b border-white/10 pb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-gray-400 uppercase tracking-wider">Starts</span>
                      <span className="text-xs font-mono text-gray-300">{formatDate(hackathon.start_date)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-gray-400 uppercase tracking-wider">Ends</span>
                      <span className="text-xs font-mono text-gray-300">{formatDate(hackathon.end_date)}</span>
                    </div>
                    {countdown && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono text-gray-400 uppercase tracking-wider">Remaining</span>
                        <span className="text-xs font-mono font-bold text-amber-400">{countdown}</span>
                      </div>
                    )}
                  </div>

                  {/* CTA Button */}
                  {hackathon.registration_link && (
                    <a
                      id="hackathon-detail-register-btn"
                      href={hackathon.registration_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`w-full inline-flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-xl font-bold text-[15px] transition-all duration-200 shadow-lg hover:scale-[1.02] active:scale-[0.98] ${cfg.ctaBg} ${cfg.glow}`}
                    >
                      {cfg.pulse && (
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
                        </span>
                      )}
                      {cfg.cta}
                      <ExternalLink className="w-4 h-4 flex-shrink-0" />
                    </a>
                  )}

                  {/* Back link */}
                  <Link
                    to="/challenges"
                    className="w-full inline-flex items-center justify-center gap-2 text-xs font-mono text-gray-500 hover:text-purple-400 transition-colors pt-1"
                  >
                    ← All Hackathons
                  </Link>
                </div>
              </div>

            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default HackathonDetail;
