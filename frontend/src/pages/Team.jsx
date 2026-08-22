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

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

const getInitials = (name) => {
  if (!name) return 'SB';
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
};

const Team = () => {
  usePageTitle('Leadership Team', 'Faculty guidance and leadership driving the AWS Student Builder Group at RIT.');

  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="relative min-h-screen bg-transparent pt-28 pb-20 px-6 overflow-hidden">
      {/* Glow backdrop */}
      <div
        aria-hidden="true"
        className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[500px] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(124,58,237,0.14) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center max-w-4xl mx-auto">
          {/* Eyebrow Glassmorphism Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-sm md:text-base font-mono tracking-widest text-gray-300 uppercase mb-6 shadow-md">
            <span className="w-2 h-2 rounded-full bg-sbg-green"></span>
            <span>CHAPTER LEADERSHIP</span>
          </div>

          {/* Upscaled Heading */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1] mb-6">
            Faculty &amp;{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sbg-green to-teal-400">
              Leadership
            </span>
          </h1>

          {/* Upscaled Subheading */}
          <p className="text-gray-400 text-lg md:text-xl lg:text-2xl font-medium max-w-4xl mx-auto leading-relaxed">
            Faculty guidance ensuring institutional alignment and academic excellence for AWS SBG RIT.
          </p>
        </div>

        {/* Dynamic Content Section */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-10 h-10 border-4 border-sbg-green/30 border-t-sbg-green rounded-full animate-spin" />
          </div>
        ) : members.length === 0 ? (
          <div className="text-center py-16 px-6 bg-[#10151c]/60 border border-white/10 rounded-3xl max-w-md mx-auto">
            <p className="text-gray-300 font-medium text-lg">
              Check back soon for team updates!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto mt-12">
            {members.map((member) => (
              <div
                key={member.id}
                className="relative flex flex-col items-center text-center bg-gradient-to-b from-[#10151c] to-aws-navy border border-white/10 rounded-3xl p-8 hover:border-sbg-green/50 hover:shadow-[0_0_30px_rgba(0,229,130,0.15)] transition-all duration-300"
              >
                {/* Avatar */}
                <div className="relative mb-4">
                  {member.image ? (
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-28 h-28 rounded-full object-cover ring-2 ring-sbg-green/50 p-1"
                    />
                  ) : (
                    <div className="w-28 h-28 rounded-full flex items-center justify-center text-4xl font-extrabold text-white bg-gradient-to-br from-purple-600 to-blue-600 ring-2 ring-sbg-green/50 p-1">
                      {getInitials(member.name)}
                    </div>
                  )}
                </div>

                {/* Name & Role */}
                <h2 className="text-2xl font-bold text-white mt-2">{member.name}</h2>
                <p className="text-sm font-mono text-sbg-green mt-1">{member.role}</p>

                {/* Description / Bio */}
                {(member.bio || member.tagline) && (
                  <p className="text-gray-400 text-xs md:text-sm mt-4 max-w-xs leading-relaxed">
                    {member.bio || member.tagline}
                  </p>
                )}

                {/* Social Icons */}
                {(member.linkedin || member.instagram) && (
                  <div className="flex items-center gap-4 mt-6 text-gray-400">
                    {member.linkedin && (
                      <a
                        href={member.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${member.name} LinkedIn`}
                      >
                        <Linkedin className="w-5 h-5 hover:text-blue-500 cursor-pointer transition-colors" />
                      </a>
                    )}
                    {member.instagram && (
                      <a
                        href={member.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${member.name} Instagram`}
                      >
                        <Instagram className="w-5 h-5 hover:text-pink-500 cursor-pointer transition-colors" />
                      </a>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Team;
