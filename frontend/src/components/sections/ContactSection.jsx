import { useState } from 'react';
import { createContactMessage } from '../../services/api';

const ContactSection = () => {
  const [form, setForm]     = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState('idle'); // idle | loading | success | error

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    try {
      await createContactMessage({
        name: form.name.trim(),
        email: form.email.trim(),
        message: form.message.trim(),
      });
      setStatus('success');
      setForm({ name: '', email: '', message: '' });
    } catch (err) {
      console.error('ContactSection submit error:', err);
      setStatus('error');
    }
  };

  return (
    <section id="contact" className="section">
      {/* Spotlight */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 70% 60% at 50% 110%, rgba(124,58,237,0.14) 0%, transparent 65%)',
        }}
      />

      <div className="relative z-10 max-w-2xl mx-auto text-center">
        {/* Header */}
        <span className="section-badge">Get Involved</span>
        <h2 className="section-title">Join AWS SBG RIT</h2>
        <div className="section-divider" />
        <p className="section-sub mb-12">
          Are you an RIT student passionate about cloud, IoT, or web? Drop your details and we'll reach out.
        </p>

        {/* Form */}
        {status === 'success' ? (
          <div
            className="glass-card py-12 animate-fade-up"
            style={{ borderColor: 'rgba(52,211,153,0.25)' }}
          >
            <p className="text-4xl mb-4">🎉</p>
            <p className="text-xl font-bold text-white mb-2">You're on the list!</p>
            <p className="text-gray-400 text-sm">We'll reach out via email. Welcome to SBG RIT!</p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="glass-card text-left space-y-5 animate-fade-up"
            id="contact-form"
          >
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label htmlFor="contact-name" className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">
                  Full Name
                </label>
                <input
                  id="contact-name"
                  type="text"
                  required
                  placeholder="Rahul Kumar"
                  value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-gray-600
                             outline-none transition-all duration-200"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                  onFocus={e => {
                    e.target.style.borderColor = 'rgba(124,58,237,0.5)';
                    e.target.style.boxShadow   = '0 0 0 3px rgba(124,58,237,0.1)';
                  }}
                  onBlur={e => {
                    e.target.style.borderColor = 'rgba(255,255,255,0.08)';
                    e.target.style.boxShadow   = 'none';
                  }}
                />
              </div>
              <div>
                <label htmlFor="contact-email" className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">
                  Email Address
                </label>
                <input
                  id="contact-email"
                  type="email"
                  required
                  placeholder="you@rit.ac.in"
                  value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-gray-600
                             outline-none transition-all duration-200"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                  onFocus={e => {
                    e.target.style.borderColor = 'rgba(124,58,237,0.5)';
                    e.target.style.boxShadow   = '0 0 0 3px rgba(124,58,237,0.1)';
                  }}
                  onBlur={e => {
                    e.target.style.borderColor = 'rgba(255,255,255,0.08)';
                    e.target.style.boxShadow   = 'none';
                  }}
                />
              </div>
            </div>

            <div>
              <label htmlFor="contact-message" className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">
                Why do you want to join?
              </label>
              <textarea
                id="contact-message"
                rows={4}
                required
                placeholder="I'm interested in cloud and want to build real AWS projects..."
                value={form.message}
                onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-gray-600
                           outline-none resize-none transition-all duration-200"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
                onFocus={e => {
                  e.target.style.borderColor = 'rgba(124,58,237,0.5)';
                  e.target.style.boxShadow   = '0 0 0 3px rgba(124,58,237,0.1)';
                }}
                onBlur={e => {
                  e.target.style.borderColor = 'rgba(255,255,255,0.08)';
                  e.target.style.boxShadow   = 'none';
                }}
              />
            </div>

            <button
              type="submit"
              disabled={status === 'loading'}
              className="btn btn-solid w-full justify-center text-base py-3.5"
              id="contact-submit-btn"
            >
              {status === 'loading' ? 'Sending…' : 'Send Application →'}
            </button>
          </form>
        )}
      </div>
    </section>
  );
};

export default ContactSection;
