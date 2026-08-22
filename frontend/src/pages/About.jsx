import { ArrowRight, Sparkles } from 'lucide-react';
import usePageTitle from '../hooks/usePageTitle';

const MISSION_PILLARS = [
  {
    id: 'pillar-1',
    title: '🚀 PILLAR 01: Cloud Learning',
    text: 'Building a strong foundation in AWS and cloud technologies through workshops, discussions, resources and hands-on learning.',
    tags: ['AWS', 'CLOUD', 'LEARNING'],
  },
  {
    id: 'pillar-2',
    title: '🛠️ PILLAR 02: Hands-on Building',
    text: 'Turning what we learn into practical experience through projects, experiments and deployments. Learn by building, testing and improving.',
    tags: ['PROJECTS', 'AWS', 'BUILD'],
  },
  {
    id: 'pillar-3',
    title: '👥 PILLAR 03: Community & Collaboration',
    text: 'Bringing cloud enthusiasts together to share knowledge, work on ideas and learn from one another through projects, events and hackathons.',
    tags: ['COMMUNITY', 'COLLABORATION', 'HACKATHONS'],
  },
];

const About = () => {
  usePageTitle(
    'About Us',
    'From first instance to first deployment. Learn about AWS Student Builder Group at RIT.'
  );

  return (
    <div className="relative min-h-screen bg-transparent px-6 pb-20 overflow-hidden">
      {/* Soft Background Violet Radial Blur */}
      <div
        aria-hidden="true"
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-purple-900/20 rounded-full blur-[120px] pointer-events-none -z-10"
      />

      <div className="relative z-10 max-w-6xl mx-auto space-y-20 pt-36">
        {/* 1. Hero Section */}
        <section className="text-center flex flex-col items-center justify-center max-w-4xl mx-auto">
          {/* Eyebrow Glassmorphism Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-xs md:text-sm font-mono tracking-widest text-gray-300 uppercase shadow-md mb-6">
            <Sparkles className="w-4 h-4 text-sbg-green" />
            <span>ABOUT OUR COMMUNITY</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1] uppercase text-center">
            FROM FIRST INSTANCE <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-sbg-green to-teal-400">
              TO FIRST DEPLOYMENT
            </span>
          </h1>

          {/* Subtext */}
          <p className="mt-6 text-gray-400 text-base md:text-lg lg:text-xl font-medium max-w-3xl leading-relaxed text-center">
            AWS SBG RIT is where cloud enthusiasts come together to learn AWS, experiment with cloud technologies and build practical projects. Whether you're getting started or already building, there's always something more to explore.
          </p>
        </section>

        {/* 2. The "One Box" Banner */}
        <section className="max-w-5xl mx-auto">
          <div className="bg-[#10151c]/90 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 md:p-8 hover:border-sbg-green/50 transition-all duration-300 flex items-center justify-center text-center shadow-2xl">
            <div className="flex flex-wrap items-center justify-center gap-3 md:gap-5 font-mono font-bold text-sm md:text-lg tracking-wider text-white">
              <span>WORKSHOPS</span>
              <span className="text-sbg-green font-extrabold">|</span>
              <span>BUILD &amp; DEPLOY</span>
              <span className="text-sbg-green font-extrabold">|</span>
              <span>HACKATHONS</span>
            </div>
          </div>
        </section>

        {/* 3. The Cloud Builder Path */}
        <section className="space-y-8 max-w-5xl mx-auto">
          <div className="text-center space-y-2">
            <span className="text-xs font-mono font-bold uppercase tracking-[0.25em] text-sbg-green block">
              OUR IDENTITY: LEARN THE CLOUD. BUILD WITH IT.
            </span>
            <h2 className="text-2xl md:text-4xl font-extrabold text-white uppercase tracking-tight">
              THE CLOUD BUILDER PATH
            </h2>
          </div>

          {/* Visual Pipeline Layout */}
          <div className="bg-[#10151c]/90 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 md:p-10 hover:border-sbg-green/50 transition-all duration-300 space-y-8 shadow-xl">
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 py-4">
              <div className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-base md:text-lg font-mono font-bold text-white tracking-wider uppercase text-center w-full md:w-auto">
                1. Understand
              </div>
              <ArrowRight className="w-6 h-6 text-sbg-green rotate-90 md:rotate-0 flex-shrink-0" />
              <div className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-base md:text-lg font-mono font-bold text-white tracking-wider uppercase text-center w-full md:w-auto">
                2. Experiment
              </div>
              <ArrowRight className="w-6 h-6 text-sbg-green rotate-90 md:rotate-0 flex-shrink-0" />
              <div className="px-6 py-3 rounded-xl bg-sbg-green/10 border border-sbg-green/40 text-base md:text-lg font-mono font-bold text-sbg-green tracking-wider uppercase text-center w-full md:w-auto shadow-md">
                3. Deploy
              </div>
            </div>

            <p className="text-gray-300 text-sm md:text-base leading-relaxed text-center max-w-3xl mx-auto font-sans">
              We move beyond simply learning cloud concepts by encouraging members to experiment with AWS, work together and build practical projects through workshops, projects and hackathons.
            </p>
          </div>
        </section>

        {/* 4. Mission Pillars (3-Column Grid) */}
        <section className="space-y-8 max-w-6xl mx-auto">
          <div className="text-center">
            <span className="text-xs font-mono font-bold uppercase tracking-[0.25em] text-sbg-green mb-2 block">
              OUR GUIDING PRINCIPLES
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white uppercase tracking-tight">
              MISSION PILLARS
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {MISSION_PILLARS.map((pillar) => (
              <div
                key={pillar.id}
                className="bg-[#10151c]/90 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 md:p-8 hover:border-sbg-green/50 transition-all duration-300 flex flex-col justify-between group shadow-xl"
              >
                <div className="space-y-4">
                  <h3 className="text-lg md:text-xl font-bold text-white group-hover:text-sbg-green transition-colors">
                    {pillar.title}
                  </h3>
                  <p className="text-xs md:text-sm text-gray-400 leading-relaxed font-sans">
                    {pillar.text}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t border-white/5">
                  {pillar.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-full text-[11px] font-mono text-sbg-green tracking-wide"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default About;
