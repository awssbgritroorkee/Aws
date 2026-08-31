import { useState, useRef } from 'react';
import { KeyRound, ArrowRight, Loader2 } from 'lucide-react';

const PinVerifyBox = ({ onVerify, loading }) => {
  const [digits, setDigits] = useState(['', '', '', '']);
  const [errorMsg, setErrorMsg] = useState('');
  const inputRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

  const handleChange = (index, value) => {
    // Only accept numeric digit
    if (value && !/^\d$/.test(value)) return;

    const newDigits = [...digits];
    newDigits[index] = value;
    setDigits(newDigits);
    setErrorMsg('');

    // Auto-advance to next box
    if (value && index < 3) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').trim();
    if (/^\d{4}$/.test(pasted)) {
      const newDigits = pasted.split('');
      setDigits(newDigits);
      setErrorMsg('');
      inputRefs[3].current?.focus();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const pin = digits.join('');
    if (pin.length !== 4) {
      setErrorMsg('Enter all 4 digits');
      return;
    }
    onVerify(pin, (err) => {
      setErrorMsg(err || 'Incorrect Invite Code');
      setDigits(['', '', '', '']);
      inputRefs[0].current?.focus();
    });
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-gray-300 flex items-center gap-1.5 uppercase tracking-wide">
          <KeyRound className="w-3.5 h-3.5 text-sbg-green" />
          Enter 4-Digit Creator Invite Code
        </label>
        <span className="text-[10px] font-mono text-gray-400">Ask creator offline</span>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex gap-2 flex-1" onPaste={handlePaste}>
          {digits.map((digit, idx) => (
            <input
              key={idx}
              ref={inputRefs[idx]}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              className="w-11 h-11 text-center text-lg font-bold font-mono bg-[#0d1117] text-white border border-white/15 rounded-xl focus:outline-none focus:border-sbg-green focus:ring-1 focus:ring-sbg-green transition-all"
            />
          ))}
        </div>

        <button
          type="submit"
          disabled={loading || digits.join('').length !== 4}
          className="h-11 px-4 rounded-xl bg-sbg-green text-aws-navy font-bold text-xs hover:bg-white transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              Join <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </div>

      {errorMsg && (
        <p className="text-xs text-red-400 font-mono animate-shake">
          ⚠️ {errorMsg}
        </p>
      )}
    </form>
  );
};

export default PinVerifyBox;
