import { useState, useEffect, useCallback } from 'react';
import usePageTitle from '../hooks/usePageTitle';
import { getAnalyticsData, downloadAnalyticsExcel } from '../services/api';
import {
  Users,
  Ticket,
  Download,
  Trophy,
  Calendar,
  Search,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldAlert,
  Phone,
  FileSpreadsheet,
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://aws-swae.onrender.com';

const AdminAnalytics = () => {
  usePageTitle('Admin Analytics', 'Community analytics, attendee leaderboards, and Excel data exports.');

  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // ── Fetch list of all events for dropdown ─────────────────────────────────
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/events/`);
        if (res.ok) {
          const data = await res.json();
          const list = Array.isArray(data) ? data : data.results || [];
          setEvents(list);
          if (list.length > 0) {
            setSelectedEventId(String(list[0].id));
          }
        }
      } catch (err) {
        console.warn('Could not load events list:', err);
      }
    };
    fetchEvents();
  }, []);

  // ── Fetch Analytics Data when selectedEventId changes ──────────────────────
  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (selectedEventId) params.event_id = selectedEventId;
      const res = await getAnalyticsData(params);
      setAnalytics(res.data);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      if (err?.response?.status === 403) {
        setError('Access Denied: Admin or Staff privileges required to view analytics.');
      } else {
        setError('Failed to load analytics metrics.');
      }
    } finally {
      setLoading(false);
    }
  }, [selectedEventId]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // ── Handle Excel Export ────────────────────────────────────────────────────
  const handleExportExcel = async () => {
    if (!selectedEventId) return;
    setExporting(true);
    try {
      await downloadAnalyticsExcel(selectedEventId);
    } catch (err) {
      console.error('Excel Export failed:', err);
      alert('Failed to download Excel report. Please ensure you have admin privileges.');
    } finally {
      setExporting(false);
    }
  };

  const selectedEvent = events.find((e) => String(e.id) === String(selectedEventId));

  const filteredRegistrations = analytics?.registered_list
    ? analytics.registered_list.filter((student) => {
        const query = searchQuery.toLowerCase();
        return (
          student.name.toLowerCase().includes(query) ||
          student.roll_number.toLowerCase().includes(query) ||
          student.branch.toLowerCase().includes(query) ||
          student.mobile_number.includes(query)
        );
      })
    : [];

  return (
    <div className="relative min-h-screen bg-transparent pt-28 pb-20 px-6 overflow-hidden">
      {/* Background Glow */}
      <div
        aria-hidden="true"
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-[#00d084]/5 rounded-full blur-[140px] -z-10 pointer-events-none"
      />

      <div className="relative z-10 max-w-7xl mx-auto space-y-10">
        {/* Top Control Bar / Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/10">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-white/10 bg-white/5 text-xs font-mono tracking-widest text-[#00d084] uppercase mb-3 shadow-md">
              <span className="w-2 h-2 rounded-full bg-[#00d084] animate-pulse" />
              <span>ADMINISTRATIVE CONTROL CENTER</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Analytics & <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00d084] to-teal-400">Reports</span>
            </h1>
            <p className="text-gray-400 text-sm md:text-base mt-1.5 max-w-xl">
              Live registration metrics, top attendee leaderboards, and 1-click Excel exports.
            </p>
          </div>

          {/* Event Dropdown Selector */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1 sm:w-72">
              <label className="block text-[10px] font-mono font-bold text-gray-400 uppercase mb-1">
                Select Active Event:
              </label>
              <div className="relative">
                <select
                  value={selectedEventId}
                  onChange={(e) => setSelectedEventId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0d1117] border border-white/15 text-sm font-semibold text-white focus:outline-none focus:border-[#00d084] cursor-pointer appearance-none shadow-lg"
                >
                  <option value="" disabled>
                    Select an event
                  </option>
                  {events.map((ev) => (
                    <option key={ev.id} value={ev.id}>
                      {ev.title} ({ev.date})
                    </option>
                  ))}
                </select>
                <Calendar className="w-4 h-4 text-[#00d084] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Permission Denied Error State */}
        {error ? (
          <div className="p-8 rounded-3xl bg-red-500/10 border border-red-500/20 text-center max-w-xl mx-auto space-y-4">
            <ShieldAlert className="w-12 h-12 text-red-400 mx-auto" />
            <h2 className="text-xl font-bold text-white">Access Restricted</h2>
            <p className="text-sm text-red-300 font-mono leading-relaxed">{error}</p>
          </div>
        ) : (
          <>
            {/* Summary Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Card 1: Total Community Students */}
              <div className="p-6 rounded-2xl bg-[#10151c]/80 border border-white/10 backdrop-blur-xl shadow-xl flex flex-col justify-between group hover:border-[#00d084]/40 transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-gray-400 uppercase tracking-wider">
                    Community Members
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-sbg-green/10 border border-[#00d084]/20 flex items-center justify-center text-[#00d084]">
                    <Users className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-4xl font-extrabold text-white font-mono">
                    {loading ? '...' : analytics?.total_community_students || 0}
                  </p>
                  <p className="text-xs text-gray-400 mt-1 font-medium">
                    Total registered student profiles
                  </p>
                </div>
              </div>

              {/* Card 2: Selected Event Registrations */}
              <div className="p-6 rounded-2xl bg-[#10151c]/80 border border-white/10 backdrop-blur-xl shadow-xl flex flex-col justify-between group hover:border-[#00d084]/40 transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-gray-400 uppercase tracking-wider">
                    Event Registrations
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                    <Ticket className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-4xl font-extrabold text-white font-mono">
                    {loading ? '...' : analytics?.event_registrations || 0}
                  </p>
                  <p className="text-xs text-gray-400 mt-1 font-medium truncate">
                    {selectedEvent ? selectedEvent.title : 'All Events Combined'}
                  </p>
                </div>
              </div>

              {/* Card 3: 1-Click Excel Export Button */}
              <div className="p-6 rounded-2xl bg-[#10151c]/80 border border-white/10 backdrop-blur-xl shadow-xl flex flex-col justify-between group hover:border-[#00d084]/40 transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-gray-400 uppercase tracking-wider">
                    Excel Data Export
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-4 space-y-3">
                  <button
                    onClick={handleExportExcel}
                    disabled={!selectedEventId || exporting || loading}
                    className="w-full py-3 px-4 rounded-xl bg-[#00d084] text-black font-bold text-sm hover:bg-white transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {exporting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Generating Excel...</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        <span>Export Event Data (Excel)</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Leaderboard & Registrations Table Split */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Leaderboard (1 Column) */}
              <div className="p-6 rounded-3xl bg-[#10151c]/90 border border-white/10 space-y-5">
                <div className="flex items-center justify-between border-b border-white/8 pb-4">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-amber-400" />
                    <h3 className="text-lg font-bold text-white">Top Attendees</h3>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
                    Community Leaderboard
                  </span>
                </div>

                <div className="space-y-3">
                  {analytics?.top_students && analytics.top_students.length > 0 ? (
                    analytics.top_students.map((student, idx) => (
                      <div
                        key={student.id}
                        className="p-3.5 rounded-xl bg-white/5 border border-white/8 flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold font-mono ${
                              idx === 0
                                ? 'bg-amber-400 text-black'
                                : idx === 1
                                ? 'bg-gray-300 text-black'
                                : idx === 2
                                ? 'bg-amber-700 text-white'
                                : 'bg-white/10 text-gray-400'
                            }`}
                          >
                            {idx + 1}
                          </span>
                          <div>
                            <p className="text-sm font-bold text-white leading-tight">
                              {student.name}
                            </p>
                            <p className="text-xs text-gray-400 font-mono">
                              {student.branch} {student.academic_year ? `• ${student.academic_year}` : ''}
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-[#00d084]/15 text-[#00d084] border border-[#00d084]/30">
                            {student.count} {student.count === 1 ? 'Event' : 'Events'}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-gray-500 italic py-4 text-center">
                      No attendee data available yet.
                    </p>
                  )}
                </div>
              </div>

              {/* Registered Students Data Table (2 Columns) */}
              <div className="lg:col-span-2 p-6 rounded-3xl bg-[#10151c]/90 border border-white/10 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/8 pb-4">
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <span>Registered Students List</span>
                      <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-[#00d084]/10 text-[#00d084] border border-[#00d084]/20">
                        {filteredRegistrations.length} Total
                      </span>
                    </h3>
                  </div>

                  {/* Search Filter Input */}
                  <div className="relative w-full sm:w-64">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search name, roll, branch..."
                      className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#0d1117] border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#00d084]"
                    />
                    <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                {loading ? (
                  <div className="flex justify-center items-center py-16">
                    <Loader2 className="w-8 h-8 text-[#00d084] animate-spin" />
                  </div>
                ) : filteredRegistrations.length === 0 ? (
                  <div className="text-center py-16 text-gray-400 space-y-2">
                    <AlertCircle className="w-8 h-8 text-gray-500 mx-auto" />
                    <p className="text-sm font-medium">No registered students found for this filter.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-gray-300">
                      <thead className="bg-white/5 text-gray-400 font-mono uppercase text-[10px]">
                        <tr>
                          <th className="p-3 rounded-l-xl">#</th>
                          <th className="p-3">Student Name</th>
                          <th className="p-3">Roll No</th>
                          <th className="p-3">Branch & Year</th>
                          <th className="p-3">Phone</th>
                          <th className="p-3 rounded-r-xl">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 font-mono">
                        {filteredRegistrations.map((student, idx) => (
                          <tr key={student.id} className="hover:bg-white/[0.02] transition-colors">
                            <td className="p-3 text-gray-500">{idx + 1}</td>
                            <td className="p-3 font-bold text-white font-sans">{student.name}</td>
                            <td className="p-3 text-gray-400">{student.roll_number}</td>
                            <td className="p-3">
                              {student.branch} ({student.academic_year || 'N/A'})
                            </td>
                            <td className="p-3 text-[#00d084]">
                              <a href={`tel:${student.mobile_number}`} className="hover:underline flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {student.mobile_number}
                              </a>
                            </td>
                            <td className="p-3 text-gray-400">
                              {new Date(student.registered_at).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminAnalytics;
