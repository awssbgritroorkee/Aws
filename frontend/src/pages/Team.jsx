import { useState, useEffect } from 'react';
import usePageTitle from '../hooks/usePageTitle';

const Linkedin = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-1.22.99-2.22 2.22-2.22s2.22 1 2.22 2.22v4.93h2.8M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
  </svg>
);

const Instagram = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
  </svg>
);

const API_URL = import.meta.env.VITE_API_URL || 'https://aws-swae.onrender.com';

const getInitials = (name) => {
  if (!name) return 'SB';
  return name.split(' ').map((p) => p[0]).join('').substring(0, 2).toUpperCase();
};

// ── Leadership Card — full-image, large, prominent (Tier 1) ──────────────────
const LeadershipCard = ({ member }) => (
  <div
    className="relative overflow-hidden rounded-3xl transition-all duration-300 group hover:scale-[1.02] cursor-default h-96 md:h-[400px] w-full max-w-sm mx-auto"
    style={{
      border: '1px solid rgba(0,229,130,0.2)',
      boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
    }}
  >
    {/* ── Full-bleed image ── */}
    {member.image ? (
      <img
        src={member.image}
        alt={member.name}
        className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
      />
    ) : (
      <div
        className="absolute inset-0 flex items-center justify-center text-7xl font-extrabold text-white/30"
        style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)' }}
      >
        {getInitials(member.name)}
      </div>
    )}

    {/* ── Gradient overlay ── */}
    <div
      className="absolute inset-0 z-10 pointer-events-none"
      style={{
        background: 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.55) 40%, rgba(0,0,0,0.10) 70%, transparent 100%)',
      }}
    />

    {/* ── Hover glow border ── */}
    <div
      className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20 pointer-events-none"
      style={{ boxShadow: '0 0 0 1px rgba(0,229,130,0.45) inset' }}
    />

    {/* ── Text content ── */}
    <div className="absolute inset-0 z-30 flex flex-col justify-end p-6 text-left">
      {member.badge && (
        <span
          className="mb-2 self-start inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase"
          style={{ background: 'rgba(0,229,130,0.18)', color: '#00e582', border: '1px solid rgba(0,229,130,0.35)', backdropFilter: 'blur(8px)' }}
        >
          {member.badge}
        </span>
      )}

      <h2 className="text-2xl font-extrabold text-white tracking-tight leading-tight drop-shadow-lg">
        {member.name}
      </h2>

      <p className="text-sm font-mono mt-1" style={{ color: '#00e582' }}>
        {member.role}
      </p>

      {(member.tagline || member.bio) && (
        <p className="text-gray-300 text-xs mt-2 leading-relaxed line-clamp-2 opacity-90">
          {member.tagline || member.bio}
        </p>
      )}

      {member.skills?.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-3">
          {member.skills.slice(0, 3).map((skill) => (
            <span
              key={skill}
              className="text-[9px] font-semibold px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(255,255,255,0.12)', color: '#d1d5db', border: '1px solid rgba(255,255,255,0.15)', backdropFilter: 'blur(4px)' }}
            >
              {skill}
            </span>
          ))}
        </div>
      )}

      {(member.linkedin || member.instagram) && (
        <div className="flex items-center gap-3 mt-4 text-gray-300">
          {member.linkedin && (
            <a href={member.linkedin} target="_blank" rel="noopener noreferrer" aria-label={`${member.name} LinkedIn`}
              className="hover:text-blue-400 transition-colors"
            >
              <Linkedin className="w-5 h-5" />
            </a>
          )}
          {member.instagram && (
            <a href={member.instagram} target="_blank" rel="noopener noreferrer" aria-label={`${member.name} Instagram`}
              className="hover:text-pink-400 transition-colors"
            >
              <Instagram className="w-5 h-5" />
            </a>
          )}
        </div>
      )}
    </div>
  </div>
);

