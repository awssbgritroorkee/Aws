import { useState, useEffect } from 'react';
import { getIdeas, createIdea, getTeams, createTeam } from '../services/api';
import SectionHeader from '../components/ui/SectionHeader';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import IdeaCard from '../components/shared/IdeaCard';

// ── Placeholder ideas shown when API is unavailable ──────────────────────
const PLACEHOLDER_IDEAS = [
  { id: 1, title: 'AWS IoT Campus Monitor', description: 'Deploy IoT sensors across campus to monitor energy usage and map it to an AWS dashboard in real-time.', author: 'Ranvijay', tags: ['IoT', 'AWS IoT Core', 'Lambda'], votes: 14, created_at: '2026-08-10' },
  { id: 2, title: 'Serverless Exam Portal', description: 'Build a zero-ops exam portal using AWS Lambda, DynamoDB, and S3 for question paper storage.', author: 'Rahul Kumar', tags: ['Serverless', 'DynamoDB', 'S3'], votes: 11, created_at: '2026-08-12' },
  { id: 3, title: 'ML Placement Predictor', description: 'Train an ML model on historical placement data to predict student placement probability.', author: 'Aashish', tags: ['ML', 'SageMaker', 'Python'], votes: 9, created_at: '2026-08-14' },
];

// ── Controlled form field ────────────────────────────────────────────────
const Field = ({ id, label, children }) => (
  <div>
    <label htmlFor={id} className="form-label">{label}</label>
    {children}
  </div>
);

