import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, CheckCircle2, Award, ExternalLink, ArrowRight, Filter } from 'lucide-react';
import usePageTitle from '../hooks/usePageTitle';

const ALL_EVENTS = [
  {
    id: 1,
    title: 'AWS Cloud Practitioner Essentials Bootcamp',
    category: 'Workshops',
    status: 'Upcoming',
    date: 'Aug 30, 2026',
    time: '10:00 AM – 3:00 PM',
    location: 'RIT Tech Lab 304 & AWS Amplify',
    description: 'A comprehensive foundational workshop introducing cloud concepts, EC2, S3, IAM, and security fundamentals.',
    typeTag: 'Hands-on Lab',
    link: '/contact',
  },
  {
    id: 2,
    title: 'Serverless Microservices Challenge',
    category: 'Hackathons',
    status: 'Completed',
    date: 'Jul 15, 2026',
    time: '24 Hours',
    location: 'RIT Auditorium',
    description: 'Students built and deployed event-driven API backends using AWS Lambda, DynamoDB, and API Gateway.',
    typeTag: 'Hackathon',
    galleryLink: '/gallery',
  },
  {
    id: 3,
    title: 'IoT Telemetry Pipelines with AWS IoT Core',
    category: 'Workshops',
    status: 'Completed',
    date: 'Jun 10, 2026',
    time: '2:00 PM – 5:00 PM',
    location: 'IoT Innovation Lab',
    description: 'Connecting microcontrollers (ESP32) with AWS IoT Core to publish real-time telemetry over MQTT.',
    typeTag: 'Hardware & Cloud',
    galleryLink: '/gallery',
  },
  {
    id: 4,
    title: 'AWS SBG Founding Cohort Orientation',
    category: 'Meetups',
    status: 'Completed',
    date: 'May 20, 2026',
    time: '4:00 PM – 6:00 PM',
    location: 'Seminar Hall B',
    description: 'Introducing the chapter leadership, domain leads, and roadmap for cloud certifications and hackathons.',
    typeTag: 'Community Meetup',
    galleryLink: '/gallery',
  },
];

const CATEGORIES = ['All', 'Workshops', 'Hackathons', 'Meetups'];

const Events = () => {
  usePageTitle('Events', 'AWS workshops, cloud bootcamps, and hackathons hosted by AWS SBG RIT.');
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredEvents = activeCategory === 'All'
    ? ALL_EVENTS
    : ALL_EVENTS.filter((e) => e.category === activeCategory);

  return (
    <div className="relative min-h-screen bg-transparent pt-28 pb-20 px-6 overflow-hidden">
      {/* Background Glow */}
      <div
        aria-hidden="true"
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-sbg-green/5 rounded-full blur-[120px] -z-10 pointer-events-none"
      />

      <div className="relative z-10 max-w-6xl mx-auto text-center">
        {/* Eyebrow Glassmorphism Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-sm md:text-base font-mono tracking-widest text-gray-300 uppercase mb-6 shadow-md">
          <span className="w-2 h-2 rounded-full bg-sbg-green"></span>
          <span>UPCOMING &amp; PAST SESSIONS</span>
        </div>

        {/* Upscaled Heading */}
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1] mb-6">
          Events &amp;{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-sbg-green to-teal-400">
            Workshops
          </span>
        </h1>

        {/* Upscaled Subheading */}
        <p className="text-gray-400 text-lg md:text-xl lg:text-2xl font-medium max-w-4xl mx-auto mb-10 leading-relaxed">
          Hands-on cloud bootcamps, technical hackathons, and AWS certification workshops at RIT.
        </p>

        {/* Filterable Category Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2 rounded-full text-xs font-mono font-semibold transition-all duration-200 ${
                activeCategory === cat
                  ? 'bg-sbg-green text-aws-navy shadow-lg shadow-sbg-green/20'
                  : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:border-white/20'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Events Grid */}
        <div className="grid md:grid-cols-2 gap-8 text-left">
          {filteredEvents.map((event) => (
            <div
              key={event.id}
              className="p-8 rounded-2xl bg-[#10151c]/90 backdrop-blur-2xl border border-white/10 hover:border-sbg-green/40 transition-all duration-300 flex flex-col justify-between group"
            >
              <div className="space-y-4">
                {/* Event Card Header */}
                <div className="flex items-center justify-between gap-2">
                  {event.status === 'Upcoming' ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-sbg-green/10 text-sbg-green border border-sbg-green/30 uppercase tracking-wider">
                      <Clock className="w-3.5 h-3.5" />
                      UPCOMING
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 uppercase tracking-wider">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      COMPLETED
                    </span>
                  )}
                  <span className="text-xs font-mono text-gray-500 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {event.date}
                  </span>
                </div>

                {/* Banner Thumbnail Placeholder */}
                <div className="h-32 rounded-xl bg-gradient-to-r from-purple-dim/30 via-white/5 to-sbg-green/10 border border-white/10 flex items-center justify-center p-4">
                  <span className="text-xs font-mono font-semibold text-gray-300 uppercase tracking-wider">
                    {event.category} · {event.typeTag}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-white group-hover:text-sbg-green transition-colors">
                  {event.title}
                </h3>

                <p className="text-sm text-gray-400 leading-relaxed">
                  {event.description}
                </p>
              </div>

              {/* Card Footer Actions */}
              <div className="pt-6 mt-6 border-t border-white/10 flex items-center justify-between">
                <span className="text-xs font-mono text-gray-500">{event.location}</span>

                {event.status === 'Upcoming' ? (
                  <Link
                    to={event.link}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-mono font-bold bg-sbg-green text-aws-navy hover:bg-white transition-colors"
                  >
                    Register Now <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                ) : (
                  <Link
                    to={event.galleryLink}
                    className="inline-flex items-center gap-1.5 text-xs font-mono text-sbg-green hover:underline"
                  >
                    View Photos <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Events;
