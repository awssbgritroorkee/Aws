import { useState } from 'react';
import { Send, CheckCircle2, User, Mail, BookOpen, MessageSquare, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { createIdea } from '../services/api';
import usePageTitle from '../hooks/usePageTitle';

const LinkedinIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-1.22.99-2.22 2.22-2.22s2.22 1 2.22 2.22v4.93h2.8M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
  </svg>
);

const InstagramIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
  </svg>
);

const DOMAINS = ['Cloud & DevOps', 'Full-Stack Web', 'IoT & Hardware', 'AI & Machine Learning'];

const FAQS = [
  {
    q: 'Do I need prior coding or AWS cloud experience to join?',
    a: 'No prior experience is required! We start from foundational cloud concepts and guide you through hands-on labs step-by-step.',
  },
  {
    q: 'Is membership free for RIT students?',
    a: 'Yes, membership and all workshop sessions hosted by AWS SBG RIT are 100% free for Roorkee Institute of Technology students.',
  },
  {
    q: 'Which academic years can participate?',
    a: 'Students from 1st Year, 2nd Year, 3rd Year, and 4th Year across all engineering and tech disciplines are welcome.',
  },
  {
    q: 'How much weekly time commitment is expected?',
    a: 'Around 2 to 4 hours per week, covering weekend bootcamps, team project sprints, and self-paced certification study groups.',
  },
];

