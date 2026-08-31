import { useState, useEffect, useCallback } from 'react';
import { getMyTeamWorkspace, reduceSlots, deleteTeamUpPost } from '../../services/api';
import { Users, Phone, MinusCircle, Clock, CheckCircle2, AlertCircle, RefreshCw, Loader2, Trash2 } from 'lucide-react';

const MyWorkspacePanel = ({ showToast }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reducingId, setReducingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const fetchWorkspace = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getMyTeamWorkspace();
      setPosts(res.data || []);
    } catch (err) {
      console.error('Failed to load workspace:', err);
      if (showToast) showToast('Failed to load your workspace posts.', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchWorkspace();
  }, [fetchWorkspace]);

  const handleReduceSlots = async (postId) => {
    setReducingId(postId);
    try {
      const res = await reduceSlots(postId);
      if (showToast) showToast(res.data?.detail || 'Slot count reduced.', 'success');
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, members_needed: res.data.members_needed, is_active: res.data.is_active }
            : p
        )
      );
    } catch (err) {
      const msg = err?.response?.data?.detail || 'Failed to reduce slots.';
      if (showToast) showToast(msg, 'error');
    } finally {
      setReducingId(null);
    }
  };

  const handleDelete = async (postId) => {
    const isConfirmed = window.confirm(
      "Are you sure you want to permanently delete this post? This action cannot be undone."
    );
    if (!isConfirmed) return;

    setDeletingId(postId);
    try {
      await deleteTeamUpPost(postId);
      setPosts((prevPosts) => prevPosts.filter((p) => p.id !== postId));
      if (showToast) showToast("Post deleted successfully.", "success");
    } catch (error) {
      console.error("Error deleting post:", error);
      const msg = error?.response?.data?.detail || "Failed to delete post. Please try again.";
      if (showToast) showToast(msg, "error");
      else alert("Failed to delete post. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="w-10 h-10 border-4 border-sbg-green/30 border-t-sbg-green rounded-full animate-spin" />
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-16 px-6 bg-[#10151c]/60 border border-white/10 rounded-3xl max-w-lg mx-auto space-y-3">
        <Users className="w-10 h-10 text-gray-500 mx-auto" />
        <h3 className="text-lg font-bold text-white">No Team Posts Created Yet</h3>
        <p className="text-sm text-gray-400">
          Create a post to find hackathon teammates or offer your skills to an existing team.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <span>My Workspace Posts</span>
          <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-sbg-green/10 text-sbg-green border border-sbg-green/20">
            {posts.length} Total
          </span>
        </h2>
        <button
          onClick={fetchWorkspace}
          className="p-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-all text-xs font-mono flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      <div className="grid gap-6">
        {posts.map((post) => (
          <div
            key={post.id}
            className="p-6 md:p-7 rounded-3xl bg-[#10151c]/90 border border-white/10 space-y-5"
          >
            {/* Top Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/8 pb-4">
              <div>
                <span className="text-[11px] font-mono text-sbg-green uppercase tracking-wider">
                  {post.mode_display}
                </span>
                <h3 className="text-lg font-bold text-white">{post.event_name}</h3>
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-2">
                {!post.is_approved_by_admin ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                    <Clock className="w-3.5 h-3.5" /> Pending Approval
                  </span>
                ) : post.is_active ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-sbg-green/10 text-sbg-green border border-sbg-green/30">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Live on Board
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-gray-500/10 text-gray-400 border border-white/10">
                    <AlertCircle className="w-3.5 h-3.5" /> Slots Filled / Closed
                  </span>
                )}
              </div>
            </div>

            {/* Slots Counter & Offline Friend Override Button */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
              <div>
                <p className="text-xs text-gray-400 font-mono">Slots Remaining</p>
                <p className="text-xl font-bold text-white font-mono">
                  {post.members_needed} {post.members_needed === 1 ? 'Slot' : 'Slots'} Open
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => handleReduceSlots(post.id)}
                  disabled={post.members_needed <= 0 || reducingId === post.id}
                  className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-amber-500/10 hover:border-amber-500/30 hover:text-amber-300 text-gray-300 text-xs font-bold font-mono transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                  title="Manually decrement slots if you found a teammate in real life offline"
                >
                  {reducingId === post.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <MinusCircle className="w-4 h-4 text-amber-400" />
                      Edit Slots (−1 Offline Teammate)
                    </>
                  )}
                </button>

                <button
                  onClick={() => handleDelete(post.id)}
                  disabled={deletingId === post.id}
                  className="bg-red-900/40 text-red-400 border border-red-800 hover:bg-red-800 hover:text-white px-3.5 py-2 rounded-xl text-xs font-bold font-mono transition-colors flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {deletingId === post.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 text-red-400" /> Delete Post
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Applicants List Section */}
            <div className="space-y-3">
              <h4 className="text-xs font-mono font-bold text-gray-400 uppercase tracking-wider">
                Interested Applicants ({post.interests ? post.interests.length : 0})
              </h4>

              {!post.interests || post.interests.length === 0 ? (
                <p className="text-xs text-gray-500 italic">No applicants have clicked Interested yet.</p>
              ) : (
                <div className="grid gap-3">
                  {post.interests.map((interest) => (
                    <div
                      key={interest.id}
                      className="p-4 rounded-2xl bg-white/5 border border-white/8 flex flex-wrap items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white">
                            {interest.applicant_name}
                          </span>
                          {interest.status === 'accepted' && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                              Joined ✅
                            </span>
                          )}
                          {interest.status === 'in_process' && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                              In Process (Locking)
                            </span>
                          )}
                          {interest.status === 'timeout' && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                              Timed Out
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-300 font-mono mt-1">
                          {interest.applicant_course && <span>{interest.applicant_course}</span>}
                          {interest.applicant_branch && <span>• {interest.applicant_branch}</span>}
                          {interest.applicant_year && <span className="text-[#00d084] font-bold">• Year: {interest.applicant_year}</span>}
                        </div>
                      </div>

                      {/* Contact Mobile */}
                      {interest.applicant_mobile ? (
                        <div className="flex items-center gap-2">
                          <a
                            href={`tel:${interest.applicant_mobile}`}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#00d084]/10 text-[#00d084] border border-[#00d084]/30 text-xs font-mono font-bold hover:bg-[#00d084] hover:text-black transition-all shadow-md"
                            title="Call or WhatsApp applicant to share Invite Code"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            <span>📞 {interest.applicant_mobile.startsWith('+') ? interest.applicant_mobile : `+91 ${interest.applicant_mobile}`}</span>
                          </a>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-500 font-mono italic">No phone provided</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyWorkspacePanel;
