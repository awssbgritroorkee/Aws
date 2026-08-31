import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

const CountdownTimer = ({ lockedUntil, onExpired }) => {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0, totalMs: 0 });

  useEffect(() => {
    if (!lockedUntil) return;

    const calculateTime = () => {
      const targetTime = new Date(lockedUntil).getTime();
      const now = new Date().getTime();
      const diff = targetTime - now;

      if (diff <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0, totalMs: 0 });
        if (onExpired) onExpired();
        return false;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ hours, minutes, seconds, totalMs: diff });
      return true;
    };

    const hasTime = calculateTime();
    if (!hasTime) return;

    const interval = setInterval(() => {
      const active = calculateTime();
      if (!active) clearInterval(interval);
    }, 1000);

    return () => clearInterval(interval);
  }, [lockedUntil, onExpired]);

  const pad = (num) => String(num).padStart(2, '0');

  if (timeLeft.totalMs <= 0) {
    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
        <Clock className="w-3.5 h-3.5" />
        Expired
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 font-mono text-xs font-bold tracking-wider animate-pulse">
      <Clock className="w-3.5 h-3.5" />
      <span>
        {pad(timeLeft.hours)}:{pad(timeLeft.minutes)}:{pad(timeLeft.seconds)}
      </span>
      <span className="text-[10px] text-amber-400/70 font-normal">LOCK</span>
    </div>
  );
};

export default CountdownTimer;
