const TEAM = [
  {
    id: 'aditya',
    name: 'Aditya Raj',
    role: 'Group Lead',
    skills: ['AWS', 'DevOps', 'Cloud Infra'],
    initials: 'AR',
    gradient: 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)',
    glowColor: 'rgba(124,58,237,0.5)',
    isLead: true,
    linkedin: '#',
    github: '#',
  },
  {
    id: 'rajat',
    name: 'Rajat Raj Seth',
    role: 'Full-Stack Engineer',
    skills: ['React', 'Django', 'PostgreSQL'],
    initials: 'RS',
    gradient: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
    glowColor: 'rgba(37,99,235,0.45)',
    isLead: false,
    linkedin: '#',
    github: '#',
  },
  {
    id: 'aashish',
    name: 'Aashish',
    role: 'ML & AI Engineer',
    skills: ['SageMaker', 'Python', 'TensorFlow'],
    initials: 'AA',
    gradient: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
    glowColor: 'rgba(5,150,105,0.45)',
    isLead: false,
    linkedin: '#',
    github: '#',
  },
  {
    id: 'anshu',
    name: 'Anshu Priya',
    role: 'UI/UX & Frontend',
    skills: ['Figma', 'React', 'Design Systems'],
    initials: 'AP',
    gradient: 'linear-gradient(135deg, #db2777 0%, #be185d 100%)',
    glowColor: 'rgba(219,39,119,0.45)',
    isLead: false,
    linkedin: '#',
    github: '#',
  },
  {
    id: 'ranvijay',
    name: 'Ranvijay',
    role: 'Embedded & IoT',
    skills: ['Embedded C', 'AWS IoT', 'RTOS'],
    initials: 'RV',
    gradient: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
    glowColor: 'rgba(217,119,6,0.45)',
    isLead: false,
    linkedin: '#',
    github: '#',
  },
];

const GithubIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
  </svg>
);

const LinkedinIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

const TeamSection = () => (
  <section id="team" className="section">
    {/* Background spotlight */}
    <div
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none"
      style={{
        background: 'radial-gradient(ellipse 80% 60% at 20% 50%, rgba(124,58,237,0.07) 0%, transparent 65%)',
      }}
    />

    <div className="relative z-10 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-16">
        <span className="section-badge">The People</span>
        <h2 className="section-title">Leadership &amp; Core Team</h2>
        <div className="section-divider" />
        <p className="section-sub">
          Five builders architecting the cloud era at RIT.
        </p>
      </div>

      {/* Lead card — full-width centered */}
      {TEAM.filter(m => m.isLead).map((member) => (
        <div key={member.id} className="flex justify-center mb-12">
          <article
            className="team-card flex flex-col items-center text-center group
                       max-w-xs w-full animate-fade-up"
          >
            {/* Avatar */}
            <div className="relative mb-5">
              {/* Glow ring */}
              <div
                aria-hidden="true"
                className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background: `radial-gradient(circle, ${member.glowColor} 0%, transparent 70%)`,
                  filter: 'blur(12px)',
                  transform: 'scale(1.4)',
                }}
              />
              <div
                className="team-avatar relative z-10 w-24 h-24 text-2xl font-black"
                style={{ background: member.gradient }}
              >
                {member.initials}
              </div>
              {/* Lead crown badge */}
              <div
                className="absolute -top-1 -right-1 z-20 w-6 h-6 rounded-full flex items-center justify-center text-[10px]"
                style={{ background: '#ff9900', boxShadow: '0 0 12px rgba(255,153,0,0.6)' }}
              >
                ★
              </div>
            </div>

            <h3 className="text-lg font-bold text-white mb-0.5">{member.name}</h3>
            <p className="text-sm font-semibold text-purple-glow mb-3">{member.role}</p>

            {/* Skills */}
            <div className="flex flex-wrap justify-center gap-1.5 mb-4">
              {member.skills.map(s => (
                <span key={s} className="text-xs text-gray-400 px-2 py-0.5 rounded-full"
                  style={{ background:'rgba(255,255,255,0.06)' }}>
                  {s}
                </span>
              ))}
            </div>

            {/* Social */}
            <div className="flex items-center gap-3">
              <a href={member.github} aria-label={`${member.name} GitHub`}
                className="text-gray-500 hover:text-white transition-colors">
                <GithubIcon />
              </a>
              <a href={member.linkedin} aria-label={`${member.name} LinkedIn`}
                className="text-gray-500 hover:text-white transition-colors">
                <LinkedinIcon />
              </a>
            </div>
          </article>
        </div>
      ))}

      {/* Core team grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-8 justify-items-center">
        {TEAM.filter(m => !m.isLead).map((member, i) => (
          <article
            key={member.id}
            className="team-card flex flex-col items-center text-center group animate-fade-up"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            {/* Avatar + glow */}
            <div className="relative mb-4">
              <div
                aria-hidden="true"
                className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background: `radial-gradient(circle, ${member.glowColor} 0%, transparent 70%)`,
                  filter: 'blur(10px)',
                  transform: 'scale(1.35)',
                }}
              />
              <div
                className="team-avatar relative z-10 w-20 h-20 text-xl font-black"
                style={{ background: member.gradient }}
              >
                {member.initials}
              </div>
            </div>

            <h3 className="text-sm font-bold text-white mb-0.5">{member.name}</h3>
            <p className="text-xs font-semibold text-gray-400 mb-3">{member.role}</p>

            <div className="flex flex-wrap justify-center gap-1 mb-3">
              {member.skills.slice(0,2).map(s => (
                <span key={s} className="text-[10px] text-gray-500 px-1.5 py-0.5 rounded-full"
                  style={{ background:'rgba(255,255,255,0.05)' }}>
                  {s}
                </span>
              ))}
            </div>

            <div className="flex items-center gap-2.5">
              <a href={member.github} aria-label={`${member.name} GitHub`}
                className="text-gray-600 hover:text-white transition-colors">
                <GithubIcon />
              </a>
              <a href={member.linkedin} aria-label={`${member.name} LinkedIn`}
                className="text-gray-600 hover:text-white transition-colors">
                <LinkedinIcon />
              </a>
            </div>
          </article>
        ))}
      </div>
    </div>
  </section>
);

export default TeamSection;
