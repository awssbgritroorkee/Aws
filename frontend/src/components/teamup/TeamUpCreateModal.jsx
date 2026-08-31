import { useState, useEffect } from 'react';
import { X, KeyRound, AlertTriangle, Users, User, Loader2 } from 'lucide-react';
import { createTeamUpPost } from '../../services/api';

const InputField = ({ id, label, required, children, note }) => (
  <div className="flex flex-col gap-1.5">
    <div className="flex items-center justify-between">
      <label htmlFor={id} className="text-xs font-semibold text-gray-400 tracking-wide uppercase">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {note && <span className="text-[10px] text-gray-500 font-mono">{note}</span>}
    </div>
    {children}
  </div>
);

const inputClass =
  'w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-gray-500 ' +
  'focus:outline-none focus:border-sbg-green/60 focus:bg-white/8 transition-all duration-200';

const selectClass =
  'w-full px-3.5 py-2.5 rounded-xl bg-[#0d1117] border border-white/10 text-sm text-white ' +
  'focus:outline-none focus:border-sbg-green/60 transition-all duration-200 appearance-none cursor-pointer';

const TeamUpCreateModal = ({ events = [], onClose, onSuccess, onError }) => {
  const [mode, setMode] = useState('need_members');
  const [eventName, setEventName] = useState('');
  const [customEvent, setCustomEvent] = useState('');
  const [eventRef, setEventRef] = useState(null);
  const [membersNeeded, setMembersNeeded] = useState(2);
  const [targetYear, setTargetYear] = useState('any');
  const [genderPref, setGenderPref] = useState('any');
  const [message, setMessage] = useState('');
  const [pinDigits, setPinDigits] = useState(['', '', '', '']);

  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState('');

  const handleEventSelect = (e) => {
    const val = e.target.value;
    if (val === 'Other') {
      setEventName('Other');
      setEventRef(null);
    } else {
      const selected = events.find((ev) => String(ev.id) === val);
      if (selected) {
        setEventName(selected.title);
        setEventRef(selected.id);
      } else {
        setEventName(val);
        setEventRef(null);
      }
    }
  };

  const handlePinChange = (index, value) => {
    if (value && !/^\d$/.test(value)) return;
    const next = [...pinDigits];
    next[index] = value;
    setPinDigits(next);
    setValidationError('');

    // Focus next input automatically
    if (value && index < 3) {
      document.getElementById(`create-pin-input-${index + 1}`)?.focus();
    }
  };

  const handlePinKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !pinDigits[index] && index > 0) {
      document.getElementById(`create-pin-input-${index - 1}`)?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');

    const finalEventName = eventName === 'Other' ? customEvent.trim() : eventName;
    if (!finalEventName) {
      setValidationError('Please select or specify an Event Name.');
      return;
    }

    const pin = pinDigits.join('');
    if (!/^\d{4}$/.test(pin)) {
      setValidationError('Please enter a 4-digit numeric Invite Code.');
      return;
    }

    if (!message.trim()) {
      setValidationError('Please provide a message description.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        mode,
        event_name: finalEventName,
        event_ref: eventRef,
        members_needed: mode === 'need_team' ? 1 : Number(membersNeeded),
        target_year: targetYear,
        gender_preference: genderPref,
        message: message.trim(),
        secret_pin: pin,
      };

      const res = await createTeamUpPost(payload);
      onSuccess(res.data?.detail || 'Post created and pending admin approval!');
      onClose();
    } catch (err) {
      const data = err?.response?.data;
      let msg = 'Failed to create post. Please try again.';
      if (data) {
        if (data.detail) msg = data.detail;
        else if (data.non_field_errors?.[0]) msg = data.non_field_errors[0];
        else {
          const firstKey = Object.keys(data)[0];
          if (firstKey) {
            msg = `${firstKey.replace('_', ' ').toUpperCase()}: ${Array.isArray(data[firstKey]) ? data[firstKey][0] : data[firstKey]}`;
          }
        }
      }
      setValidationError(msg);
      if (onError) onError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
      onClick={handleBackdrop}
    >
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity" aria-hidden="true" />

      {/* Panel */}
      <div className="relative z-10 w-full max-w-lg bg-[#0d1117]/95 border border-white/10 rounded-3xl shadow-2xl overflow-hidden my-8">
        <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-sbg-green/60 to-transparent" />

        {/* Header */}
        <div className="px-7 pt-6 pb-4 border-b border-white/8 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-mono font-bold tracking-widest text-sbg-green uppercase mb-1">
              Team Up Matchmaking
            </p>
            <h2 className="text-xl font-bold text-white leading-tight">Create Team Post</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="px-7 py-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Mode Selector */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setMode('need_members')}
              className={`p-3.5 rounded-2xl border text-left flex flex-col gap-1 transition-all ${
                mode === 'need_members'
                  ? 'bg-sbg-green/10 border-sbg-green text-sbg-green'
                  : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center gap-2 font-bold text-xs">
                <Users className="w-4 h-4" /> Need Members
              </div>
              <span className="text-[10px] font-mono text-gray-400">Team seeking teammates</span>
            </button>

            <button
              type="button"
              onClick={() => setMode('need_team')}
              className={`p-3.5 rounded-2xl border text-left flex flex-col gap-1 transition-all ${
                mode === 'need_team'
                  ? 'bg-sky-500/10 border-sky-400 text-sky-400'
                  : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center gap-2 font-bold text-xs">
                <User className="w-4 h-4" /> Need a Team
              </div>
              <span className="text-[10px] font-mono text-gray-400">Solo builder looking to join</span>
            </button>
          </div>

          {/* Event Select */}
          <InputField id="create-event" label="Event / Project" required>
            <div className="relative">
              <select
                id="create-event"
                onChange={handleEventSelect}
                defaultValue=""
                required
                className={selectClass}
              >
                <option value="" disabled>Select event or custom</option>
                {events.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.title} ({ev.date})
                  </option>
                ))}
                <option value="Other">Other / Custom Project</option>
              </select>
            </div>
          </InputField>

          {eventName === 'Other' && (
            <InputField id="create-custom-event" label="Custom Project / Event Name" required>
              <input
                id="create-custom-event"
                type="text"
                value={customEvent}
                onChange={(e) => setCustomEvent(e.target.value)}
                placeholder="e.g. Smart India Hackathon 2026"
                required
                className={inputClass}
              />
            </InputField>
          )}

          {/* Members Needed & Target Year */}
          <div className="grid grid-cols-2 gap-4">
            {mode === 'need_members' ? (
              <InputField id="create-members" label="Members Needed" required note="Max 6">
                <select
                  id="create-members"
                  value={membersNeeded}
                  onChange={(e) => setMembersNeeded(e.target.value)}
                  className={selectClass}
                >
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <option key={n} value={n}>
                      {n} {n === 1 ? 'member' : 'members'}
                    </option>
                  ))}
                </select>
              </InputField>
            ) : (
              <InputField id="create-members-fixed" label="Members Needed">
                <input
                  type="text"
                  disabled
                  value="1 (Solo)"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/3 border border-white/5 text-sm text-gray-400 select-none cursor-not-allowed"
                />
              </InputField>
            )}

            <InputField id="create-target-year" label="Target Year" required>
              <select
                id="create-target-year"
                value={targetYear}
                onChange={(e) => setTargetYear(e.target.value)}
                className={selectClass}
              >
                <option value="any">Any Year</option>
                <option value="1st">1st Year</option>
                <option value="2nd">2nd Year</option>
                <option value="3rd">3rd Year</option>
                <option value="4th">4th Year</option>
              </select>
            </InputField>
          </div>

          {/* Gender Preference */}
          <InputField id="create-gender" label="Gender Preference" required>
            <select
              id="create-gender"
              value={genderPref}
              onChange={(e) => setGenderPref(e.target.value)}
              className={selectClass}
            >
              <option value="any">Any Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </InputField>

          {/* Requirement Message */}
          <InputField id="create-message" label="Requirement Details & Skills" required>
            <textarea
              id="create-message"
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe your tech stack, project idea, or what role you are looking to fill..."
              required
              className={inputClass}
            />
          </InputField>

          {/* 4-Digit Invite Code Entry Box */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                <KeyRound className="w-4 h-4 text-amber-400" />
                Create 4-Digit Invite Code *
              </label>
              <span className="text-[10px] font-mono text-amber-400">Numeric Only</span>
            </div>

            <p className="text-[11px] text-amber-200/80 leading-relaxed">
              ⚠️ Remember this Invite Code! When someone contacts you offline, share this Invite Code with them so they can officially join your team on the platform.
            </p>

            <div className="flex justify-center gap-3 py-1">
              {[0, 1, 2, 3].map((idx) => (
                <input
                  key={idx}
                  id={`create-pin-input-${idx}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={pinDigits[idx]}
                  onChange={(e) => handlePinChange(idx, e.target.value)}
                  onKeyDown={(e) => handlePinKeyDown(idx, e)}
                  className="w-12 h-12 text-center text-xl font-bold font-mono bg-[#0d1117] text-white border border-amber-500/40 rounded-xl focus:outline-none focus:border-sbg-green focus:ring-1 focus:ring-sbg-green transition-all"
                />
              ))}
            </div>
          </div>

          {validationError && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 font-mono flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Footer Submit */}
          <div className="pt-4 border-t border-white/8 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-400 bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl text-xs font-bold bg-sbg-green text-aws-navy hover:bg-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Submitting...
                </>
              ) : (
                'Submit Post →'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TeamUpCreateModal;
