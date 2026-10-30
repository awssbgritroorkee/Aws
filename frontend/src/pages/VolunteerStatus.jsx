import { useAuth } from '../context/AuthContext';
import { ClipboardList, Clock, CheckCircle2, XCircle } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// Status config — maps backend status strings to visual treatment
// ─────────────────────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  Pending: {
    label:       'Pending Review',
    description: 'Your application has been received and is currently under review by the AWS SBG team. We will update you soon.',
    icon:        Clock,
    iconColor:   'text-yellow-400',
    badgeBg:     'bg-yellow-500/10',
    badgeBorder: 'border-yellow-500/30',
    badgeText:   'text-yellow-400',
    ringColor:   'ring-yellow-500/20',
    emoji:       '⏳',
  },
  Accepted: {
    label:       'Accepted',
    description: 'Congratulations! Your volunteer application has been accepted. The team will reach out to you with next steps.',
    icon:        CheckCircle2,
    iconColor:   'text-emerald-400',
    badgeBg:     'bg-emerald-500/10',
    badgeBorder: 'border-emerald-500/30',
    badgeText:   'text-emerald-400',
    ringColor:   'ring-emerald-500/20',
    emoji:       '🎉',
  },
  Rejected: {
    label:       'Not Selected',
    description: 'Thank you for your interest in volunteering. Unfortunately, your application was not selected at this time. You are welcome to apply again in the next cycle.',
    icon:        XCircle,
    iconColor:   'text-red-400',
    badgeBg:     'bg-red-500/10',
    badgeBorder: 'border-red-500/30',
    badgeText:   'text-red-400',
    ringColor:   'ring-red-500/20',
    emoji:       '📋',
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// VolunteerStatus — Read-only dashboard view showing application status
// ─────────────────────────────────────────────────────────────────────────────
const VolunteerStatus = () => {
  const { user, context } = useAuth();
  const rawStatus    = user?.volunteer_status ?? context?.volunteer_status;
  const normalized   = rawStatus ? rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1).toLowerCase() : null;
  const cfg          = STATUS_CONFIG[normalized] || STATUS_CONFIG.Pending;

  // Null-guard: this page is only reachable when volunteer_status is not null
  // (the sidebar tab is conditionally rendered), but guard defensively.
  if (!rawStatus) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <ClipboardList className="w-12 h-12 text-gray-600 mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">No Application Found</h2>
        <p className="text-gray-400 text-sm max-w-sm">
          You have not submitted a volunteer application yet. Applications open periodically — check the main site for announcements.
        </p>
      </div>
    );
  }

  const StatusIcon = cfg.icon;
  const displayStatus = String(rawStatus).toUpperCase();

  return (
    <div className="max-w-2xl mx-auto py-6 px-2 space-y-8">

      {/* ── Page Header ─────────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">
          Volunteer Application
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Read-only view of your current application status.
        </p>
      </div>

      {/* ── Status Card ─────────────────────────────────────────────────────── */}
      <div
        className={`rounded-2xl border ${cfg.badgeBorder} ${cfg.badgeBg} ring-4 ${cfg.ringColor} p-8 flex flex-col items-center text-center gap-4`}
      >
        {/* Big emoji accent */}
        <div className="text-5xl">{cfg.emoji}</div>

        {/* Icon + status label */}
        <div className="flex items-center gap-2">
          <StatusIcon className={`w-5 h-5 ${cfg.iconColor}`} />
          <span className={`text-lg font-black ${cfg.badgeText} uppercase tracking-widest`}>
            {cfg.label}
          </span>
        </div>

        {/* Human-readable status line */}
        <p className="text-white text-base font-semibold">
          Your Volunteer Application Status:{' '}
          <span className={cfg.badgeText}>{displayStatus}</span>
        </p>

        {/* Descriptive message */}
        <p className="text-gray-400 text-sm leading-relaxed max-w-md">
          {cfg.description}
        </p>
      </div>

      {/* ── Info Note ───────────────────────────────────────────────────────── */}
      <div className="rounded-xl bg-white/[0.03] border border-white/[0.07] px-5 py-4">
        <p className="text-xs text-gray-500 leading-relaxed">
          <span className="font-semibold text-gray-400">Note:</span>{' '}
          Status updates are made by the AWS SBG core team. If you have questions,
          reach out to the team via the official contact channels.
          This is a read-only view — no further action is required from your end.
        </p>
      </div>

    </div>
  );
};

export default VolunteerStatus;