// ── Founding Member Card — medium, balanced (Tier 2) ──────────────────────────
const FoundingCard = ({ member }) => (
  <div
    className="relative overflow-hidden rounded-2xl transition-all duration-300 group hover:scale-[1.02] cursor-default h-80 md:h-[320px] w-full max-w-xs mx-auto"
    style={{
      border: '1px solid rgba(0,229,130,0.2)',
      boxShadow: '0 6px 32px rgba(0,0,0,0.45)',
    }}
  >
    {/* ── Full-bleed image ── */}
    {member.image ? (
      <img
        src={member.image}
        alt={member.name}
        className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
      />
    ) : (
      <div
        className="absolute inset-0 flex items-center justify-center text-6xl font-extrabold text-white/30"
        style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)' }}
      >
        {getInitials(member.name)}
      </div>
    )}

    {/* ── Gradient overlay ── */}
    <div
      className="absolute inset-0 z-10 pointer-events-none"
      style={{
        background: 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.50) 40%, rgba(0,0,0,0.08) 70%, transparent 100%)',
      }}
    />

    {/* ── Hover glow border ── */}
    <div
      className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-400 z-20 pointer-events-none"
      style={{ boxShadow: '0 0 0 1px rgba(0,229,130,0.40) inset' }}
    />

    {/* ── Text content ── */}
    <div className="absolute inset-0 z-30 flex flex-col justify-end p-5 text-left">
      {member.badge && (
        <span
          className="mb-1.5 self-start inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase"
          style={{ background: 'rgba(0,229,130,0.16)', color: '#00e582', border: '1px solid rgba(0,229,130,0.30)', backdropFilter: 'blur(6px)' }}
        >
          {member.badge}
        </span>
      )}

      <h3 className="text-xl font-bold text-white tracking-tight leading-tight drop-shadow-md">
        {member.name}
      </h3>

      <p className="text-xs font-mono mt-0.5" style={{ color: '#00e582' }}>
        {member.role}
      </p>

      {(member.tagline || member.bio) && (
        <p className="text-gray-300 text-[11px] mt-1.5 leading-tight line-clamp-1 opacity-90">
          {member.tagline || member.bio}
        </p>
      )}

      {member.skills?.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {member.skills.slice(0, 2).map((skill) => (
            <span
              key={skill}
              className="text-[8px] font-semibold px-1.5 py-0.5 rounded-full"
              style={{ background: 'rgba(255,255,255,0.12)', color: '#d1d5db', border: '1px solid rgba(255,255,255,0.15)', backdropFilter: 'blur(4px)' }}
            >
              {skill}
            </span>
          ))}
        </div>
      )}

      {(member.linkedin || member.instagram) && (
        <div className="flex items-center gap-2.5 mt-3 text-gray-300">
          {member.linkedin && (
            <a href={member.linkedin} target="_blank" rel="noopener noreferrer" aria-label={`${member.name} LinkedIn`}
              className="hover:text-blue-400 transition-colors"
            >
              <Linkedin className="w-4 h-4" />
            </a>
          )}
          {member.instagram && (
            <a href={member.instagram} target="_blank" rel="noopener noreferrer" aria-label={`${member.name} Instagram`}
              className="hover:text-pink-400 transition-colors"
            >
              <Instagram className="w-4 h-4" />
            </a>
          )}
        </div>
      )}
    </div>
  </div>
);