// ─────────────────────────────────────────────────────────────────────────
const Connect = () => {
  const [activeTab, setActiveTab] = useState('ideas');

  // Idea Wall state
  const [ideas, setIdeas]         = useState(PLACEHOLDER_IDEAS);
  const [ideasLoading, setIL]     = useState(false);
  const [ideaForm, setIdeaForm]   = useState({ title: '', description: '', author: '', tags: '' });
  const [ideaSubmitting, setIS]   = useState(false);
  const [ideaSuccess, setISuccess] = useState(false);

  // Team Builder state
  const [teams, setTeams]          = useState([]);
  const [teamsLoading, setTL]      = useState(false);
  const [teamForm, setTeamForm]    = useState({ project: '', skills_needed: '', contact: '', description: '' });
  const [teamSubmitting, setTS]    = useState(false);
  const [teamSuccess, setTSuccess] = useState(false);

  // ── Fetch ideas ──────────────────────────────────────────────────────
  useEffect(() => {
    setIL(true);
    getIdeas()
      .then((res) => setIdeas(res.data))
      .catch(() => { /* keep placeholders */ })
      .finally(() => setIL(false));
  }, []);

  // ── Fetch teams ──────────────────────────────────────────────────────
  useEffect(() => {
    setTL(true);
    getTeams()
      .then((res) => setTeams(res.data))
      .catch(() => {})
      .finally(() => setTL(false));
  }, []);

  // ── Submit idea ──────────────────────────────────────────────────────
  const handleIdeaSubmit = async (e) => {
    e.preventDefault();
    setIS(true);
    try {
      const payload = {
        ...ideaForm,
        tags: ideaForm.tags.split(',').map((t) => t.trim()).filter(Boolean),
      };
      const res = await createIdea(payload);
      setIdeas((prev) => [res.data, ...prev]);
      setIdeaForm({ title: '', description: '', author: '', tags: '' });
      setISuccess(true);
      setTimeout(() => setISuccess(false), 3000);
    } catch {
      /* API not yet running — just reset */
    } finally {
      setIS(false);
    }
  };

  // ── Submit team request ──────────────────────────────────────────────
  const handleTeamSubmit = async (e) => {
    e.preventDefault();
    setTS(true);
    try {
      const res = await createTeam(teamForm);
      setTeams((prev) => [res.data, ...prev]);
      setTeamForm({ project: '', skills_needed: '', contact: '', description: '' });
      setTSuccess(true);
      setTimeout(() => setTSuccess(false), 3000);
    } catch {
      /* API not yet running */
    } finally {
      setTS(false);
    }
  };

  return (
    <div className="page-inner">
      <SectionHeader
        title="Connect"
        subtitle="Share your ideas and find your build crew."
      >
        <Badge variant="purple">Idea Wall</Badge>
        <Badge variant="blue">Team Builder</Badge>
      </SectionHeader>

      {/* ── Tab bar ── */}
      <div className="flex gap-1 p-1 bg-surface rounded-lg mb-6 w-fit border border-border-card">
        {['ideas', 'teams'].map((tab) => (
          <button
            key={tab}
            id={`tab-${tab}`}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
              activeTab === tab
                ? 'bg-surface-hover text-text-primary border border-border-subtle'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            {tab === 'ideas' ? '💡 Idea Wall' : '🤝 Team Builder'}
          </button>
        ))}
      </div>

      {/* ════════════════════ IDEA WALL ═══════════════════════════ */}
      {activeTab === 'ideas' && (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Form */}
          <Card
            header={<h2 className="text-sm font-semibold text-text-primary">Post an Idea</h2>}
            className="animate-in"
          >
            <form onSubmit={handleIdeaSubmit} className="space-y-4" id="idea-form">
              <Field id="idea-title" label="Idea Title *">
                <input id="idea-title" required className="form-input"
                  placeholder="e.g. Serverless Campus Portal"
                  value={ideaForm.title}
                  onChange={(e) => setIdeaForm((p) => ({ ...p, title: e.target.value }))} />
              </Field>
              <Field id="idea-desc" label="Description">
                <textarea id="idea-desc" rows={3} className="form-input resize-none"
                  placeholder="What problem does it solve?"
                  value={ideaForm.description}
                  onChange={(e) => setIdeaForm((p) => ({ ...p, description: e.target.value }))} />
              </Field>
              <Field id="idea-author" label="Your Name">
                <input id="idea-author" className="form-input" placeholder="Anonymous"
                  value={ideaForm.author}
                  onChange={(e) => setIdeaForm((p) => ({ ...p, author: e.target.value }))} />
              </Field>
              <Field id="idea-tags" label="Tags (comma-separated)">
                <input id="idea-tags" className="form-input" placeholder="AWS, Python, IoT"
                  value={ideaForm.tags}
                  onChange={(e) => setIdeaForm((p) => ({ ...p, tags: e.target.value }))} />
              </Field>

              {ideaSuccess && (
                <p className="text-xs text-emerald-400 font-medium animate-in">
                  ✓ Idea posted successfully!
                </p>
              )}

              <Button
                type="submit"
                variant="purple"
                className="w-full justify-center"
                disabled={ideaSubmitting}
                id="idea-submit-btn"
              >
                {ideaSubmitting ? 'Posting…' : 'Post Idea'}
              </Button>
            </form>
          </Card>

          {/* Ideas grid */}
          <div className="lg:col-span-2">
            {ideasLoading ? (
              <p className="text-sm text-text-muted">Loading ideas…</p>
            ) : ideas.length === 0 ? (
              <Card className="text-center py-12">
                <p className="text-text-muted text-sm">No ideas yet. Be the first to post!</p>
              </Card>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {ideas.map((idea, i) => (
                  <div key={idea.id ?? i} className="animate-in" style={{ animationDelay: `${i * 60}ms` }}>
                    <IdeaCard idea={idea} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ════════════════════ TEAM BUILDER ════════════════════════ */}
      {activeTab === 'teams' && (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Form */}
          <Card
            header={<h2 className="text-sm font-semibold text-text-primary">Find a Team</h2>}
            className="animate-in"
          >
            <form onSubmit={handleTeamSubmit} className="space-y-4" id="team-form">
              <Field id="team-project" label="Project Name *">
                <input id="team-project" required className="form-input"
                  placeholder="e.g. CloudTrace v2"
                  value={teamForm.project}
                  onChange={(e) => setTeamForm((p) => ({ ...p, project: e.target.value }))} />
              </Field>
              <Field id="team-desc" label="Description">
                <textarea id="team-desc" rows={3} className="form-input resize-none"
                  placeholder="What are you building?"
                  value={teamForm.description}
                  onChange={(e) => setTeamForm((p) => ({ ...p, description: e.target.value }))} />
              </Field>
              <Field id="team-skills" label="Skills Needed">
                <input id="team-skills" className="form-input" placeholder="React, AWS Lambda, ML"
                  value={teamForm.skills_needed}
                  onChange={(e) => setTeamForm((p) => ({ ...p, skills_needed: e.target.value }))} />
              </Field>
              <Field id="team-contact" label="Contact (email / Discord)">
                <input id="team-contact" className="form-input" placeholder="your@email.com"
                  value={teamForm.contact}
                  onChange={(e) => setTeamForm((p) => ({ ...p, contact: e.target.value }))} />
              </Field>

              {teamSuccess && (
                <p className="text-xs text-emerald-400 font-medium animate-in">
                  ✓ Team request posted!
                </p>
              )}

              <Button
                type="submit"
                variant="outline"
                className="w-full justify-center"
                disabled={teamSubmitting}
                id="team-submit-btn"
              >
                {teamSubmitting ? 'Posting…' : 'Post Team Request'}
              </Button>
            </form>
          </Card>

          {/* Team requests list */}
          <div className="lg:col-span-2">
            {teamsLoading ? (
              <p className="text-sm text-text-muted">Loading team requests…</p>
            ) : teams.length === 0 ? (
              <Card className="text-center py-12">
                <p className="text-text-muted text-sm">No open team requests yet.</p>
                <p className="text-text-subtle text-xs mt-1">Start the backend server to persist data.</p>
              </Card>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {teams.map((team, i) => (
                  <Card key={team.id ?? i} className="animate-in" style={{ animationDelay: `${i * 60}ms` }}>
                    <p className="text-sm font-semibold text-text-primary mb-1">{team.project}</p>
                    {team.description && (
                      <p className="text-xs text-text-muted mb-3 line-clamp-2">{team.description}</p>
                    )}
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {(team.skills_needed || '').split(',').filter(Boolean).map((s) => (
                        <Badge key={s} variant="blue">{s.trim()}</Badge>
                      ))}
                    </div>
                    <p className="text-xs text-text-subtle">Contact: {team.contact}</p>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Connect;
