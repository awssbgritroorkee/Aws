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

const CountdownTimer = ({ targetDate }) => {
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
    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-sbg-green/10 text-sbg-green border border-sbg-green/30">
        <span className="w-1.5 h-1.5 rounded-full bg-sbg-green animate-pulse" />
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
