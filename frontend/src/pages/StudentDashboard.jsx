import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dailyCheckin, getBuilderProfile, getLeaderboard } from '../services/api';

// ─────────────────────────────────────────────────────────────────────────────
// XP → Level calculator
// ─────────────────────────────────────────────────────────────────────────────
const LEVEL_THRESHOLDS = [
  { min: 0,   max: 49,  level: 1, title: 'Newcomer',    color: 'text-gray-400',   glow: 'shadow-gray-500/30'   },
  { min: 50,  max: 149, level: 2, title: 'Learner',     color: 'text-blue-400',   glow: 'shadow-blue-500/40'   },
  { min: 150, max: 299, level: 3, title: 'Builder',     color: 'text-emerald-400',glow: 'shadow-emerald-500/40'},
  { min: 300, max: 499, level: 4, title: 'Engineer',    color: 'text-yellow-400', glow: 'shadow-yellow-500/40' },
  { min: 500, max: 799, level: 5, title: 'Architect',   color: 'text-orange-400', glow: 'shadow-orange-500/40' },
  { min: 800, max: 1199,level: 6, title: 'Innovator',   color: 'text-pink-400',   glow: 'shadow-pink-500/40'   },
  { min: 1200,max: Infinity,level:7,title:'Cloud Expert',color:'text-purple-400', glow: 'shadow-purple-500/40' },
];

const getLevel = (xp) =>
  LEVEL_THRESHOLDS.find(({ min, max }) => xp >= min && xp <= max) || LEVEL_THRESHOLDS[0];

const getXpProgressPct = (xp) => {
  const lvl = getLevel(xp);
  if (lvl.max === Infinity) return 100;
  const range = lvl.max - lvl.min + 1;
  return Math.round(((xp - lvl.min) / range) * 100);
};

// ─────────────────────────────────────────────────────────────────────────────
// Rank medal helpers
// ─────────────────────────────────────────────────────────────────────────────
const RANK_STYLES = [
  { medal: '🥇', ring: 'ring-yellow-400/60',  bg: 'bg-yellow-400/10',  text: 'text-yellow-400'  },
  { medal: '🥈', ring: 'ring-gray-300/60',    bg: 'bg-gray-300/10',    text: 'text-gray-300'    },
  { medal: '🥉', ring: 'ring-amber-600/60',   bg: 'bg-amber-700/10',   text: 'text-amber-500'   },
];

// ─────────────────────────────────────────────────────────────────────────────
// Skeleton pulse component
// ─────────────────────────────────────────────────────────────────────────────
const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse rounded-xl bg-white/5 ${className}`} />
);

// ─────────────────────────────────────────────────────────────────────────────
// Check-in Toast / Milestone Banner
// ─────────────────────────────────────────────────────────────────────────────
const CheckinToast = ({ message, streak, xp, onClose }) => {
  useEffect(() => {
    const t = setTimeout(onClose, 5000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className="fixed top-20 right-4 z-50 animate-slide-in-right">
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-900/90 to-black/90
                      backdrop-blur-xl border border-emerald-500/40 rounded-2xl p-5 shadow-2xl
                      shadow-emerald-900/50 max-w-sm">
        {/* Glow strip */}
        <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent" />

        <div className="flex items-start gap-3">
          <span className="text-3xl leading-none">🎉</span>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-emerald-300 text-sm tracking-wide uppercase">
              Daily Check-In Complete!
            </p>
            <p className="text-white text-sm mt-0.5">{message}</p>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-yellow-400/20 text-yellow-300">
                +10 XP
              </span>
              {streak > 1 && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-orange-400/20 text-orange-300">
                  🔥 {streak}-day streak!
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-white transition-colors ml-1 shrink-0"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Metric Box — used in the hero stats row
// ─────────────────────────────────────────────────────────────────────────────
const MetricBox = ({ icon, label, value, valueClass = 'text-white', sublabel }) => (
  <div className="flex-1 min-w-0 bg-white/[0.04] hover:bg-white/[0.07] border border-white/10
                  rounded-2xl p-4 transition-all duration-300 group">
    <div className="flex items-center gap-2 mb-2">
      <span className="text-xl">{icon}</span>
      <span className="text-xs text-gray-500 font-medium uppercase tracking-widest">{label}</span>
    </div>
    <p className={`text-3xl font-black tabular-nums ${valueClass}`}>{value}</p>
    {sublabel && <p className="text-xs text-gray-500 mt-1">{sublabel}</p>}
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Command Card — quick action shortcuts
// ─────────────────────────────────────────────────────────────────────────────
const CommandCard = ({ icon, title, subtitle, accentClass, glowClass, to, external }) => {
  const inner = (
    <div className={`relative overflow-hidden group flex flex-col gap-3 p-5 rounded-2xl
                     bg-white/[0.04] border border-white/10 hover:border-emerald-500/50
                     hover:-translate-y-1 hover:bg-white/[0.08] transition-all duration-300
                     cursor-pointer h-full`}>
      {/* Corner glow */}
      <div className={`absolute -top-6 -right-6 w-24 h-24 rounded-full blur-2xl opacity-0
                       group-hover:opacity-30 transition-opacity duration-500 ${glowClass}`} />

      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl
                       ${accentClass} bg-white/5 border border-white/10`}>
        {icon}
      </div>
      <div>
        <p className={`font-bold text-base ${accentClass}`}>{title}</p>
        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{subtitle}</p>
      </div>
      <div className={`mt-auto text-xs font-semibold flex items-center gap-1 ${accentClass}`}>
        Open <svg className="w-3 h-3 transition-transform group-hover:translate-x-1" fill="none"
          stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path d="M9 18l6-6-6-6" /></svg>
      </div>
    </div>
  );

  if (external) {
    return (
      <a href={to} target="_blank" rel="noopener noreferrer" className="h-full">
        {inner}
      </a>
    );
  }
  return <Link to={to} className="h-full">{inner}</Link>;
};

