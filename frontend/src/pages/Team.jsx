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

// ── Leadership Card — large, prominent ───────────────────────────────────────
const LeadershipCard = ({ member }) => (
  <div className="relative flex flex-col items-center text-center rounded-3xl p-8 transition-all duration-300 group hover:scale-[1.02]"
    style={{
      background: 'linear-gradient(145deg, rgba(0,229,130,0.06) 0%, rgba(16,21,28,0.95) 60%)',
      border: '1px solid rgba(0,229,130,0.25)',
      boxShadow: '0 0 0 1px rgba(0,229,130,0.05), 0 8px 32px rgba(0,0,0,0.4)',
    }}
  >
    {/* Glow ring */}
    <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
      style={{ boxShadow: '0 0 40px rgba(0,229,130,0.18) inset' }}
    />

    {/* Badge */}
    {member.badge && (
      <span className="mb-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase"
        style={{ background: 'rgba(0,229,130,0.12)', color: '#00e582', border: '1px solid rgba(0,229,130,0.3)' }}
      >
        {member.badge}
      </span>
    )}

    {/* Avatar */}
    <div className="relative mb-5">
      <div className="absolute inset-0 rounded-full blur-xl opacity-40"
        style={{ background: 'radial-gradient(circle, rgba(0,229,130,0.5), transparent 70%)' }}
      />
      {member.image ? (
        <img
          src={member.image}
          alt={member.name}
          className="relative w-36 h-36 rounded-full object-cover"
          style={{ border: '2px solid rgba(0,229,130,0.5)', padding: '3px',
            boxShadow: '0 0 24px rgba(0,229,130,0.25)' }}
        />
      ) : (
        <div className="relative w-36 h-36 rounded-full flex items-center justify-center text-5xl font-extrabold text-white"
          style={{ background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
            border: '2px solid rgba(0,229,130,0.5)', padding: '3px' }}
        >
          {getInitials(member.name)}
        </div>
      )}
    </div>

    {/* Name & Role */}
    <h2 className="text-2xl font-extrabold text-white tracking-tight">{member.name}</h2>
    <p className="text-sm font-mono mt-1.5" style={{ color: '#00e582' }}>{member.role}</p>

    {/* Bio / Tagline */}
    {(member.bio || member.tagline) && (
      <p className="text-gray-400 text-sm mt-4 leading-relaxed max-w-xs">
        {member.bio || member.tagline}
      </p>
    )}

    {/* Skills */}
    {member.skills?.length > 0 && (
      <div className="flex flex-wrap justify-center gap-1.5 mt-4">
        {member.skills.slice(0, 4).map((skill) => (
          <span key={skill} className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full"
            style={{ background: 'rgba(255,255,255,0.06)', color: '#9ca3af', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            {skill}
          </span>
        ))}
      </div>
    )}

    {/* Social */}
    {(member.linkedin || member.instagram) && (
      <div className="flex items-center gap-4 mt-6 text-gray-400">
        {member.linkedin && (
          <a href={member.linkedin} target="_blank" rel="noopener noreferrer" aria-label={`${member.name} LinkedIn`}>
            <Linkedin className="w-5 h-5 hover:text-blue-400 transition-colors" />
          </a>
        )}
        {member.instagram && (
          <a href={member.instagram} target="_blank" rel="noopener noreferrer" aria-label={`${member.name} Instagram`}>
            <Instagram className="w-5 h-5 hover:text-pink-400 transition-colors" />
          </a>
        )}
      </div>
    )}
  </div>
);

// ── Core Team Card — compact, standard ───────────────────────────────────────
const CoreCard = ({ member }) => (
  <div className="relative flex flex-col items-center text-center rounded-2xl p-6 transition-all duration-300 group hover:scale-[1.02]"
    style={{
      background: 'linear-gradient(160deg, rgba(16,21,28,1) 0%, rgba(10,14,20,0.98) 100%)',
      border: '1px solid rgba(255,255,255,0.08)',
      boxShadow: '0 4px 20px rgba(0,0,0,0.35)',
    }}
  >
    <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none"
      style={{ boxShadow: '0 0 24px rgba(0,229,130,0.10) inset', border: '1px solid rgba(0,229,130,0.2)' }}
    />

    {/* Badge */}
    {member.badge && (
      <span className="mb-3 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase"
        style={{ background: 'rgba(255,255,255,0.06)', color: '#9ca3af', border: '1px solid rgba(255,255,255,0.1)' }}
      >
        {member.badge}
      </span>
    )}

    {/* Avatar */}
    <div className="relative mb-3">
      {member.image ? (
        <img
          src={member.image}
          alt={member.name}
          className="w-24 h-24 rounded-full object-cover"
          style={{ border: '2px solid rgba(0,229,130,0.3)', padding: '2px' }}
        />
      ) : (
        <div className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-extrabold text-white"
          style={{ background: 'linear-gradient(135deg, #5b21b6, #1d4ed8)',
            border: '2px solid rgba(0,229,130,0.3)', padding: '2px' }}
        >
          {getInitials(member.name)}
        </div>
      )}
    </div>

    {/* Name & Role */}
    <h3 className="text-lg font-bold text-white tracking-tight">{member.name}</h3>
    <p className="text-xs font-mono mt-1" style={{ color: '#00e582' }}>{member.role}</p>

    {/* Tagline only — keep compact */}
    {member.tagline && (
      <p className="text-gray-500 text-xs mt-3 leading-relaxed max-w-[200px]">{member.tagline}</p>
    )}

    {/* Skills */}
    {member.skills?.length > 0 && (
      <div className="flex flex-wrap justify-center gap-1 mt-3">
        {member.skills.slice(0, 3).map((skill) => (
          <span key={skill} className="text-[9px] font-semibold px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(255,255,255,0.05)', color: '#6b7280', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            {skill}
          </span>
        ))}
      </div>
    )}

    {/* Social */}
    {(member.linkedin || member.instagram) && (
      <div className="flex items-center gap-3 mt-4 text-gray-500">
        {member.linkedin && (
          <a href={member.linkedin} target="_blank" rel="noopener noreferrer" aria-label={`${member.name} LinkedIn`}>
            <Linkedin className="w-4 h-4 hover:text-blue-400 transition-colors" />
          </a>
        )}
        {member.instagram && (
          <a href={member.instagram} target="_blank" rel="noopener noreferrer" aria-label={`${member.name} Instagram`}>
            <Instagram className="w-4 h-4 hover:text-pink-400 transition-colors" />
          </a>
        )}
      </div>
    )}
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

  const coreTeam = members
    .filter((m) => m.category === 'CORE')
    .sort((a, b) => a.priority_order - b.priority_order);

  // Fallback: if no category data yet (old data), show everyone in leadership
  const showFallback = !loading && members.length > 0 && leadership.length === 0 && coreTeam.length === 0;

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
            Faculty &amp;{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sbg-green to-teal-400">
              Core Team
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
              title="Faculty & Leaders"
              subtitle="Faculty guidance and group leadership ensuring vision, direction, and institutional alignment."
            />
            {/* Centered flex — 1 col mobile, up to 3 on large screens */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {leadership.map((m) => <LeadershipCard key={m.id} member={m} />)}
            </div>
          </section>
        )}

        {/* ── Divider between tiers ────────────────────────────────────────── */}
        {!loading && leadership.length > 0 && coreTeam.length > 0 && (
          <div className="flex items-center gap-4 max-w-4xl mx-auto -mt-8">
            <div className="flex-1 h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.08))' }} />
            <span className="text-gray-600 text-xs font-mono tracking-widest uppercase px-2">Core Team</span>
            <div className="flex-1 h-px" style={{ background: 'linear-gradient(to left, transparent, rgba(255,255,255,0.08))' }} />
          </div>
        )}

        {/* ── Tier 2: Core Team ────────────────────────────────────────────── */}
        {!loading && coreTeam.length > 0 && (
          <section aria-label="Core team section">
            <SectionHeading
              eyebrow="Core Team"
              title="The Builders"
              subtitle="The dedicated members running events, content, gallery, and the cloud initiatives day-to-day."
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