// ── Core Team Card — compact, small (Tier 3) ─────────────────────────────────
const CoreCard = ({ member }) => (
  <div
    className="relative overflow-hidden rounded-2xl transition-all duration-300 group hover:scale-[1.03] cursor-default h-72 md:h-[280px] w-full max-w-[18rem] mx-auto"
    style={{
      border: '1px solid rgba(255,255,255,0.08)',
      boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
    }}
  >
    {/* ── Full-bleed image ── */}
    {member.image ? (
      <img
        src={member.image}
        alt={member.name}
        className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
      />
    ) : (
      <div
        className="absolute inset-0 flex items-center justify-center text-5xl font-extrabold text-white/25"
        style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)' }}
      >
        {getInitials(member.name)}
      </div>
    )}

    {/* ── Gradient overlay ── */}
    <div
      className="absolute inset-0 z-10 pointer-events-none"
      style={{
        background: 'linear-gradient(to top, rgba(0,0,0,0.90) 0%, rgba(0,0,0,0.45) 45%, rgba(0,0,0,0.05) 75%, transparent 100%)',
      }}
    />

    {/* ── Hover glow border ── */}
    <div
      className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-400 z-20 pointer-events-none"
      style={{ boxShadow: '0 0 0 1px rgba(0,229,130,0.30) inset' }}
    />

    {/* ── Text content ── */}
    <div className="absolute inset-0 z-30 flex flex-col justify-end p-3.5 text-left">
      {member.badge && (
        <span
          className="mb-1 self-start inline-flex items-center px-1.5 py-0.5 rounded-full text-[8px] font-bold tracking-wider uppercase"
          style={{ background: 'rgba(255,255,255,0.10)', color: '#9ca3af', border: '1px solid rgba(255,255,255,0.15)', backdropFilter: 'blur(6px)' }}
        >
          {member.badge}
        </span>
      )}

      <h3 className="text-base font-bold text-white tracking-tight leading-tight drop-shadow">
        {member.name}
      </h3>

      <p className="text-[10px] font-mono mt-0.5" style={{ color: '#00e582' }}>
        {member.role}
      </p>

      {member.skills?.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1.5">
          {member.skills.slice(0, 2).map((skill) => (
            <span
              key={skill}
              className="text-[8px] font-semibold px-1.5 py-0.5 rounded-full"
              style={{ background: 'rgba(255,255,255,0.10)', color: '#9ca3af', border: '1px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(4px)' }}
            >
              {skill}
            </span>
          ))}
        </div>
      )}

      {(member.linkedin || member.instagram) && (
        <div className="flex items-center gap-2 mt-2 text-gray-400">
          {member.linkedin && (
            <a href={member.linkedin} target="_blank" rel="noopener noreferrer" aria-label={`${member.name} LinkedIn`}
              className="hover:text-blue-400 transition-colors"
            >
              <Linkedin className="w-3.5 h-3.5" />
            </a>
          )}
          {member.instagram && (
            <a href={member.instagram} target="_blank" rel="noopener noreferrer" aria-label={`${member.name} Instagram`}
              className="hover:text-pink-400 transition-colors"
            >
              <Instagram className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      )}
    </div>
  </div>
);

// ── Section Divider ───────────────────────────────────────────────────────────
const SectionHeading = ({ eyebrow, title, subtitle }) => (
  <div className="text-center mb-10">
    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-xs font-mono tracking-widest text-gray-400 uppercase mb-4 shadow-sm">
      <span className="w-1.5 h-1.5 rounded-full bg-sbg-green" />
      {eyebrow}
    </div>
    <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">{title}</h2>
    {subtitle && <p className="text-gray-500 text-sm md:text-base mt-2 max-w-xl mx-auto">{subtitle}</p>}
  </div>
);

// ── Main Page ─────────────────────────────────────────────────────────────────
const Team = () => {
  usePageTitle('Team', 'Meet the leadership and core team driving the AWS Student Builder Group at RIT Roorkee.');

  const [members, setMembers] = useState([]);
  const [loading, setLoading]  = useState(true);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await fetch(`${API_URL}/api/members/`);
        if (response.ok) {
          const data = await response.json();
          setMembers(Array.isArray(data) ? data : (data.results || []));
        } else {
          console.error('Failed to fetch members:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching members:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMembers();
  }, []);

  // Split by category, sort by priority_order within each tier
  const leadership = members
    .filter((m) => m.category === 'LEADERSHIP')
    .sort((a, b) => a.priority_order - b.priority_order);

  const founding = members
    .filter((m) => m.category === 'FOUNDING')
    .sort((a, b) => a.priority_order - b.priority_order);

  const coreTeam = members
    .filter((m) => m.category === 'CORE')
    .sort((a, b) => a.priority_order - b.priority_order);

  // Fallback: if no category data yet (old data), show everyone in leadership
  const showFallback = !loading && members.length > 0 && leadership.length === 0 && founding.length === 0 && coreTeam.length === 0;

  return (
    <div className="relative min-h-screen bg-transparent pt-28 pb-24 px-6 overflow-hidden">
      {/* Page glow backdrop */}
      <div aria-hidden="true" className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[600px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at center, rgba(124,58,237,0.10) 0%, transparent 70%)', filter: 'blur(80px)' }}
      />

      <div className="relative z-10 max-w-7xl mx-auto space-y-24">

        {/* ── Page Header ─────────────────────────────────────────────────── */}
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-sm md:text-base font-mono tracking-widest text-gray-300 uppercase mb-6 shadow-md">
            <span className="w-2 h-2 rounded-full bg-sbg-green" />
            <span>MEET THE TEAM</span>
          </div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1] mb-6">
            The Visionaries &amp;{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sbg-green to-teal-400">
              Builders
            </span>
          </h1>
          <p className="text-gray-400 text-lg md:text-xl font-medium max-w-3xl mx-auto leading-relaxed">
            The people behind AWS SBG RIT Roorkee — from faculty mentors to the builders shipping it all.
          </p>
        </div>

        {/* ── Loading ──────────────────────────────────────────────────────── */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="w-10 h-10 border-4 border-sbg-green/30 border-t-sbg-green rounded-full animate-spin" />
          </div>
        )}

        {/* ── Empty state ──────────────────────────────────────────────────── */}
        {!loading && members.length === 0 && (
          <div className="text-center py-16 px-6 rounded-3xl max-w-md mx-auto"
            style={{ background: 'rgba(16,21,28,0.6)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <p className="text-gray-300 font-medium text-lg">Check back soon for team updates!</p>
          </div>
        )}

        {/* ── Fallback: no category set (old data) — show flat list ────────── */}
        {showFallback && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {members.map((m) => <CoreCard key={m.id} member={m} />)}
          </div>
        )}

        {/* ── Tier 1: Leadership ───────────────────────────────────────────── */}
        {!loading && leadership.length > 0 && (
          <section aria-label="Leadership section">
            <SectionHeading
              eyebrow="Chapter Leadership"
              title="Faculty & Group Leaders"
              subtitle="Guiding the vision, direction, and institutional alignment of AWS SBG."
            />
            {/* Centered flex — 1 col mobile, up to 3 on large screens */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {leadership.map((m) => <LeadershipCard key={m.id} member={m} />)}
            </div>
          </section>
        )}

        {/* ── Tier 2: Founding Members ─────────────────────────────────────── */}
        {!loading && founding.length > 0 && (
          <section aria-label="Founding members section">
            <SectionHeading
              eyebrow="Founding Team"
              title="Founding Members"
              subtitle="The original builders who laid the foundation and architected the community from ground zero."
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {founding.map((m) => <FoundingCard key={m.id} member={m} />)}
            </div>
          </section>
        )}

        {/* ── Tier 3: Core Team (Conditional Rendering) ────────────────────── */}
        {!loading && coreTeam.length > 0 && (
          <section aria-label="Core team section">
            <SectionHeading
              eyebrow="Core Team"
              title="Core Team"
              subtitle="The dedicated forces executing events, technical projects, and driving community growth."
            />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 max-w-7xl mx-auto">
              {coreTeam.map((m) => <CoreCard key={m.id} member={m} />)}
            </div>
          </section>
        )}

      </div>
    </div>
  );
};

export default Team;
