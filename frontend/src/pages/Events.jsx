import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Calendar, Clock, CheckCircle2, ExternalLink, ArrowRight, Lock } from 'lucide-react';
import axios from 'axios';
import usePageTitle from '../hooks/usePageTitle';
import { useAuth } from '../context/AuthContext';
import { useGoogleLogin } from '@react-oauth/google';
import EventRegistrationModal from '../components/EventRegistrationModal';
import CountdownTimer from '../components/CountdownTimer';
import { useToast } from '../components/ui/Toast';

const API_URL = import.meta.env.VITE_API_URL || 'https://aws-swae.onrender.com';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

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

  const { user, login: authLogin, refreshContext } = useAuth();
  const { showToast, ToastContainer } = useToast();

  const [events, setEvents]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [activeTab, setActiveTab] = useState('All');

  // Modal state
  const [selectedEvent, setSelectedEvent] = useState(null);

  // ── Google Login flow (triggered from Register button when unauthenticated) ─
  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const accessToken = tokenResponse.access_token;

        let profile = null;
        try {
          const r = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          profile = r.data;
        } catch { /* ignore */ }

        const res = await axios.post(`${API_BASE_URL}/api/auth/google/`, {
          access_token: accessToken,
        });

        const authToken = res.data.key || res.data.token || res.data.access || accessToken;
        const userData = {
          name:    res.data.user?.first_name || profile?.given_name || profile?.name || 'Builder',
          email:   res.data.user?.email || profile?.email || '',
          picture: profile?.picture || '',
        };

        authLogin(userData, authToken);
        await refreshContext();

        // After login: open modal for the event they clicked
        // selectedEvent is still set from the button click
      } catch (err) {
        showToast('Login failed. Please try again.', 'error');
        console.error('Google login error:', err);
      }
    },
    onError: () => showToast('Google Sign-In failed.', 'error'),
  });

  // ── Fetch events ─────────────────────────────────────────────────────────
  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const headers = token ? { Authorization: `Token ${token}` } : {};
      const response = await fetch(`${API_URL}/api/events/`, { headers });
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
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents, user]);

  // ── Register button click handler ─────────────────────────────────────────

  const filteredEvents = activeTab === 'All'
    ? events
    : events.filter((e) => e.status && e.status.toLowerCase() === activeTab.toLowerCase());

  const handleRegisterClick = useCallback((event) => {
    if (!user) {
      // Not logged in — save intended event and trigger SSO
      setSelectedEvent(event);
      googleLogin();
      return;
    }
    // Logged in — open modal directly
    setSelectedEvent(event);
  }, [user, googleLogin]);

  const handleModalClose = useCallback(() => setSelectedEvent(null), []);

  // ── Deep-link: auto-open modal when ?event=<slug> or ?eventId=<id> is in URL ──
  // Also persists intent to sessionStorage so it survives the Google OAuth redirect.
  const [searchParams, setSearchParams] = useSearchParams();
  useEffect(() => {
    if (events.length === 0) return;

    // Resolve identifier: URL params take priority, then sessionStorage fallback
    const urlSlug    = searchParams.get('event');    // preferred slug param
    const urlId      = searchParams.get('eventId');  // numeric fallback
    const stored     = sessionStorage.getItem('pendingEventToRegister');
    const identifier = urlSlug || urlId || stored;

    if (!identifier) return; // nothing to do

    // Find matching event by slug first, then by numeric id
    const targetEvent = events.find(
      (e) => e.slug === identifier || String(e.id) === identifier
    );

    // Clean the URL regardless of outcome (never leave dirty params in the bar)
    if (urlSlug || urlId) {
      setSearchParams({}, { replace: true });
    }

    if (!targetEvent || !targetEvent.is_registration_open) return;

    if (user) {
      // ── Authenticated path ────────────────────────────────────────────────
      sessionStorage.removeItem('pendingEventToRegister');

      if (targetEvent.is_registered) {
        // Already registered — don't open modal again, just confirm
        showToast("You're already registered for this event! 🎉", 'success');
      } else {
        // Not yet registered — open the registration modal
        handleRegisterClick(targetEvent);
      }
    } else {
      // ── Unauthenticated path ──────────────────────────────────────────────
      // Persist intent FIRST so it survives the Google OAuth redirect
      const toStore = targetEvent.slug || String(targetEvent.id);
      sessionStorage.setItem('pendingEventToRegister', toStore);

      // handleRegisterClick calls googleLogin() internally when !user —
      // this immediately triggers the Google OAuth popup/redirect.
      handleRegisterClick(targetEvent);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [events]); // runs once when the events array first populates

  // ── Post-login: consume pending sessionStorage intent after OAuth redirect ──
  // Fires when `user` transitions null → authenticated (after Google login).
  useEffect(() => {
    if (!user || events.length === 0) return;
    const stored = sessionStorage.getItem('pendingEventToRegister');
    if (!stored) return;

    const targetEvent = events.find(
      (e) => e.slug === stored || String(e.id) === stored
    );

    // Clear storage FIRST — prevents any retry loop
    sessionStorage.removeItem('pendingEventToRegister');

    if (!targetEvent || !targetEvent.is_registration_open) return;

    if (targetEvent.is_registered) {
      // Already registered (e.g. registered on another device/tab)
      showToast("You're already registered for this event! 🎉", 'success');
    } else {
      handleRegisterClick(targetEvent);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, events]); // re-runs when user logs in OR events load (whichever is last)

  const handleSuccess = useCallback((msg) => {
    showToast(msg || 'Registration Successful! 🎉', 'success');
    if (selectedEvent) {
      setEvents((prev) =>
        prev.map((e) => (e.id === selectedEvent.id ? { ...e, is_registered: true } : e))
      );
    }
  }, [showToast, selectedEvent]);

  const handleError = useCallback((msg) => {
    showToast(msg, 'error');
  }, [showToast]);

  // ── Share / copy deep link ─────────────────────────────────────────────────
  const handleShare = useCallback((e, eventObj) => {
    e.stopPropagation();
    // Prefer slug for human-readable URL; fall back to id for old events without slug
    const identifier = eventObj.slug || eventObj.id;
    const paramKey   = eventObj.slug ? 'event' : 'eventId';
    const link = `${window.location.origin}/events?${paramKey}=${identifier}`;
    navigator.clipboard.writeText(link).then(() => {
      showToast('Event link copied to clipboard! 📋', 'success');
    }).catch(() => {
      showToast('Copy this link: ' + link, 'success');
    });
  }, [showToast]);

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
              const regOpen    = event.is_registration_open !== false; // default true if missing

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
                      {/* Date + Share button */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-gray-400 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {formatDate(event.date)}
                        </span>
                        <button
                          id={`share-btn-${event.id}`}
                          onClick={(e) => handleShare(e, event)}
                          title="Copy direct registration link"
                          className="p-1.5 rounded-full text-gray-500 hover:text-sbg-green hover:bg-sbg-green/10 transition-all duration-200"
                          aria-label="Copy event link"
                        >
                          {/* Share icon */}
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                          </svg>
                        </button>
                      </div>
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
                  <div className="pt-6 mt-6 border-t border-white/10 flex justify-end items-center">

                    {event.is_registered ? (
                      /* ── ALREADY REGISTERED ── */
                      <div className="flex items-center gap-3">
                        {/* Live countdown — only for upcoming events, sits left of the button */}
                        {isUpcoming && event.date && (
                          <CountdownTimer targetDate={event.date} />
                        )}
                        {event.registration_link ? (
                          /* Has Meetup link → show live "Join Session" link */
                          <a
                            id={`join-session-btn-${event.id}`}
                            href={event.registration_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-mono font-bold whitespace-nowrap bg-sbg-green/10 text-sbg-green border border-sbg-green/40 hover:bg-sbg-green hover:text-aws-navy transition-all duration-200"
                          >
                            Join Session <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        ) : (
                          /* No link → fallback disabled badge */
                          <button
                            id={`registered-btn-${event.id}`}
                            disabled
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 cursor-not-allowed"
                          >
                            Registered ✅
                          </button>
                        )}
                      </div>
                    ) : isUpcoming ? (
                      regOpen ? (
                        /* ── Registration OPEN ── */
                        <button
                          id={`register-btn-${event.id}`}
                          onClick={() => handleRegisterClick(event)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-mono font-bold bg-sbg-green text-aws-navy hover:bg-white transition-colors"
                        >
                          {user ? 'Register Now' : 'Sign In & Register'} <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        /* ── Registration CLOSED ── */
                        <span
                          id={`reg-closed-${event.id}`}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-mono font-bold bg-white/5 text-gray-500 border border-white/10 cursor-not-allowed"
                          title="Registration is closed for this event"
                        >
                          <Lock className="w-3 h-3" /> Registration Closed
                        </span>
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

      {/* ── Event Registration Modal ── */}
      {selectedEvent && user && (
        <EventRegistrationModal
          event={selectedEvent}
          onClose={handleModalClose}
          onSuccess={handleSuccess}
          onError={handleError}
        />
      )}

      {/* ── Toast Notifications ── */}
      <ToastContainer />
    </div>
  );
};

export default Events;
