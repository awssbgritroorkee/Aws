import { Link } from 'react-router-dom';
import { Compass, Target, Rocket, Award, Users, Cloud, Laptop, Code, ArrowRight } from 'lucide-react';
import usePageTitle from '../hooks/usePageTitle';

const PERKS = [
  { icon: <Award className="w-4 h-4 text-sbg-green" />, label: 'E-Certificate' },
  { icon: <Users className="w-4 h-4 text-sbg-green" />, label: 'Networking' },
  { icon: <Cloud className="w-4 h-4 text-sbg-green" />, label: 'AWS Swag' },
  { icon: <Laptop className="w-4 h-4 text-sbg-green" />, label: 'Hands-on Labs' },
  { icon: <Code className="w-4 h-4 text-sbg-green" />, label: 'Open to all Branches' },
];

const WHY_JOIN_CARDS = [
  {
    num: '01',
    title: 'Learn by doing.',
    text: 'Hands-on workshops and projects, not boring lectures. Build real cloud apps and web platforms.',
  },
  {
    num: '02',
    title: 'Get certified.',
    text: 'Free prep sessions, study groups, and roadmaps to help you ace your AWS Cloud Practitioner exams.',
  },
  {
    num: '03',
    title: 'Network.',
    text: 'Connect with AWS professionals, alumni mentors, and peers who share your passion for technology.',
  },
  {
    num: '04',
    title: 'Win stuff.',
    text: 'Participate in hackathons for real prizes, swags, and opportunities. Plus, access to free AWS credits.',
  },
];

const About = () => {
  usePageTitle('About Us', 'Community built around practice. AWS Student Builder Group at RIT.');

  return (
    <div className="relative min-h-screen bg-aws-navy px-6 pb-20 overflow-hidden">
      {/* Soft Background Violet Radial Blur */}
      <div
        aria-hidden="true"
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-purple-900/20 rounded-full blur-[120px] pointer-events-none -z-10"
      />

      <div className="relative z-10 max-w-6xl mx-auto space-y-24">
        {/* 1. Hero Section (Standardized Cinematic Canvas) */}
        <section className="pt-36 pb-20 text-center flex flex-col items-center justify-center max-w-4xl mx-auto relative">
          {/* Glassmorphism Eyebrow Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-xs md:text-sm font-mono tracking-widest text-gray-300 uppercase shadow-md">
            <Compass className="w-4 h-4 text-sbg-green" />
            <span>OUR PHILOSOPHY</span>
          </div>

          {/* Main Headline with Gradient Accent */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white text-center mt-6 leading-[1.1] drop-shadow-lg">
            Community built around{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-sbg-green">
              practice.
            </span>
          </h1>

          {/* Subheadline with breathing room */}
          <p className="max-w-4xl mx-auto mt-6 text-gray-400 text-lg md:text-xl lg:text-2xl font-medium leading-relaxed text-center">
            AWS Student Builder Group at RIT is a student-led technical community for anyone who wants hands-on cloud experience, sharper programming foundations, and a space to build real software with others. No prior coding experience required.
          </p>
        </section>

        {/* 2. Vision & Mission Cards (Glassmorphism Grid) */}
        <section className="grid md:grid-cols-2 gap-8">
          {/* Card 1: Vision */}
          <div className="bg-white/5 border border-white/10 p-8 rounded-2xl space-y-4 hover:border-purple-glow/40 transition-all shadow-xl">
            <div className="w-12 h-12 rounded-xl bg-purple-glow/15 border border-purple-glow/30 flex items-center justify-center text-purple-glow">
              <Target className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-white">Our Vision</h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              To cultivate an inclusive community of cloud-native builders who actively shape the future of technology by mastering Amazon Web Services and participating in the global developer ecosystem.
            </p>
          </div>

          {/* Card 2: Mission */}
          <div className="bg-white/5 border border-white/10 p-8 rounded-2xl space-y-4 hover:border-sbg-green/40 transition-all shadow-xl">
            <div className="w-12 h-12 rounded-xl bg-sbg-green/15 border border-sbg-green/30 flex items-center justify-center text-sbg-green">
              <Rocket className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-white">Our Mission</h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              Equip students across all disciplines with the practical skills, industry certifications, and hands-on project experience necessary to thrive in the modern software landscape.
            </p>
          </div>
        </section>

        {/* 3. "Why Join Us?" Section (Numbered Cards Layout) */}
        <section className="space-y-12">
          <div className="text-center">
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              Why join RIT's AWS SBG?
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
            {WHY_JOIN_CARDS.map((card) => (
              <div
                key={card.num}
                className="bg-white/5 border border-white/10 p-6 rounded-2xl space-y-3 hover:border-sbg-green transition-all shadow-lg flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <span className="text-xl font-mono font-bold text-purple-glow block">
                    {card.num}
                  </span>
                  <h3 className="text-lg font-bold text-white group-hover:text-sbg-green transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    {card.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 4. Feature Pills (The Perks) */}
        <section className="flex flex-wrap items-center justify-center gap-4 py-6">
          {PERKS.map((perk, i) => (
            <div
              key={i}
              className="rounded-full px-5 py-2.5 border border-white/20 bg-white/5 text-sm font-mono text-gray-300 flex items-center gap-2.5 hover:border-sbg-green/50 hover:bg-white/10 transition-all shadow-md"
            >
              {perk.icon}
              <span>{perk.label}</span>
            </div>
          ))}
        </section>

        {/* 5. Call to Action (Bottom Banner) */}
        <section className="rounded-3xl bg-gradient-to-r from-purple-900/50 to-transparent border border-white/10 p-10 md:p-14 text-center flex flex-col items-center justify-center space-y-6 shadow-2xl">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            Ready to ship real software with us?
          </h2>

          <Link
            to="/contact"
            className="px-8 py-4 rounded-full text-sm font-bold bg-[#00E582] text-aws-navy hover:bg-white transition-all duration-200 shadow-lg shadow-sbg-green/20 active:scale-95 flex items-center gap-2"
          >
            Join the Community <ArrowRight className="w-4 h-4" />
          </Link>
        </section>
      </div>
    </div>
  );
};

export default About;
