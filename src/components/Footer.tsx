import React, { useState, useEffect } from 'react';
import { ArrowUp, Award } from 'lucide-react';
import { useCMS } from '../context/CMSContext';
import { INITIAL_SITE_CONTENT } from '../data/initialCmsData';

export const Footer: React.FC = () => {
  const { database, isAdmin, setSelectedComponentId } = useCMS();
  const branding = database.siteContent?.branding || INITIAL_SITE_CONTENT.branding;
  const footer = database.siteContent?.footer || INITIAL_SITE_CONTENT.footer;
  const [time, setTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString('en-GB', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          timeZone: 'Europe/London',
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer
      onClick={() => {
        if (isAdmin) setSelectedComponentId('site-footer');
      }}
      className="relative w-full bg-[#050506] border-t border-white/[0.08] py-12 text-zinc-400 font-sans overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        {/* Top Tier */}
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-8 border-b border-white/[0.06] gap-6">
          <div className="flex items-center gap-4">
            <img
              src={branding.logoImage || '/images/ods-logo.png'}
              alt={branding.logoAlt || 'ODS Logo'}
              className="w-11 h-11 object-contain rounded-full border border-white/15"
            />
            <div>
              <span className="font-display font-bold text-2xl md:text-3xl tracking-tight text-zinc-100 block leading-none">
                {footer.studioName}
              </span>
              <span className="text-[11px] font-mono tracking-widest text-zinc-500 uppercase mt-1.5 block">
                {footer.disciplinesLine}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={scrollToTop}
            className="group flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/[0.04] border border-white/10 hover:border-white/25 text-xs font-mono text-zinc-200 transition-all w-fit active:scale-[0.97]"
          >
            <span>Back to Top</span>
            <div className="w-5 h-5 rounded-full bg-zinc-800 text-zinc-200 flex items-center justify-center transition-transform group-hover:-translate-y-0.5">
              <ArrowUp className="w-3 h-3" />
            </div>
          </button>
        </div>

        {/* Middle Tier */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 py-8 border-b border-white/[0.06] text-xs font-mono">
          <div>
            <span className="text-zinc-600 uppercase block mb-1">Local Time</span>
            <span className="text-zinc-200 font-semibold tracking-wider">
              {time || '12:00:00'} GMT+1
            </span>
          </div>

          <div>
            <span className="text-zinc-600 uppercase block mb-1">{footer.statusLabel}</span>
            <span className="text-zinc-300 font-semibold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-300" />
              {footer.statusValue}
            </span>
          </div>

          <div>
            <span className="text-zinc-600 uppercase block mb-1">{footer.recognitionLabel}</span>
            <span className="text-zinc-300 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-zinc-400" />
              {footer.recognitionValue}
            </span>
          </div>

          <div>
            <span className="text-zinc-600 uppercase block mb-1">{footer.architectureLabel}</span>
            <span className="text-zinc-400">{footer.architectureValue}</span>
          </div>
        </div>

        {/* Bottom Tier */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-zinc-500 gap-3">
          <p>{footer.copyright}</p>
          <p>{footer.tagline}</p>
        </div>
      </div>
    </footer>
  );
};
