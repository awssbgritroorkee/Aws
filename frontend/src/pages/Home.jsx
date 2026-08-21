import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, Code2, Cloud, Cpu, Trophy, Calendar } from 'lucide-react';
import usePageTitle from '../hooks/usePageTitle';

const FEATURES = [
  {
    id: 'fullstack',
    icon: <Code2 className="w-7 h-7 text-sbg-green" />,
    title: 'Full-Stack Web Dev',
    description: 'Build production-ready applications with modern frameworks like React, Vite, and Django REST Framework.',
    accent: 'rgba(0,229,130,0.12)',
  },
  {
    id: 'cloud',
    icon: <Cloud className="w-7 h-7 text-sky-400" />,
    title: 'Cloud & DevOps',
    description: 'Master EC2, S3, Docker containers, CI/CD pipelines, and Infrastructure as Code on AWS cloud.',
    accent: 'rgba(56,189,248,0.15)',
  },
  {
    id: 'iot',
    icon: <Cpu className="w-7 h-7 text-amber-400" />,
    title: 'IoT & Hardware',
    description: 'Bridge physical hardware with cloud telemetry pipelines using ESP32 microcontrollers and AWS IoT Core.',
    accent: 'rgba(255,153,0,0.12)',
  },
  {
    id: 'hackathons',
    icon: <Trophy className="w-7 h-7 text-sbg-green" />,
    title: 'Competitive Hackathons',
    description: 'Participate and lead in national hackathons like Smart India Hackathon, Technomax, and HackSprit.',
    accent: 'rgba(0,229,130,0.12)',
  },
];

const STATS = [
  '04 Focus Domains',
  '2026 Chapter Founded',
  'Global AWS SBG Network',
  'Open Enrollment',
];

const Home = () => {
  usePageTitle(
    'Home',
    "Official website of AWS Student Builder Group at Roorkee Institute of Technology. Full-Stack, Cloud & DevOps, IoT, and Hackathons."
  );

  return (
    <div className="relative bg-aws-navy text-white overflow-hidden">
      {/* Soft Background Low-Opacity Green Glow */}
      <div
        aria-hidden="true"
        className="absolute top-24 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-sbg-green/10 rounded-full blur-[120px] pointer-events-none -z-10"
      />

      {/* Hero Section */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pt-36 pb-20 text-center flex flex-col items-center justify-center">
        {/* Eyebrow badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-mono font-semibold text-gray-300 uppercase tracking-widest mb-8 border border-sbg-green/30 bg-white/5 shadow-md">
          <Sparkles className="w-3.5 h-3.5 text-sbg-green" />
          <span>Recruiting the founding cohort — 2026–27</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
          Welcome to RIT's <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-sbg-green to-teal-400">
            AWS Student Builder Group
          </span>
        </h1>

        <p className="mt-6 text-gray-400 text-base md:text-lg font-medium max-w-2xl text-center leading-relaxed">
          We're RIT's official AWS Student Builder Group — architecting the future through full-stack development, IoT, and cloud innovation. Hands-on workshops, real projects, and a straight path to your first AWS certification. No prior experience required.
        </p>

        {/* Action Buttons */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/contact"
            className="bg-sbg-green text-black font-bold px-6 py-2.5 rounded-full hover:bg-[#00c972] transition-all shadow-lg shadow-sbg-green/20 active:scale-95"
          >
            Join Now
          </Link>
          <Link
            to="/events"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-semibold text-gray-300 border border-gray-500 hover:border-sbg-green hover:text-sbg-green transition-all duration-200 active:scale-95 bg-white/5"
          >
            Explore Events
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Honest Stats Strip */}
        <div className="mt-12 inline-flex flex-wrap items-center justify-center gap-3 md:gap-6 px-6 py-2.5 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-gray-400">
          {STATS.map((stat, i) => (
            <div key={stat} className="flex items-center gap-3">
              {i > 0 && <span className="text-gray-600 hidden sm:inline">•</span>}
              <span className="text-gray-300 font-semibold">{stat}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Floating Feature Highlights — 4 Columns */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <span className="text-xs font-mono font-bold uppercase tracking-[0.25em] text-sbg-green mb-2 block">
            CORE FOCUS AREAS
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white">
            What We Build
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map((f) => (
            <div
              key={f.id}
              className="relative flex flex-col items-start p-7 rounded-2xl bg-white/5 border border-white/10 hover:border-sbg-green/40 hover:bg-white/[0.07] transition-all duration-300 shadow-xl hover:-translate-y-1 group"
            >
              <div
                className="w-13 h-13 rounded-2xl flex items-center justify-center mb-5 flex-shrink-0"
                style={{ background: f.accent }}
              >
                {f.icon}
              </div>
              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-sbg-green transition-colors">
                {f.title}
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Next Event Teaser Card */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 pb-16">
        <Link
          to="/events"
          className="group block p-6 md:p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-sbg-green/40 transition-all duration-300 shadow-xl"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-sbg-green uppercase tracking-wider">
                <Calendar className="w-3.5 h-3.5" />
                <span>Next Upcoming Workshop</span>
              </div>
              <h3 className="text-xl font-bold text-white group-hover:text-sbg-green transition-colors">
                AWS Cloud Practitioner Essentials Bootcamp
              </h3>
              <p className="text-xs text-gray-400">
                August 30, 2026 · Hands-on EC2 &amp; S3 lab session at RIT Tech Lab.
              </p>
            </div>
            <span className="inline-flex items-center gap-2 text-xs font-mono font-bold text-sbg-green group-hover:translate-x-1 transition-transform flex-shrink-0">
              View Events &amp; Register <ArrowRight className="w-4 h-4" />
            </span>
          </div>
        </Link>
      </section>
    </div>
  );
};

export default Home;
