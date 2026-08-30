import { useState, useCallback, useEffect, useRef } from 'react';

/**
 * Lightweight toast notification system.
 *
 * Usage:
 *   const { showToast, ToastContainer } = useToast();
 *   showToast('Registration Successful!', 'success');
 *   showToast('You have already registered for this event.', 'error');
 *
 *   return (
 *     <>
 *       <YourContent />
 *       <ToastContainer />
 *     </>
 *   );
 */

const Toast = ({ message, type, onDismiss }) => {
  const isSuccess = type === 'success';

  useEffect(() => {
    const timer = setTimeout(onDismiss, 4000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div
      role="alert"
      aria-live="polite"
      style={{ animation: 'toastSlideIn 0.3s cubic-bezier(0.34,1.56,0.64,1)' }}
      className={`flex items-start gap-3 px-5 py-4 rounded-2xl shadow-2xl border backdrop-blur-xl max-w-sm w-full ${
        isSuccess
          ? 'bg-emerald-950/90 border-emerald-500/30 text-emerald-300'
          : 'bg-red-950/90 border-red-500/30 text-red-300'
      }`}
    >
      {/* Icon */}
      <div className={`flex-shrink-0 mt-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
        isSuccess ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
      }`}>
        {isSuccess ? '✓' : '✕'}
      </div>

      {/* Message */}
      <p className="text-sm font-medium leading-snug flex-1">{message}</p>

      {/* Dismiss button */}
      <button
        onClick={onDismiss}
        aria-label="Dismiss notification"
        className={`flex-shrink-0 opacity-50 hover:opacity-100 transition-opacity text-lg leading-none mt-[-2px] ${
          isSuccess ? 'hover:text-emerald-200' : 'hover:text-red-200'
        }`}
      >
        ×
      </button>
    </div>
  );
};

// ── Progress bar that shrinks over 4s ────────────────────────────────────────
const ProgressBar = ({ type }) => (
  <div className={`h-0.5 rounded-full mt-2 ${type === 'success' ? 'bg-emerald-500/30' : 'bg-red-500/30'}`}>
    <div
      className={`h-full rounded-full ${type === 'success' ? 'bg-emerald-400' : 'bg-red-400'}`}
      style={{ animation: 'toastShrink 4s linear forwards' }}
    />
  </div>
);

// ── Hook ──────────────────────────────────────────────────────────────────────
export const useToast = () => {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const showToast = useCallback((message, type = 'success') => {
    const id = ++idRef.current;
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const ToastContainer = useCallback(() => (
    <>
      <style>{`
        @keyframes toastSlideIn {
          from { opacity: 0; transform: translateY(12px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0)    scale(1); }
        }
        @keyframes toastShrink {
          from { width: 100%; }
          to   { width: 0%; }
        }
      `}</style>
      <div
        aria-label="Notifications"
        className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none"
      >
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <Toast
              message={t.message}
              type={t.type}
              onDismiss={() => dismiss(t.id)}
            />
          </div>
        ))}
      </div>
    </>
  ), [toasts, dismiss]);

  return { showToast, ToastContainer };
};

export default useToast;
