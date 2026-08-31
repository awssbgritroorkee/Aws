import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import usePageTitle from '../hooks/usePageTitle';
import { useToast } from '../components/ui/Toast';
import { getTeamUpPosts, expressInterest, verifyTeamPin } from '../services/api';
import TeamRequestCard from '../components/teamup/TeamRequestCard';
import TeamUpCreateModal from '../components/teamup/TeamUpCreateModal';
import MyWorkspacePanel from '../components/teamup/MyWorkspacePanel';
import { Users, User, Plus, Filter, Sparkles, LayoutDashboard } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const TeamUp = () => {
  usePageTitle('Team Up', 'Dual-mode matchmaking to find hackathon teammates and project partners at AWS SBG RIT.');

  const { user, login: authLogin, refreshContext } = useAuth();
  const { showToast, ToastContainer } = useToast();

  const [activeTab, setActiveTab] = useState('explore'); // 'explore' | 'workspace'
  const [modeFilter, setModeFilter] = useState('need_members'); // 'need_members' | 'need_team'
  const [yearFilter, setYearFilter] = useState('');
  const [posts, setPosts] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showCreateModal, setShowCreateModal] = useState(false);

  // ── Google SSO flow for unauthenticated action trigger ────────────────────
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
          name: res.data.user?.first_name || profile?.given_name || profile?.name || 'Builder',
          email: res.data.user?.email || profile?.email || '',
          picture: profile?.picture || '',
        };

        authLogin(userData, authToken);
        await refreshContext();
        showToast('Signed in successfully!', 'success');
      } catch (err) {
        showToast('Login failed. Please try again.', 'error');
        console.error('Google login error:', err);
      }
    },
    onError: () => showToast('Google Sign-In failed.', 'error'),
  });

  // ── Fetch active events for modal dropdown ─────────────────────────────────
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'https://aws-swae.onrender.com';
        const res = await fetch(`${API_URL}/api/events/?status=upcoming`);
        if (res.ok) {
          const data = await res.json();
          setEvents(Array.isArray(data) ? data : data.results || []);
        }
      } catch (err) {
        console.warn('Could not load events list:', err);
      }
    };
    fetchEvents();
  }, []);

  // ── Fetch board posts ──────────────────────────────────────────────────────
  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (modeFilter) params.mode = modeFilter;
      if (yearFilter) params.target_year = yearFilter;

      const res = await getTeamUpPosts(params);
      setPosts(res.data || []);
    } catch (err) {
      console.error('Error fetching teamup posts:', err);
      setError('Failed to load matchmaking posts.');
    } finally {
      setLoading(false);
    }
  }, [modeFilter, yearFilter]);

  useEffect(() => {
    if (activeTab === 'explore') {
      fetchPosts();
    }
  }, [fetchPosts, activeTab, user]);

  // ── Action Handlers ────────────────────────────────────────────────────────
  const handleCreateClick = () => {
    if (!user) {
      googleLogin();
      return;
    }
    setShowCreateModal(true);
  };

  const handleInterested = async (postId) => {
    if (!user) {
      googleLogin();
      return null;
    }
    try {
      const res = await expressInterest(postId);
      showToast(res.data?.detail || 'Slot locked for 4 hours!', 'success');
      return res.data;
    } catch (err) {
      const msg = err?.response?.data?.detail || 'Failed to express interest.';
      showToast(msg, 'error');
      return null;
    }
  };

  const handleVerifyPin = async (postId, pin) => {
    if (!user) {
      googleLogin();
      return null;
    }
    const res = await verifyTeamPin(postId, pin);
    showToast(res.data?.detail || 'Officially joined the team! 🎉', 'success');
    return res.data;
  };

  return (
    <div className="relative min-h-screen bg-transparent pt-28 pb-20 px-6 overflow-hidden">
      {/* Glow */}
      <div
        aria-hidden="true"
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-sbg-green/5 rounded-full blur-[120px] -z-10 pointer-events-none"
      />

      <div className="relative z-10 max-w-6xl mx-auto text-center">
        {/* Eyebrow Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-xs md:text-sm font-mono tracking-widest text-gray-300 uppercase mb-6 shadow-md">
          <span className="w-2 h-2 rounded-full bg-sbg-green" />
          <span>DUAL-MODE MATCHMAKING SYSTEM</span>
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-tight mb-4">
          Team <span className="text-transparent bg-clip-text bg-gradient-to-r from-sbg-green to-teal-400">Up</span>
        </h1>

        <p className="text-gray-400 text-base md:text-lg font-medium max-w-2xl mx-auto mb-6 leading-relaxed">
          Whether you are building a team for an upcoming hackathon or looking to join an existing project, the Matchmaking platform connects you with the right talent. Collaborate, build, and scale together.
        </p>

        {/* Feature Cards Container */}
        <div className="flex flex-col sm:flex-row justify-center gap-5 mt-10 mb-16 max-w-3xl mx-auto">
          {/* Card 1 */}
          <div className="bg-white/5 border border-white/10 rounded-2xl py-5 px-6 flex-1 text-left hover:bg-white/10 transition-all duration-300 backdrop-blur-sm shadow-lg">
            <div className="text-4xl mb-3">🚀</div>
            <h3 className="text-white font-bold text-xl mb-2">Need Members?</h3>
            <p className="text-gray-300 text-[15px] leading-relaxed">
              Post your project requirements, set an Invite Code, and recruit top builders from the community.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white/5 border border-white/10 rounded-2xl py-5 px-6 flex-1 text-left hover:bg-white/10 transition-all duration-300 backdrop-blur-sm shadow-lg">
            <div className="text-4xl mb-3">🙋‍♂️</div>
            <h3 className="text-white font-bold text-xl mb-2">Need a Team?</h3>
            <p className="text-gray-300 text-[15px] leading-relaxed">
              Showcase your skills on the board, get recruited into ongoing projects, and start building.
            </p>
          </div>
        </div>

        {/* Top Control Bar: Tab Toggle + Create Button */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-10 pb-6 border-b border-white/10">
          {/* Main View Tabs */}
          <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white/5 border border-white/10">
            <button
              onClick={() => setActiveTab('explore')}
              className={`px-5 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
                activeTab === 'explore'
                  ? 'bg-sbg-green text-aws-navy shadow-lg'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Explore Board
            </button>
            <button
              onClick={() => {
                if (!user) {
                  googleLogin();
                  return;
                }
                setActiveTab('workspace');
              }}
              className={`px-5 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'workspace'
                  ? 'bg-sbg-green text-aws-navy shadow-lg'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" /> My Workspace
            </button>
          </div>

          {/* Action CTA */}
          <button
            onClick={handleCreateClick}
            className="px-6 py-2.5 rounded-full bg-sbg-green text-aws-navy font-bold text-xs font-mono hover:bg-white transition-all shadow-lg shadow-sbg-green/10 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> {user ? 'Create Post' : 'Sign In to Post'}
          </button>
        </div>

        {/* EXPLORE BOARD VIEW */}
        {activeTab === 'explore' && (
          <div className="space-y-8">
            {/* Filter Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-white/5 border border-white/10 rounded-xl p-2 mb-6 backdrop-blur-md">
              {/* Mode Toggle Chips */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setModeFilter('need_members')}
                  className={`px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                    modeFilter === 'need_members'
                      ? 'bg-[#00d084] text-black shadow-md'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" /> Looking for Members
                </button>
                <button
                  onClick={() => setModeFilter('need_team')}
                  className={`px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                    modeFilter === 'need_team'
                      ? 'bg-[#00d084] text-black shadow-md'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <User className="w-3.5 h-3.5" /> Looking for Teams
                </button>
              </div>

              {/* Secondary Filters */}
              <div className="flex items-center gap-3 pr-2">
                <div className="flex items-center gap-2">
                  <Filter className="w-3.5 h-3.5 text-gray-400" />
                  <select
                    value={yearFilter}
                    onChange={(e) => setYearFilter(e.target.value)}
                    className="px-3 py-1.5 rounded-lg bg-[#0d1117] border border-white/10 text-xs text-white focus:outline-none focus:border-[#00d084] cursor-pointer"
                  >
                    <option value="">All Years</option>
                    <option value="1st">1st Year</option>
                    <option value="2nd">2nd Year</option>
                    <option value="3rd">3rd Year</option>
                    <option value="4th">4th Year</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Board Cards Grid */}
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="w-10 h-10 border-4 border-sbg-green/30 border-t-sbg-green rounded-full animate-spin" />
              </div>
            ) : error ? (
              <div className="text-center py-16 px-6 bg-[#10151c]/60 border border-red-500/20 rounded-3xl max-w-md mx-auto text-red-400">
                <p className="font-medium text-lg">{error}</p>
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-16 px-6 bg-[#10151c]/60 border border-white/10 rounded-3xl max-w-md mx-auto space-y-3">
                <Sparkles className="w-8 h-8 text-sbg-green mx-auto opacity-60" />
                <p className="text-gray-300 font-medium text-base">
                  No active requests matching these filters.
                </p>
                <p className="text-xs text-gray-500">
                  Be the first to post a team request!
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6 text-left">
                {posts.map((post) => (
                  <TeamRequestCard
                    key={post.id}
                    post={post}
                    onInterested={handleInterested}
                    onVerifyPin={handleVerifyPin}
                    isAuthenticated={!!user}
                    currentUserId={user}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* MY WORKSPACE VIEW */}
        {activeTab === 'workspace' && user && (
          <MyWorkspacePanel showToast={showToast} />
        )}
      </div>

      {/* Post Creation Modal */}
      {showCreateModal && (
        <TeamUpCreateModal
          events={events}
          onClose={() => setShowCreateModal(false)}
          onSuccess={(msg) => {
            showToast(msg, 'success');
            fetchPosts();
          }}
          onError={(msg) => showToast(msg, 'error')}
        />
      )}

      {/* Toast notifications */}
      <ToastContainer />
    </div>
  );
};

export default TeamUp;