// ─────────────────────────────────────────────────────────────────────────────
// Leaderboard Row
// ─────────────────────────────────────────────────────────────────────────────
const LeaderboardRow = ({ entry, rank, isCurrentUser }) => {
  const style   = RANK_STYLES[rank - 1];
  const initial = (entry.full_name || entry.username || '?')[0].toUpperCase();

  return (
    <div className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200
                     ${isCurrentUser
                       ? 'bg-emerald-500/10 border border-emerald-500/30'
                       : 'hover:bg-white/[0.05] border border-transparent'}`}>

      {/* Rank badge */}
      <div className={`w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full
                       text-sm font-black ${style ? `ring-2 ${style.ring} ${style.bg} ${style.text}` : 'text-gray-500 bg-white/5'}`}>
        {style ? style.medal : rank}
      </div>

      {/* Avatar */}
      <div className={`w-8 h-8 flex-shrink-0 rounded-full flex items-center justify-center
                       text-xs font-bold bg-gradient-to-br from-emerald-700 to-blue-700 ring-1 ring-white/10`}>
        {initial}
      </div>

      {/* Name */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold truncate ${isCurrentUser ? 'text-emerald-300' : 'text-white'}`}>
          {entry.full_name || entry.username}
          {isCurrentUser && <span className="ml-1.5 text-[10px] text-emerald-400">(you)</span>}
        </p>
        <p className="text-[11px] text-gray-500 truncate">Streak: {entry.current_streak}d</p>
      </div>

      {/* XP */}
      <div className="text-right flex-shrink-0">
        <p className={`text-sm font-black ${style ? style.text : 'text-gray-300'}`}>
          {entry.xp_points}
        </p>
        <p className="text-[10px] text-gray-600">XP</p>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main Dashboard Component
// ─────────────────────────────────────────────────────────────────────────────
const StudentDashboard = () => {
  const { user, context, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [profile,     setProfile]     = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [error,       setError]       = useState(null);

  // Check-in toast state
  const [toast, setToast] = useState(null); // { message, streak, xp }

  // Guard — redirect to home if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/', { replace: true });
    }
  }, [authLoading, user, navigate]);

  // ── Fetch profile + leaderboard + trigger check-in ─────────────────────────
  const fetchData = useCallback(async () => {
    setLoadingData(true);
    setError(null);
    try {
      const [profileRes, leaderboardRes] = await Promise.all([
        getBuilderProfile(),
        getLeaderboard(),
      ]);

      if (profileRes.data?.is_core_team) {
        alert("Access Denied: Core team members cannot participate in student challenges.");
        navigate('/', { replace: true });
        return;
      }

      setProfile(profileRes.data);
      setLeaderboard(leaderboardRes.data.leaderboard || []);
    } catch (err) {
      console.error('[Dashboard] Fetch error:', err);
      setError('Could not load your dashboard. Please try again.');
    } finally {
      setLoadingData(false);
    }
  }, [navigate]);

  // ── Daily Check-in (fires once on mount, after auth is confirmed) ──────────
  const checkinFiredRef = useRef(false);
  useEffect(() => {
    if (authLoading || !user) return;
    if (checkinFiredRef.current) return;
    checkinFiredRef.current = true;

    const fireCheckin = async () => {
      try {
        const { data } = await dailyCheckin();
        // Show toast only for new check-ins (not already-checked-in responses)
        if (!data.already_checked_in && !data.is_core_team) {
          const p = data.profile || {};
          setToast({
            message: data.message,
            streak:  p.current_streak || 1,
            xp:      p.xp_points     || 10,
          });
          // Refresh profile to reflect updated XP
          setProfile(p);
        }
      } catch {
        // Silent fail — check-in is a background action, never block UX
      }
    };

    fetchData();
    fireCheckin();
  }, [authLoading, user, fetchData]);

  // ── Loading state ──────────────────────────────────────────────────────────
  if (authLoading || loadingData) {
    return (
      <div className="min-h-screen bg-[#050505] text-white pt-20 px-4 md:px-8 pb-20">
        <div className="max-w-6xl mx-auto space-y-6 mt-6">
          {/* Hero skeleton */}
          <Skeleton className="h-44" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="h-8 w-48" />
              <div className="grid grid-cols-2 gap-4">
                {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-36" />)}
              </div>
            </div>
            <Skeleton className="h-96" />
          </div>
        </div>
      </div>
    );
  }

  // ── Error state ────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center px-4">
        <div className="text-center max-w-sm space-y-4">
          <span className="text-5xl">⚠️</span>
          <p className="text-gray-300">{error}</p>
          <button
            onClick={fetchData}
            className="px-6 py-2.5 rounded-full bg-sbg-green text-black font-bold text-sm hover:brightness-110 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // ── Computed display values ────────────────────────────────────────────────
  const displayName = profile?.full_name
    || user?.name
    || context?.email?.split('@')[0]
    || 'Builder';
  const displayEmail  = profile?.email || user?.email || '';
  const isCoreteam    = profile?.is_core_team || false;
  const xp            = profile?.xp_points || 0;
  const streak        = profile?.current_streak || 0;
  const longestStreak = profile?.longest_streak || 0;
  const levelInfo     = getLevel(xp);
  const progressPct   = getXpProgressPct(xp);

  // Is current user in leaderboard?
  const currentUserEmail = profile?.email;
  const myRank = leaderboard.findIndex(e => e.email === currentUserEmail) + 1;

  return (
    <>
      {/* ── Check-in Toast ─────────────────────────────────────────────────── */}
      {toast && (
        <CheckinToast
          message={toast.message}
          streak={toast.streak}
          xp={toast.xp}
          onClose={() => setToast(null)}
        />
      )}

      <div className="w-full text-white pb-12">
        <div className="max-w-6xl mx-auto">

          {/* ── Page header label ─────────────────────────────────────────── */}
          <div className="mt-8 mb-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-white/10" />
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-500 px-3">
              Builder Command Center
            </span>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-white/10" />
          </div>

          {/* ═══════════════════════════════════════════════════════════════
              HERO — Profile & Stats
          ════════════════════════════════════════════════════════════════ */}
          <div className="relative overflow-hidden rounded-3xl border border-white/10
                          bg-gradient-to-br from-white/[0.06] to-white/[0.02]
                          backdrop-blur-xl p-6 md:p-8">

            {/* Background glow blobs */}
            <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full
                            bg-emerald-500/10 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -right-20 w-64 h-64 rounded-full
                            bg-blue-500/10 blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-start gap-6">

              {/* Avatar */}
              <div className="flex-shrink-0 relative">
                {user?.picture ? (
                  <img
                    src={user.picture}
                    alt={displayName}
                    className="w-20 h-20 rounded-2xl ring-2 ring-white/20 object-cover"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-700
                                  to-blue-700 flex items-center justify-center ring-2 ring-white/20
                                  text-3xl font-black">
                    {(displayName)[0].toUpperCase()}
                  </div>
                )}
                {/* Level badge pinned to avatar */}
                {!isCoreteam && (
                  <div className={`absolute -bottom-2 -right-2 text-[10px] font-black px-2 py-0.5
                                   rounded-full bg-black border border-white/20 ${levelInfo.color}`}>
                    Lv.{levelInfo.level}
                  </div>
                )}
              </div>

              {/* Identity */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h1 className="text-2xl md:text-3xl font-black text-white truncate">
                    {displayName}
                  </h1>
                  {isCoreteam && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1
                                     rounded-full bg-cyan-400/10 border border-cyan-400/40 text-cyan-300">
                      👑 Core Team
                    </span>
                  )}
                  {!isCoreteam && (
                    <span className={`inline-flex items-center gap-1 text-xs font-bold px-3 py-1
                                      rounded-full bg-black/30 border border-white/10 ${levelInfo.color}`}>
                      ⚡ {levelInfo.title}
                    </span>
                  )}
                </div>
                <p className="text-gray-500 text-sm truncate">{displayEmail}</p>

                {/* Fair Play message for core team */}
                {isCoreteam ? (
                  <div className="mt-4 p-4 rounded-xl bg-cyan-400/5 border border-cyan-400/20">
                    <p className="text-cyan-300 text-sm font-medium">
                      🛡️ XP &amp; Leaderboard tracking is <strong>disabled</strong> for your account to
                      maintain Fair Play for students.
                    </p>
                  </div>
                ) : (
                  /* XP Progress bar */
                  <div className="mt-4 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">Progress to {levelInfo.level < 7 ? `Level ${levelInfo.level + 1}` : 'Max Level'}</span>
                      <span className={`font-bold ${levelInfo.color}`}>{progressPct}%</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-blue-500 transition-all duration-700"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-gray-600">
                      {levelInfo.max === Infinity
                        ? 'Maximum level reached 🎉'
                        : `${levelInfo.max + 1 - xp} XP to next level`}
                    </p>
                  </div>
                )}
              </div>

              {/* Rank pill (if in leaderboard) */}
              {!isCoreteam && myRank > 0 && (
                <div className="flex-shrink-0 text-center bg-black/30 border border-white/10
                                rounded-2xl px-5 py-4 hidden md:block">
                  <p className="text-[10px] uppercase tracking-widest text-gray-500">Campus Rank</p>
                  <p className="text-4xl font-black text-yellow-400 mt-1">#{myRank}</p>
                  <p className="text-[11px] text-gray-600 mt-0.5">Top {leaderboard.length}</p>
                </div>
              )}
            </div>

            {/* ── Metric row (students only) ─────────────────────────────── */}
            {!isCoreteam && (
              <div className="relative z-10 flex flex-col sm:flex-row gap-3 mt-6">
                <MetricBox
                  icon="🌟"
                  label="XP Score"
                  value={xp.toLocaleString()}
                  valueClass="text-yellow-400"
                  sublabel={`${levelInfo.title} · Level ${levelInfo.level}`}
                />
                <MetricBox
                  icon="🔥"
                  label="Active Streak"
                  value={`${streak}d`}
                  valueClass="text-orange-400"
                  sublabel={`Best: ${longestStreak} days`}
                />
                <MetricBox
                  icon="🚀"
                  label="Current Level"
                  value={`Lv. ${levelInfo.level}`}
                  valueClass={levelInfo.color}
                  sublabel={levelInfo.title}
                />
              </div>
            )}
          </div>

          {/* ═══════════════════════════════════════════════════════════════
              MAIN GRID — Command Center (2 cols) + Leaderboard (1 col)
          ════════════════════════════════════════════════════════════════ */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">

            {/* ── LEFT: Quick Command Center ───────────────────────────── */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-black text-white">Quick Command Center</h2>
                <div className="h-px flex-1 bg-white/5" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <CommandCard
                  icon="⚡"
                  title="Active Challenges"
                  subtitle="Join internal sprints, global hackathons, and community events."
                  accentClass="text-emerald-400"
                  glowClass="bg-emerald-500"
                  to="/challenges"
                />
                <CommandCard
                  icon="📅"
                  title="Upcoming Events"
                  subtitle="RSVP for workshops, cloud sessions, and speaker events."
                  accentClass="text-purple-400"
                  glowClass="bg-purple-500"
                  to="/events"
                />
                <CommandCard
                  icon="🤝"
                  title="Team Up"
                  subtitle="Find hackathon teammates. Post your profile or browse open slots."
                  accentClass="text-blue-400"
                  glowClass="bg-blue-500"
                  to="/teamup"
                />
                <CommandCard
                  icon="🏅"
                  title="My Certificates"
                  subtitle="View and download your AWS SBG participation certificates."
                  accentClass="text-yellow-400"
                  glowClass="bg-yellow-500"
                  to="https://aws.amazon.com/developer/community/students/"
                  external
                />
                <CommandCard
                  icon="☁️"
                  title="AWS Builder Center"
                  subtitle="Free hands-on labs, workshops, and certifications from AWS."
                  accentClass="text-orange-400"
                  glowClass="bg-orange-500"
                  to="https://aws.amazon.com/developer/community/students/"
                  external
                />
                <CommandCard
                  icon="👥"
                  title="Meet the Team"
                  subtitle="Get to know the AWS SBG core team and student leaders."
                  accentClass="text-pink-400"
                  glowClass="bg-pink-500"
                  to="/team"
                />
              </div>

              {/* ── Activity hint banner ──────────────────────────────── */}
              <div className="relative overflow-hidden rounded-2xl border border-emerald-500/20
                              bg-emerald-500/5 p-5">
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-6xl opacity-10
                                select-none pointer-events-none">🔥</div>
                <p className="text-sm font-semibold text-emerald-300">
                  {streak === 0
                    ? '🚀 Start your journey — check in daily to build your streak and earn XP!'
                    : streak < 3
                    ? `🌱 You're on a ${streak}-day streak! Come back tomorrow to keep it going.`
                    : streak < 7
                    ? `🔥 ${streak}-day streak! You're building momentum. Keep going!`
                    : `🏆 Incredible! ${streak}-day streak. You're a true AWS SBG Builder!`}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Each daily check-in earns +10 XP. Streaks unlock future milestone rewards.
                </p>
              </div>
            </div>

            {/* ── RIGHT: Campus Leaderboard ────────────────────────────── */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-4">
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-black text-white">Campus Leaderboard</h2>
                  <div className="h-px flex-1 bg-white/5" />
                </div>

                <div className="relative overflow-hidden rounded-2xl border border-white/10
                                bg-white/[0.03] backdrop-blur-xl p-4 space-y-1">

                  {/* Header glow strip */}
                  <div className="absolute inset-x-0 top-0 h-0.5
                                  bg-gradient-to-r from-transparent via-yellow-400/60 to-transparent" />

                  {leaderboard.length === 0 ? (
                    <div className="text-center py-12 space-y-2">
                      <span className="text-4xl">🏆</span>
                      <p className="text-gray-500 text-sm">No entries yet.<br />Be the first to check in!</p>
                    </div>
                  ) : (
                    leaderboard.map((entry, idx) => (
                      <LeaderboardRow
                        key={entry.username || idx}
                        entry={entry}
                        rank={idx + 1}
                        isCurrentUser={entry.email === currentUserEmail}
                      />
                    ))
                  )}

                  {/* My rank (if not in top 10) */}
                  {!isCoreteam && myRank === 0 && profile && (
                    <>
                      <div className="border-t border-white/5 my-2" />
                      <div className="flex items-center gap-2 px-3 py-2">
                        <span className="text-gray-600 text-xs italic flex-1">You are not yet ranked.</span>
                        <span className="text-[11px] text-gray-600">{xp} XP</span>
                      </div>
                    </>
                  )}

                  <p className="text-[10px] text-gray-600 text-center pt-2 pb-1">
                    🛡️ Fair Play: Core team XP excluded from rankings
                  </p>
                </div>
              </div>
            </div>

          </div>{/* /main grid */}
        </div>{/* /max-w */}
      </div>

      {/* Slide-in animation */}
      <style>{`
        @keyframes slide-in-right {
          from { transform: translateX(110%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
        .animate-slide-in-right { animation: slide-in-right 0.4s cubic-bezier(0.22,1,0.36,1) both; }
      `}</style>
    </>
  );
};

export default StudentDashboard;
