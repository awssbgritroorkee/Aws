import usePageTitle from '../hooks/usePageTitle';

const LinkedinIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-1.22.99-2.22 2.22-2.22s2.22 1 2.22 2.22v4.93h2.8M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
  </svg>
);

const GithubIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.1-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z"/>
  </svg>
);

const FACULTY_MEMBER = {
  id: 'faculty',
  initials: 'FA',
  badge: '⭐ Advisor',
  name: 'Faculty Coordinator',
  role: 'Faculty Advisor',
  bio: "Guiding the chapter's vision and ensuring institutional support for cloud innovation at RIT.",
  skills: ['Mentorship', 'Cloud Strategy'],
  github: 'https://github.com',
  linkedin: 'https://linkedin.com',
};

const Team = () => {
  usePageTitle('Leadership Team', 'Faculty guidance and leadership driving the AWS Student Builder Group at RIT.');

  return (
    <div className="relative min-h-screen bg-aws-navy pt-28 pb-20 px-6 overflow-hidden">
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
              Advisor
            </span>
          </h1>

          {/* Upscaled Subheading */}
          <p className="text-gray-400 text-lg md:text-xl lg:text-2xl font-medium max-w-4xl mx-auto leading-relaxed">
            Faculty guidance ensuring institutional alignment and academic excellence for AWS SBG RIT.
          </p>
        </div>

        {/* Centered Faculty Coordinator Card */}
        <div className="flex justify-center max-w-md mx-auto mt-12">
          <div
            className="w-full border border-white/10 bg-[#10151c] rounded-3xl p-8 flex flex-col items-center text-center hover:border-sbg-green/30 transition-all shadow-xl group relative"
          >
            {/* Avatar Wrapper */}
            <div className="relative">
              <div className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-extrabold text-white bg-purple-600 shadow-lg group-hover:scale-105 transition-transform">
                {FACULTY_MEMBER.initials}
              </div>
              <span className="absolute -top-2 -right-4 bg-sbg-green text-black px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 shadow-md">
                {FACULTY_MEMBER.badge}
              </span>
            </div>

            {/* Name & Role */}
            <h2 className="text-2xl font-bold text-white mt-6">{FACULTY_MEMBER.name}</h2>
            <p className="text-sm font-mono text-sbg-green mt-1">{FACULTY_MEMBER.role}</p>

            {/* Description */}
            <p className="text-gray-400 text-xs md:text-sm mt-4 max-w-xs leading-relaxed">
              {FACULTY_MEMBER.bio}
            </p>

            {/* Skill Pills */}
            <div className="flex flex-wrap justify-center gap-2 mt-5">
              {FACULTY_MEMBER.skills.map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1 border border-white/15 bg-white/5 rounded-full text-xs text-gray-300 font-mono"
                >
                  {skill}
                </span>
              ))}
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-4 mt-6 text-gray-400">
              <a
                href={FACULTY_MEMBER.github}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${FACULTY_MEMBER.name} GitHub`}
                className="hover:text-white transition-colors"
              >
                <GithubIcon className="w-5 h-5" />
              </a>
              <a
                href={FACULTY_MEMBER.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${FACULTY_MEMBER.name} LinkedIn`}
                className="hover:text-white transition-colors"
              >
                <LinkedinIcon className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Team;
