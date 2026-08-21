import SectionHeader from '../components/ui/SectionHeader';
import MemberCard from '../components/shared/MemberCard';
import Badge from '../components/ui/Badge';
import { CORE_TEAM } from '../constants/teamData';

const lead       = CORE_TEAM.find((m) => m.isLead);
const coreMembers = CORE_TEAM.filter((m) => !m.isLead);

const Community = () => (
  <div className="page-inner">
    <SectionHeader
      title="Community & Core Team"
      subtitle="The leadership behind AWS SBG RIT — dedicated students architecting the cloud era."
    >
      <Badge variant="purple">{CORE_TEAM.length} Members</Badge>
      <Badge variant="orange">Active Chapter</Badge>
    </SectionHeader>

    {/* ── Lead card ── */}
    {lead && (
      <section aria-label="Group Lead" className="mb-8">
        <p className="text-xs font-semibold tracking-widest uppercase text-text-subtle mb-3">
          Group Lead
        </p>
        <div className="max-w-sm">
          <MemberCard member={lead} featured />
        </div>
      </section>
    )}

    {/* ── Core team grid ── */}
    <section aria-label="Core Team">
      <p className="text-xs font-semibold tracking-widest uppercase text-text-subtle mb-3">
        Core Team
      </p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {coreMembers.map((member, i) => (
          <div
            key={member.id}
            className="animate-in"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <MemberCard member={member} />
          </div>
        ))}
      </div>
    </section>

    {/* ── Join CTA ── */}
    <section
      aria-label="Join the team"
      className="mt-10 rounded-xl border border-border-card bg-surface p-8 text-center relative overflow-hidden"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 60% 80% at 50% 50%, rgba(124,58,237,0.07) 0%, transparent 70%)',
        }}
      />
      <p className="text-xs font-semibold tracking-widest uppercase text-text-subtle mb-2">
        Want to Contribute?
      </p>
      <h2 className="text-xl font-bold text-text-primary mb-2">
        Join AWS SBG RIT
      </h2>
      <p className="text-sm text-text-muted max-w-sm mx-auto mb-6">
        We're always looking for passionate builders — cloud, web, ML, embedded.
        If you're at RIT, apply to become a core member.
      </p>
      <a
        href="/connect"
        id="community-join-btn"
        className="btn-primary btn inline-flex"
      >
        Apply to Join
      </a>
    </section>
  </div>
);

export default Community;
