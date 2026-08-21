import { Flame, Activity, ShieldAlert, Recycle, ExternalLink, Cpu, Code2 } from 'lucide-react';
import usePageTitle from '../hooks/usePageTitle';

const GithubIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.1-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z"/>
  </svg>
);

const REAL_PROJECTS = [
  {
    id: 'autonix',
    title: 'AUTONIX Acoustic Fire Suppression Vehicle',
    eventTag: 'Technomax Prototype',
    category: 'Robotics & Hardware',
    status: 'FEATURED PROTOTYPE',
    statusColor: '#00E582',
    description: 'Autonomous fire-extinguishing vehicle utilizing ESP32-CAM, onboard computer vision, and an AWS Cloud telemetry dashboard for acoustic frequency suppression analytics.',
    stack: ['ESP32-CAM', 'Computer Vision', 'AWS IoT Core', 'Django REST'],
    icon: <Flame className="w-6 h-6 text-amber-400" />,
    gradient: 'from-amber-500/10 via-purple-dim/20 to-transparent',
  },
  {
    id: 'green-track',
    title: 'Green Track Waste Management Platform',
    eventTag: 'AI for Bharat Hackathon',
    category: 'Cloud & AI Innovation',
    status: 'AWARD WINNER',
    statusColor: '#00E582',
    description: 'Cloud and AI dashboard analyzing urban waste distribution, optimizing route logistics, and processing real-time sensor streams over AWS infrastructure.',
    stack: ['AWS SageMaker', 'React', 'Django REST', 'PostgreSQL'],
    icon: <Recycle className="w-6 h-6 text-sbg-green" />,
    gradient: 'from-sbg-green/10 via-purple-dim/20 to-transparent',
  },
  {
    id: 'patient-health',
    title: 'Patient Health Monitoring Network',
    eventTag: 'IoT Integrations',
    category: 'Healthcare & Microcontrollers',
    status: 'DEPLOYED LAB',
    statusColor: '#38bdf8',
    description: 'Smart biomedical sensor array built on NodeMCU microcontrollers, streaming live pulse and vitals data directly to AWS IoT Core and real-time dashboards.',
    stack: ['NodeMCU', 'AWS IoT Core', 'MQTT', 'Live Dashboards'],
    icon: <Activity className="w-6 h-6 text-sky-400" />,
    gradient: 'from-sky-500/10 via-purple-dim/20 to-transparent',
  },
  {
    id: 'proximity-alert',
    title: 'Obstacle Detection & Live Proximity Alert Systems',
    eventTag: 'HackSprit Innovation',
    category: 'Embedded & Safety Tech',
    status: 'PROTOTYPE',
    statusColor: '#a855f7',
    description: 'Hardware-to-cloud obstacle detection platform combining ultrasonic arrays with low-latency AWS WebSockets for real-time proximity warning triggers.',
    stack: ['ESP32', 'AWS WebSockets', 'Python', 'React'],
    icon: <ShieldAlert className="w-6 h-6 text-purple-glow" />,
    gradient: 'from-purple-glow/10 via-purple-dim/20 to-transparent',
  },
];

const Projects = () => {
  usePageTitle(
    'Projects & Innovations',
    'Real-world autonomous robotics, IoT sensor networks, and cloud platforms built by AWS SBG RIT members.'
  );

  return (
    <div className="relative min-h-screen bg-transparent pt-28 pb-20 px-6 overflow-hidden">
      {/* Background radial spotlight */}
      <div
        aria-hidden="true"
        className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[550px] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(124,58,237,0.18) 0%, transparent 70%)',
          filter: 'blur(70px)',
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto space-y-16">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs font-mono font-bold uppercase tracking-[0.25em] text-sbg-green mb-2 block">
            REAL-WORLD ENGINEERING
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-4">
            Projects &amp; Prototypes
          </h1>
          <p className="text-gray-400 text-base leading-relaxed">
            Bridging hardware and cloud. We build end-to-end systems: connecting physical sensor arrays and microcontrollers (ESP32, NodeMCU) to scalable Django backends and AWS infrastructure.
          </p>
        </div>

        {/* Projects Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {REAL_PROJECTS.map((project) => (
            <article
              key={project.id}
              className="p-8 rounded-2xl bg-[#10151c]/90 backdrop-blur-2xl border border-white/10 hover:border-sbg-green/40 transition-all duration-300 shadow-xl group flex flex-col justify-between relative overflow-hidden"
            >
              {/* Gradient overlay */}
              <div
                aria-hidden="true"
                className={`absolute inset-0 bg-gradient-to-br ${project.gradient} pointer-events-none`}
              />

              <div className="relative z-10 space-y-4">
                {/* Event tag & Status Badge */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-mono font-bold text-sbg-green uppercase tracking-wider">
                    ● {project.eventTag}
                  </span>
                  <span
                    className="text-[10px] font-mono font-bold px-3 py-1 rounded-full border tracking-wider"
                    style={{
                      color: project.statusColor,
                      borderColor: `${project.statusColor}40`,
                      background: `${project.statusColor}15`,
                    }}
                  >
                    {project.status}
                  </span>
                </div>

                {/* Icon + Title */}
                <div className="flex items-start gap-3">
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex-shrink-0 mt-1">
                    {project.icon}
                  </div>
                  <div>
                    <span className="text-xs font-mono text-gray-500 block mb-1">
                      {project.category}
                    </span>
                    <h2 className="text-xl font-bold text-white group-hover:text-sbg-green transition-colors leading-snug">
                      {project.title}
                    </h2>
                  </div>
                </div>

                <p className="text-sm text-gray-400 leading-relaxed">
                  {project.description}
                </p>
              </div>

              {/* Stack Pills & Links */}
              <div className="relative z-10 pt-6 mt-6 border-t border-white/10 space-y-4">
                <div className="flex flex-wrap gap-2">
                  {project.stack.map((tech) => (
                    <span
                      key={tech}
                      className="text-[11px] font-mono text-gray-300 px-3 py-1 rounded-full bg-white/5 border border-white/10"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between text-xs font-mono text-gray-400 pt-1">
                  <span className="flex items-center gap-1.5 text-sbg-green">
                    <Cpu className="w-3.5 h-3.5" /> Hardware + AWS System
                  </span>
                  <div className="flex items-center gap-3">
                    <a
                      href="https://github.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-white transition-colors flex items-center gap-1"
                    >
                      <GithubIcon className="w-3.5 h-3.5" /> Repo
                    </a>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Integration Callout */}
        <div className="p-8 md:p-10 rounded-2xl bg-gradient-to-r from-purple-dim/20 via-white/5 to-sbg-green/10 border border-sbg-green/30 text-center space-y-4">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-sbg-green">
            THE RIT CHAPTER DIFFERENTIATOR
          </span>
          <h3 className="text-2xl font-bold text-white max-w-2xl mx-auto">
            From Sensor Pin to AWS Lambda Trigger
          </h3>
          <p className="text-sm text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Unlike standard software clubs, we bridge the physical and digital. We build end-to-end systems: connecting physical sensor arrays and microcontrollers (ESP32, NodeMCU) to scalable Django backends and AWS cloud infrastructure.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Projects;
