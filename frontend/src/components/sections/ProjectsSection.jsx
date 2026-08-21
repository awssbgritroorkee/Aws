const PROJECTS = [
  {
    id: 'cloudtrace',
    name: 'CloudTrace',
    team: 'Team Nebula',
    status: 'Shipped',
    statusColor: '#34d399',
    stack: ['AWS Lambda', 'DynamoDB', 'React'],
    description: 'Distributed tracing dashboard for serverless workloads built entirely on AWS infrastructure.',
    gradient: 'from-purple-dim/30 to-transparent',
  },
  {
    id: 'iot-monitor',
    name: 'Campus IoT Monitor',
    team: 'Team Circuit',
    status: 'Active',
    statusColor: '#ff9900',
    stack: ['AWS IoT Core', 'MQTT', 'Grafana'],
    description: 'Real-time energy consumption monitoring across the RIT campus using IoT sensors and AWS.',
    gradient: 'from-amber-900/20 to-transparent',
  },
  {
    id: 'placement-ml',
    name: 'PlacePred ML',
    team: 'Team Synapse',
    status: 'In Progress',
    statusColor: '#60a5fa',
    stack: ['SageMaker', 'Python', 'S3'],
    description: 'ML model predicting placement outcomes from anonymized historical RIT campus data.',
    gradient: 'from-blue-900/20 to-transparent',
  },
  {
    id: 'sbg-portal',
    name: 'SBG Portal',
    team: 'Core Team',
    status: 'Live',
    statusColor: '#34d399',
    stack: ['React', 'Django', 'Vite'],
    description: 'The official SBG RIT platform — this very site. Open-source, contributions welcome.',
    gradient: 'from-purple-dim/20 to-transparent',
  },
];

const ArrowIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <line x1="7" y1="17" x2="17" y2="7"/>
    <polyline points="7 7 17 7 17 17"/>
  </svg>
);

const ProjectsSection = () => (
  <section id="projects" className="section">
    <div
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none"
      style={{
        background: 'radial-gradient(ellipse 60% 40% at 80% 50%, rgba(124,58,237,0.06) 0%, transparent 70%)',
      }}
    />

    <div className="relative z-10 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-16">
        <span className="section-badge">What We've Built</span>
        <h2 className="section-title">Projects</h2>
        <div className="section-divider" />
        <p className="section-sub">
          Real-world cloud applications built by RIT students, deployed on AWS.
        </p>
      </div>

      {/* Projects grid */}
      <div className="grid sm:grid-cols-2 gap-5">
        {PROJECTS.map((project, i) => (
          <article
            key={project.id}
            className="glass-card group relative overflow-hidden animate-fade-up"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            {/* Gradient tint */}
            <div
              aria-hidden="true"
              className={`absolute inset-0 bg-gradient-to-br ${project.gradient} pointer-events-none`}
            />

            <div className="relative z-10">
              {/* Status dot + team */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs text-gray-500 font-medium">{project.team}</span>
                <div className="flex items-center gap-1.5">
                  <div
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: project.statusColor, boxShadow: `0 0 6px ${project.statusColor}` }}
                  />
                  <span className="text-xs font-semibold" style={{ color: project.statusColor }}>
                    {project.status}
                  </span>
                </div>
              </div>

              <h3 className="text-xl font-bold text-white mb-2">{project.name}</h3>
              <p className="text-sm text-gray-400 leading-relaxed mb-5">{project.description}</p>

              {/* Tech stack */}
              <div className="flex flex-wrap gap-2 mb-5">
                {project.stack.map((tech) => (
                  <span
                    key={tech}
                    className="text-xs font-medium px-2.5 py-1 rounded-full text-gray-300"
                    style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.08)' }}
                  >
                    {tech}
                  </span>
                ))}
              </div>

              <a
                href="#"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-glow
                           group-hover:text-white transition-colors"
                id={`project-${project.id}-link`}
              >
                View Project
                <ArrowIcon />
              </a>
            </div>
          </article>
        ))}
      </div>
    </div>
  </section>
);

export default ProjectsSection;
