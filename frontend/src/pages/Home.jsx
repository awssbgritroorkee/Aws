import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Calendar, Wrench, Rocket, Trophy } from 'lucide-react';
import usePageTitle from '../hooks/usePageTitle';

const WHY_BUILD_CARDS = [
  {
    id: 'workshops',
    icon: <Wrench className="w-7 h-7 text-sbg-green" />,
    title: 'HANDS-ON WORKSHOPS',
    text: 'Learn AWS and cloud concepts through practical sessions, guided demonstrations, and hands-on activities. Get familiar with the tools and services used to build and work with cloud technologies.',
    tags: ['AWS', 'CLOUD', 'HANDS-ON'],
  },
  {
    id: 'projects',
    icon: <Rocket className="w-7 h-7 text-sky-400" />,
    title: 'BUILD & DEPLOY PROJECTS',
    text: 'Take what you learn and put it into practice by building small, practical projects with AWS. Work with other members, experiment with cloud services, and learn how applications can be deployed on the cloud.',
    tags: ['AWS', 'PROJECTS', 'DEPLOYMENT'],
  },
  {
    id: 'hackathons',
    icon: <Trophy className="w-7 h-7 text-amber-400" />,
    title: 'HACKATHONS',
    text: 'Work with a team to solve problems, develop ideas, and build working solutions within a limited time. Put your technical skills into practice while learning from the people you build with.',
    tags: ['TEAMWORK', 'PROBLEM SOLVING', 'BUILD'],
  },
];

const Home = () => {
  usePageTitle(
    'Home',
    'AWS Student Builder Group at RIT. Explore Cloud Computing, AWS and DevOps through hands-on sessions and collaborative projects.'
  );

  return (
    <div className="relative bg-transparent text-white overflow-hidden">
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
          <span>AWS STUDENT BUILDER GROUP · RIT ROORKEE</span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-white leading-[1.1] text-center uppercase">
          WHERE CLOUD LEARNERS <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-sbg-green via-teal-300 to-emerald-400">
            BECOME CLOUD BUILDERS
          </span>
        </h1>

        {/* Subtext */}
        <p className="mt-6 text-gray-400 text-base md:text-lg lg:text-xl font-medium max-w-3xl text-center leading-relaxed">
          RIT's student-led cloud community powered by AWS. Explore Cloud Computing, AWS and DevOps through hands-on sessions, technical workshops and collaborative projects.
        </p>

        {/* Action Buttons */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <a
            href="https://www.meetup.com/aws-sbg-at-roorkee-institute-of-technology/"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-sbg-green text-black font-bold px-7 py-3 rounded-full hover:bg-[#00c972] transition-all shadow-lg shadow-sbg-green/20 active:scale-95 text-sm"
          >
            Join Now
          </a>
          <Link
            to="/events"
            className="inline-flex items-center gap-2 px-7 py-3 rounded-full text-sm font-semibold text-gray-300 border border-gray-500 hover:border-sbg-green hover:text-sbg-green transition-all duration-200 active:scale-95 bg-white/5"
          >
            Explore Events
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* "Why Build With Us" Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <span className="text-xs font-mono font-bold uppercase tracking-[0.25em] text-sbg-green mb-2 block">
            WHY BUILD WITH US
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">
            Learn, Build &amp; Deploy Together
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {WHY_BUILD_CARDS.map((card) => (
            <div
              key={card.id}
              className="bg-[#10151c]/90 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 md:p-8 hover:border-sbg-green/50 transition-all duration-300 flex flex-col justify-between group shadow-xl"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                  {card.icon}
                </div>
                <h3 className="text-xl font-bold text-white group-hover:text-sbg-green transition-colors">
                  {card.title}
                </h3>
                <p className="text-sm text-gray-400 leading-relaxed font-sans">
                  {card.text}
                </p>
              </div>

              {/* Tag Pills */}
              <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t border-white/5">
                {card.tags.map((tag) => (
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

      {/* Events Spotlight */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 pb-16">
        <Link
          to="/events"
          className="group block bg-[#10151c]/90 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 md:p-8 hover:border-sbg-green/50 transition-all duration-300 shadow-xl"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-sbg-green uppercase tracking-wider">
                <Calendar className="w-3.5 h-3.5" />
                <span>EVENTS SPOTLIGHT</span>
              </div>
              <h3 className="text-xl font-bold text-white group-hover:text-sbg-green transition-colors">
                Upcoming AWS Workshops &amp; Hackathons
              </h3>
              <p className="text-xs text-gray-400">
                Join our hands-on sessions, certification bootcamps, and technical sprints at RIT.
              </p>
            </div>
            <span className="inline-flex items-center gap-2 text-xs font-mono font-bold text-sbg-green group-hover:translate-x-1 transition-transform flex-shrink-0">
              Explore All Events <ArrowRight className="w-4 h-4" />
            </span>
          </div>
        </Link>
      </section>
    </div>
  );
};

export default Home;
