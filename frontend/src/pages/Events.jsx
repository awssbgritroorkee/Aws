import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, CheckCircle2, ExternalLink, ArrowRight } from 'lucide-react';
import usePageTitle from '../hooks/usePageTitle';

const API_URL = import.meta.env.VITE_API_URL || 'https://aws-swae.onrender.com';

const STATUS_TABS = ['All', 'Upcoming', 'Past'];

const formatDate = (dateString) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch (e) {
    return dateString;
  }
};

const Events = () => {
  usePageTitle('Events', 'AWS workshops, cloud bootcamps, and hackathons hosted by AWS SBG RIT.');

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('All');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/api/events/`);
        if (!response.ok) {
          throw new Error(`Failed to fetch events: ${response.statusText}`);
        }
        const data = await response.json();
        setEvents(Array.isArray(data) ? data : (data.results || []));
      } catch (err) {
        console.error('Error fetching events:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const filteredEvents = activeTab === 'All'
    ? events
    : events.filter((e) => e.status && e.status.toLowerCase() === activeTab.toLowerCase());

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

        {/* Heading */}
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1] mb-6">
          Events &amp;{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-sbg-green to-teal-400">
            Workshops
          </span>
        </h1>

        {/* Subheading */}
        <p className="text-gray-400 text-lg md:text-xl lg:text-2xl font-medium max-w-4xl mx-auto mb-10 leading-relaxed">
          Hands-on cloud bootcamps, technical hackathons, and AWS certification workshops at RIT.
        </p>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-full text-xs font-mono font-semibold transition-all duration-200 ${
                activeTab === tab
                  ? 'bg-sbg-green text-aws-navy shadow-lg shadow-sbg-green/20'
                  : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:border-white/20'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Events Grid / State Handlers */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-10 h-10 border-4 border-sbg-green/30 border-t-sbg-green rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-16 px-6 bg-[#10151c]/60 border border-red-500/20 rounded-3xl max-w-md mx-auto text-red-400">
            <p className="font-medium text-lg">Unable to load events.</p>
            <p className="text-xs text-gray-400 mt-2">{error}</p>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-16 px-6 bg-[#10151c]/60 border border-white/10 rounded-3xl max-w-md mx-auto">
            <p className="text-gray-300 font-medium text-lg">
              No events scheduled yet. Check back soon!
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-8 text-left">
            {filteredEvents.map((event) => {
              const isUpcoming = event.status && event.status.toLowerCase() === 'upcoming';
              return (
                <div
                  key={event.id}
                  className="p-8 rounded-2xl bg-[#10151c]/90 backdrop-blur-2xl border border-white/10 hover:border-sbg-green/40 transition-all duration-300 flex flex-col justify-between group"
                >
                  <div className="space-y-4">
                    {/* Event Card Header */}
                    <div className="flex items-center justify-between gap-2">
                      {isUpcoming ? (
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
                      <span className="text-xs font-mono text-gray-400 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(event.date)}
                      </span>
                    </div>

                    {/* Poster Image or Fallback */}
                    {event.poster ? (
                      <div className="overflow-hidden rounded-xl border border-white/10 h-44">
                        <img
                          src={event.poster}
                          alt={event.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ) : (
                      <div className="h-32 rounded-xl bg-gradient-to-r from-purple-900/30 via-white/5 to-sbg-green/10 border border-white/10 flex items-center justify-center p-4">
                        <span className="text-xs font-mono font-semibold text-gray-300 uppercase tracking-wider">
                          AWS SBG Event
                        </span>
                      </div>
                    )}

                    <h3 className="text-xl font-bold text-white group-hover:text-sbg-green transition-colors">
                      {event.title}
                    </h3>

                    {event.description && (
                      <p className="text-sm text-gray-400 leading-relaxed">
                        {event.description}
                      </p>
                    )}
                  </div>

                  {/* Card Footer Actions */}
                  <div className="pt-6 mt-6 border-t border-white/10 flex items-center justify-between">
                    <span className="text-xs font-mono text-gray-500">AWS Student Builder Group</span>

                    {isUpcoming ? (
                      event.registration_link ? (
                        <a
                          href={event.registration_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-mono font-bold bg-sbg-green text-aws-navy hover:bg-white transition-colors"
                        >
                          Register Now <ArrowRight className="w-3.5 h-3.5" />
                        </a>
                      ) : (
                        <Link
                          to="/contact"
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-mono font-bold bg-sbg-green text-aws-navy hover:bg-white transition-colors"
                        >
                          Register Interest <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      )
                    ) : (
                      <Link
                        to="/gallery"
                        className="inline-flex items-center gap-1.5 text-xs font-mono text-sbg-green hover:underline"
                      >
                        View Photos <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Events;
