import { useState, useEffect, useCallback } from 'react';

// ── helpers ───────────────────────────────────────────────────────────────────

/**
 * Parse the backend DateField value ("YYYY-MM-DD") into a JS timestamp.
 * Treating it as local midnight avoids UTC-shift surprises (e.g. "2026-09-05"
 * becoming Sep 4 23:30 in IST if parsed as UTC).
 */
function parseDateFieldToMs(dateStr) {
  if (!dateStr) return null;
  // "YYYY-MM-DD" → local midnight
  const [y, m, d] = String(dateStr).split('-').map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d).getTime(); // local midnight
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
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono bg-white/4 border border-white/10">
      <span className="text-gray-500 text-[10px] tracking-wide uppercase">Starts in</span>
      <div className="flex items-center gap-1">
        {timeLeft.d > 0 && (
          <>
            <span className="px-1.5 py-0.5 rounded bg-white/8 text-white font-bold">
              {timeLeft.d}d
            </span>
            <span className="text-white/20">·</span>
          </>
        )}
        <span className="px-1.5 py-0.5 rounded bg-white/8 text-white font-bold">
          {pad(timeLeft.h)}h
        </span>
        <span className="text-white/20">·</span>
        <span className="px-1.5 py-0.5 rounded bg-white/8 text-white font-bold">
          {pad(timeLeft.m)}m
        </span>
        <span className="text-white/20">·</span>
        <span className="px-1.5 py-0.5 rounded bg-sbg-green/15 text-sbg-green font-bold tabular-nums animate-pulse">
          {pad(timeLeft.s)}s
        </span>
      </div>
    </div>
  );
};

export default CountdownTimer;
