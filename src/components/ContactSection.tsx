import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Copy, Check, Send, ArrowUpRight } from 'lucide-react';

export const ContactSection: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [discipline, setDiscipline] = useState('Logo Branding');
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    budget: '$5,000 - $15,000',
    message: '',
  });

  const email = 'hello@oladesigns.com';

  const copyEmail = () => {
    navigator.clipboard.writeText(email);
    setCopied(true);
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#fafafa', '#d4d4d8', '#71717a', '#27272a'],
    });
    setTimeout(() => setCopied(false), 2400);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    confetti({
      particleCount: 80,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#fafafa', '#d4d4d8', '#71717a', '#27272a'],
    });
  };

  return (
    <section id="contact" className="relative w-full py-16 md:py-20 bg-[#070708] overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          {/* Left Column: Direct Inquiry Trigger */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-widest text-zinc-500 block mb-2">
                Initiate Partnership
              </span>

              <h2 className="font-display font-extrabold text-3xl sm:text-4xl md:text-5xl text-zinc-100 tracking-tight leading-[1.02]">
                LET&rsquo;S BUILD SOMETHING ICONIC.
              </h2>

              <p className="mt-4 text-sm text-zinc-400 font-sans leading-relaxed">
                Accepting select commissions for Logo Branding, Social Media Design, Event Flyers,
                Cinematic Video Editing, and Quantitative Market Visuals.
              </p>

              {/* Instant Email Copy Button */}
              <div className="mt-7">
                <span className="text-[11px] font-mono uppercase tracking-widest text-zinc-500 block mb-2">
                  Direct Inquiries
                </span>
                <button
                  type="button"
                  onClick={copyEmail}
                  className="group flex items-center gap-3 p-3.5 rounded-xl bg-[#0e0e12] border border-white/[0.09] hover:border-zinc-500 transition-colors duration-200 w-full sm:w-auto"
                >
                  <div className="w-9 h-9 rounded-lg bg-white/[0.05] border border-white/10 flex items-center justify-center text-zinc-200">
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </div>
                  <div className="text-left pr-3">
                    <span className="font-mono text-sm font-bold text-zinc-100 block">
                      {email}
                    </span>
                    <span className="text-[11px] font-mono text-zinc-500">
                      {copied ? 'Copied to clipboard' : 'Click to copy email address'}
                    </span>
                  </div>
                </button>
              </div>
            </div>

            {/* Social Portals */}
            <div className="mt-10 pt-6 border-t border-white/[0.08]">
              <span className="text-[11px] font-mono uppercase tracking-widest text-zinc-500 block mb-3">
                Digital Presence &amp; Portals
              </span>
              <div className="flex flex-wrap gap-2.5">
                {[
                  { name: 'X / Twitter', url: '#contact' },
                  { name: 'YouTube Channel', url: '#contact' },
                  { name: 'TradingView', url: '#contact' },
                  { name: 'Instagram', url: '#contact' },
                  { name: 'GitHub', url: '#contact' },
                ].map((s, i) => (
                  <a
                    key={i}
                    href={s.url}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.08] text-xs font-mono text-zinc-400 hover:text-zinc-100 hover:border-white/20 transition-colors"
                  >
                    <span>{s.name}</span>
                    <ArrowUpRight className="w-3 h-3 text-zinc-500" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Inquiry Form */}
          <div className="lg:col-span-7 p-6 md:p-8 rounded-2xl bg-[#0c0c10] border border-white/[0.09] shadow-2xl">
            {submitted ? (
              <div className="py-12 text-center">
                <div className="w-12 h-12 rounded-full bg-white/[0.06] border border-white/15 text-zinc-100 flex items-center justify-center mx-auto mb-4">
                  <Check className="w-6 h-6" />
                </div>
                <h3 className="font-display font-bold text-xl text-zinc-100">
                  Transmission Received
                </h3>
                <p className="mt-2 text-sm text-zinc-400 max-w-sm mx-auto">
                  Thank you for reaching out. Briefs are reviewed daily and answered within 24
                  hours.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="mt-6 px-5 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-xs font-mono text-zinc-100 transition-colors"
                >
                  Send Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Discipline Selector */}
                <div>
                  <label className="text-[11px] font-mono uppercase tracking-widest text-zinc-400 block mb-2.5">
                    Select Discipline Scope
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      'Logo Branding',
                      'Social Media Design',
                      'Flyers',
                      'Video Editing',
                      'Technical Analysis',
                      'Full Direction',
                    ].map((d) => (
                      <button
                        type="button"
                        key={d}
                        onClick={() => setDiscipline(d)}
                        className={`p-2.5 rounded-lg text-xs font-mono text-left transition-colors border ${
                          discipline === d
                            ? 'bg-zinc-100 border-zinc-100 text-zinc-950 font-semibold'
                            : 'bg-white/[0.02] border-white/[0.08] text-zinc-400 hover:text-zinc-200 hover:border-white/20'
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Name & Email Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="contact-name"
                      className="text-[11px] font-mono uppercase tracking-widest text-zinc-400 block mb-1.5"
                    >
                      Your Name
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Elena Rostova"
                      className="w-full bg-black/50 border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-400 transition-colors"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="contact-email"
                      className="text-[11px] font-mono uppercase tracking-widest text-zinc-400 block mb-1.5"
                    >
                      Email Address
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="elena@studio.com"
                      className="w-full bg-black/50 border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-400 transition-colors"
                    />
                  </div>
                </div>

                {/* Budget Tier */}
                <div>
                  <label
                    htmlFor="contact-budget"
                    className="text-[11px] font-mono uppercase tracking-widest text-zinc-400 block mb-1.5"
                  >
                    Estimated Budget Tier
                  </label>
                  <select
                    id="contact-budget"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    className="w-full bg-black/50 border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-zinc-400 transition-colors"
                  >
                    <option value="< $5,000">&lt; $5,000 (Advisory / Retainer)</option>
                    <option value="$5,000 - $15,000">
                      $5,000 - $15,000 (Complete Brand System / Commercial Cut)
                    </option>
                    <option value="$15,000 - $35,000">
                      $15,000 - $35,000 (Comprehensive Brand + Motion Overhaul)
                    </option>
                    <option value="$35,000+">
                      $35,000+ (Enterprise / Global Launch / Proprietary Alpha)
                    </option>
                  </select>
                </div>

                {/* Message */}
                <div>
                  <label
                    htmlFor="contact-message"
                    className="text-[11px] font-mono uppercase tracking-widest text-zinc-400 block mb-1.5"
                  >
                    Project Vision &amp; Objectives
                  </label>
                  <textarea
                    id="contact-message"
                    rows={4}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Tell us about the product, timeline, aesthetic goals, or specific deliverable requirements..."
                    className="w-full bg-black/50 border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-400 transition-colors"
                  />
                </div>

                {/* Submit CTA */}
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 font-display font-bold text-sm tracking-wide transition-all duration-150 active:scale-[0.99] flex items-center justify-center gap-2 group"
                >
                  <span>Transmit Project Brief</span>
                  <Send className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
