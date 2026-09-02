import { useState, useEffect, useCallback } from 'react';

// ── helpers ───────────────────────────────────────────────────────────────────

/**
 * Parse the backend DateTimeField ISO string (e.g. "2026-09-05T10:00:00+05:30")
 * into a JS timestamp in ms.  new Date() handles all ISO 8601 variants natively,
 * including timezone offsets, so no manual splitting needed.
 */
function parseDateFieldToMs(dateStr) {
  if (!dateStr) return null;
  const ms = new Date(dateStr).getTime();
  return Number.isNaN(ms) ? null : ms;
}

function calcTimeLeft(targetMs) {
  if (!targetMs) return null;
  const diff = targetMs - Date.now();
  if (diff <= 0) return null; // event has started / passed
  return {
    d: Math.floor(diff / (1000 * 60 * 60 * 24)),
    h: Math.floor((diff / (1000 * 60 * 60)) % 24),
    m: Math.floor((diff / (1000 * 60)) % 60),
    s: Math.floor((diff / 1000) % 60),
  };
}

// ── component ─────────────────────────────────────────────────────────────────

const CountdownTimer = ({ targetDate, meetingLink }) => {
  const targetMs = parseDateFieldToMs(targetDate);

  const getTimeLeft = useCallback(() => calcTimeLeft(targetMs), [targetMs]);
  const [timeLeft, setTimeLeft] = useState(getTimeLeft);

  useEffect(() => {
    if (!targetMs) return;
    const id = setInterval(() => setTimeLeft(calcTimeLeft(targetMs)), 1000);
    return () => clearInterval(id);
  }, [targetMs]);

  // ── Invalid / missing date ─────────────────────────────────────────────────
  if (!targetMs) return null;

  // ── Event has started / passed ────────────────────────────────────────────
  if (!timeLeft) {
    if (meetingLink && typeof meetingLink === 'string' && meetingLink.trim() !== '') {
      return (
        <a
          href={meetingLink}
          target="_blank"
          rel="noopener noreferrer"
          className="relative inline-flex items-center gap-2 bg-red-600 text-white border border-red-500 px-5 py-2.5 rounded-lg text-sm font-extrabold animate-pulse hover:bg-red-700 hover:scale-105 transition-all shadow-[0_0_15px_rgba(220,38,38,0.6)] uppercase tracking-wide"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
          </span>
          Join Live Meet
        </a>
      );
    }

    return (
      <div className="text-[#00d084] font-bold text-sm bg-[#00d084]/20 px-4 py-2 rounded-lg border border-[#00d084]/30 w-fit">
        Event is Live! 🚀
      </div>
    );
  }

  // ── Countdown ticking ─────────────────────────────────────────────────────
  const pad = (n) => String(n).padStart(2, '0');

  return (
    <div className="flex items-center gap-2 text-sm font-mono font-bold w-fit">
      <span className="text-gray-500 text-[10px] tracking-wider uppercase">Starts in</span>
      <div className="flex items-center gap-1 text-yellow-400">
        {timeLeft.d > 0 && (
          <>
            <span>{timeLeft.d}d</span>
            <span className="text-gray-600 font-normal">•</span>
          </>
        )}
        <span>{pad(timeLeft.h)}h</span>
        <span className="text-gray-600 font-normal">•</span>
        <span>{pad(timeLeft.m)}m</span>
        <span className="text-gray-600 font-normal">•</span>
        <span className="text-sbg-green animate-pulse">{pad(timeLeft.s)}s</span>
      </div>
    </div>
  );
};

export default CountdownTimer;