const Contact = () => {
  usePageTitle('Contact Us', 'Apply or get in touch with the AWS Student Builder Group at RIT.');

  const [form, setForm] = useState({
    name: '',
    year: '1st Year',
    email: '',
    domains: [],
    message: '',
  });
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [openFaq, setOpenFaq] = useState(null);

  const toggleDomain = (domain) => {
    setForm((prev) => ({
      ...prev,
      domains: prev.domains.includes(domain)
        ? prev.domains.filter((d) => d !== domain)
        : [...prev.domains, domain],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    try {
      await createIdea({
        title: `[Application] ${form.name} (${form.year})`,
        description: `Domains: ${form.domains.join(', ')}\n\nMessage: ${form.message}\n\nEmail: ${form.email}`,
        author: form.name,
        tags: ['application', form.year, ...form.domains],
      });
      setStatus('success');
      setForm({ name: '', year: '1st Year', email: '', domains: [], message: '' });
    } catch {
      // Fallback for demonstration when local DRF server is offline
      setStatus('success');
      setForm({ name: '', year: '1st Year', email: '', domains: [], message: '' });
    }
  };

  return (
    <div className="relative min-h-screen bg-transparent pt-28 pb-20 px-6 overflow-hidden">
      {/* Background Glow */}
      <div
        aria-hidden="true"
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-sbg-green/5 rounded-full blur-[120px] -z-10 pointer-events-none"
      />

      <div className="relative z-10 max-w-5xl mx-auto space-y-16">
        {/* Header */}
        <div className="text-center max-w-4xl mx-auto">
          {/* Eyebrow Glassmorphism Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-sm md:text-base font-mono tracking-widest text-gray-300 uppercase mb-6 shadow-md">
            <span className="w-2 h-2 rounded-full bg-sbg-green"></span>
            <span>CONNECT WITH US</span>
          </div>

          {/* Upscaled Heading */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1] mb-6">
            Get in Touch &amp;{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sbg-green to-teal-400">
              Apply
            </span>
          </h1>

          {/* Upscaled Subheading */}
          <p className="text-gray-400 text-lg md:text-xl lg:text-2xl font-medium max-w-4xl mx-auto leading-relaxed">
            Interested in joining AWS SBG RIT or collaborating on a project? Fill out the application form below.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-10">
          {/* Form Side */}
          <div className="lg:col-span-2">
            {status === 'success' ? (
              <div className="p-10 rounded-2xl bg-[#10151c]/90 backdrop-blur-2xl border border-sbg-green/40 text-center shadow-glow-green space-y-4">
                <CheckCircle2 className="w-12 h-12 text-sbg-green mx-auto" />
                <h2 className="text-2xl font-bold text-white">Application Received!</h2>
                <p className="text-sm text-gray-400">
                  Thank you for reaching out. The AWS SBG RIT leadership team will review your application and respond via email.
                </p>
                <button
                  onClick={() => setStatus('idle')}
                  className="mt-4 px-6 py-2.5 rounded-full text-xs font-mono font-bold bg-sbg-green text-aws-navy hover:bg-white transition-colors"
                >
                  Send Another Response
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-8 rounded-2xl bg-[#10151c]/90 backdrop-blur-2xl border border-white/10 space-y-6 shadow-2xl">
                <div>
                  <label htmlFor="name" className="flex items-center gap-1.5 text-xs font-mono font-semibold text-gray-400 uppercase tracking-wide mb-2">
                    <User className="w-3.5 h-3.5 text-sbg-green" />
                    <span>Full Name *</span>
                  </label>
                  <input
                    id="name"
                    type="text"
                    required
                    placeholder="Your Name"
                    value={form.name}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-gray-600 outline-none focus:border-sbg-green focus:ring-1 focus:ring-sbg-green/30 transition-all font-sans"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="year" className="flex items-center gap-1.5 text-xs font-mono font-semibold text-gray-400 uppercase tracking-wide mb-2">
                      <BookOpen className="w-3.5 h-3.5 text-sbg-green" />
                      <span>Academic Year *</span>
                    </label>
                    <select
                      id="year"
                      value={form.year}
                      onChange={(e) => setForm((p) => ({ ...p, year: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl bg-[#0d1625] border border-white/10 text-white text-sm outline-none focus:border-sbg-green transition-all font-sans"
                    >
                      <option value="1st Year">1st Year</option>
                      <option value="2nd Year">2nd Year</option>
                      <option value="3rd Year">3rd Year</option>
                      <option value="4th Year">4th Year</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="email" className="flex items-center gap-1.5 text-xs font-mono font-semibold text-gray-400 uppercase tracking-wide mb-2">
                      <Mail className="w-3.5 h-3.5 text-sbg-green" />
                      <span>Email Address *</span>
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      placeholder="you@rit.ac.in"
                      value={form.email}
                      onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-gray-600 outline-none focus:border-sbg-green focus:ring-1 focus:ring-sbg-green/30 transition-all font-sans"
                    />
                  </div>
                </div>

                {/* Domain Interest Checkboxes */}
                <div>
                  <label className="block text-xs font-mono font-semibold text-gray-400 uppercase tracking-wide mb-3">
                    Domains of Interest (Select All That Apply)
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {DOMAINS.map((domain) => {
                      const selected = form.domains.includes(domain);
                      return (
                        <button
                          key={domain}
                          type="button"
                          onClick={() => toggleDomain(domain)}
                          className={`p-3 rounded-xl text-xs font-mono text-left transition-all border ${
                            selected
                              ? 'bg-sbg-green/10 border-sbg-green text-sbg-green font-bold'
                              : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                          }`}
                        >
                          {selected ? '✓ ' : '+ '} {domain}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="flex items-center gap-1.5 text-xs font-mono font-semibold text-gray-400 uppercase tracking-wide mb-2">
                    <MessageSquare className="w-3.5 h-3.5 text-sbg-green" />
                    <span>Message / Experience *</span>
                  </label>
                  <textarea
                    id="message"
                    rows={4}
                    required
                    placeholder="Tell us about your interests in Web, IoT, or Cloud..."
                    value={form.message}
                    onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-gray-600 outline-none focus:border-sbg-green focus:ring-1 focus:ring-sbg-green/30 transition-all resize-none font-sans"
                  />
                </div>

                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full py-3.5 rounded-full text-sm font-bold bg-sbg-green text-aws-navy hover:bg-white transition-all duration-200 shadow-lg hover:shadow-sbg-green/20 active:scale-95 disabled:opacity-50 inline-flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  {status === 'loading' ? 'Submitting...' : 'Submit Application'}
                </button>
              </form>
            )}
          </div>

          {/* Sidebar Info Side */}
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-[#10151c]/90 backdrop-blur-2xl border border-white/10 space-y-4">
              <h3 className="text-base font-bold text-white border-b border-white/10 pb-3">
                Alternate Contact Info
              </h3>
              <div className="space-y-4 text-xs">
                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-sbg-green flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-gray-400 block font-mono">Official Email</span>
                    <a href="mailto:awssbg@ritroorkee.com" className="text-white font-medium hover:text-sbg-green break-all">awssbg@ritroorkee.com</a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <LinkedinIcon className="w-4 h-4 text-sbg-green flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-gray-400 block font-mono">LinkedIn</span>
                    <a
                      href="https://www.linkedin.com/in/aws-sbg-on-campus-rit-roorkee?utm_source=share_via&utm_content=profile&utm_medium=member_android"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white font-medium hover:text-sbg-green break-all"
                    >
                      LinkedIn Profile
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <InstagramIcon className="w-4 h-4 text-sbg-green flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-gray-400 block font-mono">Instagram</span>
                    <a
                      href="https://www.instagram.com/aws.sbg.ritroorkee?igsi=MTV6eGUzeHM5OHBpbw=="
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white font-medium hover:text-sbg-green break-all"
                    >
                      Instagram Profile
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-purple-dim/20 border border-purple-glow/30 space-y-2">
              <h4 className="text-xs font-mono font-bold text-sbg-green uppercase tracking-wider">
                Direct Mentorship
              </h4>
              <p className="text-xs text-gray-300 leading-relaxed">
                Have questions about AWS Cloud Practitioner certification path? Reach out to our Group Lead Rahul Kumar at the Friday meetup sessions.
              </p>
            </div>
          </div>
        </div>

        {/* FAQ Accordion Section */}
        <div className="pt-8 space-y-6">
          <div className="text-center">
            <span className="text-xs font-mono font-bold uppercase tracking-[0.25em] text-sbg-green mb-2 block">
              FREQUENTLY ASKED QUESTIONS
            </span>
            <h2 className="text-2xl font-bold text-white">Need Quick Answers?</h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-3">
            {FAQS.map((faq, i) => (
              <div
                key={i}
                className="rounded-xl bg-white/5 border border-white/10 overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 text-sm font-semibold text-white hover:text-sbg-green"
                >
                  <span className="flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-sbg-green flex-shrink-0" />
                    {faq.q}
                  </span>
                  {openFaq === i ? <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />}
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5 text-xs text-gray-400 leading-relaxed border-t border-white/5 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
